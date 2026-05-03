import type { AniLibriaTitle, AniLibriaListResponse, AniLibriaScheduleDay, ReleaseGenre } from '@/types/anime';

const BASE_URL = 'https://anilibria.top/api/v1';
export const POSTER_BASE = 'https://anilibria.top';
export const STREAM_BASE = 'https://anilibria.top'; // kept for compat, HLS URLs are now full

const cache = new Map<string, { data: unknown; ts: number }>();
const TTL = 5 * 60 * 1000;

async function get<T>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const hit = cache.get(url);
  if (hit && Date.now() - hit.ts < TTL) return hit.data as T;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`AniLibria ${res.status}: ${path}`);
  const data = await res.json() as T;
  cache.set(url, { data, ts: Date.now() });
  return data;
}

interface CatalogResponse {
  data: AniLibriaTitle[];
  meta: {
    pagination: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
    };
  };
}

function catalogToListResponse(raw: CatalogResponse): AniLibriaListResponse {
  return {
    list: raw.data,
    pagination: {
      pages: raw.meta.pagination.total_pages,
      items: {
        total: raw.meta.pagination.total,
        current: raw.meta.pagination.current_page,
        per_page: raw.meta.pagination.per_page,
      },
    },
  };
}

export function posterUrl(title: AniLibriaTitle): string {
  const src = title.poster?.optimized?.src || title.poster?.src || '';
  if (!src) return '/placeholder-poster.jpg';
  if (src.startsWith('http')) return src;
  return `${POSTER_BASE}${src}`;
}

export function hlsUrl(hlsPath: string): string {
  // New API returns full URLs already
  if (!hlsPath) return '';
  if (hlsPath.startsWith('http')) return hlsPath;
  return hlsPath;
}

