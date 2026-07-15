import { env } from "../config/env.ts";
import pg from "pg";

const { Pool } = pg;


export const pool = new Pool({
  host: process.env.PGHOST ?? "127.0.0.1",
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE ?? "cs453",
  user: process.env.PGUSER ?? "postgres",
  password: process.env.PGPASSWORD ?? "postgres"
});


export async function initializeDatabase() {
	await pool.query(`
	CREATE TABLE IF NOT EXISTS tasks (
		id SERIAL PRIMARY KEY,
		title TEXT NOT NULL,
		description TEXT,
		status TEXT NOT NULL DEFAULT 'todo',
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMP NOT NULL DEFAULT NOW()
	)
  `);

  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM tasks");

  if (rows[0].count === 0) {
	
	console.log("executing initialize database");
    await pool.query(
      `
		INSERT INTO TASKS (id, title, description, status, created_at, updated_at) VALUES ('3', 'third task', 'this is the third task.', 'not started', '2026-07-14 02:50:21.716814+00', '2026-07-14 02:50:21.716814+00') RETURNING id, title, description, status, created_at, updated_at;
		INSERT INTO TASKS (id, title, description, status, created_at, updated_at) VALUES ('2', 'second task', 'this is the second task.', 'done', '2026-07-14 02:47:21.716814+00', '2026-07-14 02:47:21.716814+00') RETURNING id, title, description, status, created_at, updated_at;
		INSERT INTO TASKS (id, title, description, status, created_at, updated_at) VALUES ('1', 'first_task', 'this is the first task.', 'in progress', '2026-07-14 02:46:21.716814+00', '2026-07-14 02:46:21.716814+00') RETURNING id, title, description, status, created_at, updated_at;
      `,
    );
  }
}