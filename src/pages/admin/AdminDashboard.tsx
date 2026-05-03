import { motion } from 'framer-motion';
import { Users, List, Eye, TrendingUp, Star, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/client';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => client.getAdminStats(),
  });

  const statCards = [
    {
      label: 'Пользователей',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      label: 'Записей в списках',
      value: stats?.totalListEntries ?? 0,
      icon: List,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Просмотрено серий',
      value: stats?.totalWatches ?? 0,
      icon: Eye,
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
    },
    {
      label: 'Активны за неделю',
      value: stats?.activeUsers ?? 0,
      icon: TrendingUp,
      color: 'text-pink-400',
      bg: 'bg-pink-500/10 border-pink-500/20',
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Дашборд</h1>
        <p className="text-gray-500 text-sm mt-1">Обзор активности сайта</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl border p-5 ${card.bg}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    {card.label}
                  </span>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <p className="text-3xl font-black text-white">{card.value.toLocaleString()}</p>
              </motion.div>
            ))}
          </div>

          {/* Popular anime */}
          {stats?.popularAnime && stats.popularAnime.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Популярные аниме
              </h2>
              <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                {stats.popularAnime.map((item, i) => (
                  <div
                    key={item.animeId}
                    className="flex items-center gap-4 px-5 py-3 border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                  >
                    <span className="text-2xl font-black text-gray-700 w-8 text-center">
                      {i + 1}
                    </span>
                    {item.animePoster && (
                      <img
                        src={item.animePoster}
                        alt={item.animeTitle}
                        className="w-9 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/anime/${item.animeId}`}
                        className="text-sm font-semibold text-white hover:text-purple-300 transition-colors truncate block"
                      >
                        {item.animeTitle}
                      </Link>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Users className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-sm font-bold text-gray-300">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
