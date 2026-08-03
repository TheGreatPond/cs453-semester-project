import { Router } from "express";
import { authenticateToken } from "../services/authenticateToken.js";
import { getUserProjects } from "../services/getUserProjects.js";
import {pool} from "../db/pool.ts";
import { getTaskParentProject } from "../services/getTaskParentProject.js";
import { getProjectOwner } from "../services/getProjectOwner.js";

const router = Router();
  // Starter route: return every user from the database.
router.get("/", authenticateToken, async (req, res) => {
    getUserProjects(req, res);
    //projectMembershipCheck(req, res, "first_project");
    try {
      const result = await pool.query(`
        SELECT *
        FROM projects
        ORDER BY project_name ASC
      `);

      res.json({ projects: result.rows });
    } catch (error) {
      console.error("Failed to load projects:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load projects."
      });
    }
  });


  // Starter route: create one item so the client can demonstrate a write.
router.post("/", authenticateToken, async (req, res) => {
    const name = req.body?.name?.trim();

    try {
      const result = await pool.query(`
        SELECT *
        FROM projects
        WHERE PROJECT_NAME = $1
      `,
      [name]);
      if (result.rows.length !== 0){
        res.status(400).json({ error: "That project_name has already been taken, please try again." });
      } else if (req.body.hasOwnProperty('name') && Object.keys(req.body).length === 1){

          try {
            const result = await pool.query(
              `
                INSERT INTO projects (project_name, owner)
                VALUES ($1, $2)
                RETURNING *
              `,
              [name, req.user.username]
            );

            res.status(201).json({ projects: result.rows[0] });
          } catch (error) {
            console.error("Failed to add project:", error);
            res.status(500).json({
              error: "Internal Server Error",
              message: "Failed to add project."
            });
          }
        } else {
            res.status(400).json({ error: "Malformed json, please try again with only a project name" });
        }
      } catch (error) {
      console.error("Failed to load projects:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load projects."
      });
    }




  });



  // DONE: Return one user by ID.
router.get("/members", authenticateToken, async (req, res) => {
    const user_projects =  await getUserProjects(req, res);
      try {
        const result = await pool.query(`
            SELECT *
            FROM project_members
            WHERE PROJECT_NAME = ANY($1)            
            ORDER BY PROJECT_NAME ASC
        `,
        [user_projects]);
        if (result.rows.length === 0){
            res.status(404).json({ error: "Resource requested not found" });
        } else{
            res.json({ projects: result.rows });
        }
        } catch (error) {
        console.error("Failed to load project members:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to load projects."
        });
      }
  });

router.post("/members", authenticateToken, async (req, res) => {
    if(req.user.username == (await getProjectOwner(req.body.project_name)) || req.user.username == "admin") {
        try {
        const result = await pool.query(`
            INSERT INTO project_members (project_name, user_name) VALUES ($1, $2) RETURNING *
        `,
        [req.body.project_name, req.body.user_name]);
        if (result.rows.length === 0){
            res.status(404).json({ error: "Resource requested not found" });
        } else{
            res.json({ projects: result.rows });
        }
        } catch (error) {
        console.error("Failed to add project member rule:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to load projects."
        });
        }
    } else {
      res.status(403).json({ Forbidden: "Users may not add members to a project they are not the  owner of" });
    }
  });

router.delete("/members", authenticateToken, async (req, res) => {
    if(req.user.username == (await getProjectOwner(req.body.project_name)) || req.user.username == "admin") {
      try {
        const result = await pool.query(`
          SELECT *
          FROM project_members
          WHERE project_name = $1 and user_name =$2
        `,
        [req.body.project_name, req.body.user_name]);
        if (result.rows.length === 0){
          res.status(404).json({ error: "Resource requested not found" });
        } else{
          try {
            const result = await pool.query(`
                DELETE FROM project_members WHERE project_name = $1 and user_name =$2
            `,
            [req.body.project_name, req.body.user_name]);
            res.status(204).json({ result: "Task successfully deleted" });
            } catch (error) {
              console.error("Failed to add project member rule:", error);
              res.status(500).json({
                  error: "Internal Server Error",
                  message: "Failed to load projects."
            });
        }

    }
      } catch (error) {
        console.error("Failed to add project member rule:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to load projects."
        });
        }
      } else {
      res.status(403).json({ Forbidden: "Users may not add members to a project they are not the  owner of" });
      }
  });

  // DONE: Return one user by ID.
router.get("/:name", authenticateToken, async (req, res) => {
    const name = req.params.name;
    const user_projects =  await getUserProjects(req, res);
    if(user_projects.includes(name)) {
        try {
        const result = await pool.query(`
            SELECT *
            FROM projects
            WHERE PROJECT_NAME = $1
        `,
        [name]);
        if (result.rows.length === 0){
            res.status(404).json({ error: "Resource requested not found" });
        } else{
            res.json({ projects: result.rows });
        }
        } catch (error) {
        console.error("Failed to load projects:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to load projects."
        });
        }
    } else {
        res.status(403).json({ Forbidden: "Users may not retrieve information about a project they do not own and are not a member of" });
    }
  });




  export default router;