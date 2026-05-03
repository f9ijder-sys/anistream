import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { BrowsePage } from '@/pages/BrowsePage';
import { TopPage } from '@/pages/TopPage';
import { AnimeDetailPage } from '@/pages/AnimeDetailPage';
import { WatchPage } from '@/pages/WatchPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminUsers } from '@/pages/admin/AdminUsers';
import { AdminStats } from '@/pages/admin/AdminStats';
import { AdminAnnouncements } from '@/pages/admin/AdminAnnouncements';
import { Navbar } from '@/components/Navbar';
import AshdiPage from '@/pages/AshdiPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes with navbar */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <HomePage />
            </>
          }
        />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/top" element={<TopPage />} />
        <Route path="/anime/:id" element={<AnimeDetailPage />} />
        <Route path="/anime/:id/watch/:episode" element={<WatchPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/ashdi/:id" element={<AshdiPage />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="stats" element={<AdminStats />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
