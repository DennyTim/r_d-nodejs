const { Client } = require("pg");

async function populateAccounts() {
  const dbConfig = {
    user: process.env.DB_POSTGRES_USER || "postgres",
    password: String(process.env.DB_POSTGRES_PASSWORD || "password"),
    host: "localhost",
    port: parseInt(process.env.DB_POSTGRES_PORT) || 5432,
    database: process.env.DB_POSTGRES_DB || "nestjs_orm_demo"
  };

  console.log("Database config:", { ...dbConfig, password: "***" });

  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log("Connected to database");

    /**
     * * Create test bills with fixed ids
     *  */
    const accounts = [
      { id: "550e8400-e29b-41d4-a716-446655440001", balance: 1000 },
      { id: "550e8400-e29b-41d4-a716-446655440002", balance: 500 },
      { id: "550e8400-e29b-41d4-a716-446655440003", balance: 0 }
    ];

    for (const account of accounts) {
      await client.query(
        "INSERT INTO accounts (id, balance) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET balance = $2",
        [account.id, account.balance]
      );
      console.log(`✓ Account ${account.id} created with balance ${account.balance}`);
    }

    /**
     *  * Create test post for isolation demo
     *  */
    await client.query(`
        INSERT INTO posts (id, title, draft)
        VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Original Title', false)
        ON CONFLICT (id) DO UPDATE SET title = 'Original Title',

                                       draft = false
    `);
    console.log("✓ Test post created for isolation demo");

    console.log("\n>>>> Created test data:");
    console.log("Account 1:", accounts[0].id, "- balance:", accounts[0].balance);
    console.log("Account 2:", accounts[1].id, "- balance:", accounts[1].balance);
    console.log("Account 3:", accounts[2].id, "- balance:", accounts[2].balance);

    console.log("\n>>>> Req examples:");
    console.log(`
      curl -X POST http://localhost:3000/transfer \\
        -H "Content-Type: application/json" \\
        -d '{"fromId": "${accounts[0].id}", "toId": "${accounts[1].id}", "amount": 100}'
    `);

  } catch (error) {
    console.error("Error seeding accounts:", error.message);
  } finally {
    await client.end();
  }
}

populateAccounts()
  .catch(console.error);
