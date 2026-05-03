import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Tv, Calendar, ExternalLink } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { ANITUBE_POPULAR, aniTubeEmbedUrl, aniTubePageUrl } from '@/lib/anitube';
import { shikimoriPosterUrl } from '@/lib/shikimori';
import type { ShikimoriAnime } from '@/lib/shikimori';

const SHIKIMORI_BASE = 'https://shikimori.one';
const HEADERS = { 'User-Agent': 'AniStream/1.0' };

interface ShikimoriAnimeDetail extends ShikimoriAnime {
  description_html?: string;
  aired_on?: string;
  status?: string;
  kind?: string;
  genres?: Array<{ id: number; name: string; russian: string }>;
}

async function fetchAnimeDetail(shikimoriId: number): Promise<ShikimoriAnimeDetail> {
  const res = await fetch(`${SHIKIMORI_BASE}/api/animes/${shikimoriId}`, { headers: HEADERS });
  if (!res.ok) throw new Error('Failed to fetch anime');
  return res.json();
}

export function AniTubePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const aniTubeId = parseInt(id ?? '0', 10);
  const entry = ANITUBE_POPULAR.find((a) => a.id === aniTubeId);

  const { data: anime, isLoading, isError } = useQuery({
    queryKey: ['shikimori-detail-for-anitube', entry?.shikimoriId],
    queryFn: () => fetchAnimeDetail(entry!.shikimoriId),
    enabled: !!entry,
    staleTime: 15 * 60 * 1000,
  });

  if (!entry) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <p className="text-4xl mb-3">😔</p>
          <p className="text-gray-400 mb-4">Аніме не знайдено</p>
          <button onClick={() => navigate(-1)} className="text-purple-400 hover:text-purple-300 transition-colors">
            Назад
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !anime) return <ErrorState onBack={() => navigate(-1)} />;

  const posterImg = shikimoriPosterUrl(anime);
  const score = parseFloat(anime.score);
  const year = anime.aired_on ? new Date(anime.aired_on).getFullYear() : null;
  const embedUrl = aniTubeEmbedUrl(entry.id);
  const externalUrl = aniTubePageUrl(entry.id, entry.slug);

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
            className="flex-shrink-0 relative"
          >
            <img
              src={posterImg}
              alt={entry.titleUkr}
              className="w-44 rounded-2xl shadow-2xl ring-1 ring-white/10 mx-auto sm:mx-0"
            />
            {/* УКР badge on poster */}
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm border border-yellow-400/30">
              <span className="text-[10px] font-bold" style={{ color: '#FFD700' }}>🇺🇦 УКР</span>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 min-w-0"
          >
            {/* Ukrainian voice badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-xs text-yellow-300 font-semibold mb-3">
              🇺🇦 Українська озвучка
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white mb-1 leading-tight">
              {entry.titleUkr}
            </h1>
            <p className="text-gray-500 mb-4">{entry.titleEng}</p>

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
                  {anime.episodes} еп.
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

            {/* Link to AniTube */}
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 text-gray-300 hover:text-white hover:border-white/20 text-sm transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Відкрити на AniTube
            </a>
          </motion.div>
        </div>

        {/* Player */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full inline-block" style={{ background: '#FFD700' }} />
            Плеєр — Українська озвучка
          </h2>
          <div className="glass rounded-xl border border-white/5 overflow-hidden">
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                frameBorder="0"
                title={entry.titleUkr}
              />
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">
            Відео надано AniTube.in.ua • Якщо плеєр не завантажується, спробуйте{' '}
            <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:text-yellow-400">
              відкрити на AniTube
            </a>
          </p>
        </section>

        {/* Description */}
        {anime.description_html && (
          <section className="mb-10">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-purple-500 inline-block" />
              Опис
            </h2>
            <div className="glass rounded-xl border border-white/5 p-5">
              <div
                className="text-gray-300 leading-relaxed text-sm"
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
        <p className="text-gray-400 mb-4">Не вдалося завантажити аніме</p>
        <button onClick={onBack} className="text-purple-400 hover:text-purple-300 transition-colors">
          Назад
        </button>
      </div>
    </div>
  );
}
