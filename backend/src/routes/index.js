import { getAllChapters, getChapterById } from '../controllers/chapters.controller.js';
import {
  getSessions,
  createSession,
  getSessionStats,
  deleteSession,
} from '../controllers/sessions.controller.js';
import {
  getAllRituals,
  createRitual,
  logRitual,
  deleteRitual,
} from '../controllers/rituals.controller.js';
import { Router } from 'express';
import { checkDbConnection } from '../config/db.js';
import { successResponse } from '../utils/apiResponse.js';

const router = Router();

// Express 4 needs rejected async handlers forwarded to error middleware.
const handle = (action) => (req, res, next) => action(req, res).catch(next);

// Base API info
router.get('/', (req, res) => {
  return successResponse(
    res,
    {
      name: 'Monkmode API',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        chapters: '/api/chapters',
        sessions: '/api/sessions',
        rituals: '/api/rituals',
      },
    },
    'Monkmode backend API service is operational',
  );
});

// Health check with DB status
router.get('/health', async (req, res) => {
  const dbStatus = await checkDbConnection();
  const uptime = process.uptime();

  const healthData = {
    uptimeSeconds: Math.floor(uptime),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: dbStatus.ok,
      latencyMs: dbStatus.latencyMs,
      error: dbStatus.error || null,
    },
  };

  // Render receives 503 when the database is unavailable.
  const statusCode = dbStatus.ok ? 200 : 503;
  return res.status(statusCode).json({
    success: dbStatus.ok,
    message: dbStatus.ok ? 'System is healthy' : 'Database connection error',
    data: healthData,
  });
});

// The complete API map lives here; each controller owns one resource.
router.get('/chapters', handle(getAllChapters));
router.get('/chapters/:id', handle(getChapterById));
router.get('/sessions', handle(getSessions));
router.post('/sessions', handle(createSession));
router.get('/sessions/stats', handle(getSessionStats));
router.delete('/sessions/:id', handle(deleteSession));
router.get('/rituals', handle(getAllRituals));
router.post('/rituals', handle(createRitual));
router.post('/rituals/:id/log', handle(logRitual));
router.delete('/rituals/:id', handle(deleteRitual));

export default router;
