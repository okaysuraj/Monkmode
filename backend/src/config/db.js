import 'dotenv/config';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
const config = connectionString
  ? {
      connectionString,
      // Keep the existing TLS behavior for hosted PostgreSQL connections.
      ssl:
        connectionString.includes('sslmode=require') || process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT) || 5432,
      database: process.env.PGDATABASE || 'monkmode',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
    };

export const pool = new pg.Pool({ ...config, connectionTimeoutMillis: 5000 });

// Idle pool errors happen outside a request and need their own handler.
pool.on('error', (error) => console.error('Database connection failed:', error.message));

export const query = (sql, params) => pool.query(sql, params);

export async function checkDbConnection() {
  const started = Date.now();
  try {
    await query('SELECT 1');
    return { ok: true, latencyMs: Date.now() - started };
  } catch (error) {
    return { ok: false, error: error.message || error.code || 'Database connection failed' };
  }
}
