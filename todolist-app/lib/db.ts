import { Pool } from "pg";

const globalWithPg = globalThis as typeof globalThis & {
  pgPool?: Pool;
};

export const pool =
  globalWithPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (!globalWithPg.pgPool) {
  globalWithPg.pgPool = pool;
}

export async function initTodosTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}
