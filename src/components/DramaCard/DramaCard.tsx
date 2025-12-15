"use client";

import { Book } from "@/types/dracin";
import Link from "next/link";
import React from "react";
import { useFavorites } from "@/hooks/useFavorites";

interface DramaCardProps {
  drama: Book | any;
  featured?: boolean;
}

const DramaCard: React.FC<DramaCardProps> = ({ drama, featured = false }) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  
  // Normalize data access
  const id = drama.bookId;
  const title = drama.bookName;
  const image = drama.coverWap || drama.cover || 'https://via.placeholder.com/300x450?text=No+Image';
  const tags = drama.tagV3s?.map((t: any) => t.tagName).slice(0, 3).join(" • ");

  const isFav = isFavorite(id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent Link navigation
      e.stopPropagation();
      
      if (isFav) {
          removeFavorite(id);
      } else {
          // Construct safe book object
          const safeBook = {
              bookId: id,
              bookName: title,
              coverWap: drama.coverWap,
              cover: drama.cover,
              tagNames: drama.tagV3s?.map((t: any) => t.tagName) || [],
              introduction: drama.introduction
          };
          addFavorite(safeBook as any);
      }
  };

  return (
    <Link href={`/watch/${id}`} className={`group relative block h-full w-full overflow-hidden rounded-md bg-zinc-800 transition-all duration-300 hover:z-50 hover:scale-105 hover:shadow-xl`}>
      <div className="aspect-[2/3] w-full relative">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-60"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        {/* Hover Information Overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full flex-col justify-end bg-gradient-to-t from-black via-black/80 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <h3 className="text-sm font-bold text-white line-clamp-1">{title}</h3>
            {tags && <p className="mt-1 text-xs text-green-400">{tags}</p>}
            
            <div className="mt-2 flex items-center space-x-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white transition-colors hover:bg-gray-200">
                    <svg className="h-3 w-3 fill-black" viewBox="0 0 24 24"><path d="M3 22v-20l18 10-18 10z"></path></svg>
                </div>
                 <button 
                    onClick={handleToggleFavorite}
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                        isFav 
                        ? "border-red-600 bg-red-600 text-white hover:bg-red-700 hover:border-red-700" 
                        : "border-gray-400 text-gray-400 hover:border-white hover:text-white"
                    }`}
                >
                    {isFav ? (
                         <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    ) : (
                         <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    )}
                </button>
            </div>
        </div>
      </div>
    </Link>
  );
};

export default DramaCard;
