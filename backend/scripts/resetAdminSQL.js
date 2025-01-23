import { sequelize } from '../config/database.js';
import bcrypt from 'bcrypt';

async function resetAdminPassword() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection successful');

    // Hash the password
    const password = 'admin';
    const hashedPassword = await bcrypt.hash(password, 10);

    // First try to find the admin user
    const [existingUser] = await sequelize.query(`
      SELECT id FROM "Users" WHERE email = 'admin@example.com' LIMIT 1;
    `, { type: sequelize.QueryTypes.SELECT });

    if (existingUser) {
      // Update existing admin
      await sequelize.query(`
        UPDATE "Users" 
        SET 
          password = :password,
          username = 'admin',
          role = 'admin',
          "updatedAt" = NOW()
        WHERE email = 'admin@example.com';
      `, {
        replacements: { password: hashedPassword }
      });
      console.log('Existing admin user updated');
    } else {
      // Create new admin
      await sequelize.query(`
        INSERT INTO "Users" (
          id,
          username,
          email,
          password,
          role,
          "createdAt",
          "updatedAt"
        ) VALUES (
          uuid_generate_v4(),
          'admin',
          'admin@example.com',
          :password,
          'admin',
          NOW(),
          NOW()
        );
      `, {
        replacements: { password: hashedPassword }
      });
      console.log('New admin user created');
    }

    // Verify the update
    const [user] = await sequelize.query(`
      SELECT id, username, email, role FROM "Users" 
      WHERE email = 'admin@example.com' 
      LIMIT 1;
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('Admin user details:', user);

    // Test password
    const [{ password: storedPassword }] = await sequelize.query(`
      SELECT password FROM "Users" 
      WHERE email = 'admin@example.com' 
      LIMIT 1;
    `, { type: sequelize.QueryTypes.SELECT });

    const isValid = await bcrypt.compare(password, storedPassword);
    console.log('Password verification:', isValid);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetAdminPassword();
