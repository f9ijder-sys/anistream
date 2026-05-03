const BASE = 'https://shikimori.one';
const HEADERS = { 'User-Agent': 'AniStream/1.0' };

export interface ShikimoriAnime {
  id: number;
  name: string;
  russian: string;
  image: { original: string; preview: string };
  score: string;
  episodes: number;
  description?: string;
}

// Shikimori IDs for popular anime not available on AniLibria
export const POPULAR_IDS = [
  16498, // Атака Титанов (Shingeki no Kyojin)
  20,    // Наруто
  269,   // Блич
  21,    // One Piece
  11061, // Hunter x Hunter (2011)
  38524, // Demon Slayer (Kimetsu no Yaiba)
  5114,  // Fullmetal Alchemist: Brotherhood
  1535,  // Death Note
  22319, // Tokyo Ghoul
  31964, // My Hero Academia
];

export async function getShikimoriAnime(ids: number[]): Promise<ShikimoriAnime[]> {
  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        const res = await fetch(`${BASE}/api/animes/${id}`, { headers: HEADERS });
        if (!res.ok) return null;
        return res.json() as Promise<ShikimoriAnime>;
      } catch {
        return null;
      }
    })
  );
  return results.filter(Boolean) as ShikimoriAnime[];
}

export function shikimoriPosterUrl(anime: ShikimoriAnime): string {
  const path = anime.image?.original || anime.image?.preview || '';
  if (!path) return '/placeholder-poster.jpg';
  if (path.startsWith('http')) return path;
  return `${BASE}${path}`;
}

export function shikimoriUrl(anime: ShikimoriAnime): string {
  return `${BASE}/animes/${anime.id}`;
}
