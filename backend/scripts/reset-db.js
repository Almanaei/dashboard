import { sequelize } from '../config/database.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function resetDatabase() {
  try {
    // Drop all tables
    console.log('Dropping all tables...');
    await sequelize.drop();
    console.log('All tables dropped successfully');

    // Run migrations
    const migrationsDir = join(__dirname, '..', 'migrations');
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    console.log('Running migrations...');
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const migrationPath = join(migrationsDir, file);
      const fileUrl = `file://${migrationPath.replace(/\\/g, '/')}`;
      const migration = await import(fileUrl);
      await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
      console.log(`Completed migration: ${file}`);
    }

    console.log('Database reset and migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase(); 