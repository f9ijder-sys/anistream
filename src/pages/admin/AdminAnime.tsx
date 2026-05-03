import { useState } from 'react';
import { motion } from 'framer-motion';
import { Film, Plus, Edit, Trash2, Search, Image, Save, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/client';

interface Anime {
  id: number;
  name: string;
  poster: string;
  year: number;
  type: string;
  description: string;
}

const MOCK_ANIME: Anime[] = [
  { id: 9999, name: 'Атака титанов', poster: 'https://static.anilibria.tv/upload/release/1000x1400/9999.jpg', year: 2013, type: 'TV', description: 'В мире, где человечество находится на грани вымирания из-за гигантских существ, известных как титаны.' },
  { id: 1, name: 'Наруто', poster: 'https://static.anilibria.tv/upload/release/1000x1400/1.jpg', year: 2002, type: 'TV', description: 'Ниндзя Наруто Узумаки ищет признание и мечтает стать Хокаге.' },
  { id: 2, name: 'Ван-Пис', poster: 'https://static.anilibria.tv/upload/release/1000x1400/2.jpg', year: 1999, type: 'TV', description: 'Пиратет Лuffy отправляется на поиски величайшего сокровища.' },
  { id: 3, name: 'Магическая битва', poster: 'https://static.anilibria.tv/upload/release/1000x1400/3.jpg', year: 2020, type: 'TV', description: 'Студент становится участником секретной школы магии.' },
  { id: 4, name: 'Клинок, рассекающий демонов', poster: 'https://static.anilibria.tv/upload/release/1000x1400/4.jpg', year: 2019, type: 'TV', description: 'Танджиро становится охотником на демонов после гибели семьи.' },
];

export function AdminAnime() {
  const [search, setSearch] = useState('');
  const [editingAnime, setEditingAnime] = useState<Anime | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();

  const { data: animeList = MOCK_ANIME } = useQuery({
    queryKey: ['adminAnime'],
    queryFn: async () => {
      // В реальном приложении это было бы API
      return MOCK_ANIME;
    },
    initialData: MOCK_ANIME,
  });

  const filteredAnime = animeList.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      // В реальном приложении это было бы API
      console.log('Delete anime:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAnime'] });
    },
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Управление аниме</h1>
          <p className="text-gray-500 text-sm mt-1">Добавление, редактирование и удаление аниме</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить аниме
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Поиск аниме..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
        />
      </div>

      {/* Anime Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAnime.map((anime, i) => (
          <motion.div
            key={anime.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-colors"
          >
            <div className="aspect-[3/4] relative">
              <img
                src={anime.poster}
                alt={anime.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-poster.jpg';
                }}
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => setEditingAnime(anime)}
                  className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(anime.id)}
                  className="p-2 bg-red-500/50 hover:bg-red-500/70 rounded-lg text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white truncate">{anime.name}</h3>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <span>{anime.year}</span>
                <span>•</span>
                <span>{anime.type}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(isAdding || editingAnime) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a2e] border border-purple-500/20 rounded-2xl p-6 w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white">
                {editingAnime ? 'Редактировать' : 'Добавить аниме'}
              </h2>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingAnime(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Название</label>
                <input
                  type="text"
                  defaultValue={editingAnime?.name}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                  placeholder="Введите название"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Год</label>
                  <input
                    type="number"
                    defaultValue={editingAnime?.year}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                    placeholder="2024"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Тип</label>
                  <select
                    defaultValue={editingAnime?.type}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="TV">TV</option>
                    <option value="Movie">Movie</option>
                    <option value="OVA">OVA</option>
                    <option value="ONA">ONA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">URL постера</label>
                <div className="relative">
                  <Image className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="url"
                    defaultValue={editingAnime?.poster}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Описание</label>
                <textarea
                  defaultValue={editingAnime?.description}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 resize-none"
                  placeholder="Описание аниме..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingAnime(null);
                  }}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Сохранить
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}