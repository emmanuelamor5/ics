import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DriverDashboard() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/posts', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error('Failed to fetch posts:', err));
  }, []);

  return (
    <div className="dashboard">
      <h2>Weather: Sunny, 24°C | Nairobi CBD</h2>

      <div className="quick-actions">
        <button onClick={() => navigate('/roadupdate')}>Post Road Update</button>
        <button onClick={() => navigate('/lostandfound')}>Report Lost/Found Item</button>
      </div>

      <h3>Traffic Alerts</h3>
      <div className="alerts">
        {posts.map(post => (
          <div key={post.id} style={{ border: '1px solid #ccc', marginBottom: '10px', padding: '10px', borderRadius: '6px' }}>
            <strong>Type:</strong> {post.type} <br />
            <strong>Description:</strong> {post.description} <br />
            <strong>Time:</strong> {new Date(post.created_at).toLocaleString()} <br />
            {post.image_url && (
              <img
                src={`http://localhost:5000${post.image_url}`}
                alt="Traffic"
                style={{ maxWidth: '100%', marginTop: '5px', borderRadius: '5px' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DriverDashboard;

