import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [claims, setClaims] = useState([]);

  const fetchAll = async () => {
    try {
      const [usersRes, alertsRes, reviewsRes, routesRes, claimsRes] = await Promise.all([
        axios.get('/api/admin/users', { withCredentials: true }),
        axios.get('/api/admin/alerts', { withCredentials: true }),
        axios.get('/api/admin/reviews', { withCredentials: true }),
        axios.get('/api/admin/routes', { withCredentials: true }),
        axios.get('/api/admin/claims', { withCredentials: true }),
      ]);
      setUsers(usersRes.data);
      setAlerts(alertsRes.data);
      setReviews(reviewsRes.data);
      setRoutes(routesRes.data);
      setClaims(claimsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const approveUser = async (id) => {
    await axios.post(`/api/admin/users/${id}/approve`, {}, { withCredentials: true });
    fetchAll();
  };

  const deleteItem = async (endpoint, id) => {
    await axios.delete(`/api/admin/${endpoint}/${id}`, { withCredentials: true });
    fetchAll();
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', color: '#00d4ff', background: '#0a0a0a', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Admin Dashboard</h1>

      <div style={{ marginBottom: '1rem' }}>
        {['users', 'alerts', 'reviews', 'routes', 'claims'].map(section => (
          <button
            key={section}
            onClick={() => setTab(section)}
            style={{
              marginRight: '10px',
              padding: '10px 20px',
              background: tab === section ? '#39ff14' : 'transparent',
              color: tab === section ? '#000' : '#00d4ff',
              border: '1px solid #00d4ff',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            {section.toUpperCase()}
          </button>
        ))}
      </div>

      {/* USERS */}
      {tab === 'users' && (
        <div>
          <h2>Users</h2>
          {users.map(user => (
            <div key={user.id} style={{ marginBottom: '10px' }}>
              {user.name} ({user.email}) - {user.specify}
              {user.approved ? (
                <span style={{ color: '#39ff14', marginLeft: '10px' }}>Approved</span>
              ) : (
                <button onClick={() => approveUser(user.id)} style={{ marginLeft: '10px' }}>Approve</button>
              )}
              <button onClick={() => deleteItem('users', user.id)} style={{ marginLeft: '10px', color: 'red' }}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {/* ALERTS */}
      {tab === 'alerts' && (
        <div>
          <h2>Road Alerts</h2>
          {alerts.map(alert => (
            <div key={alert.id} style={{ marginBottom: '10px' }}>
              [{alert.type.toUpperCase()}] - {alert.description}
              <button onClick={() => deleteItem('alerts', alert.id)} style={{ marginLeft: '10px', color: 'red' }}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {/* REVIEWS */}
      {tab === 'reviews' && (
        <div>
          <h2>Commuter Reviews</h2>
          {reviews.map(review => (
            <div key={review.id} style={{ marginBottom: '10px' }}>
              Sacco ID: {review.sacco_id} | Clean: {review.cleanliness_rating} | Safety: {review.safety_rating} | Service: {review.service_rating}
              {review.review_text && <p>{review.review_text}</p>}
              <button onClick={() => deleteItem('reviews', review.id)} style={{ color: 'red' }}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {/* ROUTES */}
      {tab === 'routes' && (
        <div>
          <h2>Routes</h2>
          {routes.map(route => (
            <div key={route.id} style={{ marginBottom: '10px' }}>
              {route.name} - {route.description}
              <button onClick={() => deleteItem('routes', route.id)} style={{ marginLeft: '10px', color: 'red' }}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {/* CLAIMS */}
      {tab === 'claims' && (
        <div>
          <h2>Driver Claims</h2>
          {claims.map(claim => (
            <div key={claim.id} style={{ marginBottom: '10px' }}>
              <strong>Driver:</strong> {claim.driver_name} | <strong>Item Description:</strong> {claim.description}
              <button onClick={() => deleteItem('lost-item', claim.lost_item_id)} style={{ marginLeft: '10px', color: 'red' }}>
                Delete Lost Item
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;




