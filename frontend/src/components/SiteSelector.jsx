import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const SiteSelector = () => {
  const [appliances, setAppliances] = useState([]);
  const [filteredAppliances, setFilteredAppliances] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppliances = async () => {
      try {
        const response = await api.get('/appliances');
        setAppliances(response.data);
        setFilteredAppliances(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching appliances', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAppliances();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredAppliances(appliances);
    } else {
      setFilteredAppliances(
        appliances.filter(app =>
          app.hostName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (app.site && app.site.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    }
  }, [searchTerm, appliances]);

  const handleSelectSite = (appliance) => {
    navigate(`/clients/${appliance.nePk}`, { 
      state: { hostname: appliance.hostName, site: appliance.site } 
    });
  };

  if (loading) return <div>Loading sites...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Select a Site</h2>
      <input
        type="text"
        placeholder="Search by hostname or site..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '20px',
          fontSize: '16px'
        }}
      />
      <table border="1" cellPadding="10" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Hostname</th>
            <th>Site</th>
            <th>Model</th>
            <th>IP</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredAppliances.map((appliance) => (
            <tr key={appliance.id}>
              <td>{appliance.hostName}</td>
              <td>{appliance.site || 'N/A'}</td>
              <td>{appliance.model || 'N/A'}</td>
              <td>{appliance.ip}</td>
              <td>
                <button onClick={() => handleSelectSite(appliance)}>
                  View DHCP Leases
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredAppliances.length === 0 && (
        <p>No sites found matching "{searchTerm}"</p>
      )}
    </div>
  );
};

export default SiteSelector;