export interface Tag {
  tagId: number;
  tagName: string;
  tagEnName: string;
}

export interface BookSource {
  sceneId: string;
  expId: string;
  strategyId: string;
  strategyName: string;
  log_id: string;
}

export interface VideoPath {
    quality: number;
    videoPath: string;
    isDefault: number;
}

export interface CdnItem {
    cdnDomain: string;
    isDefault: number;
    videoPathList: VideoPath[];
}

export interface Episode {
    chapterId: string;
    chapterName: string;
    chapterCover?: string; // Some responses might not have it, or named chapterImg
    chapterImg?: string;
    cdnList?: CdnItem[];
    // properties from previous assumption that might not exist or need mapping
    videoUrl?: string; 
    duration?: string;
    index?: number;
}

export interface Book {
  bookId: string;
  bookName: string;
  coverWap: string;
  bookSource?: BookSource;
  algorithmRecomDot?: string;
  chapterCount?: number;
  introduction?: string;
  tags?: string[];
  tagV3s?: Tag[];
  playCount?: string;
  bookShelfTime?: number;
  shelfTime?: string;
  inLibrary?: boolean;
  status?: string; // e.g. "Ongoing", "Completed", "Total 75 episodes"
  // Additional fields for detail view
  episodeList?: Episode[];
}

export interface TagCardVo {
  tagId: number;
  tagName: string;
  tagEnName: string;
  tagBooks: Book[];
}

export interface ApiItem {
  isEntry: number;
  index: number;
  dataFrom: string;
  cardType: number; 
  tagCardVo?: TagCardVo;
  bookId?: string;
  bookName?: string;
  coverWap?: string;
  introduction?: string;
  tags?: string[];
  tagV3s?: Tag[];
  playCount?: string;
  corner?: {
    cornerType: number;
    name: string;
    color: string;
  };
}

export type ApiResponse = ApiItem[];

export interface MeloloBook {
    book_id: string;
    book_name: string;
    thumb_url: string; // "coverWap"
    abstract: string; // "introduction"
    category_info: string; // JSON string
    stat_infos: string[];
    serial_count?: string;
    recommend_reason?: string;
    score?: string;
    tags?: string; 
}

export interface MeloloResponse {
    books: MeloloBook[];
    has_more: boolean;
    next_offset: number;
}
