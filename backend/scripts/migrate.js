import { readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  const migrationsDir = join(__dirname, '..', 'migrations');
  
  try {
    // Get all migration files
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    // Run migrations in sequence
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const migration = await import(join(migrationsDir, file));
      await migration.up();
      console.log(`Completed migration: ${file}`);
    }

    console.log('All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
