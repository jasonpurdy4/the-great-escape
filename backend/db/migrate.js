// Run database migrations (schema.sql)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./connection');

async function runMigrations() {
  try {
    console.log('📦 Reading schema.sql...');
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🚀 Running migrations...');
    await pool.query(schema);

    console.log('✅ All tables created successfully!');
    console.log('\n📊 Verifying tables...');

    // List all tables
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n✅ Tables created:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigrations();
