export async function up(queryInterface, Sequelize) {
  try {
    // First, drop existing columns if they exist
    const columns = ['filename', 'original_name', 'mime_type'];
    for (const column of columns) {
      try {
        await queryInterface.removeColumn('report_attachments', column);
      } catch (error) {
        console.log(`Column ${column} might not exist, continuing...`);
      }
    }

    // Add columns with new schema
    await queryInterface.addColumn('report_attachments', 'filename', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '' // Temporary default value
    });

    await queryInterface.addColumn('report_attachments', 'original_name', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '' // Temporary default value
    });

    await queryInterface.addColumn('report_attachments', 'mime_type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'application/octet-stream' // Default MIME type
    });

    // Update existing records
    await queryInterface.sequelize.query(`
      UPDATE report_attachments 
      SET filename = name,
          original_name = name,
          mime_type = 'application/octet-stream'
      WHERE filename = '' OR original_name = '';
    `);

    // Make size and type optional
    await queryInterface.changeColumn('report_attachments', 'size', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.changeColumn('report_attachments', 'type', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Remove temporary default values
    await queryInterface.changeColumn('report_attachments', 'filename', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('report_attachments', 'original_name', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('report_attachments', 'mime_type', {
      type: Sequelize.STRING,
      allowNull: false
    });

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

export async function down(queryInterface, Sequelize) {
  try {
    // Revert the changes
    await queryInterface.removeColumn('report_attachments', 'filename');
    await queryInterface.removeColumn('report_attachments', 'original_name');
    await queryInterface.removeColumn('report_attachments', 'mime_type');
    
    // Revert size and type to be required
    await queryInterface.changeColumn('report_attachments', 'size', {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    await queryInterface.changeColumn('report_attachments', 'type', {
      type: Sequelize.STRING,
      allowNull: false
    });
  } catch (error) {
    console.error('Migration reversion failed:', error);
    throw error;
  }
} 