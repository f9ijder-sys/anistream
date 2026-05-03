import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronRight, X, Megaphone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/client';
import { useUpdates, useGenreAnime } from '@/hooks/useAnime';
import { AnimeRow } from '@/components/AnimeRow';
import { posterUrl } from '@/lib/anilibria';
import AshdiRow from '@/components/AshdiRow';

export function HomePage() {
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const { data: updates, isLoading: updatesLoading } = useUpdates(24);
  const { data: action } = useGenreAnime('Экшен', 1);
  const { data: romance } = useGenreAnime('Романтика', 1);
  const { data: announcements } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => client.getActiveAnnouncements(),
    staleTime: 5 * 60 * 1000,
  });

  const featured = updates?.list?.[0];
  const latestList = updates?.list ?? [];
  const actionList = action?.list ?? [];
  const romanceList = romance?.list ?? [];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Announcement Banner */}
      <AnimatePresence>
        {!bannerDismissed && announcements && announcements.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative z-40 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-sm px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white text-sm">
                <Megaphone className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold">{announcements[0].title}:</span>
                <span className="text-white/90">{announcements[0].message}</span>
              </div>
              <button
                onClick={() => setBannerDismissed(true)}
                className="text-white/70 hover:text-white ml-4 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      {featured ? (
        <HeroSection title={featured} />
      ) : (
        <div className="h-[70vh] animated-gradient" />
      )}

      {/* Content Rows */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <AnimeRow
          title="Последние обновления"
          titles={latestList}
          loading={updatesLoading}
          accentColor="#6c63ff"
        />
        {actionList.length > 0 && (
          <AnimeRow
            title="Лучший экшен"
            titles={actionList}
            accentColor="#ff6584"
          />
        )}
        {romanceList.length > 0 && (
          <AnimeRow
            title="Романтика"
            titles={romanceList}
            accentColor="#f59e0b"
          />
        )}
        <AshdiRow />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function HeroSection({ title }: { title: import('@/types/anime').AniLibriaTitle }) {
  const img = posterUrl(title);
  const name = title.name.main || title.name.english || '';
  const desc = title.description?.slice(0, 200) + (title.description && title.description.length > 200 ? '...' : '');

  return (
    <div className="relative h-[75vh] min-h-[500px] overflow-hidden">
      {/* Background blur */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{
          backgroundImage: `url(${img})`,
          filter: 'blur(40px) brightness(0.3)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />

      {/* Content */}
      <div className="relative h-full flex items-end pb-16 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="flex items-end gap-8">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden sm:block flex-shrink-0"
          >
            <img
              src={img}
              alt={name}
              className="w-40 rounded-2xl shadow-2xl ring-1 ring-white/10"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              {title.is_ongoing && (
                <span className="status-airing text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Выходит
                </span>
              )}
              {title.genres.slice(0, 3).map((g) => (
                <span key={g.id} className="genre-badge">{g.name}</span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 leading-tight text-glow">
              {name}
            </h1>
            {title.name.english && (
              <p className="text-gray-400 text-sm mb-3">{title.name.english}</p>
            )}

            {desc && (
              <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3">{desc}</p>
            )}

            <div className="flex items-center gap-3">
              <Link
                to={`/anime/${title.id}`}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all glow-purple hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                Смотреть
              </Link>
              <Link
                to={`/anime/${title.id}`}
                className="flex items-center gap-2 px-5 py-3 rounded-xl glass border border-white/10 text-gray-300 hover:text-white hover:border-white/20 font-medium transition-all"
              >
                Подробнее
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black gradient-text">AniStream</span>
          <span className="text-gray-600 text-sm">— аниме с русской озвучкой</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-300 transition-colors">Главная</Link>
          <Link to="/browse" className="hover:text-gray-300 transition-colors">Каталог</Link>
          <Link to="/top" className="hover:text-gray-300 transition-colors">Топ аниме</Link>
        </div>
        <p className="text-xs text-gray-600">Данные предоставлены AniLibria.tv</p>
      </div>
    </footer>
  );
}
