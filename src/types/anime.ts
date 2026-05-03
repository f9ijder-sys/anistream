export interface ReleasePoster {
  src: string;
  preview: string;
  thumbnail: string;
  optimized: { src: string; preview: string; thumbnail: string };
}

export interface ReleaseGenre {
  id: number;
  name: string;
  total_releases?: number;
  image?: { preview: string; thumbnail: string };
}

export interface ReleaseEpisode {
  id: string;
  name: string | null;
  ordinal: number;
  hls_480: string | null;
  hls_720: string | null;
  hls_1080: string | null;
  preview: { src: string; thumbnail?: string } | null;
  sort_order: number;
  duration: number;
  release_id: number;
}

export interface ReleaseMember {
  id: number;
  nickname: string;
}

export interface ReleaseMembers {
  voice?: ReleaseMember[];
  translator?: ReleaseMember[];
  editing?: ReleaseMember[];
  timing?: ReleaseMember[];
}

export interface AniLibriaTitle {
  id: number;
  alias: string;
  name: { main: string; english: string | null; alternative: string | null };
  poster: ReleasePoster;
  type: { value: string; description: string };
  year: number;
  season: { value: string; description: string };
  description: string | null;
  is_ongoing: boolean;
  is_in_production?: boolean;
  episodes_total: number;
  added_in_users_favorites: number;
  genres: ReleaseGenre[];
  publish_day?: { value: number; description: string };
  age_rating?: { label: string; is_adult: boolean };
  fresh_at?: string;
  updated_at?: string;
  // Only in full release detail:
  episodes?: ReleaseEpisode[];
  members?: ReleaseMembers;
}

export interface AniLibriaListResponse {
  list: AniLibriaTitle[];
  pagination?: {
    pages: number;
    items: { total: number; current: number; per_page: number };
  };
}

// Keep for schedule compatibility
export interface AniLibriaScheduleDay {
  day: number;
  list: AniLibriaTitle[];
}
