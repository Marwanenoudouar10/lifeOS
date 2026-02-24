import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/request-logger.js';
import { errorHandler } from './middleware/error-handler.js';

import taskRoutes from './routes/tasks.js';
import projectRoutes from './routes/projects.js';
import goalRoutes from './routes/goals.js';
import habitRoutes from './routes/habits.js';
import focusRoutes from './routes/focus.js';
import planRoutes from './routes/plans.js';
import reviewRoutes from './routes/reviews.js';
import tagRoutes from './routes/tags.js';
import categoryRoutes from './routes/categories.js';
import reminderRoutes from './routes/reminders.js';
import dashboardRoutes from './routes/dashboard.js';
import analyticsRoutes from './routes/analytics.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  // Health check
  app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/v1/tasks', taskRoutes);
  app.use('/api/v1/projects', projectRoutes);
  app.use('/api/v1/goals', goalRoutes);
  app.use('/api/v1/habits', habitRoutes);
  app.use('/api/v1/focus', focusRoutes);
  app.use('/api/v1/plans', planRoutes);
  app.use('/api/v1/reviews', reviewRoutes);
  app.use('/api/v1/tags', tagRoutes);
  app.use('/api/v1/categories', categoryRoutes);
  app.use('/api/v1/reminders', reminderRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);
  app.use('/api/v1/analytics', analyticsRoutes);

  app.use(errorHandler);

  return app;
}
