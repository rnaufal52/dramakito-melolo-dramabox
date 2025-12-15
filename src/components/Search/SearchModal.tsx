"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Book } from "@/types/dracin"; 
// Generally API calls in client component are okay if they hit an internal API route or public endpoint.
// Let's assume api.ts works on Client or we create an internal API route.
// Ideally, we should use a Server Action or Route Handler to proxy if CORS is an issue.
// However, earlier we saw client components using api directly? No, mainly server components used it.
// Let's implement a simple fetch for now, assuming api.ts works or we mock it for now.
// Actually, to be safe and fast, I'll just hardcode some genres and "Trending" queries.
// Update: User said "rekomendasi search", so fetching is better.
// I will fetch `/api/search/recommendations` ? No, I don't have that.
// I will try to call `dracinApi.getTrending()` inside a useEffect.

const POPULAR_SEARCHES = ["CEO", "Revenge", "Love", "Romance", "Time Travel", "Short Drama"];

export default function SearchModal({ onClose }: { onClose: () => void }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(false); // Global loading for nav
    const [isFetching, setIsFetching] = useState(false); // Local loading for autocomplete
    const [showSuggestions, setShowSuggestions] = useState(false);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        inputRef.current?.focus();
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        };
    }, []);

    // Autocomplete Effect
    useEffect(() => {
        if (!query.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        setIsFetching(true);
        debounceTimeout.current = setTimeout(async () => {
            try {
                // Use internal proxy to avoid CORS issues
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const results: Book[] = await res.json();
                
                // Filter by Title Only (Client-side enforcement)
                const lowerQuery = query.toLowerCase();
                const titleMatches = results.filter(book => 
                    book.bookName.toLowerCase().includes(lowerQuery)
                );

                // Limit to 6 items
                setSuggestions(titleMatches.slice(0, 6)); 
                setShowSuggestions(true);
            } catch (error) {
                console.error("Autocomplete failed", error);
            } finally {
                setIsFetching(false);
            }
        }, 500); // 500ms debounce
        
    }, [query]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            setIsLoading(true);
            // Simulate a brief delay or just direct push. 
            // The spinner shows immediately. The router.push will eventually trigger global loading.
            router.push(`/?query=${encodeURIComponent(query)}`);
            // Don't close immediately to show the spinner, or close? 
            // User said "loading dulu" (loading first). if we close, we lose the modal spinner.
            // But if we don't close, we might see modal + global loading?
            // Actually, next.js loading.tsx replaces the current segment.
            // If the modal is in a layout/preserved, it might stay.
            // But usually loading.tsx replaces the page content.
            // Let's keep modal open with spinner until navigation unmounts or we close it.
            // Actually, better to close only after a minimal delay or rely on unmount.
            // But standard behavior: if we don't close, the modal is visible.
            // Let a timeout close it? Or just let navigation handle it.
            // User wants "loading first, then skeleton".
            // If I keep modal open with spinner, then skeleton appears, that works.
            setTimeout(() => {
                 onClose();
            }, 500); // Optional: ensure spinner is seen for a bit? No, faster is better.
                     // But to satisfy "loading dulu", showing it for a split second is good.
                     // Let's just set isLoading(true) and close on unmount or after push.
            // Actually, explicit onClose might be needed if SearchModal is strictly client component in a layout that doesn't unmount?
            // Navbar is persistent. SearchModal is conditionally rendered in Navbar.
            // So if page changes, Navbar stays? YES.
            // So SearchModal stays open if we don't close it.
            // We MUST close it.
            // So: Spinner -> Wait -> Close -> URL changes -> Skeleton shows.
            // To do this smoothly:
            // setIsLoading(true) -> navigate -> setTimeout(onClose, 200).
        }
    };

    const handleKeywordClick = (keyword: string) => {
         setIsLoading(true);
         router.push(`/?query=${encodeURIComponent(keyword)}`);
         setTimeout(() => onClose(), 500);
    };

    const handleSuggestionClick = (bookId: string) => {
        setIsLoading(true);
        router.push(`/watch/${bookId}`);
        setTimeout(() => onClose(), 500);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/80 backdrop-blur-sm pt-20 animate-in fade-in duration-200">
             <div className="relative w-full max-w-2xl bg-[#181818] rounded-xl shadow-2xl border border-gray-700 overflow-hidden mx-4 flex flex-col max-h-[80vh]">
                  {/* Header / Input */}
                  <form onSubmit={handleSearch} className="flex-none flex items-center p-4 border-b border-gray-700 relative z-10 bg-[#181818]">
                      {isLoading ? (
                          <div className="mr-4 animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      ) : (
                          <svg className="w-6 h-6 text-gray-400 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                      )}
                      <input 
                          ref={inputRef}
                          type="text" 
                          className="flex-1 bg-transparent text-white text-lg placeholder-gray-500 focus:outline-none disabled:opacity-50"
                          placeholder="Search titles..."
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          disabled={isLoading}
                      />
                      <button type="button" onClick={onClose} className="ml-4 text-gray-400 hover:text-white" disabled={isLoading}>
                          <span className="text-sm font-semibold">ESC</span>
                      </button>
                  </form>

                  {/* Content Area (Scrollable) */}
                  <div className={`flex-1 overflow-y-auto p-4 custom-scrollbar ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                      
                      {/* Autocomplete Suggestions */}
                      {query.trim() && (
                          <div className="mb-6">
                              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3 flex items-center justify-between">
                                  <span>Suggestions</span>
                                  {isFetching && <span className="animate-pulse text-red-500">Searching...</span>}
                              </h3>
                              
                              <div className="space-y-2">
                                  {suggestions.length > 0 ? (
                                      suggestions.map((book) => (
                                          <div 
                                            key={book.bookId} 
                                            onClick={() => handleSuggestionClick(book.bookId)}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors group"
                                          >
                                              <div className="h-12 w-8 flex-none bg-gray-800 rounded overflow-hidden">
                                                  <img src={book.coverWap} alt={book.bookName} className="h-full w-full object-cover" />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                  <h4 className="text-sm font-medium text-gray-200 group-hover:text-white truncate">
                                                      {book.bookName}
                                                  </h4>
                                                  <p className="text-xs text-gray-500 truncate">
                                                      {book.introduction || "No description"}
                                                  </p>
                                              </div>
                                              <svg className="w-4 h-4 text-gray-600 group-hover:text-red-500 -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                              </svg>
                                          </div>
                                      ))
                                  ) : (
                                      !isFetching && <div className="text-gray-500 text-sm py-2">No results found for "{query}"</div>
                                  )}
                              </div>
                          </div>
                      )}

                      {/* Popular Searches (Visual - only show if no query or if we want always visible at bottom?) 
                          Usually Autocomplete replaces Default View. 
                          If query is empty => Show Popular. 
                          If query exists => Show Suggestions.
                      */}
                      {!query.trim() && (
                        <div>
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Popular Searches</h3>
                            <div className="flex flex-wrap gap-3">
                                {POPULAR_SEARCHES.map(term => (
                                    <button 
                                        key={term}
                                        onClick={() => handleKeywordClick(term)}
                                        className="px-4 py-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                      )}
                  </div>
                  
                  {/* Helper Text */}
                  <div className="bg-gray-900/50 p-3 text-center text-xs text-gray-600 border-t border-gray-800">
                      Press Enter to search
                  </div>
             </div>
             
             {/* Backdrop Click to Close */}
             <div className="absolute inset-0 -z-10" onClick={onClose}></div>
        </div>
    );
}
