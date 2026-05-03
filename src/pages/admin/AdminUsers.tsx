import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, ShieldOff, Ban, CheckCircle, ChevronLeft, ChevronRight, Loader2, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/client';

export function AdminUsers() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', debouncedSearch, page],
    queryFn: () => client.getAdminUsers(debouncedSearch || undefined, page),
  });

  const { data: userDetails } = useQuery({
    queryKey: ['adminUserDetails', selectedUser],
    queryFn: () => client.getUserDetails(selectedUser!),
    enabled: !!selectedUser,
  });

  const toggleAdminMutation = useMutation({
    mutationFn: (userId: string) => client.toggleAdmin(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminUsers'] }),
  });

  const banMutation = useMutation({
    mutationFn: (userId: string) => client.banUser(userId, 'Нарушение правил'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminUsers'] }),
  });

  const unbanMutation = useMutation({
    mutationFn: (userId: string) => client.unbanUser(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminUsers'] }),
  });

  const handleSearchChange = (val: string) => {
    setSearch(val);
    clearTimeout((window as Window & { _st?: ReturnType<typeof setTimeout> })._st);
    (window as Window & { _st?: ReturnType<typeof setTimeout> })._st = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Пользователи</h1>
        <p className="text-gray-500 text-sm mt-1">
          {data?.total ? `${data.total} зарегистрированных` : 'Управление аккаунтами'}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Поиск по имени, хэндлу, ID..."
          className="w-full bg-[#1a1a27] border border-purple-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
        />
      </div>

      <div className="flex gap-5">
        {/* Table */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
            </div>
          ) : (
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Пользователь</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Статус</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Аниме</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Серий</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.users.map((user, i) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className={`border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors ${
                          selectedUser === user.id ? 'bg-purple-500/5' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {user.image ? (
                              <img src={user.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                                {(user.name?.[0] ?? '?').toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-white font-medium">{user.name ?? 'Безымянный'}</p>
                              {user.handle && <p className="text-xs text-gray-500">@{user.handle}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {user.isAdmin && (
                              <span className="px-1.5 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-[10px] font-semibold">Admin</span>
                            )}
                            {user.isBanned && (
                              <span className="px-1.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-semibold">Бан</span>
                            )}
                            {!user.isAdmin && !user.isBanned && (
                              <span className="text-xs text-gray-500">Обычный</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-300">{user.animeCount}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-300">{user.watchCount}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                              title="Подробнее"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => toggleAdminMutation.mutate(user.id)}
                              disabled={toggleAdminMutation.isPending}
                              className={`p-1.5 rounded-lg transition-colors ${
                                user.isAdmin
                                  ? 'text-yellow-400 hover:bg-yellow-500/10'
                                  : 'text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10'
                              }`}
                              title={user.isAdmin ? 'Снять админа' : 'Сделать админом'}
                            >
                              {user.isAdmin ? <ShieldOff className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                            </button>
                            {user.isBanned ? (
                              <button
                                onClick={() => unbanMutation.mutate(user.id)}
                                disabled={unbanMutation.isPending}
                                className="p-1.5 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors"
                                title="Разбанить"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => banMutation.mutate(user.id)}
                                disabled={banMutation.isPending}
                                className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Забанить"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                  <span className="text-xs text-gray-500">
                    Страница {page} из {data.totalPages}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                      disabled={page >= data.totalPages}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Detail Panel */}
        {selectedUser && userDetails && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-64 flex-shrink-0"
          >
            <div className="glass rounded-2xl border border-white/5 p-4">
              <h3 className="font-bold text-white text-sm mb-3">Детали пользователя</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Список аниме ({userDetails.animeList.length})</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {userDetails.animeList.slice(0, 10).map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          item.status === 'watching' ? 'bg-blue-400' :
                          item.status === 'completed' ? 'bg-green-400' :
                          item.status === 'favorite' ? 'bg-pink-400' : 'bg-yellow-400'
                        }`} />
                        <span className="text-xs text-gray-400 truncate">{item.animeTitle}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Последние просмотры</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {userDetails.history.slice(0, 8).map((h) => (
                      <p key={h.id} className="text-xs text-gray-500">
                        Аниме #{h.animeId} · Серия {h.episodeNumber}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
