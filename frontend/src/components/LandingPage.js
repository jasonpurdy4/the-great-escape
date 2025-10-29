import React, { useState, useEffect } from 'react';
import './LandingPage.css';

function LandingPage({ onNavigate }) {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/teams`);
      const data = await response.json();
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
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
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-value">20</div>
                <div className="stat-label">Teams</div>
              </div>
              <div className="stat">
                <div className="stat-value">38</div>
                <div className="stat-label">Matchdays</div>
              </div>
              <div className="stat">
                <div className="stat-value">$10</div>
                <div className="stat-label">Entry Fee</div>
              </div>
            </div>
            <div className="hero-cta">
              <button
                onClick={() => onNavigate('team-selection')}
                className="btn btn-primary btn-huge"
              >
                Make Your Pick for Matchday 10
              </button>
              <p className="hero-note">Pick your team. Survive or die. Win the pot. 🏆</p>
            </div>
          </div>
        </div>
      </section>

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

      {/* Features Section */}
      <section className="features section">
        <div className="container">
          <h2>Why You'll Love It</h2>
          <div className="feature-grid">
            <div className="feature-card card">
              <h4>🎯 Pure Skill</h4>
              <p>No odds, no spreads. Just pick winners. Your football knowledge matters.</p>
            </div>
            <div className="feature-card card">
              <h4>📊 Public Leaderboards</h4>
              <p>See everyone's picks and watch the drama unfold in real-time.</p>
            </div>
            <div className="feature-card card">
              <h4>💰 Weekly Pots</h4>
              <p>New pool starts every matchday. Multiple chances to win all season.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to Play?</h2>
            <p>Make your pick for Matchday 10 and join the survival pool.</p>
            <button
              onClick={() => onNavigate('team-selection')}
              className="btn btn-primary btn-huge"
            >
              Make Your Pick Now
            </button>
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
    </div>
  );
}

export default LandingPage;
