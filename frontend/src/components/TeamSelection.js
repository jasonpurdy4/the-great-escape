import React, { useState, useEffect } from 'react';
import './TeamSelection.css';

function TeamSelection() {
  const [matches, setMatches] = useState([]);
  const [currentMatchday, setCurrentMatchday] = useState(9);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [usedTeams, setUsedTeams] = useState([]);

  useEffect(() => {
    fetchMatchdayData();
  }, [currentMatchday]);

  const fetchMatchdayData = async () => {
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
  };

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
    if (isTeamUsed(team.id)) {
      alert('You\'ve already used this team!');
      return;
    }
    setSelectedTeam({ ...team, match });
  };

  const handleConfirmPick = () => {
    if (!selectedTeam) return;
    // For MVP, just simulate confirmation
    alert(`Pick confirmed: ${selectedTeam.name} vs ${selectedTeam.match.homeTeam.id === selectedTeam.id ? selectedTeam.match.awayTeam.name : selectedTeam.match.homeTeam.name}`);
    setUsedTeams([...usedTeams, selectedTeam.id]);
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

        {/* Confirm Button */}
        {selectedTeam && (
          <div className="confirm-section">
            <div className="confirm-box">
              <p>
                You're picking <strong>{selectedTeam.name}</strong> to win
              </p>
              <button onClick={handleConfirmPick} className="btn btn-primary btn-large">
                Confirm Pick
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamSelection;
