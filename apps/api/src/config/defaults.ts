/**
 * Local dev fallback when DATABASE_URL is not set in the environment.
 * Set DATABASE_URL in apps/api/.env — never commit real credentials here.
 */
export const DEV_DATABASE_URL =
  'postgresql://user:password@localhost:5432/devdb?sslmode=prefer';
