import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import SiteSelector from './components/SiteSelector';
import Clients from './components/Clients';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={{ 
      padding: '10px 20px', 
      backgroundColor: '#f0f0f0', 
      borderBottom: '2px solid #ccc',
      display: 'flex',
      gap: '10px'
    }}>
      <button 
        onClick={() => navigate('/')}
        disabled={location.pathname === '/'}
        style={{ padding: '8px 16px', cursor: location.pathname === '/' ? 'default' : 'pointer' }}
      >
        Home
      </button>
      <button 
        onClick={() => navigate('/select-site')}
        disabled={location.pathname === '/select-site'}
        style={{ padding: '8px 16px', cursor: location.pathname === '/select-site' ? 'default' : 'pointer' }}
      >
        Site Selection
      </button>
    </nav>
  );
};

const App = () => {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>ESOP Systems Observation Program</h1>
        </header>
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/select-site" element={<SiteSelector />} />
            <Route path="/clients/:nePk" element={<Clients />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;