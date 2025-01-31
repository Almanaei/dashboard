require('dotenv').config();

module.exports = {
  development: {
    username: 'postgres',
    password: 'admin',
    database: 'prody_dashboard',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false
  },
  test: {
    username: 'postgres',
    password: 'admin',
    database: 'prody_dashboard_test',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false
  }
};
