import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Star, Tv, Calendar, Users, ArrowLeft, Tag, Radio } from 'lucide-react';
import { useTitleDetail, useGenreAnime } from '@/hooks/useAnime';
import { posterUrl } from '@/lib/anilibria';
import { AddToListButton } from '@/components/AddToListButton';
import { Navbar } from '@/components/Navbar';
import { AnimeGridCard, AnimeGridCardSkeleton } from '@/components/AnimeCard';

export function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const animeId = Number(id);

  const { data: title, isLoading, isError } = useTitleDetail(animeId);

  const firstGenreName = title?.genres?.[0]?.name ?? '';
  const { data: similar, isLoading: similarLoading } = useGenreAnime(firstGenreName, 1);

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !title) return <ErrorState />;

  const img = posterUrl(title);
  const name = title.name.main || title.name.english || '';
  const episodesList = (title.episodes ?? []).slice().sort((a, b) => a.ordinal - b.ordinal);
  const isAiring = title.is_ongoing;

  // Filter out current anime from similar list
  const similarList = (similar?.list ?? []).filter((t) => t.id !== animeId).slice(0, 12);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      {/* Backdrop */}
      <div className="relative h-80 sm:h-96 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ backgroundImage: `url(${img})`, filter: 'blur(30px) brightness(0.25)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/50 to-transparent" />
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-48 relative z-10 pb-20">
        {/* Back button */}
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к каталогу
        </Link>

        {/* Top section */}
        <div className="flex flex-col sm:flex-row gap-8 mb-10">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0"
          >
            <img
              src={img}
              alt={name}
              className="w-44 rounded-2xl shadow-2xl ring-1 ring-white/10 mx-auto sm:mx-0"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 min-w-0"
          >
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-1 leading-tight">{name}</h1>
            {title.name.english && <p className="text-gray-500 mb-4">{title.name.english}</p>}

            {/* Meta */}
            <div className="flex flex-wrap gap-3 mb-5">
              <MetaBadge icon={<Tv className="w-3.5 h-3.5" />} label={title.type?.description ?? 'TV'} />
              {title.episodes_total > 0 && (
                <MetaBadge
                  icon={<Star className="w-3.5 h-3.5" />}
                  label={`${title.episodes_total} эпизодов`}
                />
              )}
              {title.year && (
                <MetaBadge icon={<Calendar className="w-3.5 h-3.5" />} label={String(title.year)} />
              )}
              {title.added_in_users_favorites > 0 && (
                <MetaBadge icon={<Users className="w-3.5 h-3.5" />} label={`${title.added_in_users_favorites.toLocaleString()} в избранном`} />
              )}
            </div>

            {/* Genres */}
            {title.genres.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mb-5">
                <Tag className="w-3.5 h-3.5 text-gray-500" />
                {title.genres.map((g) => (
                  <Link key={g.id} to={`/browse?genre=${encodeURIComponent(g.name)}`} className="genre-badge">
                    {g.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              {episodesList.length > 0 && (
                <Link
                  to={`/anime/${title.id}/watch/${episodesList[0].ordinal}`}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all glow-purple hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Смотреть с 1 серии
                </Link>
              )}
              <AddToListButton animeId={title.id} animeTitle={name} animePoster={img} />
            </div>

            {/* Status */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a27] border border-white/5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isAiring ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                }`}
              />
              <span className="text-sm text-gray-300">{isAiring ? 'Онгоинг' : 'Завершён'}</span>
            </div>

            {/* Ongoing badge */}
            {isAiring && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 ml-2">
                <Radio className="w-3.5 h-3.5 text-green-400" />
                <span className="text-sm text-green-400">Выходит еженедельно</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Description */}
        {title.description && (
          <section className="mb-10">
            <SectionTitle>Описание</SectionTitle>
            <div className="glass rounded-xl border border-white/5 p-5">
              <p className="text-gray-300 leading-relaxed text-sm">{title.description}</p>
            </div>
          </section>
        )}

        {/* Episodes — jut.su style */}
        {episodesList.length > 0 && (
          <section className="mb-10">
            <SectionTitle>
              <span className="flex items-center gap-2">
                Серии ({episodesList.length})
                {isAiring && (
                  <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/25 text-green-400">
                    Выходит
                  </span>
                )}
              </span>
            </SectionTitle>
            <div className="glass rounded-xl border border-white/5 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">1 сезон</h3>
              <div className="flex flex-wrap gap-2">
                {episodesList.map((ep) => (
                  <Link
                    key={ep.id}
                    to={`/anime/${title.id}/watch/${ep.ordinal}`}
                    className="group flex flex-col items-center justify-center gap-0.5 px-4 py-2.5 rounded-xl bg-green-600/15 border border-green-500/25 hover:bg-green-500/25 hover:border-green-400/50 transition-all min-w-[72px]"
                  >
                    <span className="text-sm font-bold text-green-300 group-hover:text-green-200">
                      {ep.ordinal} серия
                    </span>
                    {ep.name && (
                      <span className="text-[10px] text-gray-500 line-clamp-1 text-center max-w-[80px]">{ep.name}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Team */}
        {title.members && (
          (title.members.voice?.length ?? 0) > 0 || (title.members.translator?.length ?? 0) > 0
        ) && (
          <section className="mb-10">
            <SectionTitle>Команда перевода</SectionTitle>
            <div className="glass rounded-xl border border-white/5 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {title.members!.voice && title.members!.voice.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Озвучка</p>
                  <div className="flex flex-wrap gap-1.5">
                    {title.members!.voice.map((v) => (
                      <span key={v.id} className="px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">{v.nickname}</span>
                    ))}
                  </div>
                </div>
              )}
              {title.members!.translator && title.members!.translator.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Перевод</p>
                  <div className="flex flex-wrap gap-1.5">
                    {title.members!.translator.map((v) => (
                      <span key={v.id} className="px-2 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs text-pink-300">{v.nickname}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Similar anime */}
        {(similarLoading || similarList.length > 0) && (
          <section>
            <SectionTitle>Похожие аниме</SectionTitle>
            <div className="overflow-x-auto pb-2 -mx-2 px-2">
              <div className="flex gap-3" style={{ width: 'max-content' }}>
                {similarLoading
                  ? Array.from({ length: 6 }).map((_, i) => <AnimeGridCardSkeleton key={i} />)
                  : similarList.map((t, i) => (
                      <div key={t.id} style={{ width: '160px' }}>
                        <AnimeGridCard title={t} index={i} />
                      </div>
                    ))
                }
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function MetaBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a27] border border-white/5 text-sm text-gray-300">
      <span className="text-purple-400">{icon}</span>
      {label}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
      <span className="w-1 h-5 rounded-full bg-purple-500 inline-block" />
      {children}
    </h2>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="skeleton h-80" />
      <div className="max-w-7xl mx-auto px-6 -mt-40 relative z-10 flex gap-8">
        <div className="skeleton w-44 h-64 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-4 pt-16">
          <div className="skeleton h-10 rounded w-1/2" />
          <div className="skeleton h-5 rounded w-1/3" />
          <div className="skeleton h-20 rounded" />
        </div>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <Navbar />
      <div className="text-center">
        <p className="text-4xl mb-3">😔</p>
        <p className="text-gray-400">Не удалось загрузить аниме</p>
        <Link to="/" className="mt-4 inline-block text-purple-400 hover:text-purple-300">
          На главную
        </Link>
      </div>
    </div>
  );
}
