import { Router } from "express";
import { authenticateToken } from "../services/authenticateToken.js";
import { getUserProjects } from "../services/getUserProjects.js";
import {pool} from "../db/pool.ts";
import { getTaskParentProject } from "../services/getTaskParentProject.js";
import { getProjectOwner } from "../services/getProjectOwner.js";
import bcrypt from "bcryptjs";


const router = Router();

router.get("/", authenticateToken, async (req, res) => {
    if (req.user.role == "admin") {
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
    } else {
        res.status(401).json({ error: "Unauthorized: Only users with the role admin are permitted to list other users" });
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
          res.status(401).json({ error: "Unauthorized: User cannot create new task in a project they are not the owner of" });
      }
    } else {
        res.status(400).json({ error: "Malformed json, please try again with title, description, project_name, and status" });
    }
  });


// TODO: stop users from accessing task they do not have permissions to the project they belong in 
router.get("/:name", authenticateToken, async (req, res) => {
    const name = req.params.name;
    if (req.user.role == "admin" || req.user.username == name) {
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
    } else {
        res.status(401).json({ error: "Unauthorized: Only users with the role admin are permitted to list other users" });
    }
  });

// TODO: make sure upgrading parent project works
router.patch("/:name", authenticateToken, async (req, res) => {
    const name = req.body?.name?.trim();
    const old_name = req.params.name;
    const role = req.user.role
    const password_hash = await bcrypt.hash(req.body?.unhashed_pw?.trim(), 10);
    if (role == "admin" || req.user.username == old_name) {
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
            if (req.body.hasOwnProperty('unhashed_pw') && Object.keys(req.body).length == 1){
                try {
                    const result =  await pool.query(
                    `
                    UPDATE users
                    SET updated_at = current_timestamp, password_hash = $2
                    WHERE user_name = $1
                    `,
                    [old_name, password_hash]
                    );
                    res.status(201).json({ "Result": `password of user ${old_name} updated` });
                } catch (error) {
                    console.error("Failed to replace User:", error);
                    res.status(500).json({
                    error: "Internal Server Error",
                    message: "Failed to replace User."
                    });
                }
            } else if (req.body.hasOwnProperty('unhashed_pw') &&  req.body.hasOwnProperty('role') && Object.keys(req.body).length == 2 && role == "admin") {
                const role = req.body?.role?.trim();
                try {
                    const result =  await pool.query(
                    `
                    UPDATE users
                    SET updated_at = current_timestamp, password_hash = $2, role = $3
                    WHERE user_name = $1
                    `,
                    [old_name, password_hash, role]
                    );

                    res.status(201).json({ "Result": `password and role of user ${old_name} updated` });
                } catch (error) {
                    console.error("Failed to replace User:", error);
                    res.status(500).json({
                    error: "Internal Server Error",
                    message: "Failed to replace User."
                    });
                } 
            } else if (req.body.hasOwnProperty('role') && Object.keys(req.body).length == 1 && role == "admin") {
                const role = req.body?.role?.trim();
                try {
                    const result =  await pool.query(
                    `
                    UPDATE users
                    SET user_name = $1, updated_at = current_timestamp, password_hash = $3, role = $4
                    WHERE user_name = $2
                    `,
                    [name, old_name, password_hash, role]
                    );

                    res.status(201).json({ User: result.rows[0] });
                } catch (error) {
                    console.error("Failed to replace User:", error);
                    res.status(500).json({
                    error: "Internal Server Error",
                    message: "Failed to replace User."
                    });
                } 
            } else {
                res.status(401).json({ error: "Malformed JSON, users are only allowed to modify their own password. Admins are allowed to edit the password and role of all users." });
            }
        }
    } catch (error) {
        console.error("Failed to load User:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to load User."
    });
    }
    } else {
      res.status(401).json({ error: "Unauthorized: Users are only allowed to edit their own password. Admins can edit the password or role of all users." });
    }
  });

router.delete("/:name", authenticateToken, async (req, res) => {
    const old_name = req.params.name;
    const role = req.user.role
    if (role == "admin" || req.user.username == old_name) {
    try {
      const result = await pool.query(`
        SELECT *
        FROM users
        WHERE USER_NAME = $1
      `,
      [old_name]);
      if (result.rows.length === 0){
        res.status(404).json({ error: "Resource requested not found" });
      } else{
          try {
            const result = await pool.query(`
              DELETE FROM users
              WHERE USER_NAME = $1
            `,
            [old_name]);
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
  }
});

export default router;