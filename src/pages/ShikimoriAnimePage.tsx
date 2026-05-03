import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Tv, Calendar, AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { shikimoriPosterUrl } from '@/lib/shikimori';
import type { ShikimoriAnime } from '@/lib/shikimori';

const SHIKIMORI_BASE = 'https://shikimori.one';
const HEADERS = { 'User-Agent': 'AniStream/1.0' };

interface ShikimoriVideo {
  id: number;
  url: string;
  image_url: string;
  player_url: string;
  name: string;
  kind: string;
  hosting: string;
}

interface ShikimoriAnimeDetail extends ShikimoriAnime {
  description_html?: string;
  aired_on?: string;
  status?: string;
  kind?: string;
  genres?: Array<{ id: number; name: string; russian: string }>;
}

async function fetchAnimeDetail(id: string): Promise<ShikimoriAnimeDetail> {
  const res = await fetch(`${SHIKIMORI_BASE}/api/animes/${id}`, { headers: HEADERS });
  if (!res.ok) throw new Error('Failed to fetch anime');
  return res.json();
}

async function fetchAnimeVideos(id: string): Promise<ShikimoriVideo[]> {
  const res = await fetch(`${SHIKIMORI_BASE}/api/animes/${id}/videos`, { headers: HEADERS });
  if (!res.ok) return [];
  return res.json();
}

export function ShikimoriAnimePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: anime, isLoading, isError } = useQuery({
    queryKey: ['shikimori-detail', id],
    queryFn: () => fetchAnimeDetail(id!),
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
  });

  const { data: videos = [] } = useQuery({
    queryKey: ['shikimori-videos', id],
    queryFn: () => fetchAnimeVideos(id!),
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
  });

  // Pick the best video: prefer full episodes over trailers/cm
  const watchableVideo = videos.find(
    (v) => v.kind !== 'pv' && v.kind !== 'cm' && v.kind !== 'ed' && v.kind !== 'op' && v.player_url
  ) || videos.find((v) => v.player_url);

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !anime) return <ErrorState onBack={() => navigate(-1)} />;

  const posterImg = shikimoriPosterUrl(anime);
  const title = anime.russian || anime.name;
  const score = parseFloat(anime.score);
  const year = anime.aired_on ? new Date(anime.aired_on).getFullYear() : null;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      {/* Backdrop */}
      <div className="relative h-72 sm:h-80 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ backgroundImage: `url(${posterImg})`, filter: 'blur(30px) brightness(0.2)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/60 to-transparent" />
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-44 relative z-10 pb-20">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>

        {/* Top section */}
        <div className="flex flex-col sm:flex-row gap-8 mb-10">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0"
          >
            <img
              src={posterImg}
              alt={title}
              className="w-44 rounded-2xl shadow-2xl ring-1 ring-white/10 mx-auto sm:mx-0"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 min-w-0"
          >
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-1 leading-tight">{title}</h1>
            {anime.name !== title && (
              <p className="text-gray-500 mb-4">{anime.name}</p>
            )}

            {/* Meta badges */}
            <div className="flex flex-wrap gap-3 mb-5">
              {score > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a27] border border-white/5 text-sm text-gray-300">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  {score.toFixed(2)}
                </div>
              )}
              {anime.kind && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a27] border border-white/5 text-sm text-gray-300">
                  <Tv className="w-3.5 h-3.5 text-purple-400" />
                  {anime.kind.toUpperCase()}
                </div>
              )}
              {anime.episodes > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a27] border border-white/5 text-sm text-gray-300">
                  <Tv className="w-3.5 h-3.5 text-purple-400" />
                  {anime.episodes} эп.
                </div>
              )}
              {year && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a27] border border-white/5 text-sm text-gray-300">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  {year}
                </div>
              )}
            </div>

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {anime.genres.map((g) => (
                  <span
                    key={g.id}
                    className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300"
                  >
                    {g.russian || g.name}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Player */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-purple-500 inline-block" />
            Плеер
          </h2>
          <div className="glass rounded-xl border border-white/5 overflow-hidden">
            {watchableVideo ? (
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={watchableVideo.player_url}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  allow="autoplay; fullscreen; picture-in-picture"
                  frameBorder="0"
                  title={title}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-16 px-6">
                <AlertCircle className="w-12 h-12 text-gray-600" />
                <div className="text-center">
                  <p className="text-gray-400 mb-2">Видео недоступно через встроенный плеер</p>
                  <p className="text-gray-600 text-sm mb-4">Смотрите аниме на AniLibria или Shikimori</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <a
                      href={`https://shikimori.one/animes/${id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm transition-colors"
                    >
                      Открыть на Shikimori
                    </a>
                    <a
                      href="https://anilibria.top"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl glass border border-white/10 text-gray-300 hover:text-white text-sm transition-colors"
                    >
                      Открыть AniLibria
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* All available videos list */}
        {videos.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-purple-500 inline-block" />
              Все видео ({videos.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {videos.map((v) => (
                <a
                  key={v.id}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass border border-white/5 rounded-xl p-3 flex items-center gap-3 hover:border-purple-500/30 transition-all group"
                >
                  {v.image_url && (
                    <img
                      src={v.image_url}
                      alt={v.name}
                      className="w-16 h-10 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                      {v.name || v.kind}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{v.hosting}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Description */}
        {anime.description_html && (
          <section className="mb-10">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-purple-500 inline-block" />
              Описание
            </h2>
            <div className="glass rounded-xl border border-white/5 p-5">
              <div
                className="text-gray-300 leading-relaxed text-sm prose-shiki"
                dangerouslySetInnerHTML={{ __html: anime.description_html }}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="skeleton h-72" />
      <div className="max-w-7xl mx-auto px-6 -mt-40 relative z-10 flex gap-8">
        <div className="skeleton w-44 h-64 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-4 pt-16">
          <div className="skeleton h-10 rounded w-1/2" />
          <div className="skeleton h-5 rounded w-1/3" />
          <div className="skeleton h-20 rounded" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-10">
        <div className="skeleton aspect-video rounded-xl" />
      </div>
    </div>
  );
}

function ErrorState({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <Navbar />
      <div className="text-center">
        <p className="text-4xl mb-3">😔</p>
        <p className="text-gray-400 mb-4">Не удалось загрузить аниме</p>
        <button
          onClick={onBack}
          className="text-purple-400 hover:text-purple-300 transition-colors"
        >
          Назад
        </button>
      </div>
    </div>
  );
}
