export const up = async (queryInterface, Sequelize) => {
  const tableInfo = await queryInterface.describeTable('Users');
  if (!tableInfo.avatar) {
    await queryInterface.addColumn('Users', 'avatar', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};

export const down = async (queryInterface, Sequelize) => {
  const tableInfo = await queryInterface.describeTable('Users');
  if (tableInfo.avatar) {
    await queryInterface.removeColumn('Users', 'avatar');
  }
}; 