// PostgreSQL Database Connection Pool
// Uses pg library for connection pooling

const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection not available
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

// Query helper - automatically handles connection pooling
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('🔍 Query executed:', { text, duration: `${duration}ms`, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
};

// Get a client from the pool for transactions
const getClient = async () => {
  try {
    const client = await pool.connect();
    console.log('📦 Client acquired from pool');

    // Add release method for easier cleanup
    const query = client.query;
    const release = client.release;

    // Override release to log
    client.release = () => {
      client.query = query;
      client.release = release;
      console.log('📦 Client released back to pool');
      return release.apply(client);
    };

    return client;
  } catch (error) {
    console.error('❌ Error acquiring client:', error);
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Graceful shutdown
const close = async () => {
  console.log('🛑 Closing database connection pool...');
  await pool.end();
  console.log('✅ Database connections closed');
};

module.exports = {
  query,
  getClient,
  transaction,
  close,
  pool
};
