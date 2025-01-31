import bcrypt from 'bcrypt';
import { User } from '../models/index.js';

export const seedAdminUser = async () => {
  try {
    // Check if admin user exists
    const adminExists = await User.findOne({
      where: { email: 'admin@example.com' }
    });

    if (!adminExists) {
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      await User.create({
        name: 'Admin User',
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        status: 'Active'
      });

      console.log('Admin user created successfully');
    } else {
      // Update admin role if it exists
      await adminExists.update({ role: 'admin' });
      console.log('Admin user already exists, role updated');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};
