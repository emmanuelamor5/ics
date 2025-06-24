import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Roadupdate = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('accident');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [severity_level, setseverity_level] = useState('');

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
    if (user?.specify === 'Commuter') {
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
    formData.append('severity_level', severity_level);

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

  if (loading) return <p style={{ textAlign: 'center', color: '#00d4ff' }}>Loading...</p>;
  if (!user) return <p style={{ textAlign: 'center', color: '#00d4ff' }}>Not logged in.</p>;

  return (
    <>
      <style>{`
        body {
          font-family: 'Courier New', monospace;
          background: linear-gradient(135deg, #0a0a0a, #1a0b2e);
          color: #00d4ff;
        }

        .road-container {
          max-width: 1000px;
          margin: auto;
          padding: 40px 20px;
        }

        .form-box, .post-box {
          background: rgba(26, 11, 46, 0.5);
          border: 1px solid rgba(0, 212, 255, 0.4);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 40px;
          backdrop-filter: blur(20px);
          box-shadow: 0 0 25px rgba(0, 212, 255, 0.2);
        }

        .form-box h2, .post-box h2 {
          font-size: 2rem;
          color: #39ff14;
          margin-bottom: 25px;
          text-shadow: 0 0 10px #39ff14;
        }

        .form-box textarea,
        .form-box select,
        .form-box input {
          width: 100%;
          padding: 14px;
          margin-bottom: 20px;
          border-radius: 10px;
          border: 1px solid #00d4ff55;
          background: rgba(0,0,0,0.4);
          color: #00d4ff;
          font-size: 1.05rem;
        }

        .form-box button {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(45deg, #00d4ff, #39ff14);
          color: #0a0a0a;
          font-weight: bold;
          font-size: 1.1rem;
          cursor: pointer;
          transition: 0.3s ease;
        }

        .form-box button:hover {
          transform: scale(1.05);
          box-shadow: 0 0 25px rgba(57, 255, 20, 0.4);
        }

        .post-box select {
          margin-bottom: 20px;
          padding: 10px;
          background: rgba(0, 0, 0, 0.4);
          color: #00d4ff;
          border-radius: 10px;
          border: 1px solid #00d4ff33;
        }

        .post-card {
          background: rgba(15, 15, 15, 0.7);
          border: 1px solid #00d4ff33;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          color: #ccc;
        }

        .post-card img {
          width: 100%;
          max-height: 320px;
          object-fit: cover;
          border-radius: 12px;
          margin-top: 15px;
        }
      `}</style>

      <div className="road-container">
        {user.specify === 'Driver' && (
          <form className="form-box" onSubmit={handlePostSubmit}>
            <h2>🛠️ Submit Road Update</h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened..."
              required
              rows={4}
            />
            <input
              type="text"
              value={severity_level}
              onChange={(e) => setseverity_level(e.target.value)}
              placeholder="Severity Level (low, medium, high)"
              required
            />
            <select value={type} onChange={(e) => setType(e.target.value)} required>
              <option value="accident">Accident</option>
              <option value="traffic_update">Traffic Update</option>
              <option value="closure">Road Closure</option>
              <option value="road_construction">Construction</option>
              <option value="flood">Flood</option>
              <option value="police_checkpoint">Police Checkpoint</option>
              <option value="poor_visibility">Poor Visibility</option>
            </select>
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              accept="image/*"
              required
            />
            <button type="submit">Submit Update</button>
          </form>
        )}

        {user.specify === 'Commuter' && (
          <div className="post-box">
            <h2>Live Road Updates</h2>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All</option>
              <option value="accident">Accident</option>
              <option value="traffic_update">Traffic Update</option>
              <option value="closure">Road Closure</option>
              <option value="road_construction">Construction</option>
              <option value="flood">Flood</option>
              <option value="police_checkpoint">Police Checkpoint</option>
              <option value="poor_visibility">Poor Visibility</option>
            </select>

            {posts.length === 0 ? (
              <p>No posts found.</p>
            ) : (
              posts.map((post, i) => (
                <div key={i} className="post-card">
                  <p><strong>Type:</strong> {post.type}</p>
                  <p>{post.description}</p>
                  {post.image_url && (
                    <img
                      src={`http://localhost:5000${post.image_url}`}
                      alt="Road Update"
                    />
                  )}
                  <p><strong>⚠️ Severity:</strong> {post.severity_level}</p>
                  
           <p><em>{new Date(post.created_at).toLocaleString()}</em></p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Roadupdate;







