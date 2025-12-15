"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce"; // We might need to install this or implement custom debounce, let's stick to standard timeout for now to avoid deps

export default function BrowseSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const [text, setText] = useState(initialQuery);
  const [query] = useDebounce(text, 500);

  useEffect(() => {
    if (query !== initialQuery) {
        if (query) {
            router.push(`/browse?query=${encodeURIComponent(query)}`);
        } else {
            router.push(`/browse`);
        }
    }
  }, [query, router, initialQuery]);

  return (
    <div className="relative mb-8 w-full max-w-2xl">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        className="block w-full rounded-full border border-gray-700 bg-gray-800 py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
        placeholder="Search for titles, genres, or people..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
}
