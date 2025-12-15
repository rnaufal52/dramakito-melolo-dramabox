"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Book } from "@/types/dracin";
import DramaCard from "@/components/DramaCard/DramaCard";
import { searchDramas } from "@/app/actions";

interface InfiniteDramaListProps {
  initialItems: Book[];
  query: string;
}

export default function InfiniteDramaList({ initialItems, query }: InfiniteDramaListProps) {
  const [items, setItems] = useState<Book[]>(initialItems);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(initialItems.length >= 20);
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  // Reset state when query changes
  useEffect(() => {
    setItems(initialItems);
    setPage(2);
    setHasMore(initialItems.length >= 20);
    setLoading(false);
  }, [query, initialItems]);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const loadMore = async () => {
    setLoading(true);
    try {
      const newItems = await searchDramas(query, page);
      if (newItems.length < 20) {
        setHasMore(false);
      }
      setItems(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
    } catch (e) {
      console.error("Failed to load more", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pb-8">
        {items.map((item, idx) => (
            <div key={`${item.bookId}-${idx}-${page}`} className="aspect-[2/3]">
                <DramaCard drama={item} />
            </div>
        ))}
      </div>
      
      {/* Loading Indicator & Trigger */}
      <div ref={lastElementRef} className="flex justify-center py-8">
        {loading && (
             <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
        )}
        {!hasMore && items.length > 0 && (
            <p className="text-gray-500">No more results.</p>
        )}
      </div>
    </>
  );
}
