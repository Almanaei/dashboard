import { sequelize } from '../config/database.js';

async function fixTables() {
  try {
    // Drop all tables and types
    console.log('Dropping all tables and types...');
    await sequelize.query(`
      DROP TABLE IF EXISTS "report_attachments" CASCADE;
      DROP TABLE IF EXISTS "reports" CASCADE;
      DROP TABLE IF EXISTS "Projects" CASCADE;
      DROP TABLE IF EXISTS "projects" CASCADE;
      DROP TABLE IF EXISTS "Users" CASCADE;
      DROP TABLE IF EXISTS "users" CASCADE;
      DROP TABLE IF EXISTS "SequelizeMeta" CASCADE;
      DROP TYPE IF EXISTS "enum_users_role" CASCADE;
      DROP TYPE IF EXISTS "enum_users_status" CASCADE;
    `);

    console.log('All tables and types dropped successfully');

    // Create UUID extension if it doesn't exist
    console.log('Creating UUID extension...');
    await sequelize.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Create ENUM types
    console.log('Creating ENUM types...');
    await sequelize.query(`CREATE TYPE "enum_users_role" AS ENUM ('user', 'admin');`);
    await sequelize.query(`CREATE TYPE "enum_users_status" AS ENUM ('Active', 'Inactive');`);
    
    // Create users table first
    console.log('Creating users table...');
    await sequelize.query(`
      CREATE TABLE "users" (
        "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "username" VARCHAR(255) NOT NULL UNIQUE,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password" VARCHAR(255) NOT NULL,
        "role" "enum_users_role" DEFAULT 'user'::enum_users_role,
        "status" "enum_users_status" DEFAULT 'Active'::enum_users_status,
        "last_active" TIMESTAMP WITH TIME ZONE,
        "avatar" VARCHAR(255),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create projects table
    console.log('Creating projects table...');
    await sequelize.query(`
      CREATE TABLE "projects" (
        "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "status" VARCHAR(20) DEFAULT 'planning',
        "start_date" TIMESTAMP WITH TIME ZONE,
        "end_date" TIMESTAMP WITH TIME ZONE,
        "priority" VARCHAR(10) DEFAULT 'medium',
        "budget" DECIMAL(10,2),
        "progress" INTEGER DEFAULT 0,
        "created_by" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create reports table
    console.log('Creating reports table...');
    await sequelize.query(`
      CREATE TABLE "reports" (
        "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        "title" VARCHAR(255) NOT NULL,
        "content" TEXT NOT NULL,
        "address" VARCHAR(255),
        "date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "time" TIME NOT NULL,
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create report_attachments table
    console.log('Creating report_attachments table...');
    await sequelize.query(`
      CREATE TABLE "report_attachments" (
        "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        "report_id" UUID NOT NULL REFERENCES "reports"("id") ON DELETE CASCADE,
        "name" VARCHAR(255) NOT NULL,
        "filename" VARCHAR(255) NOT NULL,
        "original_name" VARCHAR(255) NOT NULL,
        "mime_type" VARCHAR(255) NOT NULL,
        "type" VARCHAR(255) NOT NULL DEFAULT 'document',
        "size" INTEGER NOT NULL,
        "url" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('All tables created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing tables:', error);
    process.exit(1);
  }
}

fixTables(); 