// Run a specific migration file
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./connection');

async function runMigration(filename) {
  try {
    console.log(`🚀 Running migration: ${filename}...`);
    const migrationPath = path.join(__dirname, 'migrations', filename);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await pool.query(sql);

    console.log(`✅ Migration ${filename} completed successfully!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

const filename = process.argv[2];
if (!filename) {
  console.error('Usage: node run-migration.js <filename>');
  process.exit(1);
}

runMigration(filename);
