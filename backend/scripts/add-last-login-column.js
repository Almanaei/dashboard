import { sequelize } from '../config/database.js';

async function addLastLoginColumn() {
  try {
    // Add the last_login column
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
    `);

    // Update existing users with current timestamp as last_login
    await sequelize.query(`
      UPDATE users 
      SET last_login = NOW()
      WHERE last_login IS NULL;
    `);

    // Remove lastActive column if it exists (since we're replacing it)
    await sequelize.query(`
      ALTER TABLE users 
      DROP COLUMN IF EXISTS last_active;
    `);

    console.log('Successfully added last_login column and removed last_active column');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addLastLoginColumn(); 