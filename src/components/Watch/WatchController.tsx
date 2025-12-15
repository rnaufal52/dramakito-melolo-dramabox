"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHistory } from "@/hooks/useHistory";
import VideoPlayer from "./VideoPlayer";
import EpisodeList from "./EpisodeList";
import FavoriteButton from "./FavoriteButton";
import DramaList from "@/components/DramaList/DramaList"; // If needed contextually, but page passes props
import { Episode } from "@/types/dracin";

interface WatchControllerProps {
    bookId: string;
    currentEpIndex: number;
    episodes: Episode[];
    bookInfo: any;
    currentEpisode: Episode;
    similarDramas: any[];
}

export default function WatchController({
    bookId,
    currentEpIndex,
    episodes,
    bookInfo,
    currentEpisode,
    similarDramas
}: WatchControllerProps) {
    const router = useRouter();
    const { markWatched, isWatched, getLastWatched, history } = useHistory();
    const [isNavigating, setIsNavigating] = useState(false);
    const [hasResumed, setHasResumed] = useState(false);

    // Resume Logic: On mount, if no specific episode selected (index 0) and history exists, redirect.
    useEffect(() => {
        if (!hasResumed && currentEpIndex === 0) {
            const lastIndex = getLastWatched(bookId);
            if (lastIndex > 0 && lastIndex < episodes.length) {
                // Redirect to last watched
                router.replace(`/watch/${bookId}?ep=${lastIndex}`);
                setHasResumed(true); // Prevent double redirect
                return;
            }
        }
        setHasResumed(true);
    }, [bookId, currentEpIndex, getLastWatched, episodes.length, router, hasResumed]);

    // Reset navigation state when episode changes (navigation completed)
    useEffect(() => {
        setIsNavigating(false);
    }, [currentEpIndex]);

    const handleEpisodeSelect = (index: number) => {
        if (index === currentEpIndex) return;

        // 1. Mark CURRENT episode as watched immediately before switching
        if (currentEpisode) {
            markWatched({ bookId, ...bookInfo }, currentEpIndex);
        }

        // 2. Set Loading State
        setIsNavigating(true);

        // 3. Navigate
        router.push(`/watch/${bookId}?ep=${index}`);
    };

    const dramaTitle = bookInfo.bookName;
    const dramaIntro = bookInfo.introduction || "No description available.";

    // Prevent rendering player if we are about to resume (avoid loading Ep 0 then Ep X)
    if (!hasResumed && currentEpIndex === 0 && getLastWatched(bookId) > 0) {
        return (
             <div className="flex h-screen w-full items-center justify-center bg-black text-white">
                 <div className="flex flex-col items-center gap-4">
                     <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                     <p>Resuming your episode...</p>
                 </div>
             </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 lg:flex-row mb-12">
            {/* Left: Player & Info */}
            <div className="flex-1">
                 <div className="w-full">
                    {currentEpisode ? (
                        <VideoPlayer 
                            episode={currentEpisode} 
                            poster={currentEpisode.chapterImg} 
                            bookId={bookId}
                            episodeIndex={currentEpIndex}
                            bookInfo={bookInfo}
                            hasNext={currentEpIndex < episodes.length - 1}
                            hasPrev={currentEpIndex > 0}
                            externalLoading={isNavigating} // Pass shared loading state
                        />
                    ) : (
                        <div className="flex aspect-video w-full items-center justify-center bg-gray-900 rounded-lg text-gray-500">
                            <p>Loading Episode...</p>
                        </div>
                    )}
                 </div>
                 
                 {/* Drama Info */}
                 <div className="mt-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white">{dramaTitle}</h1>
                            <h2 className="text-lg text-red-500 mt-1">
                                {currentEpisode ? `Episode ${currentEpIndex + 1}: ${currentEpisode.chapterName || ''}` : "Select an Episode"}
                            </h2>
                        </div>
                        <FavoriteButton book={bookInfo} />
                    </div>

                    {/* Metadata Tags & Status */}
                    <div className="flex flex-wrap gap-2 items-center">
                        {bookInfo?.tags && bookInfo.tags.map((tag: string, i: number) => (
                            <span key={i} className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded border border-gray-700">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Tabs / Details */}
                    <div className="bg-[#181818] p-6 rounded-lg border border-gray-800/50">
                        <h3 className="text-lg font-semibold mb-2 text-white">Synopsis</h3>
                        <p className="text-gray-400 leading-relaxed mb-4 text-sm md:text-base">
                            {dramaIntro}
                        </p>
                    </div>
                 </div>
            </div>

            {/* Right: Episode List */}
            <div className="w-full lg:w-96 flex-none">
                <EpisodeList 
                    bookId={bookId} 
                    episodes={episodes} 
                    currentEpIndex={currentEpIndex} 
                    onEpisodeClick={handleEpisodeSelect} 
                    watchedEpisodes={history[bookId]?.watchedEpisodes || []} // Pass watched list directly
                />
            </div>
        </div>
    );
}
