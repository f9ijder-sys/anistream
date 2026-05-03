import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

function CustomTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-xl border border-purple-500/20 px-3 py-2 shadow-xl">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="text-sm font-bold text-white">{String(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

export function AdminStats() {
  const { data: dailyStats, isLoading: dsLoading } = useQuery({
    queryKey: ['adminDailyStats'],
    queryFn: () => client.getDailyStats(30),
  });

  const { data: popularAnime, isLoading: paLoading } = useQuery({
    queryKey: ['adminPopularAnime'],
    queryFn: () => client.getPopularAnime(20),
  });

  const chartData = dailyStats?.map((d) => ({
    date: d.date.slice(5),
    watches: d.watches,
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Статистика</h1>
        <p className="text-gray-500 text-sm mt-1">Активность за последние 30 дней</p>
      </div>

      {/* Watch chart */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Просмотры серий по дням</h2>
        {dsLoading ? (
          <div className="flex items-center justify-center h-48 glass rounded-2xl border border-white/5">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        ) : (
          <div className="glass rounded-2xl border border-white/5 p-5">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#8888aa', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fill: '#8888aa', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(108,99,255,0.1)' }} />
                <Bar dataKey="watches" fill="#6c63ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Popular anime table */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Топ-20 популярных аниме</h2>
        {paLoading ? (
          <div className="flex items-center justify-center h-48 glass rounded-2xl border border-white/5">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        ) : !popularAnime || popularAnime.length === 0 ? (
          <div className="glass rounded-2xl border border-white/5 p-12 text-center">
            <p className="text-gray-500">Данных пока нет. Пользователи ещё не добавляли аниме в списки.</p>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            {popularAnime.map((item) => (
              <div
                key={item.animeId}
                className="flex items-center gap-4 px-5 py-3 border-b border-white/5 last:border-0"
              >
                <span className="text-lg font-black text-gray-600 w-8 text-center flex-shrink-0">
                  {item.rank}
                </span>
                {item.animePoster && (
                  <img
                    src={item.animePoster}
                    alt={item.animeTitle}
                    className="w-8 h-10 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{item.animeTitle}</p>
                </div>
                {/* Bar */}
                <div className="hidden sm:flex items-center gap-2 w-32">
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{
                        width: `${Math.min(100, (item.count / (popularAnime[0]?.count ?? 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-300 w-8 text-right flex-shrink-0">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
