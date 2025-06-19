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

  if (loading) return <p style={{ textAlign: 'center' }}>Loading...</p>;
  if (!user) return <p style={{ textAlign: 'center' }}>Not logged in.</p>;

  return (
    <div style={styles.container}>
      {user.specify === 'Driver' && (
        <form style={styles.form} onSubmit={handlePostSubmit}>
          <h2 style={styles.heading}>Submit Road Update</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what happened"
            required
            rows={4}
            style={styles.textarea}
          />
          <select value={type} onChange={(e) => setType(e.target.value)} required style={styles.select}>
            <option value="accident">Accident</option>
            <option value="traffic_update">Traffic Update</option>
          </select>
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            accept="image/*"
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Submit</button>
        </form>
      )}

      {user.specify === 'Commuter' && (
        <div style={styles.postSection}>
          <h2 style={styles.heading}>Road Updates</h2>
          <label style={styles.label}>Filter by Type:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={styles.select}>
            <option value="">All</option>
            <option value="accident">Accident</option>
            <option value="traffic_update">Traffic Update</option>
          </select>

          <div style={{ marginTop: '20px' }}>
            {posts.length === 0 ? (
              <p>No posts found.</p>
            ) : (
              posts.map((post, i) => (
                <div key={i} style={styles.postCard}>
                  <p><strong>Type:</strong> {post.type}</p>
                  <p>{post.description}</p>
                  {post.image_url && (
                    <img
                      src={`http://localhost:5000${post.image_url}`}
                      alt="post"
                      style={styles.image}
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

const styles = {
  container: {
    padding: '30px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
  },
  heading: {
    marginBottom: '15px',
    color: '#333',
  },
  form: {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  select: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  input: {
    marginBottom: '10px',
    padding: '10px 0',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: '#fff',
    fontSize: '16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  postSection: {
    marginTop: '20px',
  },
  label: {
    fontWeight: 'bold',
    marginRight: '10px',
  },
  postCard: {
    border: '1px solid #ccc',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '15px',
    backgroundColor: '#fafafa',
  },
  image: {
    width: '100%',
    maxHeight: '300px',
    borderRadius: '6px',
    objectFit: 'cover',
    marginTop: '10px',
  },
};

export default Roadupdate;






