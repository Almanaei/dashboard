import { sequelize } from '../config/database.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const checkUser = async (email) => {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User found:');
    console.log('ID:', user.id);
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Password is hashed:', user.password.startsWith('$2b$'));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
};

// Replace with your admin email
const adminEmail = process.argv[2];
if (!adminEmail) {
  console.log('Please provide an email address');
  process.exit(1);
}

checkUser(adminEmail);
