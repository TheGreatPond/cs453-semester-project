import express from "express";
import cors from "cors";
import {initializeDatabase} from "./db/pool.ts";
import {createApp} from "./app2.js";
import { env } from "../src/config/env.ts"



const isMainModule = process.argv[1] === new URL(import.meta.url).pathname;
export const PORT = env.port;

if (isMainModule) {
  const app = createApp();

  initializeDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Semester Project API listening on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Server startup failed:", error);
      process.exit(1);
    });
}
