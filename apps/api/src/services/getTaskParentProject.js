

import {pool} from "../db/pool.ts";

export async function getTaskParentProject(id) {
    try {
        const result = await pool.query(`
            SELECT parent_project
            FROM tasks
            WHERE ID = $1
        `,
        [id]);
        if (result.rows.length === 0){
            res.status(404).json({ error: "Resource requested not found" });
        } else{
            const data = JSON.parse(JSON.stringify(result.rows));
            const values = data.map(item => item.parent_project);
            return values[0];
        }
    } catch (error) {
        console.error("Failed to load items:", error);
        res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load items."
      });
    }
}