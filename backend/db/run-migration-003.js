// Run migration 003 - Add team_crest column
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query } = require('./connection');

async function runMigration() {
  try {
    console.log('🔄 Running migration 003: Add team_crest to picks...');

    // Read migration file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', '003-add-team-crest-to-picks.sql'),
      'utf8'
    );

    // Execute migration
    await query(migrationSQL);

    console.log('✅ Migration 003 completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
