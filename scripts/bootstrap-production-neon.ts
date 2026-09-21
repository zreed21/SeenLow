import "dotenv/config";

const rawUrl = process.argv[2] || process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!rawUrl) {
  console.error("DATABASE_URL (or POSTGRES_URL) is required as an argument or environment variable.");
  process.exit(1);
}

// Set before dynamically importing DB modules so this script can target a Neon
// URL supplied on the command line without loading the sandbox .env connection.
process.env.DATABASE_URL = rawUrl;

async function main() {
  const [{ getDatabaseStatus, runDatabaseBootstrap }, { pool }] = await Promise.all([
    import("../src/lib/dbBootstrap"),
    import("../src/db/index"),
  ]);

  const before = await getDatabaseStatus();
  console.log(`Connecting to database: ${before.databaseHost}`);
  console.log(`Before: tables=${before.existingTablesCount}, deals=${before.dealsCount}, sources=${before.sourcesCount}`);

  if (before.missingTables.length === 0 && before.dealsCount > 0) {
    console.log("Existing catalog detected. Nothing inserted; scans and orders preserved.");
  } else {
    const result = await runDatabaseBootstrap();
    console.log("Bootstrap result:", JSON.stringify(result));
  }

  const after = await getDatabaseStatus();
  console.log(
    `After: tables=${after.existingTablesCount}, deals=${after.dealsCount}, sources=${after.sourcesCount}, ` +
      `sellable=${after.certifiedSellableCount}`
  );

  await pool.end();
}

main().catch((error) => {
  console.error("Production bootstrap failed:", error);
  process.exit(1);
});
