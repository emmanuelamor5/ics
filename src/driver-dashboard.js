import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DriverDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/me', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Not logged in');
        return res.json();
      })
      .then(data => {
        if (data.specify !== 'Driver') {
          navigate('/login');
        } else {
          setUser(data);
        }
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  useEffect(() => {
    fetch('http://localhost:5000/api/alerts', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setAlerts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch alerts:', err);
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Driver Dashboard</h2>
        <p style={styles.weather}>Weather: Sunny, 24°C | Nairobi CBD</p>
      </div>

      <div style={styles.actions}>
        <button style={styles.button} onClick={() => navigate('/roadupdate')}>Post Road Update</button>
        <button style={styles.button} onClick={() => navigate('/lostandfound')}>Report Lost/Found Item</button>
        <button style={styles.button} onClick={() => navigate('/profile')}>View Profile</button>
        <button style={{ ...styles.button, backgroundColor: '#e74c3c' }} onClick={handleLogout}>Logout</button>
      </div>

      <h3 style={styles.sectionTitle}>Traffic Alerts</h3>

      {loading ? (
        <p style={styles.loading}>Loading alerts...</p>
      ) : (
        <div style={styles.alertList}>
          {alerts.length === 0 ? (
            <p style={styles.noAlerts}>No alerts available.</p>
          ) : (
            alerts.map(post => (
              <div key={post.id} style={styles.alertCard}>
                <p><strong>Type:</strong> {post.type}</p>
                <p><strong>Description:</strong> {post.description}</p>
                <p><strong>Time:</strong> {new Date(post.created_at).toLocaleString()}</p>
                {post.image_url && (
                  <img
                    src={`http://localhost:5000${post.image_url}`}
                    alt="Road Update"
                    style={styles.image}
                  />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '40px 20px',
    fontFamily: 'Arial, sans-serif',
    background: '#f4f7fa',
    minHeight: '100vh'
  },
  header: {
    marginBottom: '30px',
    textAlign: 'center'
  },
  title: {
    fontSize: '28px',
    color: '#2c3e50',
    marginBottom: '10px'
  },
  weather: {
    fontSize: '16px',
    color: '#7f8c8d'
  },
  actions: {
    display: 'grid',
    gap: '15px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    marginBottom: '40px'
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#3498db',
    color: '#fff',
    cursor: 'pointer',
    transition: '0.3s'
  },
  sectionTitle: {
    fontSize: '22px',
    color: '#34495e',
    marginBottom: '15px'
  },
  loading: {
    fontSize: '16px',
    color: '#999'
  },
  noAlerts: {
    fontStyle: 'italic',
    color: '#555'
  },
  alertList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  alertCard: {
    background: '#fff',
    padding: '15px 20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  },
  image: {
    marginTop: '10px',
    borderRadius: '6px',
    maxWidth: '100%'
  }
};

export default DriverDashboard;


