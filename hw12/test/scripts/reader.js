const { Client } = require("pg");

async function reader() {
  const config = {
    user: process.env.DB_POSTGRES_USER,
    password: process.env.DB_POSTGRES_PASSWORD,
    host: "localhost",
    port: parseInt(process.env.DB_POSTGRES_PORT),
    database: process.env.DB_POSTGRES_DB
  };

  const client = new Client(config);

  try {
    await client.connect();
    console.log(`[READER ${new Date().toISOString()}] Connected to database`);

    const postId = "550e8400-e29b-41d4-a716-446655440000";

    /**
     *  Set isolation level READ UNCOMMITTED
     * * */
    await client.query("SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED");

    console.log(`[READER ${new Date().toISOString()}] Starting to read (READ UNCOMMITTED level)`);

    for (let i = 1; i <= 3; i++) {
      const result = await client.query("SELECT title FROM posts WHERE id = $1", [postId]);
      const title = result.rows[0]?.title || "NOT FOUND";
      console.log(`[READER ${new Date().toISOString()}] Read #${i}: title = '${title}'`);

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`[READER ${new Date().toISOString()}] Reading completed`);
  } catch (error) {
    console.error(`[READER ${new Date().toISOString()}] Error:`, error.message);
  } finally {
    await client.end();
  }
}

reader()
  .catch(console.error);
