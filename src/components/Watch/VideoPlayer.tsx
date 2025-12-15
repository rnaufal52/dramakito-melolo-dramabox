"use client";

import { Episode, VideoPath } from "@/types/dracin";
import React, { useEffect, useState, useRef, useCallback, Fragment } from "react";
import { useHistory } from "@/hooks/useHistory";
import { useRouter } from "next/navigation";

interface VideoPlayerProps {
  episode: Episode;
  poster?: string;
  bookId: string;
  episodeIndex: number;
  bookInfo?: any;
  hasNext?: boolean;
  hasPrev?: boolean;
  externalLoading?: boolean;
}

export default function VideoPlayer({ 
    episode, 
    poster, 
    bookId, 
    episodeIndex, 
    bookInfo,
    hasNext,
    hasPrev,
    externalLoading = false
}: VideoPlayerProps) {
  const [availableQualities, setAvailableQualities] = useState<VideoPath[]>([]);
  const [currentQuality, setCurrentQuality] = useState<VideoPath | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Custom Controls State
  const [isPlaying, setIsPlaying] = useState(false); // Default to false until we know
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading for navigation
  const [isSpeedingUp, setIsSpeedingUp] = useState(false); // 2x Speed state
  const hasMarkedRef = useRef(false);

  const { markWatched, saveProgress, getProgress, getLastWatched } = useHistory();
  const [restoredTime, setRestoredTime] = useState(false);
  const router = useRouter();

  // Next Episode Popup State
  const [showNextPopup, setShowNextPopup] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isCancelled, setIsCancelled] = useState(false);

  // Mark as watched & Restore Progress
  useEffect(() => {
    setRestoredTime(false); // Reset restored state on episode change
    setIsCancelled(false);
    setShowNextPopup(false);
    setIsLoading(false); // Turn off loading when episode changes
    hasMarkedRef.current = false; // Reset marked state
  }, [episodeIndex]);

  // Prefetch next episode for instant navigation
  useEffect(() => {
    if (hasNext && bookId) {
       router.prefetch(`/watch/${bookId}?ep=${episodeIndex + 1}`);
    }
  }, [bookId, episodeIndex, hasNext, router]);

  useEffect(() => {
    if (bookId && bookInfo) {
        // Restore progress logic
        // We check if we have a saved progress for this specific book AND if the last watched index matches functionality
        // But simply, if user navigates to an episode, we usually start from 0 UNLESS it's the one they left off.
        const lastIndex = getLastWatched(bookId);
        
        // Only load progress if we are watching the same episode we left off, or if it's a resume action (which we don't distinguish here yet)
        if (lastIndex === episodeIndex && !restoredTime) {
             const savedTime = getProgress(bookId);
             // Ensure reasonable time (not near end)
             if (savedTime > 5 && videoRef.current) {
                 videoRef.current.currentTime = savedTime;
             }
             setRestoredTime(true);
        }

        return; 
    }
  }, [bookId, episodeIndex, bookInfo, getLastWatched, getProgress, restoredTime]);

  // Track progress & Next Episode Popup
  const handleTimeUpdate = useCallback(() => {
      if (!videoRef.current || !bookId) return;
      const time = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      
      setProgress(time);
      if (dur) setDuration(dur);

      // Mark as watched if played more than 1 second
      if (time > 1 && bookInfo) {
         // We rely on useHistory internal logic to not duplicate or spam updates too much, 
         // but strictly speaking markWatched is efficient. 
         // However, to avoid calling it every frame, we could check if it's already marked for this session.
         // But useHistory usually overwrites safely. Let's add a debouncer or simple check?
         // Actually markWatched is cheap. But let's verify if we need a state to prevent spam.
         // For now, let's just trigger it once per session basically.
         // But wait, user might re-watch.
         // Let's use a ref ensuring we only mark ONCE per video load if > 1s.
         if (!hasMarkedRef.current) {
             markWatched({ bookId, ...bookInfo }, episodeIndex);
             hasMarkedRef.current = true;
         }
      }
      
      // Save every roughly 5 seconds (performance)
      if (time > 0 && Math.floor(time) % 5 === 0) {
          // If near end (95%), maybe don't save progress or reset? 
          // For now, save plain.
          if (duration && time < duration - 10) {
              saveProgress(bookId, time);
          }
      }

      // Check for Next Episode Popup
      if (duration && hasNext && !isCancelled) {
          const remaining = duration - time;
          
          // Instant Autoplay Trigger (0.3s buffer to prevent dead air)
          if (isAutoPlay && remaining < 0.3 && !isLoading) {
             handleNext();
             return; // Stop further updates
          }

          if (remaining <= 10 && remaining > 0) { // Show in last 10 seconds
              setShowNextPopup(true);
              setCountdown(Math.ceil(remaining));
          } else {
              setShowNextPopup(false);
          }
      }
  }, [bookId, saveProgress, hasNext, isCancelled]);

  const handleCancelPopup = () => {
      setIsCancelled(true);
      setShowNextPopup(false);
  };
  
  const handleNext = () => {
      if (hasNext) {
          setIsLoading(true);
          router.push(`/watch/${bookId}?ep=${episodeIndex + 1}`);
      }
  };

  const handlePrev = () => {
      if (hasPrev) {
          setIsLoading(true);
          router.push(`/watch/${bookId}?ep=${episodeIndex - 1}`);
      }
  };

  // Parse available resolutions
  useEffect(() => {
    if (!episode.cdnList || episode.cdnList.length === 0) {
        if (episode.videoUrl) {
            const fallback: VideoPath = { quality: 720, videoPath: episode.videoUrl, isDefault: 1 };
            setAvailableQualities([fallback]);
            setCurrentQuality(fallback);
            setVideoSrc(episode.videoUrl);
        }
        return;
    }

    const defaultCdn = episode.cdnList.find((c) => c.isDefault === 1) || episode.cdnList[0];
    const paths = defaultCdn?.videoPathList || [];
    const sortedPaths = [...paths].sort((a, b) => b.quality - a.quality);
    setAvailableQualities(sortedPaths);

    const defaultPath = sortedPaths.find((p) => p.isDefault === 1) || sortedPaths[0];
    if (defaultPath) {
        setCurrentQuality(defaultPath);
        setVideoSrc(defaultPath.videoPath);
    }
  }, [episode]);

  const handleQualityChange = (quality: VideoPath) => {
    if (!videoRef.current) return;
    const currentTime = videoRef.current.currentTime;
    const isPlaying = !videoRef.current.paused;
    setCurrentQuality(quality);
    setVideoSrc(quality.videoPath);
    setTimeout(() => {
        if (videoRef.current) {
            videoRef.current.currentTime = currentTime;
            if (isPlaying) videoRef.current.play();
        }
    }, 50);
  };

  const togglePlay = () => {
    if (videoRef.current) {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = Number(e.target.value);
      if (videoRef.current) {
          videoRef.current.currentTime = newTime;
          setProgress(newTime);
      }
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const startSpeedUp = () => {
      if (videoRef.current) {
          videoRef.current.playbackRate = 2.0;
          setIsSpeedingUp(true);
      }
  };

  const stopSpeedUp = () => {
      if (videoRef.current) {
          videoRef.current.playbackRate = 1.0;
          setIsSpeedingUp(false);
      }
  };

  const toggleFullscreen = () => {
      if (document.fullscreenElement) {
          document.exitFullscreen();
      } else if (containerRef.current) {
          containerRef.current.requestFullscreen();
      }
  };

  if (!videoSrc && !episode.videoUrl) {
      return (
        <div className="flex h-full flex-col items-center justify-center text-gray-500">
            <span className="text-4xl mb-4">⚠️</span>
            <p>Video not available.</p>
        </div>
      );
  }

  // Auto Play preference
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Load AutoPlay preference
  useEffect(() => {
      const stored = localStorage.getItem("dracin_autoplay");
      if (stored !== null) {
          setIsAutoPlay(stored === "true");
      }
  }, []);

  const toggleAutoPlay = () => {
      const newState = !isAutoPlay;
      setIsAutoPlay(newState);
      localStorage.setItem("dracin_autoplay", String(newState));
  };
  
  return (
    <div className="flex flex-col gap-4 w-full">
      <div 
        ref={containerRef} 
        className="group relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-2xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
            setIsHovered(false);
            stopSpeedUp(); // Ensure speed resets if mouse leaves
        }}
        onMouseDown={startSpeedUp}
        onMouseUp={stopSpeedUp}
        onTouchStart={startSpeedUp}
        onTouchEnd={stopSpeedUp}
        onContextMenu={(e) => e.preventDefault()} // Prevent context menu on long press
      >
        <video
            ref={videoRef}
            src={videoSrc || undefined}
            autoPlay={isAutoPlay}
            className="h-full w-full object-contain cursor-pointer"
            poster={poster || episode.chapterImg}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => isAutoPlay && handleNext()}
            onClick={togglePlay} // Simple click toggles play
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
        >
            Your browser does not support the video tag.
        </video>

        {/* 2x Speed Indicator Overlay */}
        {isSpeedingUp && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-1 rounded-full backdrop-blur-sm z-20 flex items-center gap-2 animate-pulse pointer-events-none">
                <span className="text-white text-xs font-bold tracking-widest">2X SPEED</span>
                <div className="flex gap-0.5">
                    <div className="w-1 h-2 bg-white skew-x-[-20deg]"></div>
                    <div className="w-1 h-2 bg-white skew-x-[-20deg]"></div>
                    <div className="w-1 h-2 bg-white skew-x-[-20deg]"></div>
                </div>
            </div>
        )}

        {/* Custom Controls Overlay */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-300 ${isHovered || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
            {/* Scrubber */}
            <input 
                type="range" 
                min={0} 
                max={duration || 100} 
                value={progress} 
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-600 hover:h-2 transition-all mb-4"
            />
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Play/Pause */}
                    <button onClick={togglePlay} className="text-white hover:text-red-500 transition-colors">
                        {isPlaying ? (
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                        ) : (
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        )}
                    </button>
                    
                    {/* Time */}
                    <span className="text-white text-sm font-medium">
                        {formatTime(progress)} / {formatTime(duration)}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Quality Selector (Moved here) */}
                    {availableQualities.length > 1 && (
                        <div className="relative group/menu">
                            <button className="bg-black/60 hover:bg-red-600 text-white rounded px-2 py-1 text-xs font-bold border border-white/20 backdrop-blur-sm transition-colors">
                                {currentQuality?.quality}p
                            </button>
                            <div className="absolute bottom-full right-0 mb-2 hidden w-24 flex-col gap-1 rounded bg-black/90 p-1 group-hover/menu:flex border border-white/10">
                                {availableQualities.map((q) => (
                                    <button
                                        key={q.quality}
                                        onClick={() => handleQualityChange(q)}
                                        className={`px-2 py-1 text-left text-xs hover:bg-white/20 rounded ${currentQuality?.quality === q.quality ? 'text-red-500 font-bold' : 'text-gray-300'}`}
                                    >
                                        {q.quality}p
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Fullscreen Toggle */}
                    <button 
                        onClick={toggleFullscreen}
                        className="text-white hover:text-red-500 transition-colors"
                        title="Fullscreen"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        {/* Next Episode Popup Overlay */}
        {showNextPopup && (
            <div className="absolute bottom-16 right-4 z-40 bg-zinc-900/95 border border-zinc-700/50 p-4 rounded-xl shadow-2xl backdrop-blur-md animate-in slide-in-from-right-5 fade-in duration-500 w-64">
                <p className="text-gray-300 text-sm mb-3 font-medium">Next episode starting in <span className="text-red-500 font-bold text-lg inline-block w-5 text-center">{countdown}</span></p>
                <div className="flex gap-2">
                    <button 
                        onClick={handleCancelPopup}
                        className="flex-1 px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleNext}
                        className="flex-1 px-3 py-2 text-xs font-bold bg-white text-black hover:bg-gray-200 rounded-lg transition-colors shadow-lg shadow-white/10"
                    >
                        Play Now
                    </button>
                </div>
            </div>
        )}

        {/* Navigation Loading Overlay */}
        {(isLoading || externalLoading) && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-white font-bold text-sm">Loading Next Video...</p>
                </div>
            </div>
        )}
      </div>

      {/* Navigation Buttons (Below Video) */}
      <div className="flex items-center justify-between px-2 text-white">
          <div className="flex items-center gap-4">
              {hasPrev && (
                  <button 
                      onClick={handlePrev}
                      className="flex items-center gap-2 rounded-full bg-zinc-800 px-6 py-2.5 text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      Previous
                  </button>
              )}
          </div>
          
          <div className="flex items-center gap-4">
               {/* Auto Play Toggle */}
               <button 
                  onClick={toggleAutoPlay}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
               >
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${isAutoPlay ? 'bg-red-600' : 'bg-gray-600'}`}>
                      <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${isAutoPlay ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                  <span>Auto Play</span>
               </button>

               {hasNext && (
                  <button 
                      onClick={handleNext}
                      className="flex items-center gap-2 rounded-full bg-zinc-800 px-6 py-2.5 text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                      Next Episode
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
              )}
          </div>
      </div>
    </div>
  );
}


