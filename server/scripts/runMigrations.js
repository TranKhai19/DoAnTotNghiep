const path = require('path');
const { runSqlDirectory } = require('./dbRunner');

async function main() {
  const directory = path.join(__dirname, '..', 'database', 'migrations');
  await runSqlDirectory({
    directory,
    tableName: 'schema_migrations',
    label: 'migration'
  });
}

main()
  .then(() => {
    console.log('Migrations completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error.message);
    process.exit(1);
  });
