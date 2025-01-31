export async function up(queryInterface, Sequelize) {
  try {
    // Ensure reports table has correct column names
    await queryInterface.renameColumn('reports', 'userId', 'user_id').catch(() => {
      console.log('Column userId might not exist or already renamed');
    });

    // Ensure report_attachments table has correct column names
    await queryInterface.renameColumn('report_attachments', 'reportId', 'report_id').catch(() => {
      console.log('Column reportId might not exist or already renamed');
    });

    await queryInterface.renameColumn('report_attachments', 'originalName', 'original_name').catch(() => {
      console.log('Column originalName might not exist or already renamed');
    });

    await queryInterface.renameColumn('report_attachments', 'mimeType', 'mime_type').catch(() => {
      console.log('Column mimeType might not exist or already renamed');
    });

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

export async function down(queryInterface, Sequelize) {
  try {
    // Revert column names in reports table
    await queryInterface.renameColumn('reports', 'user_id', 'userId').catch(() => {
      console.log('Column user_id might not exist or already renamed');
    });

    // Revert column names in report_attachments table
    await queryInterface.renameColumn('report_attachments', 'report_id', 'reportId').catch(() => {
      console.log('Column report_id might not exist or already renamed');
    });

    await queryInterface.renameColumn('report_attachments', 'original_name', 'originalName').catch(() => {
      console.log('Column original_name might not exist or already renamed');
    });

    await queryInterface.renameColumn('report_attachments', 'mime_type', 'mimeType').catch(() => {
      console.log('Column mime_type might not exist or already renamed');
    });

  } catch (error) {
    console.error('Migration reversion failed:', error);
    throw error;
  }
} 