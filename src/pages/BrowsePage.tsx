import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBrowse, useGenres } from '@/hooks/useAnime';
import { AnimeGridCard, AnimeGridCardSkeleton } from '@/components/AnimeCard';
import { Navbar } from '@/components/Navbar';

export function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputVal, setInputVal] = useState(searchParams.get('q') ?? '');
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') ?? '');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = searchParams.get('q') ?? '';
  const genre = searchParams.get('genre') ?? '';

  useEffect(() => {
    setInputVal(q);
    setPage(1);
  }, [q]);

  useEffect(() => {
    setSelectedGenre(genre);
    setPage(1);
  }, [genre]);

  const { data, isLoading } = useBrowse({
    search: q || undefined,
    genres: selectedGenre || undefined,
    page,
  });

  const { data: genres } = useGenres();

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const p = new URLSearchParams();
      if (inputVal.trim()) p.set('q', inputVal.trim());
      if (selectedGenre) p.set('genre', selectedGenre);
      setSearchParams(p);
      setPage(1);
    },
    [inputVal, selectedGenre, setSearchParams],
  );

  const applyGenre = (g: string) => {
    const newGenre = selectedGenre === g ? '' : g;
    setSelectedGenre(newGenre);
    const p = new URLSearchParams(searchParams);
    if (newGenre) p.set('genre', newGenre);
    else p.delete('genre');
    setSearchParams(p);
    setPage(1);
  };

  const titles = data?.list ?? [];
  const totalPages = data?.pagination?.pages ?? 1;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1">Каталог аниме</h1>
          <p className="text-gray-500 text-sm">Русская озвучка от AniLibria</p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Поиск по названию..."
                className="w-full bg-[#1a1a27] border border-purple-500/20 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              {inputVal && (
                <button
                  type="button"
                  onClick={() => { setInputVal(''); setSearchParams(new URLSearchParams()); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-colors"
            >
              Найти
            </button>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className={`px-4 py-3 rounded-xl glass border transition-colors ${filtersOpen ? 'border-purple-500/50 text-purple-300' : 'border-white/10 text-gray-400 hover:text-white'}`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Genre filters */}
        {(filtersOpen || selectedGenre) && genres && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 overflow-hidden"
          >
            <div className="glass rounded-xl border border-purple-500/10 p-4">
              <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">Жанры</p>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => applyGenre(g)}
                    className={`genre-badge ${selectedGenre === g ? 'active' : ''}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Active filters */}
        {(q || selectedGenre) && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs text-gray-500">Фильтры:</span>
            {q && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs">
                «{q}»
                <button onClick={() => { setSearchParams(new URLSearchParams()); setInputVal(''); }}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedGenre && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs">
                {selectedGenre}
                <button onClick={() => applyGenre(selectedGenre)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => <AnimeGridCardSkeleton key={i} />)}
          </div>
        ) : titles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-gray-400 text-lg font-medium">Ничего не найдено</p>
            <p className="text-gray-600 text-sm mt-1">Попробуйте изменить запрос или фильтры</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {titles.map((t, i) => <AnimeGridCard key={t.id} title={t} index={i} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                  disabled={page <= 1}
                  className="p-2 rounded-lg glass border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                    return (
                      <button
                        key={p}
                        onClick={() => { setPage(p); window.scrollTo(0, 0); }}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg glass border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


