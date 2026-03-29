// db.js
require('dotenv').config(); // Load .env variables first
const { Pool } = require('pg');

// Create a new connection pool using DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Log when a client successfully connects
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

// Handle unexpected errors on idle clients
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Optional helper to test the DB connection immediately
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    console.log('DB is live! Server time:', res.rows[0]);
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
};

// Run the test when the module is loaded
testConnection();

module.exports = pool;