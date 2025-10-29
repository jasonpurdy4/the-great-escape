// FutureMatchweeks - Shows upcoming matchweeks available to join
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './FutureMatchweeks.css';

function FutureMatchweeks({ onJoin }) {
  const { totalFunds } = useAuth();
  const [matchweeks, setMatchweeks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableMatchweeks();
  }, []);

  const fetchAvailableMatchweeks = async () => {
    try {
      setLoading(true);
      // TODO: Fetch available matchweeks from API
      // For now, generate mock data for matchweeks 11-15
      const mockMatchweeks = Array.from({ length: 5 }, (_, i) => ({
        matchday: 11 + i,
        deadline: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000), // 1-5 weeks from now
        poolSize: Math.floor(Math.random() * 200) + 50,
        potentialPrize: (Math.floor(Math.random() * 200) + 50) * 10 * 0.9 // 90% of entry fees
      }));
      setMatchweeks(mockMatchweeks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching matchweeks:', error);
      setLoading(false);
    }
  };

  const handleJoinMatchweek = (matchday) => {
    // TODO: Show payment modal or redirect to team selection
    console.log('Join matchday:', matchday);
    if (onJoin) {
      onJoin(matchday);
    }
  };

  const formatDeadline = (date) => {
    const now = new Date();
    const diff = date - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 7) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return 'Soon';
    }
  };

  if (loading) {
    return <div className="loading">Loading matchweeks...</div>;
  }

  if (matchweeks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📅</div>
        <h3>No Upcoming Matchweeks</h3>
        <p>Check back soon for the next available matchweek!</p>
      </div>
    );
  }

  return (
    <div className="future-matchweeks">
      {matchweeks.map((mw) => (
        <div key={mw.matchday} className="matchweek-card">
          <div className="matchweek-header">
            <div className="matchweek-number">Matchday {mw.matchday}</div>
            <div className="matchweek-deadline">
              Deadline in {formatDeadline(mw.deadline)}
            </div>
          </div>

          <div className="matchweek-stats">
            <div className="stat-item">
              <div className="stat-label">Current Pool</div>
              <div className="stat-value">{mw.poolSize} entries</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Prize Pool</div>
              <div className="stat-value">${mw.potentialPrize.toFixed(0)}</div>
            </div>
          </div>

          <div className="matchweek-actions">
            <div className="entry-fee">$10 entry</div>
            <button
              onClick={() => handleJoinMatchweek(mw.matchday)}
              className="btn btn-primary"
              disabled={totalFunds < 1000}
            >
              {totalFunds >= 1000 ? 'Join Pool' : 'Add Funds to Join'}
            </button>
          </div>

          {totalFunds < 1000 && (
            <div className="insufficient-funds-note">
              You need ${((1000 - totalFunds) / 100).toFixed(2)} more to join
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default FutureMatchweeks;
