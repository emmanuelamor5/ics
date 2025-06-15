import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('accident');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject('Not logged in'))
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        navigate('/');
      });
  }, [navigate]);

  useEffect(() => {
    if (user?.role === 'Commuter') {
      const url = filter
        ? `http://localhost:5000/api/posts?type=${filter}`
        : 'http://localhost:5000/api/posts';
      fetch(url, { credentials: 'include' })
        .then(res => res.ok ? res.json() : [])
        .then(setPosts)
        .catch(console.error);
    }
  }, [user, filter]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('description', description);
    formData.append('type', type);
    formData.append('image', image);

    try {
      const res = await fetch('http://localhost:5000/api/post', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (res.ok) {
        alert('Post submitted!');
        setDescription('');
        setImage(null);
      } else {
        alert('Failed to submit post.');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting post.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Not logged in.</p>;

  return (
    <div className="welcome-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Welcome, {user.username}!</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* Driver Form */}
      {user.role === 'Driver' && (
        <form className="post-form" onSubmit={handlePostSubmit}>
          <h2>Submit Road Update</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what happened"
            required
            rows={4}
          />
          <select value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="accident">Accident</option>
            <option value="traffic_update">Traffic Update</option>
          </select>
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            accept="image/*"
            required
          />
          <button type="submit">Submit</button>
        </form>
      )}

      {/* Commuter View */}
      {user.role === 'Commuter' && (
        <div className="post-list">
          <h2>Road Updates</h2>
          <label>Filter by Type: </label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All</option>
            <option value="accident">Accident</option>
            <option value="traffic_update">Traffic Update</option>
          </select>

          <div style={{ marginTop: '20px' }}>
            {posts.length === 0 ? (
              <p>No posts found.</p>
            ) : (
              posts.map((post, i) => (
                <div className="post-card" key={i}>
                  <p><strong>Type:</strong> {post.type}</p>
                  <p>{post.description}</p>
                  {post.image_url && (
                    <img
                      src={`http://localhost:5000${post.image_url}`}
                      alt="post"
                    />
                  )}
                  <p><em>Posted at: {new Date(post.created_at).toLocaleString()}</em></p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Welcome;




