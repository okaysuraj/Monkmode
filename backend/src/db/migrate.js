import { readFile } from 'node:fs/promises';
import { pool } from '../config/db.js';

const action = process.argv[2] || 'init';
const files = { init: ['schema.sql'], seed: ['seed.sql'], reset: ['schema.sql', 'seed.sql'] };

async function migrate() {
  if (!Object.hasOwn(files, action)) throw new Error('Use init, seed, or reset.');

  const client = await pool.connect();
  try {
    // Each command completes fully or leaves the existing database untouched.
    await client.query('BEGIN');
    if (action === 'reset') {
      await client.query(
        'DROP TABLE IF EXISTS focus_sessions, ritual_logs, rituals, chapters, users CASCADE',
      );
    }
    for (const file of files[action]) {
      const sql = await readFile(new URL(file, import.meta.url), 'utf8');
      await client.query(sql);
    }
    await client.query('COMMIT');
    console.log(`Database ${action} complete.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

try {
  await migrate();
} catch (error) {
  console.error('Database setup failed:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
