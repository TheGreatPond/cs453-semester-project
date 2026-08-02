

import {pool} from "../db/pool.ts";

export async function getProjectOwner(id) {
    try {
        const result = await pool.query(`
            SELECT owner
            FROM projects
            WHERE PROJECT_NAME = $1
        `,
        [id]);
        if (result.rows.length === 0){
            return null
        } else{
            const data = JSON.parse(JSON.stringify(result.rows));
            const values = data.map(item => item.owner);
            return values[0];
        }
    } catch (error) {
        console.error("Failed to load items:", error);
        return null
    }
}