import { sequelize } from '../config/database.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const testPasswordValidation = async (email, password) => {
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
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Stored Password Hash:', user.password);

    // Test direct bcrypt comparison
    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password validation result:', isValid);

    // Get password hash for comparison
    const salt = await bcrypt.genSalt(10);
    const testHash = await bcrypt.hash(password, salt);
    console.log('Test password hash:', testHash);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
};

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Please provide both email and password');
  console.log('Usage: node testPasswordValidation.js <email> <password>');
  process.exit(1);
}

testPasswordValidation(email, password);
