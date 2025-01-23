import { sequelize } from '../config/database.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const resetAdminPassword = async (email, newPassword) => {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found');
      return;
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    await user.update({ password: hashedPassword });

    console.log('Password updated successfully');
    console.log('User details:');
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('Role:', user.role);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
};

// Get email and new password from command line arguments
const adminEmail = process.argv[2];
const newPassword = process.argv[3];

if (!adminEmail || !newPassword) {
  console.log('Please provide both email and new password');
  console.log('Usage: node resetAdminPassword.js <email> <newPassword>');
  process.exit(1);
}

resetAdminPassword(adminEmail, newPassword);
