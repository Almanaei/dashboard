import { sequelize } from '../config/database.js';
import { User } from '../models/index.js';

async function createAdmin() {
  try {
    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      username: 'admin',
      password: 'admin123', // Model will hash this automatically
      role: 'admin',
      status: 'Active'
    });

    console.log('Admin user created successfully:', admin.email);
    await sequelize.close();
  } catch (error) {
    console.error('Error creating admin user:', error);
    await sequelize.close();
    process.exit(1);
  }
}

createAdmin(); 