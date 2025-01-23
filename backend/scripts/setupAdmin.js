import { sequelize } from '../config/database.js';
import User from '../models/User.js';

const setupAdmin = async (email, password, username) => {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');

    // Delete existing user if exists
    await User.destroy({ where: { email } });
    console.log('Cleaned up existing user');

    // Create new admin user
    const user = await User.create({
      username,
      email,
      password,
      role: 'admin'
    });

    console.log('Admin user created successfully');
    console.log('User details:');
    console.log('ID:', user.id);
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('Role:', user.role);

    // Test password verification
    const isValid = user.validatePassword(password);
    console.log('Password verification:', isValid);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
};

// Get command line arguments
const adminEmail = process.argv[2];
const adminPassword = process.argv[3];
const adminUsername = process.argv[4];

if (!adminEmail || !adminPassword || !adminUsername) {
  console.log('Please provide email, password, and username');
  console.log('Usage: node setupAdmin.js <email> <password> <username>');
  process.exit(1);
}

setupAdmin(adminEmail, adminPassword, adminUsername);
