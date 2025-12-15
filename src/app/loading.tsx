import Skeleton from "@/components/UI/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar Skeleton */}
      <div className="h-20 w-full border-b border-white/10 flex items-center px-8">
         <Skeleton className="h-8 w-32" />
         <div className="flex-1"></div>
         <div className="flex gap-4">
             <Skeleton className="h-8 w-16" />
             <Skeleton className="h-8 w-16" />
         </div>
      </div>

      {/* Hero Skeleton */}
      <div className="relative h-[50vh] w-full px-8 py-12 flex flex-col justify-center gap-4">
          <Skeleton className="h-10 w-2/3 md:w-1/3" />
          <Skeleton className="h-4 w-1/2 md:w-1/4" />
          <div className="flex gap-4 mt-4">
              <Skeleton className="h-10 w-32 rounded-full" />
              <Skeleton className="h-10 w-32 rounded-full" />
          </div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="container mx-auto px-4 py-8 space-y-8">
          {[1, 2].map((section) => (
              <div key={section}>
                  <Skeleton className="h-6 w-48 mb-4" />
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {[1, 2, 3, 4, 5].map((item) => (
                          <div key={item} className="space-y-2">
                              <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                          </div>
                      ))}
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}
