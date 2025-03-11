import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  user: process.env.DATABASE_USER,         // Database user
  host: process.env.DATABASE_HOST,         // Database host (e.g., localhost)
  database: process.env.DATABASE_NAME,     // Database name
  password: process.env.DATABASE_PASSWORD, // Database password
  port: parseInt(process.env.DATABASE_PORT, 10), // Database port (converted to a number)
});
