'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    return queryInterface.bulkInsert('users', [
      {
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: hashedPassword,
        role: 'Admin',
        status: 'Active',
        last_active: new Date(),
        avatar: 'https://ui-avatars.com/api/?name=John+Doe',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        username: 'janesmith',
        password: hashedPassword,
        role: 'User',
        status: 'Active',
        last_active: new Date(),
        avatar: 'https://ui-avatars.com/api/?name=Jane+Smith',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        username: 'mikej',
        password: hashedPassword,
        role: 'User',
        status: 'Inactive',
        last_active: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        username: 'sarahw',
        password: hashedPassword,
        role: 'User',
        status: 'Active',
        last_active: new Date(),
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Alex Brown',
        email: 'alex@example.com',
        username: 'alexb',
        password: hashedPassword,
        role: 'Admin',
        status: 'Active',
        last_active: new Date(),
        avatar: 'https://ui-avatars.com/api/?name=Alex+Brown',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};
