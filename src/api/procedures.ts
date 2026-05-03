import { db } from '@/api/db';
import { env } from '@/lib/env';
import { getAuth } from '@adaptive-ai/sdk/server';

// ─── Health ───────────────────────────────────────────────────────────────────
export async function health() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: await db.$queryRaw`SELECT 1 as result`
      .then(() => 'connected')
      .catch(() => 'disconnected'),
    env: env.VITE_NODE_ENV,
  };
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────
async function requireAuth() {
  const auth = await getAuth({ required: true });
  if (auth.status !== 'authenticated') throw new Error('Not authenticated');
  return auth.userId;
}

async function requireAdmin() {
  const userId = await requireAuth();
  const admin = await db.admin.findUnique({ where: { userId } });
  if (!admin) throw new Error('Admin access required');
  return userId;
}

// ─── User Profile ─────────────────────────────────────────────────────────────
export async function getCurrentUser() {
  const auth = await getAuth();
  if (auth.status !== 'authenticated') return null;

  const user = await db.user.findUnique({ where: { id: auth.userId } });
  if (!user) return null;

  const [isAdmin, isBanned, listCount, watchCount] = await Promise.all([
    db.admin.findUnique({ where: { userId: auth.userId } }).then(Boolean),
    db.userBan.findUnique({ where: { userId: auth.userId } }).then(Boolean),
    db.userAnimeList.count({ where: { userId: auth.userId } }),
    db.watchHistory.count({ where: { userId: auth.userId } }),
  ]);

  return { ...user, isAdmin, isBanned, listCount, watchCount };
}

// ─── Anime List ───────────────────────────────────────────────────────────────
export async function addToList(
  animeId: number,
  animeTitle: string,
  animePoster: string,
  status: string,
) {
  const userId = await requireAuth();
  return db.userAnimeList.upsert({
    where: { userId_animeId: { userId, animeId } },
    create: { userId, animeId, animeTitle, animePoster, status },
    update: { status, animePoster },
  });
}

export async function removeFromList(animeId: number) {
  const userId = await requireAuth();
  return db.userAnimeList.deleteMany({ where: { userId, animeId } });
}

export async function getUserList(status?: string) {
  const userId = await requireAuth();
  return db.userAnimeList.findMany({
    where: { userId, ...(status ? { status } : {}) },
    orderBy: { addedAt: 'desc' },
  });
}

export async function getAnimeStatus(animeId: number) {
  const auth = await getAuth();
  if (auth.status !== 'authenticated') return null;
  const entry = await db.userAnimeList.findUnique({
    where: { userId_animeId: { userId: auth.userId, animeId } },
  });
  return entry?.status ?? null;
}

export async function addToHistory(animeId: number, episodeNumber: number) {
  const userId = await requireAuth();
  return db.watchHistory.create({ data: { userId, animeId, episodeNumber } });
}

export async function getLastWatched(animeId: number) {
  const auth = await getAuth();
  if (auth.status !== 'authenticated') return null;
  const entry = await db.watchHistory.findFirst({
    where: { userId: auth.userId, animeId },
    orderBy: { watchedAt: 'desc' },
  });
  return entry?.episodeNumber ?? null;
}

// ─── Announcements (public) ───────────────────────────────────────────────────
export async function getActiveAnnouncements() {
  return db.announcement.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
}

// ─── Admin: Stats ─────────────────────────────────────────────────────────────
export async function getAdminStats() {
  await requireAdmin();

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const [totalUsers, totalListEntries, totalWatches, activeUsersRaw, popularRaw] =
    await Promise.all([
      db.user.count(),
      db.userAnimeList.count(),
      db.watchHistory.count(),
      db.watchHistory.findMany({
        where: { watchedAt: { gte: weekStart } },
        select: { userId: true },
        distinct: ['userId'],
      }),
      db.userAnimeList.groupBy({
        by: ['animeId', 'animeTitle', 'animePoster'],
        _count: { animeId: true },
        orderBy: { _count: { animeId: 'desc' } },
        take: 5,
      }),
    ]);

  return {
    totalUsers,
    totalListEntries,
    totalWatches,
    activeUsers: activeUsersRaw.length,
    popularAnime: popularRaw.map((r) => ({
      animeId: r.animeId,
      animeTitle: r.animeTitle,
      animePoster: r.animePoster,
      count: r._count.animeId,
    })),
  };
}

