import { seedAdminUser } from '../seeders/adminUser.js';

async function seed() {
  try {
    console.log('Starting database seeding...');
    await seedAdminUser();
    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
