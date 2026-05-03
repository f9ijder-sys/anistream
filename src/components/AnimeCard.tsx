import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Play, Tv, Film } from 'lucide-react';
import type { AniLibriaTitle } from '@/types/anime';
import { posterUrl } from '@/lib/anilibria';

interface CardProps {
  title: AniLibriaTitle;
  index?: number;
}

function StatusBadge({ isOngoing }: { isOngoing: boolean }) {
  if (isOngoing) {
    return (
      <span className="status-airing text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        Выходит
      </span>
    );
  }
  return (
    <span className="status-completed text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit">
      Завершён
    </span>
  );
}

export function AnimeCard({ title, index = 0 }: CardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const img = posterUrl(title);
  const name = title.name.main || title.name.english || '';
  const isMovie = title.type?.value?.toLowerCase().includes('movie') || title.type?.description?.toLowerCase().includes('фильм');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
    >
      <Link to={`/anime/${title.id}`}>
        <div
          className="anime-card rounded-xl overflow-hidden cursor-pointer"
          style={{ width: '160px', minWidth: '160px' }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="relative aspect-[2/3] bg-[#1a1a27]">
            {!imgLoaded && <div className="skeleton absolute inset-0" />}
            <img
              src={img}
              alt={name}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'} ${hovered ? 'scale-110' : 'scale-100'}`}
              loading="lazy"
            />

            {/* Hover overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: hovered ? 1 : 0 }}
              className="absolute inset-0 card-overlay flex flex-col justify-end p-2"
            >
              <div className="flex justify-center mb-2">
                <div className="w-9 h-9 rounded-full bg-purple-500/80 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                </div>
              </div>
              {title.description && (
                <p className="text-[9px] text-gray-300 line-clamp-3 leading-relaxed">
                  {title.description}
                </p>
              )}
            </motion.div>

            {/* Type */}
            <div className="absolute top-1.5 left-1.5">
              {isMovie ? (
                <Film className="w-3.5 h-3.5 text-pink-400 drop-shadow" />
              ) : (
                <Tv className="w-3.5 h-3.5 text-purple-400 drop-shadow" />
              )}
            </div>

            {/* Episodes count */}
            {title.episodes_total > 0 && (
              <div className="absolute top-1.5 right-1.5 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5">
                <span className="text-[10px] font-bold text-white">
                  {title.episodes_total} эп.
                </span>
              </div>
            )}
          </div>

          <div className="p-2 bg-[#1a1a27]">
            <h3 className="text-xs font-semibold text-white line-clamp-2 leading-tight mb-1">
              {name}
            </h3>
            <StatusBadge isOngoing={title.is_ongoing} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function AnimeGridCard({ title, index = 0 }: CardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const img = posterUrl(title);
  const name = title.name.main || title.name.english || '';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.025 }}
    >
      <Link to={`/anime/${title.id}`}>
        <div
          className="anime-card rounded-xl overflow-hidden cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="relative aspect-[2/3] bg-[#1a1a27]">
            {!imgLoaded && <div className="skeleton absolute inset-0" />}
            <img
              src={img}
              alt={name}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'} ${hovered ? 'scale-105' : 'scale-100'}`}
              loading="lazy"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: hovered ? 1 : 0 }}
              className="absolute inset-0 card-overlay flex flex-col justify-end p-3"
            >
              <div className="flex justify-center mb-3">
                <div className="w-11 h-11 rounded-full bg-purple-500/80 flex items-center justify-center">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
              </div>
              {title.description && (
                <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                  {title.description}
                </p>
              )}
            </motion.div>
          </div>
          <div className="p-3 bg-[#1a1a27]">
            <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight mb-1.5">
              {name}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              <StatusBadge isOngoing={title.is_ongoing} />
              {title.genres.slice(0, 2).map((g) => (
                <span key={g.id} className="genre-badge text-[10px]">{g.name}</span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function StarRating({ score }: { score: number }) {
  const stars = Math.round(score / 2);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
        />
      ))}
    </div>
  );
}

export function AnimeCardSkeleton() {
  return (
    <div style={{ width: '160px', minWidth: '160px' }}>
      <div className="rounded-xl overflow-hidden">
        <div className="skeleton aspect-[2/3]" />
        <div className="p-2 bg-[#1a1a27] space-y-1.5">
          <div className="skeleton h-3 rounded w-full" />
          <div className="skeleton h-3 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function AnimeGridCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden">
      <div className="skeleton aspect-[2/3]" />
      <div className="p-3 bg-[#1a1a27] space-y-2">
        <div className="skeleton h-4 rounded w-full" />
        <div className="skeleton h-3 rounded w-2/3" />
      </div>
    </div>
  );
}
