import { query } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getAllRituals = async (req, res) => {
  const result = await query(`
    SELECT 
      r.id, 
      r.title, 
      r.japanese_title, 
      r.description, 
      r.category, 
      r.target_daily_minutes, 
      r.is_active,
      r.created_at,
      CASE WHEN rl.id IS NOT NULL THEN true ELSE false END AS completed_today,
      rl.duration_minutes AS today_minutes,
      rl.notes AS today_notes
    FROM rituals r
    LEFT JOIN ritual_logs rl 
      ON r.id = rl.ritual_id AND rl.completed_date = CURRENT_DATE
    WHERE r.is_active = true
    ORDER BY r.created_at ASC
  `);

  return successResponse(res, result.rows, 'Rituals retrieved successfully');
};

export const createRitual = async (req, res) => {
  const {
    title,
    japanese_title,
    description,
    category = 'discipline',
    target_daily_minutes = 30,
  } = req.body;

  if (typeof title !== 'string' || !title.trim()) {
    return errorResponse(res, 'Title is required', 400);
  }

  const result = await query(
    `INSERT INTO rituals (title, japanese_title, description, category, target_daily_minutes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      title.trim(),
      japanese_title?.trim() || null,
      description?.trim() || null,
      category,
      target_daily_minutes,
    ],
  );

  return successResponse(res, result.rows[0], 'Ritual created successfully', 201);
};

export const logRitual = async (req, res) => {
  const { id } = req.params;
  const { duration_minutes = 0, notes = null } = req.body;

  // Check if ritual exists
  const ritualCheck = await query('SELECT id FROM rituals WHERE id = $1', [id]);
  if (ritualCheck.rows.length === 0) {
    return errorResponse(res, `Ritual '${id}' not found`, 404);
  }

  // Upsert into ritual_logs for today
  const result = await query(
    `INSERT INTO ritual_logs (ritual_id, completed_date, duration_minutes, notes)
     VALUES ($1, CURRENT_DATE, $2, $3)
     ON CONFLICT (ritual_id, completed_date)
     DO UPDATE SET
       duration_minutes = EXCLUDED.duration_minutes,
       notes = EXCLUDED.notes
     RETURNING *`,
    [id, duration_minutes, notes],
  );

  return successResponse(res, result.rows[0], 'Ritual logged for today', 200);
};

export const deleteRitual = async (req, res) => {
  const { id } = req.params;
  const result = await query('DELETE FROM rituals WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    return errorResponse(res, `Ritual '${id}' not found`, 404);
  }

  return successResponse(res, { id }, 'Ritual deleted successfully');
};
