"use client";

import { useEffect, useState } from "react";
import { Book } from "@/types/dracin";

export interface HistoryItem {
  bookId: string;
  bookName: string;
  cover: string;
  lastWatchedIndex: number;
  watchedEpisodes: number[];
  progress: number; // Seconds
  timestamp: number;
  bookInfo?: Book | any; // Storing full book info for listing
}

export function useHistory() {
  const [history, setHistory] = useState<Record<string, HistoryItem>>({});

  useEffect(() => {
    const stored = localStorage.getItem("dracin_history");
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveHistory = (newHistory: Record<string, HistoryItem>) => {
    setHistory(newHistory);
    localStorage.setItem("dracin_history", JSON.stringify(newHistory));
  };

  const getHistoryItem = (bookId: string, bookInfo: any, episodeIndex: number) => {
     const existing = history[bookId];
     if (existing) return existing;
     
     return {
        bookId,
        bookName: bookInfo?.bookName || "Unknown",
        cover: bookInfo?.cover || bookInfo?.coverWap || "",
        lastWatchedIndex: episodeIndex,
        watchedEpisodes: [],
        progress: 0,
        timestamp: Date.now(),
        bookInfo: bookInfo
     };
  };

  const markWatched = (book: any, episodeIndex: number) => {
    if (!book || !book.bookId) return;
    
    setHistory((prev) => {
        const current = prev[book.bookId] || {
            bookId: book.bookId,
            bookName: book.bookName,
            cover: book.cover || book.coverWap,
            watchedEpisodes: [],
            lastWatchedIndex: 0,
            timestamp: Date.now(),
            bookInfo: book
        };

        const updatedEpisodes = current.watchedEpisodes.includes(episodeIndex)
            ? current.watchedEpisodes
            : [...current.watchedEpisodes, episodeIndex];

        const newItem = {
            ...current,
            watchedEpisodes: updatedEpisodes,
            lastWatchedIndex: episodeIndex,
            timestamp: Date.now(),
            bookInfo: book
        };
        
        const newHistory = {
            ...prev,
            [book.bookId]: newItem,
        };
        localStorage.setItem("dracin_history", JSON.stringify(newHistory)); // Save immediately
        return newHistory;
    });
  };

  const removeHistoryItem = (bookId: string) => {
      setHistory(prev => {
          const newHistory = { ...prev };
          delete newHistory[bookId];
          localStorage.setItem("dracin_history", JSON.stringify(newHistory));
          return newHistory;
      });
  };

  const clearAllHistory = () => {
      setHistory({});
      localStorage.removeItem("dracin_history");
  };

  const saveProgress = (bookId: string, progress: number) => {
      setHistory(prev => {
          if (!prev[bookId]) return prev; 
          
          const updatedItem = {
              ...prev[bookId],
              progress,
              timestamp: Date.now()
          };
          const newHistory = { ...prev, [bookId]: updatedItem };
          localStorage.setItem("dracin_history", JSON.stringify(newHistory));
          return newHistory;
      });
  };

  const getProgress = (bookId: string) => {
      return history[bookId]?.progress || 0;
  };


  const isWatched = (bookId: string, episodeIndex: number) => {
    return history[bookId]?.watchedEpisodes?.includes(episodeIndex) || false;
  };

  const getLastWatched = (bookId: string) => {
    return history[bookId]?.lastWatchedIndex ?? -1;
  };

  return { history, markWatched, isWatched, getLastWatched, saveProgress, getProgress, removeHistoryItem, clearAllHistory };
}
