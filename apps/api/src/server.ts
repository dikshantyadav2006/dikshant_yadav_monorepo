import { buildApp } from './app.js';
import { env } from './config/env.js';
import { AuthService } from './services/auth.service.js';

const app = buildApp();

async function start() {
  try {
    // Seed default admin user (bootstrapping credentials if empty)
    await AuthService.seedAdminIfNeeded();

    await app.listen({ port: env.PORT, host: env.HOST });
    console.log(`[API] Server is listening at http://${env.HOST}:${env.PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();
export default app;
