require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Football Data API configuration
const FOOTBALL_API_TOKEN = process.env.FOOTBALL_API_TOKEN || '5a09c0f3cece4cab8d1dda6c1b07582b';
const FOOTBALL_API_BASE = 'https://api.football-data.org/v4';

// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'The Great Escape API is running!' });
});

// Get current Premier League matches
app.get('/api/matches', async (req, res) => {
  try {
    const { matchday } = req.query;
    const url = matchday
      ? `${FOOTBALL_API_BASE}/competitions/PL/matches?matchday=${matchday}`
      : `${FOOTBALL_API_BASE}/competitions/PL/matches`;

    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': FOOTBALL_API_TOKEN
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Get Premier League teams
app.get('/api/teams', async (req, res) => {
  try {
    const response = await fetch(`${FOOTBALL_API_BASE}/competitions/PL/teams`, {
      headers: {
        'X-Auth-Token': FOOTBALL_API_TOKEN
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Get current matchday info
app.get('/api/current-matchday', async (req, res) => {
  try {
    const response = await fetch(`${FOOTBALL_API_BASE}/competitions/PL/matches`, {
      headers: {
        'X-Auth-Token': FOOTBALL_API_TOKEN
      }
    });

    const data = await response.json();
    const currentMatchday = data.matches[0]?.season?.currentMatchday || 1;

    res.json({
      currentMatchday,
      season: data.matches[0]?.season
    });
  } catch (error) {
    console.error('Error fetching current matchday:', error);
    res.status(500).json({ error: 'Failed to fetch current matchday' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 The Great Escape API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
