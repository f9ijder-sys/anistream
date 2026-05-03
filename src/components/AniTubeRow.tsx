import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AniTubeEntry } from '@/lib/anitube';
import { shikimoriPosterUrl } from '@/lib/shikimori';
import type { ShikimoriAnime } from '@/lib/shikimori';

export interface AniTubeEntryWithShikimori extends AniTubeEntry {
  shikimoriData?: ShikimoriAnime;
}

interface AniTubeRowProps {
  title: string;
  entries: AniTubeEntryWithShikimori[];
  accentColor?: string;
}

function AniTubeCard({ entry, index = 0 }: { entry: AniTubeEntryWithShikimori; index?: number }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const img = entry.shikimoriData
    ? shikimoriPosterUrl(entry.shikimoriData)
    : '/placeholder-poster.jpg';
  const score = entry.shikimoriData ? parseFloat(entry.shikimoriData.score) : 0;
  const episodes = entry.shikimoriData?.episodes ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
    >
      <Link to={`/anitube/${entry.id}`}>
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
              alt={entry.titleUkr}
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
                <div className="w-9 h-9 rounded-full bg-yellow-500/80 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
              </div>
              <p className="text-[9px] text-gray-300 text-center leading-relaxed">
                Дивитись
              </p>
            </motion.div>

            {/* УКР badge */}
            <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5">
              <span className="text-[9px] font-bold" style={{ color: '#FFD700' }}>🇺🇦 УКР</span>
            </div>

            {/* Score badge */}
            {score > 0 && (
              <div className="absolute top-1.5 right-1.5 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5 flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                <span className="text-[10px] font-bold text-white">{score.toFixed(1)}</span>
              </div>
            )}

            {/* Episodes count */}
            {episodes > 0 && (
              <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5">
                <span className="text-[10px] font-bold text-white">{episodes} еп.</span>
              </div>
            )}
          </div>

          <div className="p-2 bg-[#1a1a27]">
            <h3 className="text-xs font-semibold text-white line-clamp-2 leading-tight mb-1">
              {entry.titleUkr}
            </h3>
            <p className="text-[10px] text-gray-500 truncate">{entry.titleEng}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function AniTubeRow({ title, entries, accentColor = '#FFD700' }: AniTubeRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: dir === 'right' ? 540 : -540, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span
            className="w-1 h-5 rounded-full inline-block"
            style={{ background: accentColor }}
          />
          {title}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg glass border border-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg glass border border-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div ref={rowRef} className="scroll-row pb-2">
        {entries.map((entry, i) => (
          <AniTubeCard key={entry.id} entry={entry} index={i} />
        ))}
      </div>
    </section>
  );
}
