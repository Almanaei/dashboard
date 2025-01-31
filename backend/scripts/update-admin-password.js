import bcrypt from 'bcrypt';
import { User } from '../models/index.js';

async function updateAdminPassword() {
  try {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.findOne({
      where: { email: 'admin@example.com' }
    });

    if (!user) {
      console.error('Admin user not found');
      process.exit(1);
    }

    await user.update({ password: hashedPassword });
    console.log('Admin password updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin password:', error);
    process.exit(1);
  }
}

updateAdminPassword(); 