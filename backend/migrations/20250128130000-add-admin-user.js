import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export async function up(queryInterface, Sequelize) {
  try {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminId = uuidv4();

    await queryInterface.bulkInsert('users', [{
      id: adminId,
      email: 'admin@example.com',
      password: adminPassword,
      name: 'System Admin',
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    }]);

    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

export async function down(queryInterface, Sequelize) {
  try {
    await queryInterface.bulkDelete('users', {
      email: 'admin@example.com'
    });
  } catch (error) {
    console.error('Error removing admin user:', error);
    throw error;
  }
} 