const path = require('path');
const { runSqlDirectory } = require('./dbRunner');

async function main() {
  const directory = path.join(__dirname, '..', 'database', 'seeders');
  await runSqlDirectory({
    directory,
    tableName: 'schema_seeders',
    label: 'seeder'
  });
}

main()
  .then(() => {
    console.log('Seeders completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeder failed:', error.message);
    process.exit(1);
  });
