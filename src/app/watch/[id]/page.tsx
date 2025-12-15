import Link from "next/link";
import { dracinApi } from "@/lib/api";
import DramaList from "@/components/DramaList/DramaList";
import WatchController from "@/components/Watch/WatchController";
import { Episode } from "@/types/dracin";

import { Metadata } from "next";

interface WatchPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
}

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const bookDetails = await dracinApi.getBookDetails(id);
  
  // Fallback title if details fail
  const title = bookDetails?.bookName || "Watch Drama";
  const description = bookDetails?.introduction?.slice(0, 160) || "Watch high quality Chinese dramas on Dracin.";

  return {
    title: `${title} - Dracin`,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: bookDetails?.coverWap ? [ bookDetails.coverWap ] : [],
    }
  };
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { id } = await params;
  const { ep } = await searchParams; // Current episode index or ID

  // Fetch book details (which encompasses episodes)
  const bookDetails = await dracinApi.getBookDetails(id);
  
  // Tag based recommendation
  const tags = bookDetails?.tags || []; // Updated from tagNames
  const similarDramas = await dracinApi.getSimilar(id, tags);

  let episodes: Episode[] = bookDetails?.episodeList || [];
  
  if (episodes.length === 0) {
      return (
          <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">
              <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">Episodes Not Found</h1>
                  <p className="text-gray-400">Could not load episodes for this drama.</p>
                  <Link href="/" className="text-red-600 hover:text-red-500 mt-4 inline-block">
                      Back to Home
                  </Link>
              </div>
          </div>
      );
  }

  // Determine current episode
  const currentEpIndex = ep ? parseInt(ep) : 0;
  const currentEpisode = episodes[currentEpIndex] || episodes[0];

  // Fetch Stream URL for current episode
  if (currentEpisode && currentEpisode.chapterId) {
      try {
          const streamUrl = await dracinApi.getStreamUrl(currentEpisode.chapterId);
          if (streamUrl) {
              currentEpisode.videoUrl = streamUrl;
          }
      } catch (err) {
          console.error("Failed to fetch stream:", err);
      }
  }

  // Construct book details object for passing to FavoriteButton and UI
  const displayBook = {
      bookId: id,
      bookName: bookDetails?.bookName || episodes[0]?.chapterName?.split(' - ')[0] || "Unknown Drama",
      coverWap: bookDetails?.coverWap || episodes[0]?.chapterImg,
      tags: bookDetails?.tags || [],
      introduction: bookDetails?.introduction
  };

  const dramaTitle = displayBook.bookName;
  const dramaIntro = displayBook.introduction || "No description available.";

  return (
    <div className="min-h-screen bg-black pt-4 text-white pb-12">
      <div className="container mx-auto px-4">
        
        {/* Main Watch Layout - Delegated to Client Controller for State Management */}
        <WatchController 
            bookId={id}
            currentEpIndex={currentEpIndex}
            episodes={episodes}
            bookInfo={displayBook}
            currentEpisode={currentEpisode}
            similarDramas={similarDramas}
        />

        {/* Similar Videos Section */}
        {similarDramas.length > 0 && (
            <div className="mt-12 border-t border-gray-800 pt-8">
                <DramaList title="You May Also Like" items={similarDramas} />
            </div>
        )}

      </div>
    </div>
  );
}
