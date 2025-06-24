import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WeatherBox from './weatherbox';

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
        if (data.specify !== 'Driver') navigate('/login');
        else {
          setUser(data);
          setLoading(false);
        }
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  const handleLogout = async () => {
    await fetch('http://localhost:5000/api/logout', {
      method: 'POST',
      credentials: 'include'
    });
    navigate('/login');
  };

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

  if (loading) return <p style={styles.loading}>Loading driver dashboard...</p>;

  return (
    <>
      {/* ====== Cyberpunk theme styles ====== */}
      <style>{`
        body {
          font-family: 'Courier New', monospace;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a0b2e 50%, #0a0a0a 100%);
          color: #00d4ff;
          overflow-x: hidden;
          min-height: 100vh;
        }

        .cyber-grid {
          position: fixed; top:0; left:0;
          width:100%; height:100%;
          background-image:
            linear-gradient(rgba(0,212,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg,rgba(0,212,255,0.1) 1px,transparent 1px);
          background-size:50px 50px;
          z-index:-2;
          animation: gridPulse 4s ease-in-out infinite;
        }

        @keyframes gridPulse {
          0%,100% { opacity: 0.3; } 50% { opacity: 0.6; }
        }

        .particles {
          position: fixed; top:0; left:0;
          width:100%; height:100%;
          pointer-events:none; z-index:-1;
        }

        .particle {
          position:absolute;
          width:2px; height:2px;
          background:linear-gradient(45deg,#39ff14,#00d4ff);
          border-radius:50%;
          animation: float 6s linear infinite;
        }

        @keyframes float {
          0% { transform: translateY(100vh) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-10vh) translateX(100px); opacity: 0; }
        }
      `}</style>

      <div className="cyber-grid"></div>
      <div className="particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      <div style={styles.container}>
        <div style={styles.card}>
          <h2>Welcome, {user?.firstname || 'Driver'}!</h2>
          <p style={styles.subheading}>Your driver dashboard</p>

          {/* 🌤 Weather Section */}
          <WeatherBox />

          <div style={styles.actions}>
            <button style={styles.button} onClick={() => navigate('/roadupdate')}>Post Road Update</button>
            <button style={styles.button} onClick={() => navigate('/RatingsDisplay')}>View Ratings</button>
            <button style={styles.button} onClick={() => navigate('/lostandfound')}>Post Lost & Found items</button>
            <button style={styles.button} onClick={() => navigate('/profile')}>Edit Profile</button>
            <button style={{ ...styles.button, backgroundColor: '#e74c3c' }} onClick={handleLogout}>Logout</button>
          </div>

          <p style={styles.note}>
            Here you can report road alerts, manage lost items and keep passengers informed.
          </p>
          <h3 className="alerts-section-title">Road Updates</h3>

        {loading ? (
          <p className="loading-text">Loading alerts...</p>
        ) : (
          <div className="alerts-list">
            {alerts.length === 0 ? (
              <p className="no-alerts">No alerts available.</p>
            ) : (
              alerts.map(post => (
                <div key={post.id} className="alert-card">
                  <p><strong>Type:</strong> {post.type}</p>
                  <p><strong>Description:</strong> {post.description}</p>
                  <p><strong>Time:</strong> {new Date(post.created_at).toLocaleString()}</p>
                  <p><strong>Severity Level:</strong> {post.severity_level}</p>
                  {post.image_url && (
                    <img
                      src={`http://localhost:5000${post.image_url}`}
                      alt="Road Update"
                      className="alert-image"
                    />
                  )}
                </div>
              ))
            )}

        </div>
          )}
        </div>

      </div>
    </>
  );
}

const styles = {
  container: {
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
    minHeight: '100vh',
    fontFamily: 'Courier New, monospace',
  },
  card: {
    background: 'rgba(26, 11, 46, 0.5)',
    border: '1px solid rgba(0, 212, 255, 0.4)',
    borderRadius: '15px',
    padding: '30px',
    maxWidth: '600px',
    width: '100%',
    backdropFilter: 'blur(15px)',
    boxShadow: '0 0 25px rgba(0, 212, 255, 0.2)',
  },
  heading: {
    color: '#39ff14',
    fontSize: '1.8rem',
    textAlign: 'center',
    marginBottom: '10px',
    textTransform: 'uppercase',
  },
  subheading: {
    color: '#00d4ff',
    textAlign: 'center',
    fontSize: '1rem',
    marginBottom: '20px',
  },
  actions: {
    display: 'grid',
    gap: '12px',
    gridTemplateColumns: '1fr 1fr',
    marginTop: '20px',
    marginBottom: '20px',
  },
  button: {
    padding: '12px',
    background: 'linear-gradient(45deg, #00d4ff, #39ff14)',
    color: '#0a0a0a',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },
  note: {
    color: '#00d4ff',
    textAlign: 'center',
    fontSize: '0.9rem',
  },
  loading: {
    textAlign: 'center',
    marginTop: '50vh',
    color: '#999',
  }
};

export default DriverDashboard;




