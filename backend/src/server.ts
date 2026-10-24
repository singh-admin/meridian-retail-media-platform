import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { adminRouter } from './routes/adminRoutes.js';
import { retailerRouter } from './routes/retailerRoutes.js';
import { mediaManagerRouter } from './routes/mediaManagerRoutes.js';
import { airlineRouter } from './routes/airlineRoutes.js';
import { screenRouter } from './routes/screenRoutes.js';
import { simulationRouter } from './routes/simulationRoutes.js';
import { aiRouter } from './routes/aiRoutes.js';
import { DataStore } from './db/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  // Security Headers Middleware
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // CORS Middleware
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // JSON Body Parser with safe size limit
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // API Routes
  app.use('/api/admin', adminRouter);
  app.use('/api/retailer', retailerRouter);
  app.use('/api/media-manager', mediaManagerRouter);
  app.use('/api/airline', airlineRouter);
  app.use('/api/screen', screenRouter);
  app.use('/api/simulation', simulationRouter);
  app.use('/api/ai', aiRouter);

  // Healthcheck endpoint for Docker & Container orchestrators
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'Meridian Airport Retail Media Platform'
    });
  });

  // Static Frontend SPA serving (for unified Render / single-service deployments)
  const possiblePaths = [
    path.resolve(__dirname, '../../frontend/dist'),
    path.resolve(process.cwd(), 'frontend/dist'),
    path.resolve(process.cwd(), '../frontend/dist'),
    path.resolve(__dirname, '../public')
  ];
  const staticPath = possiblePaths.find(p => fs.existsSync(p));

  if (staticPath) {
    app.use(express.static(staticPath));
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/health') || req.path.startsWith('/ws')) {
        return next();
      }
      res.sendFile(path.join(staticPath, 'index.html'));
    });
  }

  // WebSocket broadcast on DataStore events (<2s live synchronization)
  const store = DataStore.getInstance();
  store.subscribe((event) => {
    const payload = JSON.stringify(event);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  });

  wss.on('connection', (ws: WebSocket) => {
    ws.send(JSON.stringify({
      type: 'CONNECTED',
      payload: { message: 'Connected to Meridian Real-Time Signage WebSocket Engine' }
    }));

    ws.on('message', (message: string) => {
      try {
        const parsed = JSON.parse(String(message));
        if (parsed.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
        }
      } catch {
        // Safe ignore
      }
    });
  });

  // Safe global error handler (no stack trace leak)
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Server error:', err.message);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message || 'An unexpected error occurred'
    });
  });

  return { app, server, wss };
}
