import {pool} from "../db/pool.ts";


export async function getUserProjects(req, res) {
  const user = req.user.username;
  const user_role = req.user.role;
  if (user === "admin"){
    try {
      const result = await pool.query(`
        SELECT project_name
        FROM projects
      `);
      const data = JSON.parse(JSON.stringify(result.rows));

      // Extract only the values
      const values = data.map(item => item.project_name);

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

      const result2 = await pool.query(`
        SELECT project_name
        FROM projects
        WHERE OWNER = $1
      `,
      [user]);
      const data2 = JSON.parse(JSON.stringify(result.rows));

      // Extract only the values
      const ownedProjects = data2.map(item => item.project_name);

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