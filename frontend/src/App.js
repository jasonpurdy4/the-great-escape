import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import TeamSelection from './components/TeamSelection';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing' or 'team-selection'

  const renderPage = () => {
    switch(currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'team-selection':
        return <TeamSelection />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="App">
      {/* Simple Nav for Demo */}
      <nav style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 1000,
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={() => setCurrentPage('landing')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '2px solid #1a2332',
            background: currentPage === 'landing' ? '#1a2332' : 'white',
            color: currentPage === 'landing' ? 'white' : '#1a2332',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Landing
        </button>
        <button
          onClick={() => setCurrentPage('team-selection')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '2px solid #1a2332',
            background: currentPage === 'team-selection' ? '#1a2332' : 'white',
            color: currentPage === 'team-selection' ? 'white' : '#1a2332',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Team Selection
        </button>
      </nav>

      {renderPage()}
    </div>
  );
}

export default App;
