import { Router } from "express";
import { authenticateToken } from "../services/authenticateToken.js";
import { getUserProjects } from "../services/getUserProjects.js";
import {pool} from "../db/pool.ts";
import { getTaskParentProject } from "../services/getTaskParentProject.js";
import { getProjectOwner } from "../services/getProjectOwner.js";


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

    console.log(req.user.username);
    console.log(await getProjectOwner(parent_project));

    if ((req.body.hasOwnProperty('title') && req.body.hasOwnProperty('description')) && req.body.hasOwnProperty('status') && req.body.hasOwnProperty('parent_project') && Object.keys(req.body).length === 4){
      if (req.user.username == (await getProjectOwner(parent_project)) || req.user.role == "admin") {
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
          res.status(403).json({ error: "Forbidden: User cannot create new task in a project they are not the owner of" });
      }
    } else {
        res.status(400).json({ error: "Malformed json, please try again with title, description, project_name, and status" });
    }
  });


// TODO: stop users from accessing task they do not have permissions to the project they belong in 
router.get("/:id", authenticateToken, async (req, res) => {
    const id = req.params.id;
    const user_projects =  await getUserProjects(req, res);
    const parent_project = await getTaskParentProject(id);
    if (user_projects.includes(parent_project)) {
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
    } else {
          res.status(403).json({ error: "Forbidden: User is not authorized to get the task requested since it belongs to a project they are not a member of" });
    }
  });

// TODO: make sure upgrading parent project works
router.put("/:id", authenticateToken, async (req, res) => {
    const title = req.body?.title?.trim();
    const description = req.body?.description?.trim();
    const status = req.body?.status?.trim();
    const new_parent_project = req.body?.parent_project?.trim();
    const id = req.params.id;
    const user_projects =  await getUserProjects(req, res);
    const parent_project = await getTaskParentProject(id);
    if (((req.user.username == (await getProjectOwner(new_parent_project))) && (req.user.username == (await getProjectOwner(parent_project)))) || (req.user.role == "admin")) {
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
                SET title = $1, description = $2, status = $3, parent_project = $4, updated_at = current_timestamp
                WHERE id = $5
                `,
                [title, description, status, parent_project, id]
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
    } else if (!user_projects.includes(new_parent_project))  {
          res.status(403).json({ error: "Forbidden: User is not authorized to place the task requested in a project the user is not the owner of" });
    } else {
          res.status(403).json({ error: "Forbidden: User is not authorized to modify the task requested since it belongs to a project they are not the owner of" });
    }
  });

// TODO: make sure upgrading parent project works
router.patch("/:id", authenticateToken, async (req, res) => {
    const id = req.params.id;
    const user_projects =  await getUserProjects(req, res);
    const parent_project = await getTaskParentProject(id);
    if (req.user.username == (await getProjectOwner(parent_project))) {
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
          if ((req.body.hasOwnProperty('title') || req.body.hasOwnProperty('description')) || req.body.hasOwnProperty('status') || req.body.hasOwnProperty('parent_project') && Object.keys(req.body).length <= 4){
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
            if (req.body.hasOwnProperty('parent_project')){
              const new_parent_project = req.body.parent_project;
              if (!user_projects.includes(new_parent_project))  {
                    res.status(403).json({ error: "Forbidden: Parent Project update failed. User is not authorized to place the task requested in a project the user is not a member of" });
              } else {
                  const result =  await pool.query(
                  `
                  UPDATE tasks
                  SET parent_project = $1, updated_at = current_timestamp
                  WHERE id = $2
                  `,
                  [parent_project, id]
                  );
              }
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
    } else {
          res.status(403).json({ error: "Forbidden: User is not authorized to modify the task requested they are not the owner of the project the task belongs to." });
    }
  });
// TODO: stop users from deleting task outside of projects they are members of
router.delete("/:id", authenticateToken, async (req, res) => {
    const id = req.params.id;
    const user_projects =  await getUserProjects(req, res);
    const parent_project = await getTaskParentProject(id);
    if (req.user.username == (await getProjectOwner(parent_project))) {

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
    } else {
          res.status(403).json({ error: "Forbidden: User is not authorized to modify the task requested they are not the owner of the project the task belongs to."});
    }
  });

export default router;