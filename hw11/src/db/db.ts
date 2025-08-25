import * as dotenv from "dotenv";
import {
    Pool,
    PoolConfig
} from "pg";

dotenv.config();

const poolConfig: PoolConfig = {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DB_POSTGRES_PORT || "5432", 10),
    user: process.env.DB_POSTGRES_USER,
    password: process.env.DB_POSTGRES_PASSWORD,
    database: process.env.DB_POSTGRES_DB,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
};

export const pool = new Pool(poolConfig);

export async function initializeDb(): Promise<void> {
    const client = await pool.connect();

    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS products
            (
                id          SERIAL PRIMARY KEY,
                name        VARCHAR(255)   NOT NULL,
                description TEXT,
                price       DECIMAL(10, 2) NOT NULL,
                category    VARCHAR(100),
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Error initializing database:", error);

        throw error;
    } finally {
        client.release();
    }
}
