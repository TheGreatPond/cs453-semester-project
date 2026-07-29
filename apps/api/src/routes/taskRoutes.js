import { Router } from "express";
import { authenticateToken } from "../app.js";
import { getUserProjects } from "../app.js";
import {pool} from "../db/pool.ts";


const router = Router();

router.get("/", authenticateToken, async (req, res) => {
    const user_projects =  await getUserProjects(req, res)
    try {
      const result = await pool.query(`
        SELECT *
        FROM tasks
        WHERE parent_project = ANY($1)
        ORDER BY id ASC
      `,
    [user_projects]);

      res.json({ items: result.rows });
    } catch (error) {
      console.error("Failed to load items:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load items."
      });
    }
  });

router.post("/", authenticateToken, async (req, res) => {
    const title = req.body?.title?.trim();
    const description = req.body?.description;
    const status = req.body?.status
    const parent_project = req.body?.parent_project
    const user_projects =  await getUserProjects(req, res)

    if ((req.body.hasOwnProperty('title') && req.body.hasOwnProperty('description')) && req.body.hasOwnProperty('status') && req.body.hasOwnProperty('parent_project') && Object.keys(req.body).length === 4){
      if (user_projects.includes(parent_project)) {
        try {
          const result = await pool.query(
            `
              INSERT INTO tasks (title, description, status, parent_project, created_at, updated_at)
              VALUES ($1, $2, $3, $4, current_timestamp, current_timestamp)
              RETURNING *
            `,
            [title, description, status, parent_project]
          );

          res.status(201).json({ task: result.rows[0] });
        } catch (error) {
          console.error("Failed to add task:", error);
          res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to add task."
          });
        }
      } else {
          res.status(403).json({ error: "User is not authorized to create task within the project specified" });
      }
    } else {
        res.status(400).json({ error: "Malformed json, please try again with title, description, project_name, and status" });
    }
  });

router.get("/:id", authenticateToken, async (req, res) => {
    const id = req.params.id;
    try {
      const result = await pool.query(`
        SELECT *
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

router.put("/:id", authenticateToken, async (req, res) => {
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

router.patch("/:id", authenticateToken, async (req, res) => {
    const id = req.params.id;
    try {
      const result = await pool.query(`
        SELECT *
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
            SELECT *
            FROM tasks
            WHERE ID = $1
          `,
          [id]);

          res.json({tasks: result.rows });
        } catch (error) {
          console.error("Failed to load task:", error);
          res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to load task."
          });
        }
      } else {
        res.status(400).json({ error: "Malformed json, please try again with only a combination of title, description and status" });
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

router.delete("/:id", authenticateToken, async (req, res) => {
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

export default router;