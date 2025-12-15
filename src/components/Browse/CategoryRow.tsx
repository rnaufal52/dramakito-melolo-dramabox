import Link from "next/link";
import DramaCard from "@/components/DramaCard/DramaCard";
import { Book } from "@/types/dracin";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

interface CategoryRowProps {
  title: string;
  items: Book[];
}

export default function CategoryRow({ title, items }: CategoryRowProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between px-4 md:px-12">
        <h2 className="text-xl font-semibold text-white md:text-2xl">{title}</h2>
        <Link 
            href={`/browse?query=${encodeURIComponent(title)}`}
            className="group flex items-center text-sm font-medium text-gray-400 transition-colors hover:text-white"
        >
            View All
            <ChevronRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="relative group">
        <div className="flex overflow-x-auto space-x-4 px-4 md:px-12 pb-4 scrollbar-hide snap-x snap-mandatory">
          {items.map((item, idx) => (
            <div key={`${item.bookId}-${idx}`} className="flex-none w-[140px] md:w-[180px] snap-center transition-transform hover:scale-105">
               <div className="aspect-[2/3]">
                  <DramaCard drama={item} />
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
