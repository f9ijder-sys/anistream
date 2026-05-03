import { PrismaClient } from './generated/client.js';
import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSQLite3({
  url: './dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Создаем пользователя, если нет
  const user = await prisma.user.upsert({
    where: { id: 'test-user' },
    update: {},
    create: {
      id: 'test-user',
      name: 'Test User',
      handle: 'testuser',
    },
  });

  // Добавляем Attack on Titan в список
  await prisma.userAnimeList.upsert({
    where: { userId_animeId: { userId: user.id, animeId: 9999 } },
    update: {},
    create: {
      userId: user.id,
      animeId: 9999,
      animeTitle: 'Атака титанов',
      animePoster: 'https://example.com/poster.jpg', // placeholder
      status: 'watching',
    },
  });

  // Добавляем в историю просмотра
  await prisma.watchHistory.create({
    data: {
      userId: user.id,
      animeId: 9999,
      episodeNumber: 1,
    },
  });

  console.log('Added Attack on Titan to test user');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());