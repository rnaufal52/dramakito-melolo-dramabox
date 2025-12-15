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

  return (
    <div className="min-h-screen bg-black pb-20">
      <Hero item={heroItem} />
      
      <div className="-mt-32 relative z-30 space-y-2 md:space-y-4">
         {/* Render Trending */}
         {trendingData.length > 0 && <DramaList title="Trending Now" items={trendingData} />}

         {/* Render Latest */}
         {latestData.length > 0 && <DramaList title="New Releases" items={latestData} />}

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
                    />
                 );
             }
             return null;
         })}
      </div>
    </div>
  );
}
