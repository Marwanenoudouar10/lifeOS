import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './prisma.js';
import { startCronJobs } from './cron/index.js';

const PORT = process.env.API_PORT || 4000;

async function main() {
  await connectDatabase();

  const app = createApp();

  startCronJobs();

  app.listen(PORT, () => {
    console.log(`lifeOS API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
  });

  process.on('SIGTERM', async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
