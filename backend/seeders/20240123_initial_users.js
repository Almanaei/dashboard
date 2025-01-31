import bcrypt from 'bcrypt';
import { User } from '../models/index.js';

export const seed = async () => {
  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user if it doesn't exist
    const adminUser = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!adminUser) {
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        status: 'Active'
      });
      console.log('Admin user created successfully');
    }

    // Create regular user if it doesn't exist
    const regularUser = await User.findOne({ where: { email: 'user@example.com' } });
    if (!regularUser) {
      await User.create({
        name: 'Regular User',
        email: 'user@example.com',
        username: 'user',
        password: hashedPassword,
        role: 'user',
        status: 'Active'
      });
      console.log('Regular user created successfully');
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

// Execute seed function if this file is run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  seed().then(() => {
    console.log('Seeding completed');
    process.exit(0);
  }).catch(error => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}
