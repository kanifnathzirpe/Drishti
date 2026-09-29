import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRouter } from './server/routes/auth.js';
import { documentsRouter } from './server/routes/documents.js';
import { batchesRouter } from './server/routes/batches.js';
import { verificationRouter } from './server/routes/verification.js';
import { dashboardRouter } from './server/routes/dashboard.js';
import { gisRouter } from './server/routes/gis.js';
import { integrationsRouter } from './server/routes/integrations.js';
import { auditRouter } from './server/routes/audit.js';
import { feedbackRouter } from './server/routes/feedback.js';
import { rulesRouter } from './server/routes/rules.js';
import { usersRouter } from './server/routes/users.js';
import { notificationsRouter } from './server/routes/notifications.js';
import { reportsRouter } from './server/routes/reports.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Body parser with 50MB limit to support base64 scanned documents & land maps
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // REST API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/documents', documentsRouter);
  app.use('/api/batches', batchesRouter);
  app.use('/api/verification', verificationRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/gis', gisRouter);
  app.use('/api/integrations', integrationsRouter);
  app.use('/api/audit', auditRouter);
  app.use('/api/feedback', feedbackRouter);
  app.use('/api/rules', rulesRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/reports', reportsRouter);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'UP',
      system: 'DRISHTI Intelligent Land Record Digitization Engine',
      version: '2.4.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Sample static images/fixtures
  app.use('/samples', express.static(path.join(__dirname, 'public/samples')));

  if (!isProduction) {
    // Vite middleware for dev mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[DRISHTI Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[DRISHTI Server] Fatal error starting server:', err);
  process.exit(1);
});