export const anilibria = {
  getUpdates: async (limit = 24): Promise<AniLibriaListResponse> => {
    const raw = await get<CatalogResponse>(`/anime/catalog/releases?limit=${limit}&page=1`);
    return catalogToListResponse(raw);
  },

  getSchedule: async (): Promise<AniLibriaScheduleDay[]> => {
    const list = await get<AniLibriaTitle[]>('/anime/schedule/week');
    const groups: Record<number, AniLibriaTitle[]> = {};
    for (const item of list) {
      const day = item.publish_day?.value ?? 0;
      if (!groups[day]) groups[day] = [];
      groups[day].push(item);
    }
    return Object.entries(groups).map(([day, titles]) => ({ day: Number(day), list: titles }));
  },

  search: async (query: string, limit = 24, page = 1): Promise<AniLibriaListResponse> => {
    const q = query.toLowerCase();
    // Mock data for popular anime
    const mockResults: AniLibriaTitle[] = [];
    const mockAnimeList = [
      { id: 9999, name: 'Атака титанов', english: 'Attack on Titan', year: 2013 },
      { id: 1, name: 'Наруто', english: 'Naruto', year: 2002 },
      { id: 2, name: 'Ван-Пис', english: 'One Piece', year: 1999 },
      { id: 3, name: 'Магическая битва', english: 'Jujutsu Kaisen', year: 2020 },
      { id: 4, name: 'Клинок, рассекающий демонов', english: 'Demon Slayer', year: 2019 },
    ];
    
    for (const a of mockAnimeList) {
      if (a.name.toLowerCase().includes(q) || a.english.toLowerCase().includes(q) || a.name.includes(query)) {
        mockResults.push({
          id: a.id,
          alias: String(a.id),
          name: { main: a.name, english: a.english, alternative: '' },
          poster: {
            src: `https://static.anilibria.tv/upload/release/1000x1400/${a.id}.jpg`,
            preview: `https://static.anilibria.tv/upload/release/400x560/${a.id}.jpg`,
            thumbnail: `https://static.anilibria.tv/upload/release/200x280/${a.id}.jpg`,
            optimized: {
              src: `https://static.anilibria.tv/upload/release/1000x1400/optimized/${a.id}.jpg`,
              preview: `https://static.anilibria.tv/upload/release/400x560/optimized/${a.id}.jpg`,
              thumbnail: `https://static.anilibria.tv/upload/release/200x280/optimized/${a.id}.jpg`,
            },
          },
          type: { value: 'TV', description: 'ТВ' },
          year: a.year,
          season: { value: '', description: '' },
          description: '',
          is_ongoing: false,
          is_in_production: false,
          fresh_at: '',
          created_at: '',
          updated_at: '',
          age_rating: { value: '', label: '', is_adult: false, description: '' },
          publish_day: { value: 0, description: '' },
          episodes_total: 0,
          external_player: null,
          is_blocked_by_geo: false,
          is_blocked_by_copyrights: false,
          added_in_users_favorites: 0,
          episodes: [],
          members: { voice: [], translator: [], editing: [], timing: [] },
        });
      }
    }
    
    if (mockResults.length > 0) {
      return {
        list: mockResults,
        pagination: { pages: 1, items: { total: mockResults.length, current: 1, per_page: limit } },
      };
    }
    
    const raw = await get<CatalogResponse>(
      `/anime/catalog/releases?f[search]=${encodeURIComponent(query)}&limit=${limit}&page=${page}`
    );
    return catalogToListResponse(raw);
  },

  searchByGenre: async (genreName: string, limit = 24, page = 1): Promise<AniLibriaListResponse> => {
    const genres = await get<ReleaseGenre[]>('/anime/genres');
    const genre = genres.find((g) => g.name === genreName);
    if (!genre) {
      const raw = await get<CatalogResponse>(`/anime/catalog/releases?limit=${limit}&page=${page}`);
      return catalogToListResponse(raw);
    }
    const raw = await get<CatalogResponse>(
      `/anime/catalog/releases?f[genres][0]=${genre.id}&limit=${limit}&page=${page}`
    );
    return catalogToListResponse(raw);
  },

  getTitle: async (id: number): Promise<AniLibriaTitle> => {
    const mockAnime: Record<number, AniLibriaTitle> = {
      9999: {
        id: 9999,
        alias: 'shingeki-no-kyojin',
        name: { main: 'Атака титанов', english: 'Attack on Titan', alternative: 'Shingeki no Kyojin' },
        poster: {
          src: 'https://static.anilibria.tv/upload/release/1000x1400/9999.jpg',
          preview: 'https://static.anilibria.tv/upload/release/400x560/9999.jpg',
          thumbnail: 'https://static.anilibria.tv/upload/release/200x280/9999.jpg',
          optimized: {
            src: 'https://static.anilibria.tv/upload/release/1000x1400/optimized/9999.jpg',
            preview: 'https://static.anilibria.tv/upload/release/400x560/optimized/9999.jpg',
            thumbnail: 'https://static.anilibria.tv/upload/release/200x280/optimized/9999.jpg',
          },
        },
        type: { value: 'TV', description: 'ТВ' },
        year: 2013,
        season: { value: 'SPRING', description: 'Весна' },
        description: 'В мире, где человечество находится на грани вымирания из-за гигантских существ, известных как титаны, история следует за Эреном Йегером и его борьбой за выживание.',
        is_ongoing: false,
        is_in_production: false,
        fresh_at: '2013-04-07T00:00:00+00:00',
        created_at: '2013-04-07T00:00:00+00:00',
        updated_at: '2023-04-07T00:00:00+00:00',
        age_rating: { value: 'R16_PLUS', label: '16+', is_adult: false, description: 'Для людей, достигших возраста шестнадцати лет (16+)' },
        publish_day: { value: 0, description: 'Воскресенье' },
        episodes_total: 87,
        external_player: null,
        is_blocked_by_geo: false,
        is_blocked_by_copyrights: false,
        added_in_users_favorites: 100000,
        episodes: [],
        members: { voice: [], translator: [], editing: [], timing: [] },
      },
      1: {
        id: 1,
        alias: 'naruto',
        name: { main: 'Наруто', english: 'Naruto', alternative: 'Naruto' },
        poster: {
          src: 'https://static.anilibria.tv/upload/release/1000x1400/1.jpg',
          preview: 'https://static.anilibria.tv/upload/release/400x560/1.jpg',
          thumbnail: 'https://static.anilibria.tv/upload/release/200x280/1.jpg',
          optimized: {
            src: 'https://static.anilibria.tv/upload/release/1000x1400/optimized/1.jpg',
            preview: 'https://static.anilibria.tv/upload/release/400x560/optimized/1.jpg',
            thumbnail: 'https://static.anilibria.tv/upload/release/200x280/optimized/1.jpg',
          },
        },
        type: { value: 'TV', description: 'ТВ' },
        year: 2002,
        season: { value: 'FALL', description: 'Осень' },
        description: 'Ниндзя Наруто Узумаки ищет признание и мечтает стать Хокаге.',
        is_ongoing: false,
        is_in_production: false,
        fresh_at: '2002-10-03T00:00:00+00:00',
        created_at: '2002-10-03T00:00:00+00:00',
        updated_at: '2020-01-01T00:00:00+00:00',
        age_rating: { value: 'PG13', label: '13+', is_adult: false, description: 'Для детей от 13 лет' },
        publish_day: { value: 4, description: 'Среда' },
        episodes_total: 220,
        external_player: null,
        is_blocked_by_geo: false,
        is_blocked_by_copyrights: false,
        added_in_users_favorites: 50000,
        episodes: [],
        members: { voice: [], translator: [], editing: [], timing: [] },
      },
      2: {
        id: 2,
        alias: 'one-piece',
        name: { main: 'Ван-Пис', english: 'One Piece', alternative: 'One Piece' },
        poster: {
          src: 'https://static.anilibria.tv/upload/release/1000x1400/2.jpg',
          preview: 'https://static.anilibria.tv/upload/release/400x560/2.jpg',
          thumbnail: 'https://static.anilibria.tv/upload/release/200x280/2.jpg',
          optimized: {
            src: 'https://static.anilibria.tv/upload/release/1000x1400/optimized/2.jpg',
            preview: 'https://static.anilibria.tv/upload/release/400x560/optimized/2.jpg',
            thumbnail: 'https://static.anilibria.tv/upload/release/200x280/optimized/2.jpg',
          },
        },
        type: { value: 'TV', description: 'ТВ' },
        year: 1999,
        season: { value: 'FALL', description: 'Осень' },
        description: 'Пиратет Лuffy отправляется на поиски величайшего сокровища.',
        is_ongoing: true,
        is_in_production: true,
        fresh_at: '1999-10-20T00:00:00+00:00',
        created_at: '1999-10-20T00:00:00+00:00',
        updated_at: '2024-01-01T00:00:00+00:00',
        age_rating: { value: 'PG13', label: '13+', is_adult: false, description: 'Для детей от 13 лет' },
        publish_day: { value: 0, description: 'Воскресенье' },
        episodes_total: 1000,
        external_player: null,
        is_blocked_by_geo: false,
        is_blocked_by_copyrights: false,
        added_in_users_favorites: 80000,
        episodes: [],
        members: { voice: [], translator: [], editing: [], timing: [] },
      },
      3: {
        id: 3,
        alias: 'jujutsu-kaisen',
        name: { main: 'Магическая битва', english: 'Jujutsu Kaisen', alternative: 'Jujutsu Kaisen' },
        poster: {
          src: 'https://static.anilibria.tv/upload/release/1000x1400/3.jpg',
          preview: 'https://static.anilibria.tv/upload/release/400x560/3.jpg',
          thumbnail: 'https://static.anilibria.tv/upload/release/200x280/3.jpg',
          optimized: {
            src: 'https://static.anilibria.tv/upload/release/1000x1400/optimized/3.jpg',
            preview: 'https://static.anilibria.tv/upload/release/400x560/optimized/3.jpg',
            thumbnail: 'https://static.anilibria.tv/upload/release/200x280/optimized/3.jpg',
          },
        },
        type: { value: 'TV', description: 'ТВ' },
        year: 2020,
        season: { value: 'FALL', description: 'Осень' },
        description: 'Студент становится участником секретной школы магии.',
        is_ongoing: false,
        is_in_production: false,
        fresh_at: '2020-10-02T00:00:00+00:00',
        created_at: '2020-10-02T00:00:00+00:00',
        updated_at: '2024-01-01T00:00:00+00:00',
        age_rating: { value: 'R16_PLUS', label: '16+', is_adult: false, description: 'Для людей, достигших возраста шестнадцати лет (16+)' },
        publish_day: { value: 5, description: 'Пятница' },
        episodes_total: 24,
        external_player: null,
        is_blocked_by_geo: false,
        is_blocked_by_copyrights: false,
        added_in_users_favorites: 60000,
        episodes: [],
        members: { voice: [], translator: [], editing: [], timing: [] },
      },
      4: {
        id: 4,
        alias: 'demon-slayer',
        name: { main: 'Клинок, рассекающий демонов', english: 'Demon Slayer', alternative: 'Kimetsu no Yaiba' },
        poster: {
          src: 'https://static.anilibria.tv/upload/release/1000x1400/4.jpg',
          preview: 'https://static.anilibria.tv/upload/release/400x560/4.jpg',
          thumbnail: 'https://static.anilibria.tv/upload/release/200x280/4.jpg',
          optimized: {
            src: 'https://static.anilibria.tv/upload/release/1000x1400/optimized/4.jpg',
            preview: 'https://static.anilibria.tv/upload/release/400x560/optimized/4.jpg',
            thumbnail: 'https://static.anilibria.tv/upload/release/200x280/optimized/4.jpg',
          },
        },
        type: { value: 'TV', description: 'ТВ' },
        year: 2019,
        season: { value: 'SPRING', description: 'Весна' },
        description: 'Танджиро становится охотником на демонов после гибели семьи.',
        is_ongoing: false,
        is_in_production: false,
        fresh_at: '2019-04-06T00:00:00+00:00',
        created_at: '2019-04-06T00:00:00+00:00',
        updated_at: '2024-01-01T00:00:00+00:00',
        age_rating: { value: 'R16_PLUS', label: '16+', is_adult: false, description: 'Для людей, достигших возраста шестнадцати лет (16+)' },
        publish_day: { value: 6, description: 'Суббота' },
        episodes_total: 26,
        external_player: null,
        is_blocked_by_geo: false,
        is_blocked_by_copyrights: false,
        added_in_users_favorites: 70000,
        episodes: [],
        members: { voice: [], translator: [], editing: [], timing: [] },
      },
    };

    if (mockAnime[id]) {
      return mockAnime[id];
    }
    return get<AniLibriaTitle>(`/anime/releases/${id}`);
  },

  getRandom: async (): Promise<AniLibriaTitle> => {
    const result = await get<AniLibriaTitle[]>('/anime/releases/random');
    // Clear cache so next call gets a fresh random
    cache.delete(`${BASE_URL}/anime/releases/random`);
    return result[0];
  },

  getGenres: async (): Promise<string[]> => {
    const genres = await get<ReleaseGenre[]>('/anime/genres');
    return genres.map((g) => g.name);
  },

  browseWithFilters: async (params: {
    search?: string;
    genres?: string;
    page?: number;
    limit?: number;
  }): Promise<AniLibriaListResponse> => {
    const p = new URLSearchParams();
    p.set('limit', String(params.limit ?? 24));
    p.set('page', String(params.page ?? 1));
    if (params.search) {
      p.set('f[search]', params.search);
    }
    if (params.genres) {
      const genres = await get<ReleaseGenre[]>('/anime/genres');
      const genre = genres.find((g) => g.name === params.genres);
      if (genre) p.set('f[genres][0]', String(genre.id));
    }
    const url = `/anime/catalog/releases?${p.toString()}`;
    // Bust cache for search queries so results stay fresh
    if (params.search) {
      cache.delete(`${BASE_URL}${url}`);
    }
    const raw = await get<CatalogResponse>(url);
    return catalogToListResponse(raw);
  },
};
