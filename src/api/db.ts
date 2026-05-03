import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/../generated/client";
import { env } from "@/lib/env";
import { Pool } from "pg";

const connectionString = env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const db = new PrismaClient({ adapter });
