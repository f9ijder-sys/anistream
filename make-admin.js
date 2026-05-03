import { PrismaClient } from './generated/client';
import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSQLite3({
  url: './dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Создаем пользователя
  const user = await prisma.user.upsert({
    where: { id: 'test-user' },
    update: {},
    create: {
      id: 'test-user',
      name: 'Admin User',
      handle: 'admin',
    },
  });

  // Добавляем права админа
  await prisma.admin.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
    },
  });

  console.log('Admin access granted to test-user');
  console.log('Go to /admin to access the admin panel');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());