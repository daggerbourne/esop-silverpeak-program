import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to DHCP Client Viewer</h1>
      <button 
        onClick={() => navigate('/select-site')}
        style={{
          padding: '15px 30px',
          fontSize: '18px',
          cursor: 'pointer',
          marginTop: '30px'
        }}
      >
        View DHCP Leases
      </button>
    </div>
  );
};

export default Home;