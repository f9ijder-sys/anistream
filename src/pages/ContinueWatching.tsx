import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/client';
import { AnimeGridCard, AnimeGridCardSkeleton } from '@/components/AnimeCard';
import { useAuth } from '@adaptive-ai/sdk/client';
import { Play } from 'lucide-react';

export function ContinueWatching() {
  const auth = useAuth({ required: false });
  
  const { data: history, isLoading } = useQuery({
    queryKey: ['continue-watching'],
    queryFn: () => client.getContinueWatching(),
    enabled: auth.status === 'authenticated',
  });

  if (auth.status !== 'authenticated' || (!isLoading && (!history || history.length === 0))) {
    return null;
  }

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Play className="w-4 h-4 text-purple-400 fill-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Продолжить просмотр</h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <AnimeGridCardSkeleton key={i} />
          ))
        ) : (
          history?.map((item, i) => (
            <div key={item.id} className="relative group">
              {/* Здесь мы имитируем объект AniLibriaTitle для карточки */}
              <AnimeGridCard 
                index={i}
                title={{
                  id: item.animeId,
                  name: { main: 'Загрузка...', english: null, alternative: null },
                  poster: { src: '', preview: '', thumbnail: '', optimized: { src: '', preview: '', thumbnail: '' } },
                  // Добавь сюда реальные данные, если планируешь расширять историю в БД
                } as any} 
              />
              <div className="absolute bottom-14 left-2 right-2 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-2/3" /> {/* Фейковый прогресс для красоты */}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}