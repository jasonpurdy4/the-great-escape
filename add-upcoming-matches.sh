#!/bin/bash
cd /Users/jasonpurdy/the-great-escape

# Create UpcomingMatches component
cat > frontend/src/components/Dashboard/UpcomingMatches.js << 'UPCOMINGJS'
// Upcoming Matches - Show next gameweek matches user needs to pick
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function UpcomingMatches({ entries, token }) {
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchUpcomingMatches();
  }, [entries]);

  const fetchUpcomingMatches = async () => {
    try {
      // Get active entries that need picks
      const activeEntries = entries.filter(e => e.status === 'active');

      if (activeEntries.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch current matchweek
      const response = await fetch(\`\${API_URL}/api/matchweeks/current\`);
      const data = await response.json();

      if (data && data.matchweek) {
        // Fetch matches for next gameweek
        const matchesResponse = await fetch(\`\${API_URL}/api/matches?matchday=\${data.matchweek}\`);
        const matchesData = await matchesResponse.json();

        if (matchesData.matches) {
          setUpcomingMatches(matchesData.matches);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
      setLoading(false);
    }
  };

  const activeEntries = entries.filter(e => e.status === 'active');

  if (loading) {
    return <div className="upcoming-matches loading">Loading upcoming matches...</div>;
  }

  if (activeEntries.length === 0) {
    return null; // No active entries, don't show this section
  }

  if (upcomingMatches.length === 0) {
    return (
      <div className="upcoming-matches">
        <div className="no-upcoming">
          <p>No upcoming matches at the moment. Check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="upcoming-matches">
      <div className="upcoming-header">
        <div>
          <h3>⚽ Next Gameweek</h3>
          <p>You have {activeEntries.length} active {activeEntries.length === 1 ? 'entry' : 'entries'} that need picks!</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/')}
        >
          Make Your Picks
        </button>
      </div>

      <div className="matches-preview">
        {upcomingMatches.slice(0, 3).map(match => (
          <div key={match.id} className="match-preview-card">
            <div className="team-preview">
              <img src={match.homeTeam.crest} alt={match.homeTeam.name} />
              <span>{match.homeTeam.name}</span>
            </div>
            <span className="vs-text">vs</span>
            <div className="team-preview">
              <img src={match.awayTeam.crest} alt={match.awayTeam.name} />
              <span>{match.awayTeam.name}</span>
            </div>
          </div>
        ))}
        {upcomingMatches.length > 3 && (
          <div className="more-matches">
            +{upcomingMatches.length - 3} more matches
          </div>
        )}
      </div>
    </div>
  );
}

export default UpcomingMatches;
UPCOMINGJS

# Add styles to Dashboard.css
cat >> frontend/src/components/Dashboard/Dashboard.css << 'DASHCSS'

/* Upcoming Matches */
.upcoming-matches {
  background: linear-gradient(135deg, #C8102E 0%, #a00d25 100%);
  color: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
}

.upcoming-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.upcoming-header h3 {
  margin: 0 0 4px 0;
  font-size: 24px;
}

.upcoming-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 16px;
}

.matches-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.match-preview-card {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.team-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.team-preview img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.team-preview span {
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.vs-text {
  font-size: 14px;
  font-weight: bold;
  opacity: 0.7;
  padding: 0 12px;
}

.more-matches {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border: 2px dashed rgba(255, 255, 255, 0.3);
}

.no-upcoming {
  text-align: center;
  padding: 40px 20px;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .upcoming-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .matches-preview {
    grid-template-columns: 1fr;
  }
}
DASHCSS

echo "UpcomingMatches component created!"
echo "Now run: git add -A && git commit -m 'Add upcoming matches component to dashboard' && git push"
