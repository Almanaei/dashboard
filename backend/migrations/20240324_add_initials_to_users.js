import { DataTypes } from 'sequelize';

export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('users', 'initials', {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  });

  // Update existing users to have initials
  const users = await queryInterface.sequelize.query(
    'SELECT id, name, username FROM users',
    { type: Sequelize.QueryTypes.SELECT }
  );

  for (const user of users) {
    let initials = null;
    if (user.name) {
      initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    } else if (user.username) {
      initials = user.username.substring(0, 2).toUpperCase();
    }

    if (initials) {
      await queryInterface.sequelize.query(
        'UPDATE users SET initials = ? WHERE id = ?',
        {
          replacements: [initials, user.id],
          type: Sequelize.QueryTypes.UPDATE
        }
      );
    }
  }
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('users', 'initials');
} 