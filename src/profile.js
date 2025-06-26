import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Homee = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    specify: '',
    password: '',
    confirmPassword: '',
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
          password: data.password || '',
          confirmPassword: data.confirmPassword || '',
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

  if (!user) return <p className="cyber-loading">Loading...</p>;

  return (
    <>
      <style>{cyberStyle}</style>
      <div className="cyber-profile-container">
        {!editing ? (
          <>
            <img
              src={user.profile_photo ? `http://localhost:5000${user.profile_photo}` : '/default-profile.png'}
              alt="Profile"
              className="cyber-profile-img"
            />
            <div className="cyber-profile-details">
              <p><strong>First Name:</strong> {user.firstname}</p>
              <p><strong>Last Name:</strong> {user.lastname}</p>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
            
              
            </div>
            <div className="cyber-profile-actions">
              <button onClick={() => setEditing(true)} className="cyber-btn">Edit Profile</button>

            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="cyber-form">
            <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} placeholder="First Name" required />
            <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} placeholder="Last Name" required />
            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username" required />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="New Password" required />
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm New Password" required />
            <input type="file" name="profilePhoto" accept="image/*" onChange={handleChange} />
            <div className="cyber-profile-actions">
              <button type="submit" className="cyber-btn">Save Changes</button>
              <button type="button" className="cyber-btn red" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

const cyberStyle = `
  body {
    background: linear-gradient(135deg, #0a0a0a 0%, #1a0b2e 50%, #0a0a0a 100%);
    color: #00d4ff;
    font-family: 'Courier New', monospace;
  }

  .cyber-loading {
    text-align: center;
    color: #39ff14;
    margin-top: 100px;
  }

  .cyber-profile-container {
    max-width: 600px;
    margin: 50px auto;
    background: rgba(26, 11, 46, 0.6);
    border: 1px solid rgba(0, 212, 255, 0.2);
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 0 25px rgba(0, 212, 255, 0.2);
    text-align: center;
    backdrop-filter: blur(10px);
  }

  .cyber-profile-img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 20px;
    border: 2px solid #39ff14;
  }

  .cyber-profile-details p {
    font-size: 1.1rem;
    margin: 8px 0;
  }

  .cyber-profile-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 20px;
  }

  .cyber-btn {
    padding: 10px 20px;
    background: linear-gradient(45deg, #00d4ff, #39ff14);
    color: #0a0a0a;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.3s ease;
  }

  .cyber-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
  }

  .cyber-btn.red {
    background: linear-gradient(45deg, #e74c3c, #ff6f61);
    color: #fff;
  }

  .cyber-form input,
  .cyber-form select {
    width: 100%;
    padding: 12px;
    margin: 10px 0;
    border-radius: 8px;
    border: 1px solid rgba(0, 212, 255, 0.3);
    background: rgba(0, 0, 0, 0.2);
    color: #00d4ff;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.3s;
  }

  .cyber-form input:focus,
  .cyber-form select:focus {
    border-color: #39ff14;
    box-shadow: 0 0 10px rgba(57, 255, 20, 0.3);
  }
`;

export default Homee;

