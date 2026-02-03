import React, { useEffect, useState } from 'react';
import api from '../api';

const Clients = () => {
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get('/clients');
        setClients(response.data.clients);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching clients', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  if (loading) return <div>Loading clients...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>DHCP Clients</h2>
      <table border="1" cellPadding="10">
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
    </div>
  );
};

export default Clients;