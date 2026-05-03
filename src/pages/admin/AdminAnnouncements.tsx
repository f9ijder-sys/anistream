import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ToggleLeft, ToggleRight, Trash2, Loader2, Megaphone } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/client';

export function AdminAnnouncements() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const qc = useQueryClient();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['allAnnouncements'],
    queryFn: () => client.getAllAnnouncements(),
  });

  const createMutation = useMutation({
    mutationFn: () => client.createAnnouncement(title, message),
    onSuccess: () => {
      setTitle('');
      setMessage('');
      qc.invalidateQueries({ queryKey: ['allAnnouncements'] });
      qc.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => client.toggleAnnouncement(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['allAnnouncements'] });
      qc.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => client.deleteAnnouncement(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['allAnnouncements'] });
      qc.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Объявления</h1>
        <p className="text-gray-500 text-sm mt-1">Баннеры на главной странице сайта</p>
      </div>

      {/* Create form */}
      <div className="glass rounded-2xl border border-purple-500/15 p-5">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-purple-400" />
          Новое объявление
        </h2>
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Заголовок объявления"
            className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Текст объявления..."
            rows={3}
            className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
          />
          <button
            onClick={() => createMutation.mutate()}
            disabled={!title.trim() || !message.trim() || createMutation.isPending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-medium text-sm transition-colors"
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Создать объявление
          </button>
        </div>
      </div>

      {/* List */}
      <div>
        <h2 className="text-base font-bold text-white mb-4">Все объявления</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        ) : !announcements || announcements.length === 0 ? (
          <div className="glass rounded-2xl border border-white/5 p-12 text-center">
            <Megaphone className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">Объявлений пока нет</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass rounded-xl border p-4 ${
                  item.isActive ? 'border-purple-500/20' : 'border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                      {item.isActive ? (
                        <span className="px-1.5 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-[10px] font-semibold">
                          Активно
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-full bg-gray-500/15 border border-gray-500/30 text-gray-500 text-[10px] font-semibold">
                          Скрыто
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{item.message}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(item.createdAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => toggleMutation.mutate(item.id)}
                      disabled={toggleMutation.isPending}
                      className={`p-2 rounded-lg transition-colors ${
                        item.isActive
                          ? 'text-green-400 hover:bg-green-500/10'
                          : 'text-gray-500 hover:text-green-400 hover:bg-green-500/10'
                      }`}
                      title={item.isActive ? 'Скрыть' : 'Показать'}
                    >
                      {item.isActive ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Удалить объявление?')) deleteMutation.mutate(item.id);
                      }}
                      disabled={deleteMutation.isPending}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
