import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimeCard, AnimeCardSkeleton } from './AnimeCard';
import type { AniLibriaTitle } from '@/types/anime';

interface AnimeRowProps {
  title: string;
  titles: AniLibriaTitle[];
  loading?: boolean;
  accentColor?: string;
}

export function AnimeRow({ title, titles, loading, accentColor = '#6c63ff' }: AnimeRowProps) {
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
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <AnimeCardSkeleton key={i} />)
          : titles.map((t, i) => <AnimeCard key={t.id} title={t} index={i} />)}
      </div>
    </section>
  );
}
