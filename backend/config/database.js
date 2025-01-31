import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  NODE_ENV
} = process.env;

// Only log in development
const shouldLog = NODE_ENV === 'development';

console.log('Initializing database connection with:', {
  database: DB_NAME,
  username: DB_USER,
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres'
});

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: shouldLog ? (msg) => console.log('Sequelize:', msg) : false,
  define: {
    underscored: true,
    timestamps: true
  },
  pool: {
    max: 20,               // Maximum number of connection in pool
    min: 5,               // Minimum number of connection in pool
    acquire: 60000,       // Maximum time, in milliseconds, that pool will try to get connection before throwing error
    idle: 30000,          // Maximum time, in milliseconds, that a connection can be idle before being released
    evict: 30000         // Run cleanup idle connections every 30 seconds
  },
  dialectOptions: {
    statement_timeout: 60000,     // Timeout for queries (1 minute)
    idle_in_transaction_session_timeout: 60000  // Timeout for transactions
  },
  retry: {
    max: 3,              // Maximum retry attempts
    match: [             // Retry on these errors
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ]
  }
});

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    if (shouldLog) {
      // Get list of all tables
      const [results] = await sequelize.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public';");
      console.log('Current tables:', results);
    }

    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', {
      message: error.message,
      code: error.original?.code,
      errno: error.original?.errno
    });
    return false;
  }
};
