import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Radio } from 'lucide-react';
import { useGenreAnime, useUpdates } from '@/hooks/useAnime';
import { AnimeGridCard, AnimeGridCardSkeleton } from '@/components/AnimeCard';
import { Navbar } from '@/components/Navbar';
import { posterUrl } from '@/lib/anilibria';
import type { AniLibriaTitle } from '@/types/anime';

export function TopPage() {
  const [activeTab, setActiveTab] = useState<'popular' | 'action' | 'fantasy' | 'comedy'>('popular');

  const { data: updates, isLoading: uLoading } = useUpdates(24);
  const { data: action, isLoading: aLoading } = useGenreAnime('Экшен', 1);
  const { data: fantasy, isLoading: fLoading } = useGenreAnime('Фэнтези', 1);
  const { data: comedy, isLoading: cLoading } = useGenreAnime('Комедия', 1);

  const tabs = [
    { id: 'popular' as const, label: 'Популярное', data: updates?.list, loading: uLoading },
    { id: 'action' as const, label: 'Экшен', data: action?.list, loading: aLoading },
    { id: 'fantasy' as const, label: 'Фэнтези', data: fantasy?.list, loading: fLoading },
    { id: 'comedy' as const, label: 'Комедия', data: comedy?.list, loading: cLoading },
  ];

  const active = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-yellow-500/15 border border-yellow-500/30">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Топ аниме</h1>
            <p className="text-gray-500 text-sm">Лучшее с русской озвучкой</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 glass rounded-xl border border-purple-500/10 p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Top 3 podium */}
        {!active.loading && active.data && active.data.length >= 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {active.data.slice(0, 3).map((title, i) => (
              <TopCard key={title.id} title={title} rank={i + 1} />
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {active.loading
            ? Array.from({ length: 12 }).map((_, i) => <AnimeGridCardSkeleton key={i} />)
            : active.data?.slice(3).map((t, i) => (
                <AnimeGridCard key={t.id} title={t} index={i} />
              ))}
        </div>
      </div>
    </div>
  );
}

function TopCard({ title, rank }: { title: AniLibriaTitle; rank: number }) {
  const img = posterUrl(title);
  const name = title.name.main || title.name.english || '';

  const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];
  const rankBg = [
    'bg-yellow-500/10 border-yellow-500/30',
    'bg-gray-500/10 border-gray-500/20',
    'bg-amber-600/10 border-amber-600/30',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`relative rounded-2xl border overflow-hidden ${rankBg[rank - 1]}`}
    >
      <Link to={`/anime/${title.id}`}>
        <div className="relative aspect-[16/9] overflow-hidden">
          <img src={img} alt={name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
          <div
            className={`absolute top-3 left-3 text-5xl font-black ${rankColors[rank - 1]} opacity-80`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            #{rank}
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-bold text-white text-sm line-clamp-1">{name}</h3>
          <div className="flex items-center gap-1 mt-1">
            {title.is_ongoing ? (
              <>
                <Radio className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">Онгоинг</span>
              </>
            ) : (
              <span className="text-xs text-gray-400">Завершён · {title.year}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
