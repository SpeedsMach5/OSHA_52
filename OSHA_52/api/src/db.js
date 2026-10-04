// Thin database interface: { query(text, params), tx(fn), close() }.
// Production uses node-postgres; tests pass in a PGlite-backed object with the same shape.
const { Pool } = require('pg');

function createPgDb({ databaseUrl, databaseSsl }) {
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseSsl ? { rejectUnauthorized: false } : undefined,
    max: 10,
  });
  return {
    query: (text, params) => pool.query(text, params),
    async tx(fn) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await fn({ query: (t, p) => client.query(t, p) });
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        throw err;
      } finally {
        client.release();
      }
    },
    close: () => pool.end(),
  };
}

module.exports = { createPgDb };
