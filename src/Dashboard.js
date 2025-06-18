// dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/posts', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setAlerts(data))
      .catch(err => console.error('Failed to fetch alerts:', err));
  }, []);

  return (
    <div className="dashboard">
      <h2>Weather: Sunny, 24°C | Nairobi CBD</h2>

      <div className="quick-actions">
        <button onClick={() => navigate('/findstage')}>Find Matatu Stage</button>
        <button onClick={() => navigate('/rate')}>Rate SACCO</button>
        <button onClick={() => navigate('/roadupdate')}>View Road Updates</button>
        <button onClick={() => navigate('/lostandfound')}>View Lost and Found items</button>
      </div>

      <h3>Recent Activity</h3>
      <div className="alerts">
        {alerts.map(alert => (
          <div key={alert.id}>
            <strong>Alert:</strong> {alert.description} -{" "}
            {new Date(alert.created_at).toLocaleString()}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;



