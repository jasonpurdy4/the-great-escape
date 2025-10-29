import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import TeamSelection from './components/TeamSelection';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing' or 'team-selection'

  const renderPage = () => {
    switch(currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} />;
      case 'team-selection':
        return <TeamSelection onNavigate={setCurrentPage} />;
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;
