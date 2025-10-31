// Setup Production Database
// Run this script to initialize the production database with schema and migrations

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Use production DATABASE_URL
const DATABASE_URL = process.env.DATABASE_URL || process.argv[2];

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not provided');
  console.error('Usage: node setup-production.js <DATABASE_URL>');
  console.error('   OR: DATABASE_URL=xxx node setup-production.js');
  process.exit(1);
}

async function setupProduction() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('railway') ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔌 Connecting to production database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Step 1: Run main schema
    console.log('📋 Step 1: Creating database schema...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8');
    await client.query(schemaSQL);
    console.log('✅ Schema created successfully!\n');

    // Step 2: Run migration 001
    console.log('📋 Step 2: Running migration 001 (PayPal lock and credits)...');
    const migration001 = fs.readFileSync(path.join(__dirname, 'migrations/001-add-paypal-lock-and-credits.sql'), 'utf8');
    await client.query(migration001);
    console.log('✅ Migration 001 completed!\n');

    // Step 3: Run migration 002
    console.log('📋 Step 3: Running migration 002 (referral system)...');
    const migration002 = fs.readFileSync(path.join(__dirname, 'migrations/002-add-referral-system.sql'), 'utf8');
    await client.query(migration002);
    console.log('✅ Migration 002 completed!\n');

    // Step 4: Seed pools
    console.log('📋 Step 4: Seeding pools for current gameweeks...');

    // Create Matchday 10 pool (current)
    const mw10Deadline = new Date('2024-11-02T11:30:00Z');
    const mw10Kickoff = new Date('2024-11-02T12:30:00Z');

    await client.query(
      `INSERT INTO pools (gameweek, season, status, entry_deadline, pick_deadline, first_match_kickoff)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (gameweek) DO NOTHING`,
      [10, '2024-25', 'active', mw10Deadline, mw10Deadline, mw10Kickoff]
    );

    // Create Matchday 11 pool (upcoming)
    const mw11Deadline = new Date('2024-11-09T11:30:00Z');
    const mw11Kickoff = new Date('2024-11-09T12:30:00Z');

    await client.query(
      `INSERT INTO pools (gameweek, season, status, entry_deadline, pick_deadline, first_match_kickoff)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (gameweek) DO NOTHING`,
      [11, '2024-25', 'upcoming', mw11Deadline, mw11Deadline, mw11Kickoff]
    );

    // Create Matchday 12 pool (upcoming)
    const mw12Deadline = new Date('2024-11-16T11:30:00Z');
    const mw12Kickoff = new Date('2024-11-16T12:30:00Z');

    await client.query(
      `INSERT INTO pools (gameweek, season, status, entry_deadline, pick_deadline, first_match_kickoff)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (gameweek) DO NOTHING`,
      [12, '2024-25', 'upcoming', mw12Deadline, mw12Deadline, mw12Kickoff]
    );

    console.log('✅ Pools seeded successfully!\n');

    // Display pools
    const poolsResult = await client.query('SELECT * FROM pools ORDER BY gameweek');
    console.log('📊 Pools in production database:');
    poolsResult.rows.forEach(pool => {
      console.log(`  - Matchday ${pool.gameweek}: ${pool.status} (Deadline: ${pool.entry_deadline})`);
    });

    console.log('\n🎉 Production database setup complete!');
    console.log('\n⚠️  NEXT STEP: Fetch Premier League matches by running:');
    console.log('   node scripts/sync-matches.js\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupProduction();
