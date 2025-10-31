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

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchPoolDetails();
  }, [entryId]);

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
            <h2>Your Latest Pick</h2>
            <div className="your-pick-card">
              <div className="pick-team">
                <div className="team-name">{myLatestPick.team_name}</div>
                <div className="pick-meta">Week {myLatestPick.gameweek}</div>
              </div>
              <div className={`pick-result result-${myLatestPick.result}`}>
                {myLatestPick.result === 'pending' && '⏱ Pending'}
                {myLatestPick.result === 'win' && '✓ Win'}
                {myLatestPick.result === 'loss' && '✗ Loss'}
                {myLatestPick.result === 'draw' && '− Draw'}
              </div>
            </div>
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
    </div>
  );
}

export default PoolDetails;
