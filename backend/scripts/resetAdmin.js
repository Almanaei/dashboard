import { sequelize } from '../config/database.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

async function resetAdmin() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection successful');

    // Find or create admin user
    const [admin, created] = await User.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: {
        username: 'admin',
        password: 'admin', // Will be hashed by model hooks
        role: 'admin'
      }
    });

    if (!created) {
      // Update existing admin
      const hashedPassword = await bcrypt.hash('admin', 10);
      await admin.update({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user updated');
    } else {
      console.log('Admin user created');
    }

    // Verify the user
    const updatedAdmin = await User.findOne({
      where: { email: 'admin@example.com' }
    });

    console.log('Admin user details:');
    console.log('Username:', updatedAdmin.username);
    console.log('Email:', updatedAdmin.email);
    console.log('Role:', updatedAdmin.role);

    // Test password validation
    const isPasswordValid = await updatedAdmin.validatePassword('admin');
    console.log('Password validation test:', isPasswordValid);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetAdmin();
