import { testConnection } from './config/database.js';

console.log('Testing database connection...');

testConnection()
  .then(success => {
    if (success) {
      console.log('✓ Database connection test passed');
      process.exit(0);
    } else {
      console.error('✗ Database connection test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('✗ Database connection test failed with error:', error);
    process.exit(1);
  });
