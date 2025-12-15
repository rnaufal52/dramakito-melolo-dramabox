import { Book, MeloloBook, MeloloResponse, ApiItem } from "@/types/dracin";

const DRAMABOX_BASE = process.env.NEXT_PUBLIC_DRAMABOX_API;
const MELOLO_BASE = process.env.NEXT_PUBLIC_MELOLO_API;
const PROXY_BASE = process.env.NEXT_PUBLIC_IMAGE_PROXY_BASE;

function getProxiedImage(url: string | undefined): string {
    if (!url) return "";
    // If it's a HEIC image, use wsrv.nl to convert it to JPG and bypass potential hotlink/signature issues for browsers that don't support HEIC
    if (url.includes(".heic")) {
        return `${PROXY_BASE}/?url=${encodeURIComponent(url)}&output=jpg`;
    }
    return url;
}

// Helper to map Melolo raw objects to our Book interface
function mapMeloloBook(item: MeloloBook | any): Book {
  // Handle both "Latest" (book_id) and "Detail" (series_id) formats
  const id = item.book_id || item.series_id || item.series_id_str;
  const title = item.book_name || item.series_title;
  const cover = getProxiedImage(item.thumb_url || item.series_cover);
  const intro = item.abstract || item.series_intro;
  const count = item.serial_count || item.episode_cnt;
  
  // Extract tags: stat_infos might be strings or objects { id, name }
  // User identified 'category_schema' as a JSON string source for tags.
  let tags: string[] = [];
  const rawTags = item.stat_infos || item.rec_tags || item.tag_list || item.classify_list || item.category_schema || [];
  
  // Helper to parse if string looks like JSON
  let processedTags = rawTags;
  if (typeof rawTags === 'string' && rawTags.startsWith('[')) {
      try {
          processedTags = JSON.parse(rawTags);
      } catch {
          processedTags = [];
      }
  }

  if (Array.isArray(processedTags)) {
      tags = processedTags.flatMap((t: any) => {
          if (typeof t === 'string') {
               // Split comma-separated strings like "Tag1, Tag2"
               return t.split(',').map(s => s.trim());
          }
          if (typeof t === 'object') {
              // Try common name fields
              return t.name || t.tag_name || t.classify_name || "";
          }
          return "";
      }).filter(Boolean);
  }

  // Extract status
  let statusStr = "";
  if (item.episode_right_text) statusStr = item.episode_right_text;
  else if (item.series_status === 1) statusStr = "Ongoing"; 
  else if (item.series_status === 2) statusStr = "Completed";

  return {
    bookId: String(id),
    bookName: title,
    coverWap: cover, 
    introduction: intro,
    chapterCount: count ? parseInt(String(count)) : 0,
    tags: tags,
    status: statusStr,
  };
}

// Helper to map Dramabox raw objects (which are loose) to Book
function mapDramaboxItem(item: ApiItem | any): Book {
    return {
        bookId: item.bookId,
        bookName: item.bookName || item.tagCardVo?.tagBooks?.[0]?.bookName || "Unknown",
        coverWap: item.coverWap || item.cover || "",
        introduction: item.introduction,
        tags: item.tagNames || item.tags || [],
        chapterCount: item.chapterCount,
        // Dramabox items usually don't have episode list attached unless specifically queried
    };
}

