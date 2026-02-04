import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Login from './components/Login';
import Home from './components/Home';
import SiteSelector from './components/SiteSelector';
import Clients from './components/Clients';
import AdminDashboard from './components/AdminDashboard';
import PasswordReset from './components/PasswordReset';
import ProtectedRoute from './components/ProtectedRoute';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useContext(AuthContext);

  if (!user) return null;

  return (
    <nav style={{ 
      padding: '10px 20px', 
      backgroundColor: '#f0f0f0', 
      borderBottom: '2px solid #ccc',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', gap: '10px' }}>
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
        {isAdmin() && (
          <button 
            onClick={() => navigate('/admin')}
            disabled={location.pathname === '/admin'}
            style={{ padding: '8px 16px', cursor: location.pathname === '/admin' ? 'default' : 'pointer' }}
          >
            Admin
          </button>
        )}
        <button 
          onClick={() => navigate('/reset-password')}
          disabled={location.pathname === '/reset-password'}
          style={{ padding: '8px 16px', cursor: location.pathname === '/reset-password' ? 'default' : 'pointer' }}
        >
          Reset Password
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>Welcome, {user.username} ({user.role})</span>
        <button 
          onClick={logout}
          style={{ padding: '8px 16px', backgroundColor: '#d32f2f', color: 'white', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <header className="App-header">
            <h1>ESOP Systems Observation Program</h1>
          </header>
          <Navigation />
          <main>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/select-site" element={
                <ProtectedRoute>
                  <SiteSelector />
                </ProtectedRoute>
              } />
              <Route path="/clients/:nePk" element={
                <ProtectedRoute>
                  <Clients />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/reset-password" element={
                <ProtectedRoute>
                  <PasswordReset />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;