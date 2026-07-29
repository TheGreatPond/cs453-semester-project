import express from "express";
import cors from "cors";

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
    // app.use("/users", userRoutes);
    // app.use("/projects", projectRoutes);
    app.use("/auth", authRoutes);

    app.use((req, res) => {
        res.status(404).json({ error: "Not found" });
    });

    return app;
}