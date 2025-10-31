// Pool Details - Detailed view of a specific pool/entry
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './PoolDetails.css';

function PoolDetails() {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState(null);
  const [pool, setPool] = useState(null);
  const [pickDistribution, setPickDistribution] = useState({});
  const [picks, setPicks] = useState([]);
  const [poolEntries, setPoolEntries] = useState([]);
  const [matches, setMatches] = useState([]);
  const [showEditPick, setShowEditPick] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [timeUntilDeadline, setTimeUntilDeadline] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchPoolDetails();
  }, [entryId]);

  // Check if editing is allowed (deadline countdown)
  useEffect(() => {
    if (!pool) return;

    const updateDeadline = () => {
      const now = new Date();
      const deadline = new Date(pool.deadline);
      const diff = deadline - now;

      if (diff <= 0) {
        setCanEdit(false);
        setTimeUntilDeadline('Deadline passed');
        return;
      }

      // Can edit if more than 1 hour until deadline
      setCanEdit(diff > 60 * 60 * 1000);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeUntilDeadline(`${days}d ${hours % 24}h until deadline`);
      } else if (hours > 0) {
        setTimeUntilDeadline(`${hours}h ${minutes}m until deadline`);
      } else {
        setTimeUntilDeadline(`${minutes}m until deadline`);
      }
    };

    updateDeadline();
    const interval = setInterval(updateDeadline, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [pool]);

  const fetchPoolDetails = async () => {
    if (!token) {
      navigate('/');
      return;
    }

    try {
      setLoading(true);

      // Fetch entry details
      const entryResponse = await fetch(`${API_URL}/api/entries/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const entryData = await entryResponse.json();

      if (entryData.success) {
        const myEntry = entryData.data.find(e => e.id === parseInt(entryId));
        if (!myEntry) {
          navigate('/dashboard');
          return;
        }
        setEntry(myEntry);

        // Fetch pool stats
        const poolResponse = await fetch(`${API_URL}/api/pools/${myEntry.pool_id}/stats`);
        const poolData = await poolResponse.json();
        setPool(poolData);

        // Fetch pick distribution
        const distResponse = await fetch(`${API_URL}/api/pools/${myEntry.pool_id}/pick-distribution`);
        const distData = await distResponse.json();
        setPickDistribution(distData);

        // Fetch my picks for this entry
        const picksResponse = await fetch(`${API_URL}/api/entries/${entryId}/picks`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const picksData = await picksResponse.json();
        if (picksData.success) {
          setPicks(picksData.data);
        }

        // Fetch matches for this gameweek (for editing picks)
        const matchesResponse = await fetch(`${API_URL}/api/matches?matchday=${poolData.matchweek}`);
        const matchesData = await matchesResponse.json();
        if (matchesData.matches) {
          setMatches(matchesData.matches);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching pool details:', error);
      setLoading(false);
    }
  };

  const calculateWinnerPayout = () => {
    if (!pool) return 0;
    const prizePool = pool.total_entries * 10; // $10 per entry
    const platformFee = prizePool * 0.10;
    return prizePool - platformFee;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { text: '✓ Active', className: 'badge-active', icon: '🟢' },
      eliminated: { text: '✗ Eliminated', className: 'badge-eliminated', icon: '🔴' },
      winner: { text: '👑 Winner', className: 'badge-winner', icon: '👑' }
    };
    return badges[status] || badges.active;
  };

  const handleEditPick = () => {
    setShowEditPick(true);
  };

  const handleSelectTeam = async (team, match) => {
    if (!myLatestPick) return;

    if (!window.confirm(`Change your pick to ${team.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/picks/${myLatestPick.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamId: team.id,
          teamName: team.name,
          teamCrest: team.crest,
          matchId: match.id
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Pick updated to ${team.name}!`);
        setShowEditPick(false);
        fetchPoolDetails(); // Refresh data
      } else {
        alert(data.error || 'Failed to update pick');
      }
    } catch (error) {
      console.error('Error updating pick:', error);
      alert('Failed to update pick. Please try again.');
    }
  };

  const isTeamUsed = (teamId) => {
    // Check if team was used in any previous picks for this entry
    return picks.some(pick => pick.team_id === teamId && pick.id !== myLatestPick?.id);
  };

  const formatMatchDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/New_York'
    });
  };

  if (loading) {
    return (
      <div className="pool-details">
        <div className="container">
          <div className="loading">Loading pool details...</div>
        </div>
      </div>
    );
  }

  if (!entry || !pool) {
    return (
      <div className="pool-details">
        <div className="container">
          <div className="error">Entry not found</div>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(entry.status);
  const winnerPayout = calculateWinnerPayout();
  const totalPicks = Object.values(pickDistribution).reduce((sum, count) => sum + count, 0);

  // Sort teams by pick count
  const sortedPicks = Object.entries(pickDistribution)
    .map(([team, count]) => ({
      team,
      count,
      percentage: totalPicks > 0 ? ((count / totalPicks) * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.count - a.count);

  // Find my latest pick
  const myLatestPick = picks.length > 0 ? picks[picks.length - 1] : null;

  return (
    <div className="pool-details">
      {/* Header */}
      <div className="pool-header">
        <div className="container">
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            ← Back to Dashboard
          </button>

          <div className="header-content">
            <div className="header-left">
              <h1>Matchweek {pool.matchweek}</h1>
              <div className={`status-badge-large ${statusBadge.className}`}>
                <span className="badge-icon">{statusBadge.icon}</span>
                <span>{statusBadge.text}</span>
              </div>
            </div>
            <div className="header-right">
              <div className="entry-info">
                <span className="entry-label">Entry #{entry.entry_number}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container pool-content">

        {/* Prize Pool Hero */}
        <div className="prize-pool-hero">
          <div className="prize-main">
            <div className="prize-icon">💰</div>
            <div className="prize-amount">${winnerPayout.toFixed(2)}</div>
            <div className="prize-label">Prize Pool</div>
          </div>

          <div className="prize-breakdown">
            <div className="breakdown-item">
              <span className="breakdown-label">Total Entries</span>
              <span className="breakdown-value">{pool.total_entries || 0}</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Entry Fee</span>
              <span className="breakdown-value">$10.00</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Platform Fee (10%)</span>
              <span className="breakdown-value">${(pool.total_entries * 1).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-number">{pool.total_entries || 0}</div>
            <div className="stat-label">Total Entries</div>
          </div>

          <div className="stat-card highlight">
            <div className="stat-icon">🎯</div>
            <div className="stat-number">{picks.length}</div>
            <div className="stat-label">Your Picks Made</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-number">MW {pool.matchweek}</div>
            <div className="stat-label">Current Week</div>
          </div>
        </div>

        {/* Your Latest Pick */}
        {myLatestPick && (
          <div className="your-pick-section">
            <div className="section-header">
              <h2>Your Latest Pick</h2>
              {canEdit && myLatestPick.result === 'pending' && (
                <button onClick={handleEditPick} className="btn btn-secondary">
                  Edit Pick
                </button>
              )}
            </div>
            <div className="your-pick-card">
              <div className="pick-team">
                {myLatestPick.team_crest && (
                  <img src={myLatestPick.team_crest} alt={myLatestPick.team_name} className="pick-team-crest" />
                )}
                <div className="pick-team-info">
                  <div className="team-name">{myLatestPick.team_name}</div>
                  <div className="pick-meta">Week {myLatestPick.gameweek}</div>
                </div>
              </div>
              <div className={`pick-result result-${myLatestPick.result}`}>
                {myLatestPick.result === 'pending' && '⏱ Pending'}
                {myLatestPick.result === 'win' && '✓ Win'}
                {myLatestPick.result === 'loss' && '✗ Loss'}
                {myLatestPick.result === 'draw' && '− Draw'}
              </div>
            </div>
            {canEdit && (
              <div className="edit-notice">
                ⏰ You can edit your pick until {timeUntilDeadline}
              </div>
            )}
            {!canEdit && myLatestPick.result === 'pending' && (
              <div className="deadline-notice">
                🔒 Pick is locked - deadline has passed
              </div>
            )}
          </div>
        )}

        {/* Pick Distribution */}
        {sortedPicks.length > 0 && (
          <div className="pick-distribution-section">
            <h2>Team Pick Distribution</h2>
            <p className="section-subtitle">See what teams your competitors chose</p>

            <div className="distribution-list">
              {sortedPicks.map((item, index) => {
                const isMyPick = myLatestPick && item.team === myLatestPick.team_name;
                return (
                  <div
                    key={item.team}
                    className={`distribution-item ${isMyPick ? 'my-pick' : ''}`}
                  >
                    <div className="item-rank">#{index + 1}</div>
                    <div className="item-content">
                      <div className="item-header">
                        <span className="item-team">{item.team}</span>
                        {isMyPick && <span className="my-pick-badge">Your Pick</span>}
                      </div>
                      <div className="item-bar-container">
                        <div
                          className="item-bar"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="item-stats">
                      <span className="item-percentage">{item.percentage}%</span>
                      <span className="item-count">{item.count} picks</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pick History */}
        {picks.length > 0 && (
          <div className="pick-history-section">
            <h2>Your Pick History</h2>
            <div className="picks-timeline">
              {picks.map((pick) => (
                <div key={pick.id} className="timeline-item">
                  <div className="timeline-week">Week {pick.gameweek}</div>
                  <div className="timeline-content">
                    <div className="timeline-team">{pick.team_name}</div>
                    <div className={`timeline-result result-${pick.result}`}>
                      {pick.result === 'pending' && '⏱ Pending'}
                      {pick.result === 'win' && '✓ Win'}
                      {pick.result === 'loss' && '✗ Loss'}
                      {pick.result === 'draw' && '− Draw'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Pick Modal */}
      {showEditPick && (
        <div className="modal-overlay" onClick={() => setShowEditPick(false)}>
          <div className="modal-content edit-pick-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowEditPick(false)}>×</button>
            <h2>Edit Your Pick</h2>
            <p className="modal-subtitle">Select a new team for Week {pool.matchweek}</p>

            <div className="matches-grid">
              {matches.map((match) => (
                <div key={match.id} className="match-card">
                  <div className="match-date">
                    {formatMatchDate(match.utcDate)}
                  </div>

                  {/* Home Team */}
                  <div
                    className={`team-option ${isTeamUsed(match.homeTeam.id) ? 'used' : ''} ${myLatestPick?.team_id === match.homeTeam.id ? 'current' : ''}`}
                    onClick={() => !isTeamUsed(match.homeTeam.id) && handleSelectTeam(match.homeTeam, match)}
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
                    {myLatestPick?.team_id === match.homeTeam.id && (
                      <span className="current-badge">Current</span>
                    )}
                  </div>

                  <div className="vs">vs</div>

                  {/* Away Team */}
                  <div
                    className={`team-option ${isTeamUsed(match.awayTeam.id) ? 'used' : ''} ${myLatestPick?.team_id === match.awayTeam.id ? 'current' : ''}`}
                    onClick={() => !isTeamUsed(match.awayTeam.id) && handleSelectTeam(match.awayTeam, match)}
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
                    {myLatestPick?.team_id === match.awayTeam.id && (
                      <span className="current-badge">Current</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PoolDetails;