// ─── Admin: Users ─────────────────────────────────────────────────────────────
export async function getAdminUsers(search?: string, page = 1) {
  await requireAdmin();
  const perPage = 20;
  const skip = (page - 1) * perPage;

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { handle: { contains: search } },
          { id: { contains: search } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      skip,
      take: perPage,
      include: {
        admin: true,
        ban: true,
        _count: { select: { animeList: true, watchHistory: true } },
      },
      orderBy: { id: 'asc' },
    }),
    db.user.count({ where }),
  ]);

  return {
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      handle: u.handle,
      image: u.image,
      isAdmin: !!u.admin,
      isBanned: !!u.ban,
      banReason: u.ban?.reason,
      animeCount: u._count.animeList,
      watchCount: u._count.watchHistory,
    })),
    total,
    page,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getUserDetails(targetUserId: string) {
  await requireAdmin();
  const [user, animeList, history, isAdminEntry, ban] = await Promise.all([
    db.user.findUnique({ where: { id: targetUserId } }),
    db.userAnimeList.findMany({
      where: { userId: targetUserId },
      orderBy: { addedAt: 'desc' },
    }),
    db.watchHistory.findMany({
      where: { userId: targetUserId },
      orderBy: { watchedAt: 'desc' },
      take: 50,
    }),
    db.admin.findUnique({ where: { userId: targetUserId } }),
    db.userBan.findUnique({ where: { userId: targetUserId } }),
  ]);

  return { user, animeList, history, isAdmin: !!isAdminEntry, ban };
}

export async function toggleAdmin(targetUserId: string) {
  await requireAdmin();
  const existing = await db.admin.findUnique({ where: { userId: targetUserId } });
  if (existing) {
    await db.admin.delete({ where: { userId: targetUserId } });
    return { isAdmin: false };
  }
  await db.admin.create({ data: { userId: targetUserId } });
  return { isAdmin: true };
}

export async function banUser(targetUserId: string, reason?: string) {
  await requireAdmin();
  return db.userBan.upsert({
    where: { userId: targetUserId },
    create: { userId: targetUserId, reason: reason ?? '' },
    update: { reason: reason ?? '' },
  });
}

export async function unbanUser(targetUserId: string) {
  await requireAdmin();
  return db.userBan.deleteMany({ where: { userId: targetUserId } });
}

// ─── Admin: Daily Stats ───────────────────────────────────────────────────────
export async function getDailyStats(days = 30) {
  await requireAdmin();
  const result: Array<{ date: string; watches: number }> = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const watches = await db.watchHistory.count({
      where: { watchedAt: { gte: start, lt: end } },
    });
    result.push({ date: start.toISOString().slice(0, 10), watches });
  }

  return result;
}

// ─── Admin: Popular Anime ─────────────────────────────────────────────────────
export async function getPopularAnime(limit = 20) {
  await requireAdmin();
  const raw = await db.userAnimeList.groupBy({
    by: ['animeId', 'animeTitle', 'animePoster'],
    _count: { animeId: true },
    orderBy: { _count: { animeId: 'desc' } },
    take: limit,
  });
  return raw.map((r, i) => ({
    rank: i + 1,
    animeId: r.animeId,
    animeTitle: r.animeTitle,
    animePoster: r.animePoster,
    count: r._count.animeId,
  }));
}

// ─── Admin: Announcements ─────────────────────────────────────────────────────
export async function getAllAnnouncements() {
  await requireAdmin();
  return db.announcement.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function createAnnouncement(title: string, message: string) {
  await requireAdmin();
  return db.announcement.create({ data: { title, message } });
}

export async function toggleAnnouncement(id: number) {
  await requireAdmin();
  const item = await db.announcement.findUnique({ where: { id } });
  if (!item) throw new Error('Not found');
  return db.announcement.update({ where: { id }, data: { isActive: !item.isActive } });
}

export async function deleteAnnouncement(id: number) {
  await requireAdmin();
  return db.announcement.delete({ where: { id } });
}

// ─── Internal ─────────────────────────────────────────────────────────────────
export async function _setInitialAdmin(userId: string) {
  await db.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });
  return db.admin.upsert({ where: { userId }, create: { userId }, update: {} });
}
