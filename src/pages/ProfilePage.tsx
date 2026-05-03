import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Check, Clock, Heart, Film, History, User } from 'lucide-react';
import { useAuth } from '@adaptive-ai/sdk/client';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/client';
import { Navbar } from '@/components/Navbar';

const TABS = [
  { id: 'watching', label: 'Смотрю', icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'completed', label: 'Просмотрено', icon: Check, color: 'text-green-400', bg: 'bg-green-500/10' },
  { id: 'plan_to_watch', label: 'Буду смотреть', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 'favorite', label: 'Любимые', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10' },
] as const;

export function ProfilePage() {
  const auth = useAuth({ required: true });
  const [activeTab, setActiveTab] = useState<'watching' | 'completed' | 'plan_to_watch' | 'favorite'>('watching');

  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => client.getCurrentUser(),
    enabled: auth.status === 'authenticated',
  });

  const { data: animeList, isLoading: listLoading } = useQuery({
    queryKey: ['userList', activeTab],
    queryFn: () => client.getUserList(activeTab),
    enabled: auth.status === 'authenticated',
  });

  const { data: allList } = useQuery({
    queryKey: ['userList'],
    queryFn: () => client.getUserList(),
    enabled: auth.status === 'authenticated',
  });

  if (auth.status === 'loading' || userLoading) return <LoadingSkeleton />;

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const tabCounts = TABS.reduce(
    (acc, tab) => {
      acc[tab.id] = allList?.filter((item) => item.status === tab.id).length ?? 0;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-purple-500/10 p-6 mb-8"
        >
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {currentUser?.image ? (
                <img
                  src={currentUser.image}
                  alt="avatar"
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-purple-500/40"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-black">
                  {getInitials(currentUser?.name)}
                </div>
              )}
              {currentUser?.isAdmin && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                  <span className="text-[10px]">★</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-white">
                  {currentUser?.name ?? 'Пользователь'}
                </h1>
                {currentUser?.isAdmin && (
                  <span className="px-2 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-semibold">
                    Admin
                  </span>
                )}
              </div>
              {currentUser?.handle && (
                <p className="text-gray-500 text-sm">@{currentUser.handle}</p>
              )}

              {/* Stats */}
              <div className="flex gap-6 mt-3">
                <StatItem
                  icon={<Film className="w-4 h-4" />}
                  value={currentUser?.listCount ?? 0}
                  label="в списке"
                />
                <StatItem
                  icon={<History className="w-4 h-4" />}
                  value={currentUser?.watchCount ?? 0}
                  label="просмотрено"
                />
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={() => auth.signIn()}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl glass border border-white/10 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <User className="w-4 h-4" />
              Изменить аккаунт
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? `${tab.bg} ${tab.color} border border-current/30`
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-current/20' : 'bg-white/5 text-gray-600'}`}>
                {tabCounts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {listLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden">
                <div className="skeleton aspect-[2/3]" />
                <div className="p-2 bg-[#1a1a27] space-y-1.5">
                  <div className="skeleton h-3 rounded" />
                  <div className="skeleton h-3 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : !animeList || animeList.length === 0 ? (
          <div className="glass rounded-2xl border border-white/5 p-16 text-center">
            <div className="text-5xl mb-4">
              {activeTab === 'watching' ? '📺' : activeTab === 'completed' ? '✅' : activeTab === 'plan_to_watch' ? '📌' : '❤️'}
            </div>
            <p className="text-gray-400 font-medium">Список пустой</p>
            <p className="text-gray-600 text-sm mt-1">
              Добавляйте аниме в список на страницах аниме
            </p>
            <Link
              to="/browse"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-sm hover:bg-purple-600/30 transition-colors"
            >
              Перейти к каталогу
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {animeList.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link to={`/anime/${item.animeId}`}>
                  <div className="anime-card rounded-xl overflow-hidden">
                    <div className="aspect-[2/3] bg-[#1a1a27]">
                      {item.animePoster ? (
                        <img
                          src={item.animePoster}
                          alt={item.animeTitle}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <Film className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-[#1a1a27]">
                      <p className="text-xs font-semibold text-white line-clamp-2 leading-tight">
                        {item.animeTitle}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {new Date(item.addedAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="text-purple-400">{icon}</span>
      <span className="font-bold text-white">{value}</span>
      <span className="text-gray-500">{label}</span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 pt-24 space-y-6">
        <div className="skeleton h-36 rounded-2xl" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-10 w-32 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}
