import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';

const Clients = () => {
  const { nePk } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { hostname, site } = location.state || {};
  
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get(`/clients?nePk=${nePk}`);
        setClients(response.data.clients);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching clients', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (nePk) {
      fetchClients();
    }
  }, [nePk]);

  if (loading) return <div>Loading clients...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate('/select-site')} style={{ marginBottom: '20px' }}>
        ← Back to Site Selection
      </button>
      <h2>DHCP Clients - {hostname || 'Unknown'} ({site || 'N/A'})</h2>
      <p>Showing {Object.keys(clients).length} lease(s)</p>
      <table border="1" cellPadding="10" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>IP Address</th>
            <th>Hostname</th>
            <th>MAC Address</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(clients).map(([ip, client]) => (
            <tr key={ip}>
              <td>{ip}</td>
              <td>{client.client_hostname || 'N/A'}</td>
              <td>{client.mac}</td>
              <td>{client.state}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {Object.keys(clients).length === 0 && (
        <p>No DHCP leases found for this site.</p>
      )}
    </div>
  );
};

export default Clients;