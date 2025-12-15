"use client";

import React, { useEffect, useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { useHistory } from "@/hooks/useHistory";
import DramaCard from "@/components/DramaCard/DramaCard";
import { Book } from "@/types/dracin";
import Link from "next/link";

import ConfirmationModal from "@/components/UI/ConfirmationModal";

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();
  const { history, removeHistoryItem, clearAllHistory } = useHistory();
  const [historyItems, setHistoryItems] = useState<Book[]>([]);
  
  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
      isOpen: boolean;
      title: string;
      message: string;
      onConfirm: () => void;
  }>({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: () => {},
  });

  useEffect(() => {
    // Convert history object to array of Books for rendering
    if (history) {
      const items = Object.values(history)
        .sort((a, b) => b.timestamp - a.timestamp)
        .map(h => h.bookInfo)
        .filter(Boolean); // Filter out any corrupt entries
      setHistoryItems(items);
    }
  }, [history]);

  const handleClearHistory = () => {
      setConfirmModal({
          isOpen: true,
          title: "Clear History",
          message: "Are you sure you want to delete all watch history? This cannot be undone.",
          onConfirm: () => {
              clearAllHistory();
          }
      });
  };

  const handleRemoveItem = (book: Book) => {
      setConfirmModal({
          isOpen: true,
          title: "Remove from History",
          message: `Remove "${book.bookName}" from your continue watching list?`,
          onConfirm: () => {
              removeHistoryItem(book.bookId);
          }
      });
  };

  return (
        <div className="min-h-screen bg-[#141414] pt-24 px-4 md:px-8 pb-10">
            {/* Confirmation Modal */}
            <ConfirmationModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDanger={true}
                confirmText="Delete"
            />

            {/* Continue Watching Section */}
            {historyItems.length > 0 && (
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="w-1 h-8 bg-red-600 rounded-full inline-block"></span>
                            Continue Watching
                        </h2>
                        <button 
                            onClick={handleClearHistory}
                            className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Clear History
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {historyItems.map((book) => {
                            const lastEpIndex = history[book.bookId]?.lastWatchedIndex || 0;
                            return (
                                <div key={book.bookId} className="relative group">
                                    <Link href={`/watch/${book.bookId}?ep=${lastEpIndex}`} className="block relative aspect-[3/4] rounded-lg overflow-hidden">
                                        <img 
                                            src={book.coverWap} 
                                            alt={book.bookName} 
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <svg className="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                                            <p className="text-white text-sm font-medium truncate">{book.bookName}</p>
                                            <p className="text-gray-300 text-xs truncate">
                                                Ep {lastEpIndex + 1}
                                            </p>
                                        </div>
                                    </Link>

                                    {/* Remove Button */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleRemoveItem(book);
                                        }}
                                        className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 z-10"
                                        title="Remove from history"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Favorites Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                     <span className="w-1 h-8 bg-red-600 rounded-full inline-block"></span>
                     My Favorites
                </h2>
                {favorites.length === 0 ? (
                    <div className="flex h-40 flex-col items-center justify-center text-gray-500 bg-zinc-900/50 rounded-xl">
                        <span className="mb-2 text-4xl">📝</span>
                        <p className="text-lg">Your list is empty.</p>
                        <p className="mt-1 text-xs text-gray-600">Mark dramas as favorites to see them here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                        {favorites.map((drama) => (
                        <div key={drama.bookId} className="aspect-[2/3]">
                            <DramaCard drama={drama} />
                        </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
