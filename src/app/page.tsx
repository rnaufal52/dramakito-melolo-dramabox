import Hero from "@/components/Hero/Hero";
import DramaList from "@/components/DramaList/DramaList";
import { dracinApi } from "@/lib/api";
import { Book } from "@/types/dracin";
import DramaCard from "@/components/DramaCard/DramaCard";
import InfiniteDramaList from "@/components/Browse/InfiniteDramaList";

export default async function Home({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
  const { query } = await searchParams;

  // 1. Search Mode: Render Results Grid
  if (query) {
    let searchResults: Book[] = [];
    try {
        searchResults = await dracinApi.search(query, 1);
    } catch (e) {
        console.error("Search failed", e);
    }

    return (
        <div className="min-h-screen bg-[#141414] text-white pt-24 px-4 md:px-12">
            <h1 className="mb-6 text-2xl font-bold">Results for "{query}"</h1>
            {searchResults.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-gray-500">
                    <p className="text-xl">No dramas found matching your search.</p>
                </div>
            ) : (
                <InfiniteDramaList initialItems={searchResults} query={query} />
            )}
        </div>
    );
  }

  // 2. Default Mode: Render Hero + Shelves + Categories
  const categories = [
      "Sistem",
      "Kelahiran kembali",
      "Identitas tersembunyi",
      "Harem",
      "CEO",
      "Pembalasan dendam",
      "Drama sejarah",
      "Romansa"
  ];

  const [trendingData, latestData, ...categoryResults] = await Promise.all([
    dracinApi.getTrending(),
    dracinApi.getLatest(),
    ...categories.map(cat => dracinApi.search(cat).catch(() => []))
  ]);

  // Determine Hero Item (Use first item from Trending)
  const heroItem = trendingData.length > 0 ? trendingData[0] : latestData[0];

  // Icon Mapping
  const getCategoryIcon = (category: string) => {
      const iconClass = "w-6 h-6";
      switch (category) {
          case "Trending Now":
              return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>; // Trending Up
          case "New Releases":
              return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; // Clock
          case "Sistem":
              return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>; // Chip/System
          case "Kelahiran kembali":
              return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>; // Cycle/Refresh
          case "Identitas tersembunyi":
              return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; // Mask/Hidden (Gear as proxy for complex mechanism/hidden) OR just Eye off
          case "Harem":
              return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>; // Heart (Romance/Harem)
          case "CEO":
              return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>; // Briefcase
          case "Pembalasan dendam":
              return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>; // Lightning/Strike
          case "Drama sejarah":
              return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>; // Book/History
          case "Romansa":
              return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; // Face/Romance (Or maybe heart?) Use Smily/Love
          default:
              return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>; // Film
      }
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      <Hero item={heroItem} />
      
      {/* Main Content with improved mobile spacing */}
      <div className="container mx-auto px-4 pb-20 pt-16 md:pt-12 space-y-16">
         {/* Render Trending */}
         {trendingData.length > 0 && <DramaList title="Trending Now" items={trendingData} icon={getCategoryIcon("Trending Now")} />}

         {/* Render Latest */}
         {latestData.length > 0 && <DramaList title="New Releases" items={latestData} icon={getCategoryIcon("New Releases")} />}

         {/* Render Categories */}
         {categories.map((cat, idx) => {
             const items = categoryResults[idx];
             if (items && items.length > 0) {
                 return (
                    <DramaList 
                        key={cat} 
                        title={cat} 
                        items={items.slice(0, 15)} 
                        viewAllLink={`/?query=${encodeURIComponent(cat)}`}
                        icon={getCategoryIcon(cat)}
                    />
                 );
             }
             return null;
         })}
      </div>
    </div>
  );
}
