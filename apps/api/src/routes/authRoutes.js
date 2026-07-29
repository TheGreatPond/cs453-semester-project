import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {pool} from "../db/pool.ts";

const router = Router();

const jwtSecret = process.env.JWT_SECRET ?? "development-only-change-me";
const jwtExpiresIn = "1h";

router.post("/login", async (req, res) => {
    const username = req.body?.username?.trim();
    const password = req.body?.password;

    if (!username || !password) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Username and password are required."
      });
    }

    try {
      const result = await pool.query(
        "SELECT user_name, password_hash FROM users WHERE user_name = $1",
        [username]
      );
      const user = result.rows[0];

      // Use the same response for an unknown username and a wrong password.
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Invalid username or password."
        });
      }

      const token = jwt.sign(
      { username: user.user_name},
      jwtSecret,
      { expiresIn: jwtExpiresIn }
      );
      res.json({
        accessToken: token,
        tokenType: "Bearer",
        expiresIn: jwtExpiresIn,
        user: { username: user.user_name }
      });
    } catch (error) {
      console.error("Login failed:", error);
      res.status(500).json({ error: "Internal Server Error", message: "Login failed." });
    }
  });

router.get("/me", async (req, res) => {
    const username = req.body?.username?.trim();
    const password = req.body?.password;

    if (!username || !password) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Username and password are required."
      });
    }

    try {
      const result = await pool.query(
        "SELECT user_name, password_hash FROM users WHERE user_name = $1",
        [username]
      );
      const user = result.rows[0];

      // Use the same response for an unknown username and a wrong password.
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Invalid username or password."
        });
      }

      const token = jwt.sign(
      { username: user.user_name},
      jwtSecret,
      { expiresIn: jwtExpiresIn }
      );
      res.json({
        accessToken: token,
        tokenType: "Bearer",
        expiresIn: jwtExpiresIn,
        user: { username: user.user_name }
      });
    } catch (error) {
      console.error("Login failed:", error);
      res.status(500).json({ error: "Internal Server Error", message: "Login failed." });
    }
  });



export default router;