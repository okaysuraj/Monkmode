import { query } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getAllChapters = async (req, res) => {
  const result = await query(
    'SELECT id, order_index, title, japanese_title, subtitle, duration_minutes, description FROM chapters ORDER BY order_index ASC',
  );
  return successResponse(res, result.rows, 'Chapters retrieved successfully');
};

export const getChapterById = async (req, res) => {
  const { id } = req.params;
  const result = await query(
    'SELECT id, order_index, title, japanese_title, subtitle, duration_minutes, description FROM chapters WHERE id = $1',
    [id],
  );

  if (result.rows.length === 0) {
    return errorResponse(res, `Chapter '${id}' not found`, 404);
  }

  return successResponse(res, result.rows[0], 'Chapter details retrieved successfully');
};
