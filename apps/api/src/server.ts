import express from "express";
import { env } from "./config/env";
import { pool } from "./db/pool";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "cs453-api",
    });
});

app.get("/db-health", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW() AS current_time");
        res.json({
            status: "ok",
            database: "connected",
            currentTime: result.rows[0].current_time,
        });
    } catch (error) {
        console.error("Database health check failed:", error);
        res.status(500).json({
            status: "error",
            database: "disconnected",
        });
    }
});

app.listen(env.port, () => {
    console.log(`Server running at http://localhost:${env.port}`);
});