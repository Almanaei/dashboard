export async function up(queryInterface, Sequelize) {
  try {
    // Drop existing users table
    await queryInterface.dropTable('users', { cascade: true });

    // Create users table with correct schema
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('user', 'admin'),
        defaultValue: 'user'
      },
      status: {
        type: Sequelize.ENUM('Active', 'Inactive'),
        defaultValue: 'Active'
      },
      last_active: {
        type: Sequelize.DATE,
        allowNull: true
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('users', ['email'], {
      unique: true,
      name: 'users_email_idx'
    });

    await queryInterface.addIndex('users', ['username'], {
      unique: true,
      name: 'users_username_idx'
    });

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

export async function down(queryInterface, Sequelize) {
  try {
    await queryInterface.dropTable('users', { cascade: true });
  } catch (error) {
    console.error('Migration reversion failed:', error);
    throw error;
  }
} 