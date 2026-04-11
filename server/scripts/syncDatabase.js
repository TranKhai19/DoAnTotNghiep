const path = require('path');
const { runSqlDirectory } = require('./dbRunner');

async function main() {
  const migrationsDir = path.join(__dirname, '..', 'database', 'migrations');
  const seedersDir = path.join(__dirname, '..', 'database', 'seeders');

  await runSqlDirectory({
    directory: migrationsDir,
    tableName: 'schema_migrations',
    label: 'migration'
  });

  await runSqlDirectory({
    directory: seedersDir,
    tableName: 'schema_seeders',
    label: 'seeder'
  });
}

main()
  .then(() => {
    console.log('Database sync completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database sync failed:', error.message);
    process.exit(1);
  });
