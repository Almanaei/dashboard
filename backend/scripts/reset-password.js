import { User } from '../models/index.js';
import bcrypt from 'bcrypt';
import { sequelize } from '../config/database.js';

async function resetPassword() {
  try {
    // Find user with password included
    const user = await User.findOne({
      where: { email: 'testuser@example.com' },
      attributes: { include: ['password'] }
    });

    if (!user) {
      console.log('User not found');
      return;
    }

    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password directly using query
    await User.update(
      { password: hashedPassword },
      { where: { email: 'testuser@example.com' } }
    );

    console.log('Password reset successful. New password: ' + newPassword);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

resetPassword(); 