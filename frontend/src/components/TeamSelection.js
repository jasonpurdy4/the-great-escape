import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PickConfirmation from './Payment/PickConfirmation';
import SignupPayment from './Payment/SignupPayment';
import './TeamSelection.css';

function TeamSelection({ onNavigate }) {
  const { isAuthenticated } = useAuth();
  const [matches, setMatches] = useState([]);
  const [currentMatchday, setCurrentMatchday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [usedTeams, setUsedTeams] = useState([]);
  const [hasConfirmedPick, setHasConfirmedPick] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showPickConfirmation, setShowPickConfirmation] = useState(false);
  const [showSignupPayment, setShowSignupPayment] = useState(false);

  const fetchMatchdayData = useCallback(async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

      // Fetch next available gameweek
      const gameweekResponse = await fetch(`${API_URL}/api/gameweeks/next`);
      const gameweekData = await gameweekResponse.json();

      if (gameweekData.success && gameweekData.data) {
        setCurrentMatchday(gameweekData.data.gameweek);
        setMatches(gameweekData.data.matches || []);
      } else {
        // Fallback: fetch matches for current matchday from Football API
        const response = await fetch(`${API_URL}/api/current-matchday`);
        const data = await response.json();
        const matchday = data.currentMatchday || 10;
        setCurrentMatchday(matchday);

        const matchesResponse = await fetch(`${API_URL}/api/matches?matchday=${matchday}`);
        const matchesData = await matchesResponse.json();
        setMatches(matchesData.matches || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatchdayData();
  }, [fetchMatchdayData]);

  // Countdown timer effect
  useEffect(() => {
    if (matches.length === 0) return;

    const getDeadline = () => {
      const firstMatch = matches.reduce((earliest, match) =>
        new Date(match.utcDate) < new Date(earliest.utcDate) ? match : earliest
      );
      return new Date(new Date(firstMatch.utcDate) - 60 * 60 * 1000); // 1 hour before
    };

    const deadline = getDeadline();

    const updateCountdown = () => {
      const now = new Date();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeRemaining('Deadline passed');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [matches]);

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
    setSelectedTeam(team);
    setSelectedMatch(match);
    setShowPickConfirmation(true);
  };

  const handleClosePickConfirmation = () => {
    setShowPickConfirmation(false);
    setSelectedTeam(null);
    setSelectedMatch(null);
  };

  const handleConfirmPick = (team, match) => {
    // If user is not authenticated, show signup/payment modal
    if (!isAuthenticated) {
      setShowPickConfirmation(false);
      setShowSignupPayment(true);
    } else {
      // If authenticated, proceed with payment flow
      // TODO: Show balance/payment selection modal (for later)
      console.log('User is authenticated, proceed with payment');
      // For now, just confirm the pick
      setUsedTeams([...usedTeams, team.id]);
      setHasConfirmedPick(true);
      setShowPickConfirmation(false);
      setSelectedTeam(null);
      setSelectedMatch(null);
    }
  };

  const handleCloseSignupPayment = () => {
    setShowSignupPayment(false);
    setSelectedTeam(null);
    setSelectedMatch(null);
  };

  const handleSignupPaymentComplete = (data) => {
    console.log('Payment complete!', data);
    // Mark team as used and show success
    setUsedTeams([...usedTeams, data.team.id]);
    setHasConfirmedPick(true);
    setShowSignupPayment(false);
    setSelectedTeam(null);
    setSelectedMatch(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    // UK Time
    const ukOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London'
    };
    const ukTime = date.toLocaleString('en-GB', ukOptions);

    // EST Time
    const estOptions = {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/New_York'
    };
    const estTime = date.toLocaleString('en-US', estOptions);

    return {
      uk: ukTime,
      est: estTime
    };
  };

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
                {timeRemaining && (
                  <span className="deadline">
                    Deadline: <span className="countdown">{timeRemaining}</span>
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
          {matches.map((match) => {
            const times = formatDate(match.utcDate);
            return (
            <div key={match.id} className="match-card">
              <div className="match-date">
                <div className="time-uk">🇬🇧 {times.uk}</div>
                <div className="time-est">🇺🇸 {times.est} EST</div>
              </div>

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
          );
          })}
        </div>

        {/* Pick Confirmation Modal */}
        {showPickConfirmation && selectedTeam && selectedMatch && (
          <PickConfirmation
            selectedTeam={selectedTeam}
            match={selectedMatch}
            matchday={currentMatchday}
            onClose={handleClosePickConfirmation}
            onConfirm={handleConfirmPick}
          />
        )}

        {/* Signup + Payment Modal */}
        {showSignupPayment && selectedTeam && selectedMatch && (
          <SignupPayment
            selectedTeam={selectedTeam}
            match={selectedMatch}
            matchday={currentMatchday}
            onClose={handleCloseSignupPayment}
            onComplete={handleSignupPaymentComplete}
          />
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