async function fetchMelolo<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${MELOLO_BASE}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  try {
    // Cache for 1 hour (3600 seconds) to improve performance
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Melolo fetch failed: ${endpoint}`);
    return res.json();
  } catch (e) {
    console.error(e);
    return {} as T;
  }
}

async function fetchDramabox(endpoint: string, params: Record<string, string> = {}): Promise<any[]> {
  const url = new URL(`${DRAMABOX_BASE}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Dramabox fetch failed: ${endpoint}`);
    return res.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}

export const dracinApi = {
  getLatest: async (): Promise<Book[]> => {
    const [meloloRes, dramaboxRes] = await Promise.all([
        fetchMelolo<MeloloResponse>("/latest"),
        fetchDramabox("/latest").catch(() => []) 
    ]);
    
    // Safety check for meloloRes
    const meloloBooks = (meloloRes && meloloRes.books ? meloloRes.books : []).map(mapMeloloBook);
    
    const dramaboxList = Array.isArray(dramaboxRes) ? dramaboxRes : [];
    const dramaboxBooks = dramaboxList
        .filter((item: any) => item?.bookId)
        .map(mapDramaboxItem);

    return [...meloloBooks, ...dramaboxBooks];
  },

  getTrending: async (): Promise<Book[]> => {
     const [meloloRes, dramaboxRes] = await Promise.all([
        fetchMelolo<MeloloResponse>("/trending"),
        fetchDramabox("/trending").catch(() => [])
     ]);

     const meloloBooks = (meloloRes && meloloRes.books ? meloloRes.books : []).map(mapMeloloBook);
     
     const dramaboxList = Array.isArray(dramaboxRes) ? dramaboxRes : [];
     const dramaboxBooks = dramaboxList
        .filter((item: any) => item?.bookId)
        .map(mapDramaboxItem);
     
     return [...meloloBooks, ...dramaboxBooks];
  },

  search: async (query: string, page: number = 1): Promise<Book[]> => {
     // Calculate offset. Melolo likely uses 0-based or 1-based offset or pure row index. 
     // Assuming offset = (page - 1) * limit based on standard APIs. 
     // "limit" is 20.
     const limit = 20;
     const offset = String((page - 1) * limit);

     const [meloloRes, dramaboxRes] = await Promise.all([
        fetchMelolo<MeloloResponse>("/search", { query, limit: String(limit), offset }),
        fetchDramabox("/search", { query }).catch(() => [])
     ]);

     // Melolo search structure: { data: { search_data: [ { books: [...] }, ... ] } }
     const meloloBooks: Book[] = [];
     const searchData = (meloloRes as any)?.data?.search_data; // Cast to any to access nested fields safely
     
     if (Array.isArray(searchData)) {
         searchData.forEach((group: any) => {
             if (Array.isArray(group.books)) {
                 meloloBooks.push(...group.books.map(mapMeloloBook));
             }
         });
     } else if ((meloloRes as any)?.books) {
         // Fallback to flat list if schema changes to match latest
         meloloBooks.push(...(meloloRes as any).books.map(mapMeloloBook));
     }

     const dramaboxList = Array.isArray(dramaboxRes) ? dramaboxRes : [];
     const dramaboxBooks = dramaboxList
        .filter((item: any) => item?.bookId || item?.cardType === 1)
        .map(mapDramaboxItem);

     return [...meloloBooks, ...dramaboxBooks];
  },

  getBookDetails: async (bookId: string): Promise<Book | null> => {
      // 1. Try Melolo Detail Endpoint directly
      try {
          const res = await fetchMelolo<any>(`/detail/${bookId}`);
          // Response structure: { data: { video_data: { ... } } }
          const data = res.data?.video_data || res.data || res;

          // Check if we found valid data with an ID (series_id)
          if (data && (data.series_id || data.book_id)) {
              const book = mapMeloloBook(data);
              
              // Extract chapters/episodes
              const rawChapters = data.video_list || data.chapter_list;
              
              if (Array.isArray(rawChapters)) {
                  book.episodeList = rawChapters.map((ch: any) => {
                      // Fix for synopsis appearing as episode title
                      // If title is super long (> 50 chars), it's likely a synopsis or mistake. Use index.
                      let epName = ch.title || ch.chapter_name || "";
                      if (epName.length > 50) epName = ""; // Too long, probably description
                      if (!epName) epName = `Episode ${ch.vid_index || ch.index}`;

                      return {
                          chapterId: ch.vid || ch.chapter_id,
                          chapterName: epName,
                          chapterImg: getProxiedImage(ch.episode_cover || ch.cover || ch.chapter_cover || book.coverWap),
                          index: ch.vid_index || ch.index,
                          videoUrl: "" 
                      };
                  });
              }
              return book;
          }
      } catch (e) {
         // Continue to Dramabox fallback
      }

      // 2. Fallback to Dramabox (Search lists)
      try {
          // Dramabox has no detail endpoint, so we search trending/latest/foryou
          const [trending, latest] = await Promise.all([
             fetchDramabox("/trending"),
             fetchDramabox("/latest")
          ]);
          
          const all = [...trending, ...latest];
          const found = all.find((b: any) => b.bookId === bookId);
          
          if (found) {
              const book = mapDramaboxItem(found);
              // Fetch episodes for Dramabox items
              const eps = await dracinApi.getAllEpisodes(bookId);
              book.episodeList = eps; // eps is Episode[] already
              return book;
          }
      } catch (e) {
         console.error("Dramabox detail lookup failed", e);
      }
      return null;
  },

  getStreamUrl: async (chapterId: string): Promise<string> => {
      // Only Melolo supports this explicit stream endpoint
      try {
          const res = await fetchMelolo<any>(`/stream/${chapterId}`);
          const data = res.data || res;
          // Melolo stream response often has 'main_url'
          return data?.main_url || data?.url || data?.stream_url || "";
      } catch {
          return "";
      }
  },

  getAllEpisodes: async (bookId: string): Promise<any[]> => {
      // For Dramabox mainly. Melolo uses getBookDetails logic.
      const res = await fetchDramabox("/allepisode", { bookId });
      if (Array.isArray(res) && res.length > 0) {
          return res.map((item: any) => ({
             chapterId: item.chapterId,
             chapterName: item.chapterName,
             chapterImg: item.chapterImg,
             videoUrl: item.cdnList?.[0]?.videoPathList?.[0]?.videoPath || ''
          }));
      }
      return [];
  },
  
  // Legacy support
  getSimilar: async (bookId: string, tags: string[] = []): Promise<Book[]> => {
       try {
         const trending = await dracinApi.getTrending();
         if (tags.length === 0) return trending.slice(0, 10);
         const similar = trending.filter(b => b.bookId !== bookId && b.tags?.some(t => tags.includes(t)));
         return similar.length > 0 ? similar : trending.slice(0, 10);
       } catch { return []; }
  }
};
