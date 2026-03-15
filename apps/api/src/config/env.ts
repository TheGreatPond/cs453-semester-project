import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

export const env = {
    port: Number(process.env.PORT || 3000),
    databaseUrl:
        process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@localhost:5432/cs453",
};