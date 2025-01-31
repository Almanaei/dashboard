import { sequelize } from '../config/database.js';

async function addInitialsColumn() {
  try {
    // Add the initials column
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS initials VARCHAR(10);
    `);

    // Update existing users with initials
    await sequelize.query(`
      UPDATE users 
      SET initials = UPPER(
        CASE 
          WHEN name IS NOT NULL THEN LEFT(REGEXP_REPLACE(name, '\\s+', '', 'g'), 2)
          ELSE LEFT(username, 2)
        END
      )
      WHERE initials IS NULL;
    `);

    console.log('Successfully added and populated initials column');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addInitialsColumn(); 