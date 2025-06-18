import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    specify: '',
    profilePhoto: null,
  });
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject('Not logged in'))
      .then(data => {
        setUser(data);
        setFormData({
          firstname: data.firstname || '',
          lastname: data.lastname || '',
          username: data.username || '',
          email: data.email || '',
          specify: data.specify || '',
          profilePhoto: null,
        });
      })
      .catch(err => {
        console.error(err);
        navigate('/');
      });
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) payload.append(key, value);
    });

    try {
      const res = await fetch('http://localhost:5000/api/update-profile', {
        method: 'POST',
        body: payload,
        credentials: 'include'
      });
      if (res.ok) {
        alert('Profile updated!');
        setEditing(false);
        window.location.reload();
      } else {
        alert('Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating profile');
    }
  };

  if (!user) return <p className="page-container">Loading...</p>;

  return (
    <div className="profile-container">
      {!editing ? (
        <>
          <img
            src={user.profile_photo ? `http://localhost:5000${user.profile_photo}` : '/default-profile.png'}
            alt="Profile"
          />
          <div className="profile-details">
            <p><strong>First Name:</strong> {user.firstname}</p>
            <p><strong>Last Name:</strong> {user.lastname}</p>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.specify}</p>
          </div>
          <div className="profile-actions">
            <button onClick={() => setEditing(true)}>Edit Profile</button>
            <button onClick={handleLogout} style={{ backgroundColor: '#dc3545' }}>Logout</button>
            <button onClick={() => navigate('/roadupdate')} className="link-button">View Road Updates</button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="post-form">
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            placeholder="First Name"
            required
          />
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            placeholder="Last Name"
            required
          />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <select name="specify" value={formData.specify} onChange={handleChange} required>
            <option value="">Select Role</option>
            <option value="Commuter">Commuter</option>
            <option value="Driver">Driver</option>
          </select>
          <input
            type="file"
            name="profilePhoto"
            accept="image/*"
            onChange={handleChange}
          />
          <button type="submit">Save Changes</button>
          <button type="button" style={{ marginLeft: '10px' }} onClick={() => setEditing(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
};

export default Home;

