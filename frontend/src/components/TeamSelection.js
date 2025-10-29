import React, { useState, useEffect, useCallback } from 'react';
import './TeamSelection.css';

function TeamSelection({ onNavigate }) {
  const [matches, setMatches] = useState([]);
  const [currentMatchday] = useState(9);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [usedTeams, setUsedTeams] = useState([]);
  const [hasConfirmedPick, setHasConfirmedPick] = useState(false);

  const fetchMatchdayData = useCallback(async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/matches?matchday=${currentMatchday}`);
      const data = await response.json();
      setMatches(data.matches || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setLoading(false);
    }
  }, [currentMatchday]);

  useEffect(() => {
    fetchMatchdayData();
  }, [fetchMatchdayData]);

  const getDeadline = () => {
    if (matches.length === 0) return null;
    const firstMatch = matches.reduce((earliest, match) =>
      new Date(match.utcDate) < new Date(earliest.utcDate) ? match : earliest
    );
    const deadline = new Date(new Date(firstMatch.utcDate) - 60 * 60 * 1000); // 1 hour before
    return deadline;
  };

  const isTeamUsed = (teamId) => {
    return usedTeams.includes(teamId);
  };

  const handleSelectTeam = (team, match) => {
    if (hasConfirmedPick) {
      alert('You\'ve already made your pick for this matchday!');
      return;
    }
    if (isTeamUsed(team.id)) {
      alert('You\'ve already used this team in a previous week!');
      return;
    }
    setSelectedTeam({ ...team, match });
  };

  const handleConfirmPick = () => {
    if (!selectedTeam) return;
    setUsedTeams([...usedTeams, selectedTeam.id]);
    setHasConfirmedPick(true);
    setSelectedTeam(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-GB', options);
  };

  const deadline = getDeadline();

  if (loading) {
    return (
      <div className="team-selection">
        <div className="container">
          <div className="loading">Loading matches...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="team-selection">
      {/* Header */}
      <div className="selection-header">
        <div className="container">
          <div className="header-content">
            <button onClick={() => onNavigate('landing')} className="back-button">
              ← Back
            </button>
            <div className="header-main">
              <h1>Pick Your Team</h1>
              <div className="matchday-info">
                <span className="matchday-badge">Matchday {currentMatchday}</span>
                {deadline && (
                  <span className="deadline">
                    Deadline: {deadline.toLocaleString('en-GB', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Match Grid */}
      <div className="container section">
        <div className="matches-grid">
          {matches.map((match) => (
            <div key={match.id} className="match-card">
              <div className="match-date">{formatDate(match.utcDate)}</div>

              {/* Home Team */}
              <div
                className={`team-option ${isTeamUsed(match.homeTeam.id) ? 'used' : ''} ${selectedTeam?.id === match.homeTeam.id ? 'selected' : ''}`}
                onClick={() => handleSelectTeam(match.homeTeam, match)}
              >
                <img
                  src={match.homeTeam.crest}
                  alt={match.homeTeam.name}
                  className="team-crest"
                />
                <div className="team-info">
                  <div className="team-name">{match.homeTeam.name}</div>
                  <div className="team-label">HOME</div>
                </div>
                {isTeamUsed(match.homeTeam.id) && (
                  <span className="used-badge">Used</span>
                )}
                {selectedTeam?.id === match.homeTeam.id && (
                  <span className="selected-check">✓</span>
                )}
              </div>

              <div className="vs">vs</div>

              {/* Away Team */}
              <div
                className={`team-option ${isTeamUsed(match.awayTeam.id) ? 'used' : ''} ${selectedTeam?.id === match.awayTeam.id ? 'selected' : ''}`}
                onClick={() => handleSelectTeam(match.awayTeam, match)}
              >
                <img
                  src={match.awayTeam.crest}
                  alt={match.awayTeam.name}
                  className="team-crest"
                />
                <div className="team-info">
                  <div className="team-name">{match.awayTeam.name}</div>
                  <div className="team-label">AWAY</div>
                </div>
                {isTeamUsed(match.awayTeam.id) && (
                  <span className="used-badge">Used</span>
                )}
                {selectedTeam?.id === match.awayTeam.id && (
                  <span className="selected-check">✓</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Confirmation Overlay */}
        {selectedTeam && !hasConfirmedPick && (
          <div className="confirmation-overlay" onClick={() => setSelectedTeam(null)}>
            <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Confirm Your Pick</h3>
                <button className="close-btn" onClick={() => setSelectedTeam(null)}>×</button>
              </div>
              <div className="modal-content">
                <img
                  src={selectedTeam.crest}
                  alt={selectedTeam.name}
                  className="modal-crest"
                />
                <h2>{selectedTeam.name}</h2>
                <p className="modal-opponent">
                  vs {selectedTeam.match.homeTeam.id === selectedTeam.id ? selectedTeam.match.awayTeam.name : selectedTeam.match.homeTeam.name}
                </p>
                <p className="modal-match-time">{formatDate(selectedTeam.match.utcDate)}</p>
                <p className="modal-warning">⚠️ You can't change this pick once confirmed!</p>
              </div>
              <div className="modal-actions">
                <button onClick={() => setSelectedTeam(null)} className="btn btn-secondary btn-large">
                  Cancel
                </button>
                <button onClick={handleConfirmPick} className="btn btn-primary btn-large">
                  Confirm Pick
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {hasConfirmedPick && (
          <div className="success-message">
            <div className="success-content">
              <div className="success-icon">✓</div>
              <h3>Pick Confirmed!</h3>
              <p>Your pick for Matchday {currentMatchday} has been locked in.</p>
              <p className="success-note">Good luck! Check back after the matches to see if you survived.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamSelection;
