// MyPicks - Shows user's active entries and their picks
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPicks.css';

function MyPicks({ entries, onRefresh }) {
  const navigate = useNavigate();
  if (!entries || entries.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🎯</div>
        <h3>No Active Picks</h3>
        <p>You haven't joined any pools yet. Join a matchweek to start playing!</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: { text: 'Active', className: 'status-active' },
      survived: { text: 'Survived', className: 'status-survived' },
      eliminated: { text: 'Eliminated', className: 'status-eliminated' },
      pending: { text: 'Pending', className: 'status-pending' }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="my-picks">
      {entries.map((entry) => {
        const statusBadge = getStatusBadge(entry.status);

        return (
          <div
            key={entry.id}
            className={`pick-card ${statusBadge.className}`}
            onClick={() => navigate(`/pool/${entry.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className="pick-header">
              <div className="pick-pool-info">
                <span className="matchday-badge">Matchday {entry.poolId}</span>
                <span className={`status-badge ${statusBadge.className}`}>
                  {statusBadge.text}
                </span>
              </div>
              <div className="pick-entry-date">
                Joined {new Date(entry.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>

            {/* Current/Latest Pick */}
            {entry.currentPick && (
              <div className="pick-content">
                <img
                  src={entry.currentPick.team.crest}
                  alt={entry.currentPick.team.name}
                  className="pick-team-crest"
                />
                <div className="pick-details">
                  <div className="pick-team-name">{entry.currentPick.team.name}</div>
                  <div className="pick-opponent">
                    vs {entry.currentPick.opponent}
                  </div>
                  <div className="pick-matchday">
                    Week {entry.currentPick.matchday}
                  </div>
                </div>
                <div className="pick-result">
                  {entry.currentPick.result === 'win' && (
                    <div className="result-badge win">✓ Win</div>
                  )}
                  {entry.currentPick.result === 'loss' && (
                    <div className="result-badge loss">✗ Loss</div>
                  )}
                  {entry.currentPick.result === 'draw' && (
                    <div className="result-badge draw">− Draw</div>
                  )}
                  {entry.currentPick.result === 'pending' && (
                    <div className="result-badge pending">⏱ Pending</div>
                  )}
                </div>
              </div>
            )}

            {/* Teams Used */}
            {entry.teamsUsed && entry.teamsUsed.length > 0 && (
              <div className="pick-footer">
                <div className="teams-used">
                  <span className="teams-used-label">Teams used:</span>
                  <div className="teams-used-crests">
                    {entry.teamsUsed.slice(0, 5).map((team, index) => (
                      <img
                        key={index}
                        src={team.crest}
                        alt={team.name}
                        title={team.name}
                        className="used-team-crest"
                      />
                    ))}
                    {entry.teamsUsed.length > 5 && (
                      <span className="more-teams">+{entry.teamsUsed.length - 5}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default MyPicks;
