import { sequelize } from '../config/database.js';
import chalk from 'chalk';

async function checkDatabase() {
  try {
    // Test connection
    console.log(chalk.blue('Testing database connection...'));
    await sequelize.authenticate();
    console.log(chalk.green('✓ Database connection successful\n'));

    // Get all tables
    console.log(chalk.blue('Fetching tables...'));
    const tables = await sequelize.query(`
      SELECT tablename, pg_size_pretty(pg_total_relation_size(quote_ident(tablename))) as size
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(quote_ident(tablename)) DESC;
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log(chalk.green('Tables in database:'));
    console.table(tables.map(t => ({
      Table: t.tablename,
      Size: t.size
    })));

    // Get detailed schema for all tables
    console.log(chalk.blue('\nFetching schema details...'));
    const schema = await sequelize.query(`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `, { type: sequelize.QueryTypes.SELECT });

    console.log(chalk.green('Detailed Schema:'));
    let currentTable = '';
    schema.forEach(column => {
      if (column.table_name !== currentTable) {
        currentTable = column.table_name;
        console.log(chalk.yellow(`\n${currentTable}:`));
      }
      const details = [
        column.data_type,
        column.is_nullable === 'YES' ? 'nullable' : 'not null',
        column.column_default ? `default: ${column.column_default}` : '',
        column.character_maximum_length ? `max length: ${column.character_maximum_length}` : '',
        column.numeric_precision ? `precision: ${column.numeric_precision}` : '',
        column.numeric_scale ? `scale: ${column.numeric_scale}` : ''
      ].filter(Boolean).join(', ');
      
      console.log(`  ${chalk.cyan(column.column_name)} (${details})`);
    });

    // Check for foreign key constraints
    console.log(chalk.blue('\nFetching foreign key relationships...'));
    const foreignKeys = await sequelize.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.update_rule,
        rc.delete_rule
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
      JOIN information_schema.referential_constraints rc
        ON rc.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name;
    `, { type: sequelize.QueryTypes.SELECT });

    console.log(chalk.green('Foreign Key Relationships:'));
    foreignKeys.forEach(fk => {
      console.log(chalk.yellow(`${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`));
      console.log(chalk.gray(`  ON UPDATE ${fk.update_rule}, ON DELETE ${fk.delete_rule}`));
    });

    // Check for indexes
    console.log(chalk.blue('\nFetching indexes...'));
    const indexes = await sequelize.query(`
      SELECT
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `, { type: sequelize.QueryTypes.SELECT });

    console.log(chalk.green('Indexes:'));
    let currentIndexTable = '';
    indexes.forEach(idx => {
      if (idx.tablename !== currentIndexTable) {
        currentIndexTable = idx.tablename;
        console.log(chalk.yellow(`\n${idx.tablename}:`));
      }
      console.log(`  ${chalk.cyan(idx.indexname)}`);
      console.log(chalk.gray(`    ${idx.indexdef}`));
    });

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('Error checking database:'));
    console.error(chalk.red(error.message));
    if (error.original) {
      console.error(chalk.red('Original error:'), {
        code: error.original.code,
        detail: error.original.detail,
        hint: error.original.hint
      });
    }
    await sequelize.close();
    process.exit(1);
  }
}

checkDatabase(); 