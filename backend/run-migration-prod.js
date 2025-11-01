// Temporary script to run migration on production database
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  // Use the public Railway database URL with SSL
  const connectionString = 'postgresql://postgres:uDcSGKVtHInYJatlTQXfOhpgfELiqauS@monorail.proxy.rlwy.net:10618/railway';

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to production database');

    const migrationPath = path.join(__dirname, 'migrations', '003_add_magic_links.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('🚀 Running migration: 003_add_magic_links.sql');
    await client.query(sql);
    console.log('✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

runMigration();
