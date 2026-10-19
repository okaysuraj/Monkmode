import { query } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const createSession = async (req, res) => {
  const {
    duration_minutes,
    mode = 'deep_work',
    chapter_id = null,
    notes = null,
    user_id = null,
  } = req.body;

  if (!Number.isInteger(duration_minutes) || duration_minutes <= 0) {
    return errorResponse(
      res,
      'Field "duration_minutes" is required and must be a positive integer',
      400,
    );
  }

  const result = await query(
    `INSERT INTO focus_sessions (duration_minutes, mode, chapter_id, notes, user_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, duration_minutes, mode, chapter_id, notes, completed_at, created_at`,
    [duration_minutes, mode, chapter_id, notes, user_id],
  );

  return successResponse(res, result.rows[0], 'Focus session recorded successfully', 201);
};

export const getSessions = async (req, res) => {
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
  const offset = Math.max(Number.parseInt(req.query.offset, 10) || 0, 0);

  const result = await query(
    `SELECT s.id, s.duration_minutes, s.mode, s.notes, s.completed_at, s.created_at,
            c.title AS chapter_title, c.japanese_title AS chapter_japanese_title
     FROM focus_sessions s
     LEFT JOIN chapters c ON s.chapter_id = c.id
     ORDER BY s.completed_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset],
  );

  return successResponse(res, result.rows, 'Sessions retrieved successfully');
};

export const getSessionStats = async (req, res) => {
  const totalStatsRes = await query(`
    SELECT 
      COUNT(*)::INT AS total_sessions,
      COALESCE(SUM(duration_minutes), 0)::INT AS total_focus_minutes,
      COALESCE(AVG(duration_minutes), 0)::NUMERIC(5, 1) AS avg_duration_minutes
    FROM focus_sessions
  `);

  const modeBreakdownRes = await query(`
    SELECT mode, COUNT(*)::INT AS session_count, SUM(duration_minutes)::INT AS total_minutes
    FROM focus_sessions
    GROUP BY mode
    ORDER BY total_minutes DESC
  `);

  const todayStatsRes = await query(`
    SELECT 
      COUNT(*)::INT AS today_sessions,
      COALESCE(SUM(duration_minutes), 0)::INT AS today_minutes
    FROM focus_sessions
    WHERE completed_at >= CURRENT_DATE
  `);

  const stats = {
    overall: totalStatsRes.rows[0],
    today: todayStatsRes.rows[0],
    modes: modeBreakdownRes.rows,
  };

  return successResponse(res, stats, 'Session statistics retrieved successfully');
};

export const deleteSession = async (req, res) => {
  const { id } = req.params;
  const result = await query('DELETE FROM focus_sessions WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    return errorResponse(res, `Session with id '${id}' not found`, 404);
  }

  return successResponse(res, { id }, 'Session deleted successfully');
};
