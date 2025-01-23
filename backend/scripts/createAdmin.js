import { sequelize } from '../config/database.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const createAdmin = async (email, password, username) => {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('User already exists');
      return;
    }

    // Create new admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin user created successfully');
    console.log('User details:');
    console.log('ID:', user.id);
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('Role:', user.role);

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
  console.log('Usage: node createAdmin.js <email> <password> <username>');
  process.exit(1);
}

createAdmin(adminEmail, adminPassword, adminUsername);
