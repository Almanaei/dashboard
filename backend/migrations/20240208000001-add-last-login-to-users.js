export const up = async (queryInterface, Sequelize) => {
  try {
    await queryInterface.addColumn('users', 'last_login', {
      type: Sequelize.DATE,
      allowNull: true
    });
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

export const down = async (queryInterface, Sequelize) => {
  try {
    await queryInterface.removeColumn('users', 'last_login');
  } catch (error) {
    console.error('Migration rollback failed:', error);
    throw error;
  }
}; 