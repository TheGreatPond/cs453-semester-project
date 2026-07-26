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

  
	console.log("creating users table");
	await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    user_name TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
	)
  `);

  let { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM users");

  if (rows[0].count === 0) {

	console.log("filling user table");
    await pool.query(
      `
    INSERT INTO USERS (user_name) VALUES 
    ('first_user') 
    RETURNING *;
    `,
    );

  }


	console.log("creating project table");
	await pool.query(`
  CREATE TABLE IF NOT EXISTS projects (
    project_name TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
	)
  `);

  ({ rows } = await pool.query("SELECT COUNT(*)::int AS count FROM projects"));

  if (rows[0].count === 0) {

	console.log("filling project table");
    await pool.query(
      `
    INSERT INTO PROJECTS (project_name) VALUES 
    ('first_project') 
    RETURNING project_name, created_at, updated_at;
    INSERT INTO PROJECTS (project_name) VALUES 
    ('second_project') 
    RETURNING project_name, created_at, updated_at;
    `,
    );
  }

  console.log("creating project_members table");
	await pool.query(`
  CREATE TABLE IF NOT EXISTS project_members (
    project_name TEXT NOT NULL,
    user_name TEXT NOT NULL,

    PRIMARY KEY (project_name, user_name),

    FOREIGN KEY (project_name) REFERENCES projects(project_name),
    FOREIGN KEY (user_name) REFERENCES users(user_name)
	)
  `);

  ({ rows } = await pool.query("SELECT COUNT(*)::int AS count FROM project_members"));

  if (rows[0].count === 0) {

	console.log("filling project_members table");
    await pool.query(
      `
    INSERT INTO project_members (project_name, user_name)
    VALUES
        ('first_project', 'first_user')
    `,
    );
  }

	console.log("creating task table");
	await pool.query(`
	CREATE TABLE IF NOT EXISTS tasks (
		id SERIAL PRIMARY KEY,
		title TEXT NOT NULL,
		description TEXT,
		status TEXT NOT NULL DEFAULT 'todo',
    assigned_to TEXT,
    parent_project TEXT NOT NULL DEFAULT 'first_project',
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    FOREIGN KEY (assigned_to) REFERENCES users(user_name)
	)
  `);

  ({ rows } = await pool.query("SELECT COUNT(*)::int AS count FROM tasks"));

  if (rows[0].count === 0) {
	
	console.log("filling task table");
    await pool.query(
      `
		INSERT INTO TASKS (title, description, status, assigned_to) VALUES ('third task', 'this is the third task.', 'not started', 'first_user') RETURNING *;
		INSERT INTO TASKS (title, description, status) VALUES ('second task', 'this is the second task.', 'done') RETURNING *;
		INSERT INTO TASKS (title, description, status, parent_project) VALUES ('first_task', 'this is the first task.', 'in progress', 'second_project') RETURNING *;
    INSERT INTO TASKS (title, description, status, assigned_to, parent_project) VALUES ('fourth_task', 'this is the fourth task.', 'in progress', 'first_user', 'second_project') RETURNING *;
      `,
    );
  }


}