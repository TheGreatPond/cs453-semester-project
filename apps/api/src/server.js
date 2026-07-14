import express from "express";
import cors from "cors";
import pg from "pg";

const { Pool } = pg;

const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.PGHOST ?? "127.0.0.1",
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE ?? "cs453",
  user: process.env.PGUSER ?? "postgres",
  password: process.env.PGPASSWORD ?? "postgres"
});

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use(cors({
    /* 
    origin: [
    //   "http://localhost:5173",
    //   "http://127.0.0.1:5173",
    //   "http://192.168.1.*:5173",
    //   "http://172.18.0.1:5173",
    //   "http://localhost:3000",
    //   "http://127.0.0.1:3000"
     ]

     */

    origin: true // i know this is bad practice but i am using this with my swagger doc since my swagger plugin within vscode hates cors

  }));

  app.get("/health", async (req, res) => {
    try {
      await pool.query("SELECT 1");
      res.json({ status: "ok" });
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(500).json({
        status: "error",
        message: "Database connection failed."
      });
    }
  });

  // Starter route: return every item from the database.
  app.get("/api/tasks", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT id, title, description, status, created_at, updated_at
        FROM tasks
        ORDER BY id ASC
      `);

      res.json({ items: result.rows });
    } catch (error) {
      console.error("Failed to load items:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load items."
      });
    }
  });

  // Starter route: create one item so the client can demonstrate a write.
  app.post("/api/tasks", async (req, res) => {
    const title = req.body?.title?.trim();
    const description = req.body?.description;
    const status = req.body?.status


    try {
      const result = await pool.query(
        `
          INSERT INTO tasks (title, description, status, created_at, updated_at)
          VALUES ($1, $2, $3, current_timestamp, current_timestamp)
          RETURNING id, title, description, status, created_at, updated_at
        `,
        [title, description, status]
      );

      res.status(201).json({ item: result.rows[0] });
    } catch (error) {
      console.error("Failed to add item:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to add item."
      });
    }
  });

  // DONE: Return one item by ID.
  app.get("/api/tasks/:id", async (req, res) => {
    const id = req.params.id;
    try {
      const result = await pool.query(`
        SELECT id, title, description, status, created_at, updated_at
        FROM tasks
        WHERE ID = $1
      `,
      [id]);
      if (result.rows.length === 0){
        res.status(404).json({ error: "Resource requested not found" });
      } else{
        res.json({ items: result.rows });
      }
    } catch (error) {
      console.error("Failed to load items:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load items."
      });
    }
  });

  // DONE: Replace one item by ID.
  app.put("/api/tasks/:id", async (req, res) => {
    const title = req.body?.title?.trim();
    const description = req.body?.description?.trim();
    const status = req.body?.status?.trim();
    const id = req.params.id;

    try {
      const result = await pool.query(`
        SELECT id, title, description, status, created_at, updated_at
        FROM tasks
        WHERE ID = $1
      `,
      [id]);
      if (result.rows.length === 0){
        res.status(404).json({ error: "Resource requested not found" });
      } else{
          try {
            const result =  await pool.query(
              `
              UPDATE tasks
              SET title = $1, description = $2, status = $3, updated_at = current_timestamp
              WHERE id = $4
              `,
              [title, description, status, id]
            );

            res.status(201).json({ item: result.rows[0] });
          } catch (error) {
            console.error("Failed to replace task:", error);
            res.status(500).json({
              error: "Internal Server Error",
              message: "Failed to replace task."
            });
          }
            }
    } catch (error) {
      console.error("Failed to load tasks:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load task."
      });
    }


  });


  // DONE: Partially update one item by ID.
  app.patch("/api/tasks/:id", async (req, res) => {
    const id = req.params.id;
    try {
      const result = await pool.query(`
        SELECT id, title, description, status, created_at, updated_at
        FROM tasks
        WHERE ID = $1
      `,
      [id]);
      if (result.rows.length === 0){
        res.status(404).json({ error: "Resource requested not found" });
      } else{
        if ((req.body.hasOwnProperty('title') || req.body.hasOwnProperty('description')) || req.body.hasOwnProperty('status') && Object.keys(req.body).length <= 3){
          if (req.body.hasOwnProperty('title')){
            const title = req.body.title;
            const result =  await pool.query(
              `
              UPDATE tasks
              SET title = $1, updated_at = current_timestamp
              WHERE id = $2
              `,
              [title, id]
            );
          }
          if (req.body.hasOwnProperty('description')){
            const description = req.body.description;
            const result =  await pool.query(
              `
              UPDATE tasks
              SET description = $1, updated_at = current_timestamp
              WHERE id = $2
              `,
              [description, id]
            );
          }
          if (req.body.hasOwnProperty('status')){
            const status = req.body.status;
            const result =  await pool.query(
              `
              UPDATE tasks
              SET status = $1, updated_at = current_timestamp
              WHERE id = $2
              `,
              [status, id]
            );
          }

        try {
          const result = await pool.query(`
            SELECT id, title, description, status, created_at, updated_at
            FROM tasks
            WHERE ID = $1
          `,
          [id]);

          res.json({tasks: result.rows });
        } catch (error) {
          console.error("Failed to load items:", error);
          res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to load items."
          });
        }
      } else {
        res.status(400).json({ error: "Malformed json, please try again with only name and quantity" });
      } 
      }
    } catch (error) {
      console.error("Failed to load items:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load items."
      });
    }
  });

  // DONE: Delete one task by ID.
  app.delete("/api/tasks/:id", async (req, res) => {
    const id = req.params.id;

    try {
      const result = await pool.query(`
        SELECT id, title, description, status, created_at, updated_at
        FROM tasks
        WHERE ID = $1
      `,
      [id]);
      if (result.rows.length === 0){
        res.status(404).json({ error: "Resource requested not found" });
      } else{
          try {
            const result = await pool.query(`
              DELETE FROM tasks
              WHERE ID = $1
            `,
            [id]);
            res.status(204).json({ result: "Task successfully deleted" });
          } catch (error) {
            console.error("Failed to load task:", error);
            res.status(500).json({
              error: "Internal Server Error",
              message: "Failed to load task."
            });
          }
      }
    } catch (error) {
      console.error("Failed to load task:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load task."
      });
    }


  });

  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  return app;
}

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity >= 0)
    )
  `);

  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM items");

  if (rows[0].count === 0) {
    await pool.query(
      `
        INSERT INTO items (name, quantity)
        VALUES ($1, $2), ($3, $4), ($5, $6)
      `,
      ["Keyboard", 10, "Mouse", 5, "Monitor", 3]
    );
  }
}

const isMainModule = process.argv[1] === new URL(import.meta.url).pathname;

if (isMainModule) {
  const app = createApp();

  initializeDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Lab 5 API listening on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Server startup failed:", error);
      process.exit(1);
    });
}
