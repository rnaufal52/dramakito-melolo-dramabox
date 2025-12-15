"use client";

import React from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { Book } from "@/types/dracin";

interface FavoriteButtonProps {
  book: any; // Using any for flexibility with mixed types
  className?: string;
  showText?: boolean;
}

export default function FavoriteButton({ book, className = "", showText = true }: FavoriteButtonProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  
  if (!book || !book.bookId) return null;

  const isFav = isFavorite(book.bookId);

  const handleToggle = () => {
    if (isFav) {
      removeFavorite(book.bookId);
    } else {
        // Construct a safe book object to store
        // Ensure we handle the differnt image fields logic here so standard cards work later
        const safeBook: Book = {
            bookId: book.bookId,
            bookName: book.bookName,
            coverWap: book.coverWap || book.cover || book.chapterImg, // Fallbacks
            cover: book.cover || book.coverWap,
            tagNames: book.tagNames || [],
            introduction: book.introduction,
            // ... other fields optional
        } as any;
        addFavorite(safeBook);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 rounded px-4 py-2 font-semibold transition-colors ${
        isFav 
          ? "bg-red-600 text-white hover:bg-red-700" 
          : "bg-gray-800 text-gray-200 hover:bg-gray-700"
      } ${className}`}
    >
      <svg 
        className={`h-5 w-5 ${isFav ? "fill-current" : "fill-none stroke-current"}`} 
        viewBox="0 0 24 24" 
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {showText && (isFav ? "Saved" : "My List")}
    </button>
  );
}
