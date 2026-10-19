import app from './app.js';
import { pool } from './config/db.js';

const port = Number(process.env.PORT) || 5000;
const server = app.listen(port, () => {
  console.log(`Monkmode API listening on port ${port}`);
});

// Let in-flight requests finish before closing the database connections.
function shutdown() {
  server.close(async () => {
    try {
      await pool.end();
    } catch (error) {
      console.error('Database shutdown failed:', error.message);
      process.exitCode = 1;
    }
  });
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
