const { Client } = require("pg");

async function writer() {
  const config = {
    user: process.env.DB_POSTGRES_USER || "postgres",
    password: process.env.DB_POSTGRES_PASSWORD || "password",
    host: "localhost",
    port: parseInt(process.env.DB_POSTGRES_PORT) || 5432,
    database: process.env.DB_POSTGRES_DB || "nestjs_orm_demo"
  };

  const client = new Client(config);

  try {
    await client.connect();
    console.log(`[WRITER ${new Date().toISOString()}] Connected to database`);

    /**
     * Crete test post if current doesn't exist
     *  */
    await client.query(`
        INSERT INTO posts (id, title, draft)
        VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Original Title', false)
        ON CONFLICT (id) DO NOTHING
    `);

    const postId = "550e8400-e29b-41d4-a716-446655440000";

    console.log(`[WRITER ${new Date().toISOString()}] Starting transaction`);
    await client.query("BEGIN");

    console.log(`[WRITER ${new Date().toISOString()}] Updating post title to 'Temp'`);
    await client.query("UPDATE posts SET title = $1 WHERE id = $2", ["Temp", postId]);

    console.log(`[WRITER ${new Date().toISOString()}] Sleeping for 5 seconds...`);
    await client.query("SELECT pg_sleep(5)");

    console.log(`[WRITER ${new Date().toISOString()}] Committing transaction`);
    await client.query("COMMIT");

    console.log(`[WRITER ${new Date().toISOString()}] Transaction completed`);

  } catch (error) {
    console.error(`[WRITER ${new Date().toISOString()}] Error:`, error.message);

    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError.message);
    }

  } finally {
    await client.end();
  }
}

writer()
  .catch(console.error);
