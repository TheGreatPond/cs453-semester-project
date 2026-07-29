import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {pool} from "../db/pool.ts";
import { authenticateToken } from "../services/authenticateToken.js";
import { jwtSecret } from "../services/authenticateToken.js";
import { jwtExpiresIn } from "../services/authenticateToken.js";



const router = Router();


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
        "SELECT * FROM users WHERE user_name = $1",
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
      { username: user.user_name, role: user.role},
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

router.get("/me", authenticateToken, (req, res) => {
    res.json({ user: req.user });
  });



export default router;