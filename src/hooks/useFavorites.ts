"use client";

import { useState, useEffect, useCallback } from "react";
import { Book } from "@/types/dracin";

const EVENT_NAME = "dracin_favorites_updated";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Book[]>([]);

  const loadFavorites = useCallback(() => {
    const stored = localStorage.getItem("dracin_favorites");
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  useEffect(() => {
    loadFavorites();
    
    const handleStorageChange = () => loadFavorites();
    window.addEventListener(EVENT_NAME, handleStorageChange);
    // Also listen to storage executing in other tabs
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(EVENT_NAME, handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadFavorites]);

  const saveFavorites = (newFavorites: Book[]) => {
    setFavorites(newFavorites);
    localStorage.setItem("dracin_favorites", JSON.stringify(newFavorites));
    window.dispatchEvent(new Event(EVENT_NAME));
  };

  const addFavorite = (book: Book) => {
    if (favorites.some((f) => f.bookId === book.bookId)) return;
    const newFavs = [book, ...favorites];
    saveFavorites(newFavs);
  };

  const removeFavorite = (bookId: string) => {
    const newFavs = favorites.filter((f) => f.bookId !== bookId);
    saveFavorites(newFavs);
  };

  const isFavorite = (bookId: string) => {
    return favorites.some((f) => f.bookId === bookId);
  };

  return { favorites, addFavorite, removeFavorite, isFavorite };
}

