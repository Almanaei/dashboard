import { sequelize } from '../config/database.js';
import User from '../models/User.js';

const updateUserRole = async (email, newRole) => {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found');
      return;
    }

    // Update the user's role
    await user.update({ role: newRole });

    console.log('Role updated successfully');
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

// Get email from command line arguments
const adminEmail = process.argv[2];

if (!adminEmail) {
  console.log('Please provide the email address');
  console.log('Usage: node updateUserRole.js <email>');
  process.exit(1);
}

updateUserRole(adminEmail, 'admin');
