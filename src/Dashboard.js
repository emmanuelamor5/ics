import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
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
        if (data.specify !== 'Commuter') {
          navigate('/login');
        } else {
          setUser(data);
          setLoading(false);
        }
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

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

  if (loading) return <p>Loading commuter dashboard...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Welcome, {user.firstname}!</h2>
        <p style={styles.subheading}>Your commuter dashboard</p>

        <div style={styles.actions}>
          <button style={styles.button} onClick={() => navigate('/matatustages')}>Matatu Stages</button>
          <button style={styles.button} onClick={() => navigate('/saccoratings')}>Rate Saccos</button>
          <button style={styles.button} onClick={() => navigate('/lostandfound')}>Lost & Found</button>
          <button style={styles.button} onClick={() => navigate('/roadupdate')}>Traffic Alerts</button>
          <button style={styles.button} onClick={() => navigate('/profile')}>Edit Profile</button>
          <button style={{ ...styles.button, backgroundColor: '#e74c3c' }} onClick={handleLogout}>Logout</button>
        </div>

        <p style={styles.note}>
          Here, you can monitor road conditions, find Matatu stages, rate Saccos, and retrieve lost items.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '100vh',
    paddingTop: '60px',
    background: 'linear-gradient(to right, #d3cce3, #e9e4f0)',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
    width: '90%',
    maxWidth: '600px',
    textAlign: 'center',
  },
  heading: {
    marginBottom: '10px',
    fontSize: '28px',
    color: '#2c3e50',
  },
  subheading: {
    fontSize: '16px',
    color: '#7f8c8d',
    marginBottom: '30px',
  },
  actions: {
    display: 'grid',
    gap: '15px',
    gridTemplateColumns: '1fr 1fr',
    marginBottom: '30px',
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#3498db',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  note: {
    fontSize: '14px',
    color: '#555',
    marginTop: '10px',
  }
};

export default Dashboard;

