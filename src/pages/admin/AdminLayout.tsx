import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart2, Megaphone, Flame, ArrowLeft, Film } from 'lucide-react';
import { useAuth } from '@adaptive-ai/sdk/client';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/client';

const NAV = [
  { to: '/admin', label: 'Дашборд', icon: LayoutDashboard, exact: true },
  { to: '/admin/users', label: 'Пользователи', icon: Users },
  { to: '/admin/anime', label: 'Аниме', icon: Film },
  { to: '/admin/stats', label: 'Статистика', icon: BarChart2 },
  { to: '/admin/announcements', label: 'Объявления', icon: Megaphone },
];

export function AdminLayout() {
  const auth = useAuth({ required: true });
  const location = useLocation();

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => client.getCurrentUser(),
    enabled: auth.status === 'authenticated',
  });

  if (auth.status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!currentUser?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 glass-strong border-r border-purple-500/10 flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-purple-400" />
            <span className="font-black gradient-text">AniStream</span>
          </div>
          <span className="text-xs text-yellow-500 font-semibold">Admin Panel</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map((item) => {
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to) && item.to !== '/admin';
            const isAdminRoot = item.exact && location.pathname === '/admin';
            const isActive = isAdminRoot || active;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Back to site */}
        <div className="p-3 border-t border-white/5">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            На сайт
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
