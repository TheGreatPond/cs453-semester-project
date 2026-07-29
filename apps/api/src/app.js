import express from "express";
import cors from "cors";
import {pool} from "./db/pool.ts";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const jwtSecret = process.env.JWT_SECRET ?? "development-only-change-me";
const jwtExpiresIn = "1h";

export async function getUserProjects(req, res) {
  const user = req.user.username;
  if (user === "admin"){
    try {
      const result = await pool.query(`
        SELECT project_name
        FROM projects
      `);
      const data = JSON.parse(JSON.stringify(result.rows));

      // Extract only the values
      const values = data.map(item => item.project_name);
      console.log(`User ${req.user.username} has access to projects ` + values); 
      return values;
    } catch (error) {
      console.error("Failed to load items:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load items."
      });
    }
  } else{
    try {
      const result = await pool.query(`
        SELECT project_name
        FROM project_members
        WHERE USER_NAME = $1 
      `,
      [user]);
      const data = JSON.parse(JSON.stringify(result.rows));

      // Extract only the values
      const values = data.map(item => item.project_name);
      console.log(`User ${req.user.username} has access to projects ` + values); 
      return values;
    } catch (error) {
      console.error("Failed to load items:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load items."
      });
    }
  }
}
/*
async function projectMembershipCheck(req, res, project_name) {
  //const user = req.user;
  const user = req.user.username;
  const projectname = "first_project";
    try {
      const result = await pool.query(`
        SELECT *
        FROM project_members
        WHERE USER_NAME = $1 AND PROJECT_NAME = $2
      `,
      [user, projectname]);
      if (result.rows.length === 0){
        console.log("access denied");
        return false;
      } else{
        console.log("access granted");      
        return true
      }
    } catch (error) {
      console.error("Failed to load items:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load items."
      });
    }
}
*/
export function authenticateToken(req, res, next) {
  const authorization = req.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Send a Bearer token in the Authorization header."
    });
  }

  const token = authorization.slice("Bearer ".length);

  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({
      error: "Unauthorized",
      message: "The access token is missing, invalid, or expired."
    });
  }
}

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




  // Starter route: return every user from the database.
  app.get("/users", authenticateToken, async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT *
        FROM users
        ORDER BY user_name ASC
      `);

      res.json({ users: result.rows });
    } catch (error) {
      console.error("Failed to load users:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load users."
      });
    }
  });

  // Starter route: create one item so the client can demonstrate a write.
  app.post("/users", authenticateToken, async (req, res) => {
    const name = req.body?.name?.trim();

    try {
      const result = await pool.query(`
        SELECT *
        FROM users
        WHERE user_name = $1
      `,
      [name]);
      if (result.rows.length !== 0){
        res.status(400).json({ error: "That username has already been taken, please try again." });
      } else if (req.body.hasOwnProperty('name') && Object.keys(req.body).length === 1){

      try {
        const result = await pool.query(
          `
            INSERT INTO users (user_name)
            VALUES ($1)
            RETURNING *
          `,
          [name]
        );

        res.status(201).json({ users: result.rows[0] });
      } catch (error) {
        console.error("Failed to add user:", error);
        res.status(500).json({
          error: "Internal Server Error",
          message: "Failed to add user."
        });
      }
    } else {
        res.status(400).json({ error: "Malformed json, please try again with only a username" });
    }
    } catch (error) {
        console.error("Failed to load users:", error);
        res.status(500).json({
          error: "Internal Server Error",
          message: "Failed to load users."
        });
  
      }
    });

  // Starter route: return every user from the database.
  app.get("/projects", authenticateToken, async (req, res) => {
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

  // Starter route: return every user from the database.
  app.get("/projects/members", authenticateToken, async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT *
        FROM project_members
        ORDER BY project_id ASC
      `);

      res.json({ project_members: result.rows });
    } catch (error) {
      console.error("Failed to load project_members:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load project_members."
      });
    }
  });

  // Starter route: create one item so the client can demonstrate a write.
  app.post("/projects", authenticateToken, async (req, res) => {
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
                INSERT INTO projects (project_name)
                VALUES ($1)
                RETURNING *
              `,
              [name]
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
  app.get("/users/:name", authenticateToken, async (req, res) => {
    const name = req.params.name;
    try {
      const result = await pool.query(`
        SELECT *
        FROM users
        WHERE USER_NAME = $1
      `,
      [name]);
      if (result.rows.length === 0){
        res.status(404).json({ error: "Resource requested not found" });
      } else{
        res.json({ users: result.rows });
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load users."
      });
    }
  });

  // DONE: Return one user by ID.
  app.get("/projects/:name", authenticateToken, async (req, res) => {
    const name = req.params.name;
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
  });

  /*

  // DONE: Replace one user by ID.
  app.put("/users/:name", async (req, res) => {
    const name = req.body?.name?.trim();
    const old_name = req.params.name;

    try {
      const result = await pool.query(`
        SELECT user_name
        FROM users
        WHERE USER_NAME = $1
      `,
      [old_name]);
      if (result.rows.length === 0){
        res.status(404).json({ error: "Resource requested not found" });
      } else{
          try {
            const result =  await pool.query(
              `
              UPDATE users
              SET user_name = $1, updated_at = current_timestamp
              WHERE user_name = $2
              `,
              [name, old_name]
            );

            res.status(201).json({ User: result.rows[0] });
          } catch (error) {
            console.error("Failed to replace User:", error);
            res.status(500).json({
              error: "Internal Server Error",
              message: "Failed to replace User."
            });
          }
            }
    } catch (error) {
      console.error("Failed to load User:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load User."
      });
    }
  });

  // DONE: Replace one user by ID.
  app.put("/projects/:id", async (req, res) => {
    const name = req.body?.name?.trim();
    const id = req.params.id;

    try {
      const result = await pool.query(`
        SELECT id
        FROM projects
        WHERE ID = $1
      `,
      [id]);
      if (result.rows.length === 0){
        res.status(404).json({ error: "Resource requested not found" });
      } else{
          try {
            const result =  await pool.query(
              `
              UPDATE projects
              SET project_name = $1, updated_at = current_timestamp
              WHERE id = $2
              `,
              [name, id]
            );

            res.status(201).json({ projects: result.rows[0] });
          } catch (error) {
            console.error("Failed to replace Project:", error);
            res.status(500).json({
              error: "Internal Server Error",
              message: "Failed to replace Project."
            });
          }
            }
    } catch (error) {
      console.error("Failed to load project:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load project."
      });
    }
  });

  */

  /*

  // DONE: Partially update one user by ID.
  app.patch("/users/:id", async (req, res) => {
    const id = req.params.id;
    try {
      const result = await pool.query(`
        SELECT id
        FROM users
        WHERE ID = $1
      `,
      [id]);
      if (result.rows.length === 0){
        res.status(404).json({ error: "Resource requested not found" });
      } else{
        if ((req.body.hasOwnProperty('name') && Object.keys(req.body).length <= 1)){
          const name = req.body.name;
          const result =  await pool.query(
            `
            UPDATE users
            SET name = $1, updated_at = current_timestamp
            WHERE id = $2
            `,
            [name, id]
          );
          

        try {
          const result = await pool.query(`
            SELECT *
            FROM users
            WHERE ID = $1
          `,
          [id]);

          res.json({user: result.rows });
        } catch (error) {
          console.error("Failed to load user:", error);
          res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to load user."
          });
        }
      } else {
        res.status(400).json({ error: "Malformed json, please try again with a username" });
      } 
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load user."
      });
    }
  });

  // DONE: Partially update one project by ID.
  app.patch("/projects/:id", async (req, res) => {
    const id = req.params.id;
    try {
      const result = await pool.query(`
        SELECT id
        FROM projects
        WHERE ID = $1
      `,
      [id]);
      if (result.rows.length === 0){
        res.status(404).json({ error: "Resource requested not found" });
      } else{
        if ((req.body.hasOwnProperty('name') && Object.keys(req.body).length <= 1)){
          const name = req.body.name;
          const result =  await pool.query(
            `
            UPDATE projects
            SET project_name = $1, updated_at = current_timestamp
            WHERE id = $2
            `,
            [name, id]
          );
          

        try {
          const result = await pool.query(`
            SELECT *
            FROM projects
            WHERE ID = $1
          `,
          [id]);

          res.json({project: result.rows });
        } catch (error) {
          console.error("Failed to load project:", error);
          res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to load project."
          });
        }
      } else {
        res.status(400).json({ error: "Malformed json, please try again with a project name" });
      } 
      }
    } catch (error) {
      console.error("Failed to load project:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load project."
      });
    }
  });

  */


  // DONE: Delete one task by ID.
  app.delete("/users/:name", authenticateToken, async (req, res) => {
    const name = req.params.name;

    try {
      const result = await pool.query(`
        SELECT *
        FROM users
        WHERE USER_NAME = $1
      `,
      [name]);
      if (result.rows.length === 0){
        res.status(404).json({ error: "Resource requested not found" });
      } else{
          try {
            const result = await pool.query(`
              DELETE FROM users
              WHERE USER_NAME = $1
            `,
            [name]);
            res.status(204).json({ result: "User successfully deleted" });
          } catch (error) {
            console.error("Failed to load user:", error);
            res.status(500).json({
              error: "Internal Server Error",
              message: "Failed to load user."
            });
          }
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load user."
      });
    }
  });

  // DONE: Delete one task by ID.
  app.delete("/projects/:name", authenticateToken, async (req, res) => {
    const name = req.params.name;

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
          try {
            const result = await pool.query(`
              DELETE FROM projects
              WHERE PROJECT_NAME = $1
            `,
            [name]);
            res.status(204).json({ result: "project successfully deleted" });
          } catch (error) {
            console.error("Failed to load project:", error);
            res.status(500).json({
              error: "Internal Server Error",
              message: "Failed to load project."
            });
          }
      }
    } catch (error) {
      console.error("Failed to load project:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load project."
      });
    }
  });


  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  return app;
}

