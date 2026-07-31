import express from "express";
import cors from "cors";
import {pool} from "./db/pool.ts";

import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import authRoutes from "./routes/authRoutes.js";

export function createApp() {
    const app = express();

    app.use(express.json());

    app.use(cors({
        origin: true
    }));

    app.use("/tasks", taskRoutes);
    app.use("/users", userRoutes);
    // app.use("/projects", projectRoutes);
    app.use("/auth", authRoutes);

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

    app.use((req, res) => {
        res.status(404).json({ error: "Not found" });
    });

    return app;
}