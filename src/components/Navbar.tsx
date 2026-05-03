import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Menu, Flame, User, Shield, LogOut, Shuffle } from 'lucide-react';
import { useAuth } from '@adaptive-ai/sdk/client';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/client';
import { anilibria } from '@/lib/anilibria';

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [randomLoading, setRandomLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth({ required: false });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => client.getCurrentUser(),
    enabled: auth.status === 'authenticated',
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

  // Close user menu on outside click
  useEffect(() => {
    const handler = () => setUserMenuOpen(false);
    if (userMenuOpen) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [userMenuOpen]);

  const handleRandom = async () => {
    if (randomLoading) return;
    setRandomLoading(true);
    try {
      const title = await anilibria.getRandom();
      navigate(`/anime/${title.id}`);
    } catch {
      // silently fail
    } finally {
      setRandomLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/', label: 'Главная' },
    { to: '/browse', label: 'Каталог' },
    { to: '/top', label: 'Топ' },
  ];

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-strong shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="relative">
              <Flame className="w-6 h-6 text-purple-400 group-hover:text-pink-400 transition-colors duration-300" />
              <div className="absolute inset-0 blur-md opacity-40 bg-purple-400 rounded-full" />
            </div>
            <span className="text-lg font-black tracking-tight gradient-text text-glow">
              AniStream
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Random anime button (desktop) */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleRandom}
            disabled={randomLoading}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-white/10 text-gray-400 hover:text-white hover:border-purple-500/40 transition-all text-sm disabled:opacity-50"
            title="Случайное аниме"
          >
            <Shuffle className={`w-4 h-4 ${randomLoading ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline">Случайное</span>
          </motion.button>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <AnimatePresence>
              {searchOpen ? (
                <motion.form
                  key="sf"
                  initial={{ width: 36, opacity: 0 }}
                  animate={{ width: 240, opacity: 1 }}
                  exit={{ width: 36, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  onSubmit={handleSearch}
                >
                  <div className="flex items-center glass rounded-xl border border-purple-500/30 px-3 py-1.5">
                    <Search className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Поиск аниме..."
                      className="bg-transparent outline-none text-sm text-white placeholder-gray-500 ml-2 flex-1 min-w-0"
                    />
                    <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
                      <X className="w-3.5 h-3.5 text-gray-500 hover:text-white ml-1" />
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.button
                  key="sb"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Auth */}
            {auth.status === 'loading' ? null : auth.status === 'unauthenticated' ? (
              <button
                onClick={() => auth.signIn()}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                Войти
              </button>
            ) : (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {currentUser?.image ? (
                    <img
                      src={currentUser.image}
                      alt="avatar"
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-purple-500/40"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(currentUser?.name)}
                    </div>
                  )}
                  {currentUser?.isAdmin && (
                    <Shield className="w-3 h-3 text-yellow-400" />
                  )}
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-10 w-48 glass-strong rounded-xl border border-purple-500/20 shadow-xl overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-white/5">
                        <p className="text-sm font-semibold text-white truncate">
                          {currentUser?.name ?? 'Пользователь'}
                        </p>
                        {currentUser?.handle && (
                          <p className="text-xs text-gray-500">@{currentUser.handle}</p>
                        )}
                      </div>
                      <div className="p-1">
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Профиль
                        </Link>
                        {currentUser?.isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            Админ панель
                          </Link>
                        )}
                        <button
                          onClick={() => { auth.signIn(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Выйти
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile menu */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-purple-500/10"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.to
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => { handleRandom(); setMenuOpen(false); }}
                disabled={randomLoading}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                <Shuffle className={`w-4 h-4 ${randomLoading ? 'animate-spin' : ''}`} />
                Случайное аниме
              </button>
              {auth.status === 'unauthenticated' && (
                <button
                  onClick={() => { auth.signIn(); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
                >
                  Войти
                </button>
              )}
              {auth.status === 'authenticated' && (
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5"
                >
                  Профиль
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
