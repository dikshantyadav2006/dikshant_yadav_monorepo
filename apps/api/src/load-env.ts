import { config } from 'dotenv';
import { resolve } from 'path';
import { DEV_DATABASE_URL } from './config/defaults.js';

config({ path: resolve(process.cwd(), '.env') });

// Prisma reads these directly from process.env at client init time.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = DEV_DATABASE_URL;
}

if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}
