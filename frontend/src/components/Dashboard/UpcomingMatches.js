// UpcomingMatches - Shows next gameweek with upcoming matches for active entries
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function UpcomingMatches({ entries, token }) {
  const [nextGameweek, setNextGameweek] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchNextGameweek();
  }, [entries]);

  const fetchNextGameweek = async () => {
    // Only show if user has active entries
    const activeEntries = entries?.filter(e => e.status === 'active') || [];
    if (activeEntries.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/gameweeks/next`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success && data.data) {
        setNextGameweek(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching next gameweek:', error);
      setLoading(false);
    }
  };

  // Don't show anything if loading or no active entries
  if (loading || !nextGameweek) {
    return null;
  }

  const activeEntries = entries?.filter(e => e.status === 'active') || [];
  if (activeEntries.length === 0) {
    return null;
  }

  // Show preview of first 3 matches
  const previewMatches = nextGameweek.matches?.slice(0, 3) || [];
  const totalMatches = nextGameweek.matches?.length || 0;

  return (
    <div className="upcoming-matches-alert">
      <div className="alert-header">
        <h3>⚠️ Gameweek {nextGameweek.gameweek} Picks Due Soon!</h3>
        <p className="deadline">
          Deadline: {new Date(nextGameweek.deadline).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })}
        </p>
      </div>

      <div className="alert-content">
        <p className="active-entries-count">
          You have {activeEntries.length} active {activeEntries.length === 1 ? 'entry' : 'entries'} that need picks!
        </p>

        {previewMatches.length > 0 && (
          <div className="matches-preview">
            {previewMatches.map((match, idx) => (
              <div key={idx} className="match-preview">
                <div className="team">
                  <img src={match.homeTeam.crest} alt={match.homeTeam.name} />
                  <span>{match.homeTeam.name}</span>
                </div>
                <span className="vs">vs</span>
                <div className="team">
                  <img src={match.awayTeam.crest} alt={match.awayTeam.name} />
                  <span>{match.awayTeam.name}</span>
                </div>
              </div>
            ))}
            {totalMatches > 3 && (
              <p className="more-matches">+ {totalMatches - 3} more matches</p>
            )}
          </div>
        )}

        <button
          className="btn btn-primary make-picks-btn"
          onClick={() => navigate('/')}
        >
          Make Your Picks Now
        </button>
      </div>
    </div>
  );
}

export default UpcomingMatches;
