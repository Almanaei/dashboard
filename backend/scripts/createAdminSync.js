import { sequelize } from '../config/database.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const createAdminSync = async (email, password, username) => {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');

    // Delete existing user if exists
    await User.destroy({ where: { email } });
    console.log('Cleaned up existing user');

    // Create salt and hash synchronously
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    console.log('Generated password hash');

    // Create new admin user directly with hashed password
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'admin'
    }, {
      // Skip password hashing hooks
      hooks: false
    });

    // Force update the password hash
    await user.update({ password: hashedPassword }, { hooks: false });

    console.log('Admin user created successfully');
    console.log('User details:');
    console.log('ID:', user.id);
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Password Hash:', user.password);

    // Test password verification
    const isValid = bcrypt.compareSync(password, user.password);
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
  console.log('Usage: node createAdminSync.js <email> <password> <username>');
  process.exit(1);
}

createAdminSync(adminEmail, adminPassword, adminUsername);
