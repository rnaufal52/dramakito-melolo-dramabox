"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Episode } from "@/types/dracin";

interface EpisodeListProps {
  bookId: string;
  episodes: Episode[];
  currentEpIndex: number;
  onEpisodeClick?: (index: number) => void;
  watchedEpisodes?: number[];
}

export default function EpisodeList({ bookId, episodes, currentEpIndex, onEpisodeClick, watchedEpisodes = [] }: EpisodeListProps) {
  // const { isWatched } = useHistory(); // Removed internal hook usage
  const activeRef = useRef<HTMLAnchorElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll active episode into view on mount
  useEffect(() => {
    if (activeRef.current && listRef.current) {
      // Simple logic to scroll to the active item
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentEpIndex]);

  return (
    <div className="rounded-lg bg-[#181818] border border-gray-800 flex flex-col h-full max-h-[800px]">
        <div className="p-4 border-b border-gray-800">
            <h3 className="text-xl font-bold text-white">Episodes</h3>
            <p className="text-xs text-gray-500 mt-1">{episodes.length} Episodes Available</p>
        </div>
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 scrollbar-hide">
            <div className="space-y-2">
                {episodes.map((episode, idx) => {
                    const watched = watchedEpisodes.includes(idx);
                    const isActive = idx === currentEpIndex;

                    return (
                        <div 
                            key={idx}
                            ref={isActive ? activeRef as any : null}
                            onClick={() => {
                                if (onEpisodeClick) {
                                    onEpisodeClick(idx);
                                }
                            }}
                            className={`flex items-center gap-3 rounded p-2 transition-colors hover:bg-gray-800/80 group cursor-pointer
                                ${isActive ? 'bg-gray-800 ring-1 ring-red-600' : ''} 
                                ${watched && !isActive ? 'opacity-60' : ''}
                            `}
                        >
                            <div className="relative h-16 w-28 flex-none overflow-hidden rounded bg-gray-900">
                                <img 
                                    src={episode.chapterCover || episode.chapterImg} 
                                    alt="" 
                                    className="h-full w-full object-cover transition-transform group-hover:scale-110" 
                                    loading="lazy"
                                />
                                {isActive && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                                    </div>
                                )}
                                {watched && !isActive && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                         <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                         </svg>
                                    </div>
                                )}
                                <div className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-[10px] font-mono text-white">
                                    {episode.duration || "02:00"}
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden min-w-0">
                                <div className="flex justify-between items-center">
                                    <h4 className={`truncate text-sm font-medium ${isActive ? 'text-red-500' : watched ? 'text-gray-400' : 'text-gray-200'}`}>
                                        Episode {idx + 1}
                                    </h4>
                                </div>
                                <p className="truncate text-xs text-gray-500">{episode.chapterName}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
}
