import React, { useState, useEffect, useCallback } from 'react';
import PickConfirmation from './Payment/PickConfirmation';
import SignupPayment from './Payment/SignupPayment';
import './LandingPage.css';
import './TeamSelection.css'; // Import team selection styles for embedded fixtures

function LandingPage({ onNavigate }) {
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [currentMatchweek, setCurrentMatchweek] = useState(null);
  const [poolStats, setPoolStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [usedTeams] = useState([]); // TODO: Fetch from API when user is logged in
  const [showPickConfirmation, setShowPickConfirmation] = useState(false);
  const [showSignupPayment, setShowSignupPayment] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Fetch current matchweek
  const fetchCurrentMatchweek = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/matchweeks/current`);
      const data = await response.json();
      setCurrentMatchweek(data);
      return data;
    } catch (error) {
      console.error('Error fetching current matchweek:', error);
      return null;
    }
  }, [API_URL]);

  // Fetch pool stats
  const fetchPoolStats = useCallback(async (poolId) => {
    try {
      const response = await fetch(`${API_URL}/api/pools/${poolId}/stats`);
      const data = await response.json();
      setPoolStats(data);
    } catch (error) {
      console.error('Error fetching pool stats:', error);
    }
  }, [API_URL]);

  // Fetch matches for matchweek
  const fetchMatches = useCallback(async (matchweek) => {
    try {
      const response = await fetch(`${API_URL}/api/matches?matchday=${matchweek}`);
      const data = await response.json();
      console.log('Fetched matches:', data.matches);
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  }, [API_URL]);

  // Fetch teams for scrolling display
  const fetchTeams = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/teams`);
      const data = await response.json();
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  }, [API_URL]);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      const matchweek = await fetchCurrentMatchweek();
      if (matchweek) {
        await Promise.all([
          fetchPoolStats(matchweek.pool_id),
          fetchMatches(matchweek.matchweek),
          fetchTeams()
        ]);
      }
      setLoading(false);
    };
    initializeData();
  }, [fetchCurrentMatchweek, fetchPoolStats, fetchMatches, fetchTeams]);

  // Debug: Log when showPickConfirmation changes
  useEffect(() => {
    console.log('showPickConfirmation changed to:', showPickConfirmation);
    console.log('selectedTeam:', selectedTeam);
    console.log('selectedMatch:', selectedMatch);
  }, [showPickConfirmation, selectedTeam, selectedMatch]);

  // Countdown timer
  useEffect(() => {
    if (!poolStats || !poolStats.deadline) return;

    const updateCountdown = () => {
      const now = new Date();
      const deadline = new Date(poolStats.deadline);
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeRemaining('Deadline passed');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [poolStats]);

  const isTeamUsed = (teamId) => {
    return usedTeams.includes(teamId);
  };

  const handleSelectTeam = (team, match) => {
    console.log('Team clicked:', team.name, 'Match:', match);
    if (isTeamUsed(team.id)) {
      alert('You\'ve already used this team in a previous week!');
      return;
    }
    console.log('Setting selectedTeam:', team);
    console.log('Setting selectedMatch:', match);
    setSelectedTeam(team);
    setSelectedMatch(match);
    console.log('Setting showPickConfirmation to true');
    setShowPickConfirmation(true);
    console.log('State updated - modal should appear');
  };

  const handleClosePickConfirmation = () => {
    setShowPickConfirmation(false);
    setSelectedTeam(null);
    setSelectedMatch(null);
  };

  const handleConfirmPick = () => {
    // User is not authenticated, show signup/payment
    setShowPickConfirmation(false);
    setShowSignupPayment(true);
  };

  const handleCompleteSignupPayment = (data) => {
    // After successful payment, close modal and show success
    setShowSignupPayment(false);
    setSelectedTeam(null);
    setSelectedMatch(null);
    // TODO: Show referral modal here
    alert('Pick confirmed! Welcome to The Great Escape!');
    // TODO: Navigate to dashboard or show referral modal
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const ukOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London'
    };
    const ukTime = date.toLocaleString('en-GB', ukOptions);
    const estOptions = {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/New_York'
    };
    const estTime = date.toLocaleString('en-US', estOptions);
    return { uk: ukTime, est: estTime };
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background"></div>
        <div className="container">
          <div className="hero-content">
            <div className="logo">
              <div className="logo-icon">⛓️‍💥</div>
              <div className="logo-text">THE GREAT ESCAPE</div>
            </div>
            <h1 className="hero-title">
              Pick your team.<br />
              <span className="hero-title-accent">Survive</span> the season.
            </h1>
            <p className="hero-subtitle">
              Premier League survival pool where the last one standing wins the pot.
            </p>
            {poolStats && currentMatchweek && (
              <div className="hero-stats">
                <div className="stat">
                  <div className="stat-value">Matchday {currentMatchweek.matchweek}</div>
                  <div className="stat-label">Current Week</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{poolStats.total_entries || 'N/A'}</div>
                  <div className="stat-label">Entries</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{poolStats.prize_pool ? `$${poolStats.prize_pool.toFixed(0)}` : 'N/A'}</div>
                  <div className="stat-label">Prize Pool</div>
                </div>
                {timeRemaining && (
                  <div className="stat">
                    <div className="stat-value countdown">{timeRemaining}</div>
                    <div className="stat-label">Time Left</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Team Selection Section - Embedded directly on homepage */}
      {loading ? (
        <section className="section">
          <div className="container">
            <div className="loading">Loading matches...</div>
          </div>
        </section>
      ) : matches.length > 0 ? (
        <section className="team-selection-section section">
          <div className="container">
            <h2 className="section-title">Matchday {currentMatchweek?.matchweek} Fixtures</h2>
            <div className="matches-grid">
              {matches.map((match) => {
                const times = formatDate(match.utcDate);
                console.log('Rendering match:', match.homeTeam?.name, 'vs', match.awayTeam?.name);
                return (
                  <div key={match.id} className="match-card">
                    <div className="match-date">
                      <div className="time-uk">🇬🇧 {times.uk}</div>
                      <div className="time-est">🇺🇸 {times.est} EST</div>
                    </div>

                    {/* Home Team */}
                    <div
                      className={`team-option ${isTeamUsed(match.homeTeam.id) ? 'used' : ''}`}
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
                    </div>

                    <div className="vs">vs</div>

                    {/* Away Team */}
                    <div
                      className={`team-option ${isTeamUsed(match.awayTeam.id) ? 'used' : ''}`}
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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        <section className="section">
          <div className="container">
            <div className="no-matches">No matches available for this matchweek.</div>
          </div>
        </section>
      )}

      {/* Team Crests Scrolling Section */}
      {teams.length > 0 && (
        <section className="teams-showcase">
          <div className="teams-scroll">
            <div className="teams-track">
              {[...teams, ...teams].map((team, index) => (
                <div key={`${team.id}-${index}`} className="team-badge">
                  <img src={team.crest} alt={team.name} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="how-it-works section">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Pick a Team Each Week</h4>
              <p>Choose one winning team per matchday. Can't reuse teams. Draw or loss = you're out.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Survive or Die</h4>
              <p>Win = Continue to next week. Draw or Loss = Eliminated. Simple as that.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>Win the Pot</h4>
              <p>Last survivor(s) standing split the entire pot. Winner takes all.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 The Great Escape. All rights reserved.</p>
          <p>Premier League survival pool. 18+ only. Play responsibly.</p>
        </div>
      </footer>

      {/* Modals */}
      {console.log('Modal render check:', {
        showPickConfirmation,
        hasSelectedTeam: !!selectedTeam,
        hasSelectedMatch: !!selectedMatch,
        willRenderModal: showPickConfirmation && selectedTeam && selectedMatch
      })}
      {showPickConfirmation && selectedTeam && selectedMatch && (
        <PickConfirmation
          selectedTeam={selectedTeam}
          match={selectedMatch}
          onConfirm={handleConfirmPick}
          onClose={handleClosePickConfirmation}
          isAuthenticated={false}
        />
      )}

      {showSignupPayment && selectedTeam && selectedMatch && poolStats && (
        <SignupPayment
          team={selectedTeam}
          match={selectedMatch}
          poolId={poolStats.id}
          matchId={selectedMatch.id}
          onComplete={handleCompleteSignupPayment}
          onClose={() => setShowSignupPayment(false)}
        />
      )}
    </div>
  );
}

export default LandingPage;
