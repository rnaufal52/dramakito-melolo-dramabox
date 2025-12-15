import { Book } from "@/types/dracin";
import Link from "next/link";
import React from "react";

interface HeroProps {
  item?: Book | any;
}

const Hero: React.FC<HeroProps> = ({ item }) => {
  if (!item) return null;

  const bgImage = item.coverWap;
  const title = item.bookName;
  const description = item.introduction || "No description available.";
  const id = item.bookId;

  return (
    <div className="relative h-[80vh] w-full overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity"
          style={{ backgroundImage: `url('${bgImage}')` }}
        ></div>

        <div className="relative z-20 flex h-full flex-col justify-end px-4 pb-12 container mx-auto md:px-12 md:pb-24">
            <h1 className="mb-4 max-w-4xl text-5xl font-extrabold leading-tight text-white drop-shadow-lg md:text-7xl">
                {title}
            </h1>
            <p className="mb-8 max-w-2xl text-lg text-gray-200 line-clamp-3 drop-shadow-md">
                {description}
            </p>
            <div className="flex space-x-4">
                <Link href={`/watch/${id}`} className="flex items-center rounded bg-white px-8 py-3 font-bold text-black transition-colors hover:bg-gray-200">
                    <svg className="mr-2 h-6 w-6" viewBox="0 0 24 24"><path d="M3 22v-20l18 10-18 10z"></path></svg>
                    Play
                </Link>
                <Link href={`/watch/${id}`} className="flex items-center rounded bg-gray-500/70 px-8 py-3 font-bold text-white transition-colors hover:bg-gray-500/50">
                    <svg className="mr-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    More Info
                </Link>
            </div>
        </div>
    </div>
  );
};

export default Hero;
