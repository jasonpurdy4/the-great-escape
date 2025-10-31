// Admin Panel - Match Results Management
import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

function AdminPanel() {
  const [pendingPicks, setPendingPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedResults, setSelectedResults] = useState({});

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchPendingPicks();
  }, []);

  const fetchPendingPicks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/admin/pending-picks`);
      const data = await response.json();

      if (data.success) {
        setPendingPicks(data.data);
        // Initialize selected results
        const initial = {};
        data.data.forEach(pick => {
          initial[pick.pick_id] = 'win'; // Default to win
        });
        setSelectedResults(initial);
      }
    } catch (error) {
      console.error('Error fetching pending picks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultChange = (pickId, result) => {
    setSelectedResults(prev => ({ ...prev, [pickId]: result }));
  };

  const handleUpdateSingle = async (pickId, gameweek) => {
    try {
      setUpdating(true);
      const response = await fetch(`${API_URL}/api/admin/update-pick-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickId,
          result: selectedResults[pickId],
          gameweek
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Pick updated to ${selectedResults[pickId]}`);
        fetchPendingPicks(); // Refresh list
      } else {
        alert(`❌ Failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating pick:', error);
      alert('❌ Failed to update pick');
    } finally {
      setUpdating(false);
    }
  };

  const handleBatchUpdate = async () => {
    if (!window.confirm(`Update ${pendingPicks.length} picks?`)) return;

    try {
      setUpdating(true);
      const updates = pendingPicks.map(pick => ({
        pickId: pick.pick_id,
        result: selectedResults[pick.pick_id],
        gameweek: pick.gameweek
      }));

      const response = await fetch(`${API_URL}/api/admin/batch-update-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ ${data.successCount} picks updated! (${data.errorCount} errors)`);
        fetchPendingPicks();
      } else {
        alert(`❌ Failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error batch updating:', error);
      alert('❌ Failed to batch update');
    } finally {
      setUpdating(false);
    }
  };

  // Group picks by gameweek
  const picksByGameweek = pendingPicks.reduce((acc, pick) => {
    if (!acc[pick.gameweek]) acc[pick.gameweek] = [];
    acc[pick.gameweek].push(pick);
    return acc;
  }, {});

  if (loading) {
    return <div className="admin-panel"><div className="loading">Loading pending picks...</div></div>;
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🛠️ Admin Panel</h1>
        <p>Update match results and manage eliminations</p>
      </div>

      {pendingPicks.length === 0 ? (
        <div className="no-pending">
          <h2>✅ All caught up!</h2>
          <p>No pending picks to update.</p>
        </div>
      ) : (
        <>
          <div className="batch-actions">
            <button
              className="btn btn-primary btn-large"
              onClick={handleBatchUpdate}
              disabled={updating}
            >
              {updating ? 'Updating...' : `Update All ${pendingPicks.length} Picks`}
            </button>
          </div>

          {Object.keys(picksByGameweek).sort((a, b) => a - b).map(gameweek => (
            <div key={gameweek} className="gameweek-section">
              <h2>Gameweek {gameweek}</h2>
              <div className="picks-grid">
                {picksByGameweek[gameweek].map(pick => (
                  <div key={pick.pick_id} className="pick-card">
                    <div className="pick-header">
                      <img src={pick.team_crest} alt={pick.team_name} className="team-crest" />
                      <div>
                        <h3>{pick.team_name}</h3>
                        <p className="pick-meta">
                          {pick.first_name} {pick.last_name} ({pick.email})
                        </p>
                        <p className="pick-meta">Entry #{pick.entry_number}</p>
                      </div>
                    </div>

                    <div className="result-selector">
                      <label>Result:</label>
                      <div className="radio-group">
                        {['win', 'draw', 'loss'].map(result => (
                          <label key={result} className="radio-option">
                            <input
                              type="radio"
                              name={`result-${pick.pick_id}`}
                              value={result}
                              checked={selectedResults[pick.pick_id] === result}
                              onChange={() => handleResultChange(pick.pick_id, result)}
                            />
                            <span className={`result-label ${result}`}>
                              {result === 'win' ? '✅ Win' : result === 'draw' ? '🟰 Draw' : '❌ Loss'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      className="btn btn-secondary"
                      onClick={() => handleUpdateSingle(pick.pick_id, pick.gameweek)}
                      disabled={updating}
                    >
                      Update
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default AdminPanel;
