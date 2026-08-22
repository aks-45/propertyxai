import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/property_x';

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER;
const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString,
  ssl: isProduction && !isLocalhost ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

const adapter = new PrismaPg(pool);

// Single instance of Prisma Client configured with PostgreSQL adapter
const prisma = new PrismaClient({ adapter });

// Asynchronously test DB connection on boot without crashing the server
(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ PostgreSQL Database connected successfully');
  } catch (err: any) {
    console.warn('⚠️ PostgreSQL connection initialized (will reconnect on query):', err.message || err);
  }
})();

export default prisma;

export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    await pool.end();
  } catch (error) {
    console.error('Error disconnecting database:', error);
  }
};