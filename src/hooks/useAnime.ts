import { useQuery } from '@tanstack/react-query';
import { anilibria } from '@/lib/anilibria';
import { POPULAR_ANIME } from '@/lib/anime-popular';
import { getShikimoriAnime, POPULAR_IDS } from '@/lib/shikimori';
import { ANITUBE_POPULAR } from '@/lib/anitube';

export function useUpdates(limit = 24) {
  return useQuery({
    queryKey: ['updates', limit],
    queryFn: () => anilibria.getUpdates(limit),
    staleTime: 3 * 60 * 1000,
  });
}

export function useSchedule() {
  return useQuery({
    queryKey: ['schedule'],
    queryFn: () => anilibria.getSchedule(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useSearch(query: string, page = 1) {
  return useQuery({
    queryKey: ['search', query, page],
    queryFn: () => anilibria.search(query, 24, page),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000,
  });
}

export function useGenreAnime(genre: string, page = 1) {
  return useQuery({
    queryKey: ['genre', genre, page],
    queryFn: () => anilibria.searchByGenre(genre, 24, page),
    enabled: !!genre,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTitleDetail(id: number) {
  return useQuery({
    queryKey: ['title', id],
    queryFn: () => anilibria.getTitle(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: () => anilibria.getGenres(),
    staleTime: 60 * 60 * 1000,
  });
}

export function useBrowse(params: {
  search?: string;
  genres?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ['browse', params],
    queryFn: () => anilibria.browseWithFilters(params),
    staleTime: 3 * 60 * 1000,
  });
}

export function usePopularAnime() {
  return useQuery({
    queryKey: ['popular-anime'],
    queryFn: async () => {
      const results = await Promise.all(
        POPULAR_ANIME.map(async (anime) => {
          const res = await anilibria.search(anime.query, 1, 1);
          return res.list?.[0] ?? null;
        })
      );
      return results.filter(Boolean);
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useShikimoriPopular() {
  return useQuery({
    queryKey: ['shikimori-popular'],
    queryFn: () => getShikimoriAnime(POPULAR_IDS),
    staleTime: 30 * 60 * 1000,
  });
}

export function useAniTubePopular() {
  return useQuery({
    queryKey: ['anitube-popular'],
    queryFn: async () => {
      const shikimoriIds = ANITUBE_POPULAR.map((a) => a.shikimoriId);
      const shikimoriData = await getShikimoriAnime(shikimoriIds);
      return ANITUBE_POPULAR.map((entry) => {
        const shikimori = shikimoriData.find((s) => s.id === entry.shikimoriId);
        return { ...entry, shikimoriData: shikimori };
      });
    },
    staleTime: 30 * 60 * 1000,
  });
}