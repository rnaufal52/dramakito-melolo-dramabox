import React from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import DramaCard from "../DramaCard/DramaCard";
import { Book, ApiItem } from "@/types/dracin";

interface DramaListProps {
  title: string;
  items: Book[];
  viewAllLink?: string;
  icon?: React.ReactNode;
}

const DramaList: React.FC<DramaListProps> = ({ title, items, viewAllLink, icon }) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="py-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
            {icon && <span className="text-red-500">{icon}</span>}
            <h2 className="text-xl font-bold text-white md:text-2xl border-l-4 border-red-600 pl-3">
            {title}
            </h2>
        </div>
        {viewAllLink && (
            <Link 
                href={viewAllLink}
                className="group flex items-center text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
                View All
                <ChevronRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
        )}
      </div>
      
      {/* Scroll Container */}
      <div className="relative group/row">
        <div className="flex space-x-4 overflow-x-auto px-4 pb-4 md:px-12 scrollbar-hide">
            {items.map((item: any, index: number) => {
                // Determine if it's a direct book object or an execution wrapper
                // The API structure is a bit flat/mixed, so we try to extract the book data
                let bookData = item;
                
                // If it's a wrapper with cardType 1, the book data is at the root
                // If it's cardType 3, we should have handled it in the parent to map 'tagBooks'
                // Here we assume 'items' is a list of paintable book objects
                
                if (item.cardType === 1 || item.bookId) {
                   bookData = item; 
                }

                return (
                    <div key={`${bookData.bookId}-${index}`} className="w-[140px] flex-none md:w-[180px]">
                        <DramaCard drama={bookData} />
                    </div>
                );
            })}
      </div>
      </div>
    </section>
  );
};

export default DramaList;
