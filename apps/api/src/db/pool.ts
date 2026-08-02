import { env } from "../config/env.ts";
import pg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
  CREATE TABLE IF NOT EXISTS users (
    user_name TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
	)
  `);

  let { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM users");

  if (rows[0].count === 0) {

    const passwordHash = await bcrypt.hash("user1-password", 10);
    const passwordHash2 = await bcrypt.hash("user2-password", 10);
    const adminPasswordHash = await bcrypt.hash("admin-password", 10);
	  console.log("filling user table");
    await pool.query(
      "INSERT INTO users (user_name, password_hash, role) VALUES ($1, $2, $3), ($4, $5, $6), ($7, $8, $9)",
      ["user1", passwordHash, "user", "admin", adminPasswordHash, 'admin', "user2", passwordHash2, "user"]
    );

  }


	await pool.query(`
  CREATE TABLE IF NOT EXISTS projects (
    project_name TEXT PRIMARY KEY,
    owner TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
	)
  `);

  ({ rows } = await pool.query("SELECT COUNT(*)::int AS count FROM projects"));

  if (rows[0].count === 0) {

	console.log("filling project table");
    await pool.query(
      `
    INSERT INTO PROJECTS (project_name, owner) VALUES 
    ('first_project', 'user1') 
    RETURNING project_name, created_at, updated_at;
    INSERT INTO PROJECTS (project_name, owner) VALUES 
    ('second_project', 'user1') 
    RETURNING project_name, created_at, updated_at;
    INSERT INTO PROJECTS (project_name, owner) VALUES 
    ('third_project', 'user2') 
    RETURNING project_name, created_at, updated_at;
    `,
    );
  }

	await pool.query(`
  CREATE TABLE IF NOT EXISTS project_members (
    project_name TEXT NOT NULL,
    user_name TEXT NOT NULL,

    PRIMARY KEY (project_name, user_name),

    FOREIGN KEY (project_name) REFERENCES projects(project_name) ON DELETE CASCADE,
    FOREIGN KEY (user_name) REFERENCES users(user_name) ON DELETE CASCADE
	)
  `);

  ({ rows } = await pool.query("SELECT COUNT(*)::int AS count FROM project_members"));

  if (rows[0].count === 0) {

	console.log("filling project_members table");
    await pool.query(
      `
    INSERT INTO project_members (project_name, user_name)
    VALUES
        ('first_project', 'user1'),
        ('second_project', 'user1'),
        ('second_project', 'user2'),
        ('third_project', 'user2')
    `
    );
  }

	await pool.query(`
	CREATE TABLE IF NOT EXISTS tasks (
		id SERIAL PRIMARY KEY,
		title TEXT NOT NULL,
		description TEXT,
		status TEXT NOT NULL DEFAULT 'todo',
    assigned_to TEXT,
    parent_project TEXT NOT NULL,
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (assigned_to) REFERENCES users(user_name),
    FOREIGN KEY (parent_project) REFERENCES projects(project_name) ON DELETE CASCADE
	)
  `);

  ({ rows } = await pool.query("SELECT COUNT(*)::int AS count FROM tasks"));

  if (rows[0].count === 0) {
	
	console.log("filling task table");
    await pool.query(
      `
		INSERT INTO TASKS (title, description, status, assigned_to, parent_project) VALUES ('third task', 'this is the third task.', 'not started', 'user1', 'first_project') RETURNING *;
		INSERT INTO TASKS (title, description, status, parent_project) VALUES ('second task', 'this is the second task.', 'done', 'first_project') RETURNING *;
		INSERT INTO TASKS (title, description, status, parent_project) VALUES ('first_task', 'this is the first task.', 'in progress', 'second_project') RETURNING *;
    INSERT INTO TASKS (title, description, status, assigned_to, parent_project) VALUES ('fourth_task', 'this is the fourth task.', 'in progress', 'user1', 'second_project') RETURNING *;
    INSERT INTO TASKS (title, description, status, parent_project) VALUES ('fifth_task', 'this is the fifth task.', 'testing',  'third_project') RETURNING *;

      `,
    );
  }


}