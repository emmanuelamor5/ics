
import React, { useEffect, useState } from 'react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const[posts, setPosts] = useState([]);
  const[postFilter, setPostFilter] = useState('');
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stages, setStages] = useState([]);
  const [saccos, setSaccos] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [newUser, setNewUser] = useState({ 
    firstname: '', 
    lastname: '', 
    username: '', 
    password: '', 
    email: '', 
    specify: '', 
    sacco: '', 
    ntsa_license: '' 
  });
  const [newRoute, setNewRoute] = useState({ display_name: '' });
  const [newStage, setNewStage] = useState({ name: '', latitude: '', longitude: '' });
  const [newSacco, setNewSacco] = useState({ sacco_name: '', base_fare_range: '', route_id: '', sacco_stage_id: '' });
  
  // Edit states
  const [editingRoute, setEditingRoute] = useState(null);
  const [editingStage, setEditingStage] = useState(null);
  const [editingSacco, setEditingSacco] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchClaims();
    fetchRoutes();
    fetchStages();
    fetchSaccos();
    fetchRatings();
    fetchPosts();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchClaims = async () => {
    const res = await fetch('http://localhost:5000/api/admin/claims', { credentials: 'include' });
    const data = await res.json();
    setClaims(data);
  };

  const fetchRoutes = async () => {
    const res = await fetch('http://localhost:5000/api/routes');
    const data = await res.json();
    setRoutes(data);
  };

  const fetchStages = async () => {
    const res = await fetch('http://localhost:5000/api/stages');
    const data = await res.json();
    setStages(data);
  };

  const fetchSaccos = async () => {
    const res = await fetch('http://localhost:5000/api/saccos');
    const data = await res.json();
    setSaccos(data);
  };

  const fetchRatings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/ratings');
      const data = await res.json();
      setRatings(data.ratings || data);
    } catch (err) {
      console.error('Error fetching ratings:', err);
    }
  };

 // Fetch posts
const fetchPosts = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/posts');
    const data = await res.json();
    setPosts(data);
  } catch (err) {
    console.error('Error fetching posts:', err);
  }
};

// Delete post
const deletePost = async (id) => {
  if (!window.confirm('Are you sure you want to delete this post?')) return;
  try {
    const res = await fetch(`http://localhost:5000/api/posts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('Post deleted successfully!');
      fetchPosts();
    } else {
      alert('Failed to delete post');
    }
  } catch (err) {
    console.error('Error deleting post:', err);
    alert('Error deleting post');
  }
};

  // User creation function
  const createUser = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
        credentials: 'include'
      });
      
      if (res.ok) {
        alert('User created successfully!');
        setNewUser({ 
          firstname: '', 
          lastname: '', 
          username: '', 
          password: '', 
          email: '', 
          specify: '', 
          sacco: '', 
          ntsa_license: '' 
        });
        fetchUsers();
      } else {
        const errorData = await res.json();
        alert(`Failed to create user: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error creating user:', err);
      alert('Error creating user');
    }
  };

  // Logout function
  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to logout?')) return;
    
    try {
      const res = await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (res.ok) {
        alert('Logged out successfully!');
        // Redirect to login page or home page
        window.location.href = '/login'; // Adjust this path as needed
      } else {
        alert('Failed to logout');
      }
    } catch (err) {
      console.error('Error logging out:', err);
      alert('Error logging out');
    }
  };

  const createRoute = async () => {
    const res = await fetch('http://localhost:5000/api/routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRoute)
    });
    if (res.ok) {
      setNewRoute({ display_name: '' });
      fetchRoutes();
    }
  };

  const createStage = async () => {
    const res = await fetch('http://localhost:5000/api/stages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStage)
    });
    if (res.ok) {
      setNewStage({ name: '', latitude: '', longitude: '' });
      fetchStages();
    }
  };

  const createSacco = async () => {
    const res = await fetch('http://localhost:5000/api/saccos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSacco)
    });
    if (res.ok) {
      setNewSacco({ sacco_name: '', base_fare_range: '', route_id: '', sacco_stage_id: '' });
      fetchSaccos();
    }
  };

  const deleteItem = async (endpoint, id, callback) => {
    const res = await fetch(`http://localhost:5000/api/${endpoint}/${id}`, { method: 'DELETE' });
    if (res.ok) callback();
  };

  const deleteRating = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rating?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/ratings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Rating deleted successfully!');
        fetchRatings();
      } else {
        alert('Failed to delete rating');
      }
    } catch (err) {
      console.error('Error deleting rating:', err);
      alert('Error deleting rating');
    }
  };

  // Edit functions
  const startEditRoute = (route) => {
    setEditingRoute(route.route_id);
    setEditData({ display_name: route.display_name });
  };

  const startEditStage = (stage) => {
    setEditingStage(stage.stage_id);
    setEditData({ name: stage.name, latitude: stage.latitude, longitude: stage.longitude });
  };

  const startEditSacco = (sacco) => {
    setEditingSacco(sacco.sacco_id);
    setEditData({ 
      sacco_name: sacco.sacco_name, 
      base_fare_range: sacco.base_fare_range, 
      route_id: sacco.route_id, 
      sacco_stage_id: sacco.sacco_stage_id 
    });
  };

  const saveEdit = async (type, id) => {
    let endpoint, data;
    
    switch (type) {
      case 'route':
        endpoint = `routes/${id}`;
        data = { display_name: editData.display_name };
        break;
      case 'stage':
        endpoint = `stages/${id}`;
        data = { name: editData.name, latitude: editData.latitude, longitude: editData.longitude };
        break;
      case 'sacco':
        endpoint = `saccos/${id}`;
        data = { 
          name: editData.sacco_name, 
          base_fare_range: editData.base_fare_range, 
          route_id: editData.route_id, 
          sacco_stage_id: editData.sacco_stage_id 
        };
        break;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        cancelEdit();
        if (type === 'route') fetchRoutes();
        else if (type === 'stage') fetchStages();
        else if (type === 'sacco') fetchSaccos();
        alert('Changes saved successfully!');
      } else {
        alert('Failed to save changes');
      }
    } catch (err) {
      console.error('Error saving changes:', err);
      alert('Error saving changes');
    }
  };

  const cancelEdit = () => {
    setEditingRoute(null);
    setEditingStage(null);
    setEditingSacco(null);
    setEditData({});
  };

  const inputStyle = {
    width: '100%', padding: '8px', margin: '5px 0', backgroundColor: '#222', color: '#00d4ff', border: '1px solid #00d4ff33', borderRadius: '5px'
  };

  const deleteButtonStyle = { ...inputStyle, backgroundColor: '#dc3545', color: '#fff', cursor: 'pointer', margin: '2px' };
  const approveButtonStyle = { ...inputStyle, backgroundColor: '#28a745', color: '#fff', cursor: 'pointer', margin: '2px' };
  const createButtonStyle = { ...inputStyle, backgroundColor: '#39ff14', color: '#000', cursor: 'pointer' };
  const editButtonStyle = { ...inputStyle, backgroundColor: '#ffc107', color: '#000', cursor: 'pointer', margin: '2px' };
  const saveButtonStyle = { ...inputStyle, backgroundColor: '#17a2b8', color: '#fff', cursor: 'pointer', margin: '2px' };
  const cancelButtonStyle = { ...inputStyle, backgroundColor: '#6c757d', color: '#fff', cursor: 'pointer', margin: '2px' };
  const logoutButtonStyle = { ...inputStyle, backgroundColor: '#dc3545', color: '#fff', cursor: 'pointer', width: 'auto', padding: '10px 20px' };

  const renderRatingsTab = () => (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Manage Ratings</h2>
      {ratings.length === 0 ? (
        <p>No ratings found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {ratings.map(rating => (
            <div key={rating.id} style={{ backgroundColor: '#111', border: '1px solid #00d4ff33', borderRadius: '10px', padding: '15px', color: '#ddd' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: '#00d4ff', marginBottom: '10px' }}>
                    Rating for: {rating.sacco_name || `Sacco ID: ${rating.sacco_id}`}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                    <p><strong>Cleanliness:</strong> {rating.cleanliness_rating}/5 ⭐</p>
                    <p><strong>Safety:</strong> {rating.safety_rating}/5 ⭐</p>
                    <p><strong>Service:</strong> {rating.service_rating}/5 ⭐</p>
                    <p><strong>Average:</strong> {rating.average_rating || ((rating.cleanliness_rating + rating.safety_rating + rating.service_rating) / 3).toFixed(1)}/5 ⭐</p>
                  </div>
                  {rating.review_text && (
                    <p style={{ marginTop: '10px', padding: '10px', backgroundColor: '#222', borderRadius: '5px' }}>
                      <strong>Review:</strong> {rating.review_text}
                    </p>
                  )}
                  <p style={{ fontSize: '0.9em', color: '#888', marginTop: '10px' }}>
                    <strong>Date:</strong> {new Date(rating.created_at).toLocaleDateString()} at {new Date(rating.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteRating(rating.id)}
                  style={{ ...deleteButtonStyle, width: '100px', height: '40px' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderClaimsTab = () => (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Claims</h2>
      {claims.length === 0 ? (
        <p>No claims to review.</p>
      ) : (
        claims.map(claim => (
          <div key={claim.id} style={{ backgroundColor: '#111', border: '1px solid #00d4ff33', borderRadius: '10px', padding: '15px', margin: '10px 0', color: '#ddd' }}>
            <h3>Claim ID: {claim.id}</h3>
            <p><strong>Claimer Name:</strong> {claim.claimer_name}</p>
            <p><strong>Contact Info:</strong> {claim.contact_info}</p>
            <p><strong>Details:</strong> {claim.details}</p>
            <p><strong>Lost Item:</strong> {claim.lostitem}</p>
            <p><strong>Description:</strong> {claim.lost_description}</p>
            <p><strong>Route:</strong> {claim.route}</p>
            <p><strong>Sacco:</strong> {claim.sacco}</p>
            <p><strong>Date:</strong> {new Date(claim.date).toLocaleDateString()}</p>
            <button
              onClick={async () => {
                if (!window.confirm('Approve this claim?')) return;
                const res = await fetch(`http://localhost:5000/api/admin/claims/${claim.id}/approve`, {
                  method: 'PUT',
                  credentials: 'include'
                });
                if (res.ok) {
                  alert('Claim approved successfully!');
                  fetchClaims();
                } else {
                  alert('Failed to approve claim');
                }
              }}
              style={approveButtonStyle}
            >
              Approve Claim
            </button>
          </div>
        ))
      )}
    </div>
  );

  const renderUsersTab = () => (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Users Management</h2>
      
      {/* User Creation Section */}
      <div style={{ backgroundColor: '#111', border: '1px solid #00d4ff33', borderRadius: '10px', padding: '20px', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#39ff14' }}>Create New User</h3>
        <form onSubmit={e => { e.preventDefault(); createUser(); }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px', marginBottom: '15px' }}>
            <input 
              style={inputStyle} 
              placeholder="First Name" 
              value={newUser.firstname} 
              onChange={e => setNewUser({ ...newUser, firstname: e.target.value })} 
              required 
            />
            <input 
              style={inputStyle} 
              placeholder="Last Name" 
              value={newUser.lastname} 
              onChange={e => setNewUser({ ...newUser, lastname: e.target.value })} 
              required 
            />
            <input 
              style={inputStyle} 
              placeholder="Username" 
              value={newUser.username} 
              onChange={e => setNewUser({ ...newUser, username: e.target.value })} 
              required 
            />
            <input 
              style={inputStyle} 
              type="password" 
              placeholder="Password" 
              value={newUser.password} 
              onChange={e => setNewUser({ ...newUser, password: e.target.value })} 
              required 
            />
            <input 
              style={inputStyle} 
              type="email" 
              placeholder="Email" 
              value={newUser.email} 
              onChange={e => setNewUser({ ...newUser, email: e.target.value })} 
              required 
            />
            <select 
              style={inputStyle} 
              value={newUser.specify} 
              onChange={e => setNewUser({ ...newUser, specify: e.target.value })} 
              required
            >
              <option value="">Select User Type</option>
              <option value="Driver">Driver</option>
              <option value="Commuter">Commuter</option>
              <option value="admin">Admin</option>
            </select>
            <input 
              style={inputStyle} 
              placeholder="Sacco (optional)" 
              value={newUser.sacco} 
              onChange={e => setNewUser({ ...newUser, sacco: e.target.value })} 
            />
            <input 
              style={inputStyle} 
              placeholder="NTSA License (optional)" 
              value={newUser.ntsa_license} 
              onChange={e => setNewUser({ ...newUser, ntsa_license: e.target.value })} 
            />
          </div>
          <button type="submit" style={createButtonStyle}>Create User</button>
        </form>
      </div>

      {/* Users Table */}
      <div style={{ backgroundColor: '#111', border: '1px solid #00d4ff33', borderRadius: '10px', padding: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Existing Users</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', backgroundColor: 'transparent', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px', borderBottom: '1px solid #00d4ff', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '10px', borderBottom: '1px solid #00d4ff', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '10px', borderBottom: '1px solid #00d4ff', textAlign: 'left' }}>Username</th>
                <th style={{ padding: '10px', borderBottom: '1px solid #00d4ff', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '10px', borderBottom: '1px solid #00d4ff', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '10px', borderBottom: '1px solid #00d4ff', textAlign: 'left' }}>Sacco</th>
                <th style={{ padding: '10px', borderBottom: '1px solid #00d4ff', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #00d4ff33' }}>{user.id}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #00d4ff33' }}>
                    {user.firstname} {user.lastname}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #00d4ff33' }}>{user.username}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #00d4ff33' }}>{user.email}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #00d4ff33' }}>{user.specify}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #00d4ff33' }}>{user.sacco || 'N/A'}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #00d4ff33' }}>
                    <button 
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete user ${user.username}?`)) {
                          deleteItem('users', user.id, fetchUsers);
                        }
                      }} 
                      style={{ ...deleteButtonStyle, width: '80px', margin: 0 }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ...existing code...
const renderRoadUpdatesTab = () => {
  // Filter posts by description or type
  const filteredPosts = posts.filter(post =>
    (post.description?.toLowerCase().includes(postFilter.toLowerCase()) ||
     post.type?.toLowerCase().includes(postFilter.toLowerCase()))
  );

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Road Updates</h2>
      <input
        style={inputStyle}
        placeholder="Filter by description or type..."
        value={postFilter}
        onChange={e => setPostFilter(e.target.value)}
      />
      {filteredPosts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px', marginTop: '1rem' }}>
          {filteredPosts.map(post => (
            <div key={post.id} style={{ backgroundColor: '#111', border: '1px solid #00d4ff33', borderRadius: '10px', padding: '15px', color: '#ddd' }}>
              <h3 style={{ color: '#00d4ff', marginBottom: '10px' }}>{post.type || 'Road Update'}</h3>
              <p>{post.description}</p>
              <p style={{ fontSize: '0.9em', color: '#888', marginTop: '10px' }}>
                <strong>Date:</strong> {new Date(post.created_at).toLocaleString()}
              </p>
              <button
                onClick={() => deletePost(post.id)}
                style={{ ...deleteButtonStyle, width: '100px', height: '40px' }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

  const renderTransportTab = () => (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Routes</h2>
      <form onSubmit={e => { e.preventDefault(); createRoute(); }}>
        <input style={inputStyle} placeholder="Route Name" value={newRoute.display_name} onChange={e => setNewRoute({ display_name: e.target.value })} required />
        <button type="submit" style={createButtonStyle}>Add Route</button>
      </form>
      {routes.map(route => (
        <div key={route.route_id} style={{ ...inputStyle, backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {editingRoute === route.route_id ? (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}>
              <input 
                style={{ ...inputStyle, margin: 0, flex: 1 }}
                value={editData.display_name || ''}
                onChange={e => setEditData({ display_name: e.target.value })}
              />
              <button style={saveButtonStyle} onClick={() => saveEdit('route', route.route_id)}>Save</button>
              <button style={cancelButtonStyle} onClick={cancelEdit}>Cancel</button>
            </div>
          ) : (
            <>
              <span>{route.display_name}</span>
              <div>
                <button style={editButtonStyle} onClick={() => startEditRoute(route)}>Edit</button>
                <button style={deleteButtonStyle} onClick={() => deleteItem('routes', route.route_id, fetchRoutes)}>Delete</button>
              </div>
            </>
          )}
        </div>
      ))}

      <h2 style={{ fontSize: '1.5rem', marginTop: '2rem' }}>Stages</h2>
      <form onSubmit={e => { e.preventDefault(); createStage(); }}>
        <input style={inputStyle} placeholder="Stage Name" value={newStage.name} onChange={e => setNewStage({ ...newStage, name: e.target.value })} required />
        <input style={inputStyle} placeholder="Latitude" value={newStage.latitude} onChange={e => setNewStage({ ...newStage, latitude: e.target.value })} required />
        <input style={inputStyle} placeholder="Longitude" value={newStage.longitude} onChange={e => setNewStage({ ...newStage, longitude: e.target.value })} required />
        <button type="submit" style={createButtonStyle}>Add Stage</button>
      </form>
      {stages.map(stage => (
        <div key={stage.stage_id} style={{ ...inputStyle, backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {editingStage === stage.stage_id ? (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}>
              <input 
                style={{ ...inputStyle, margin: 0, flex: 1 }}
                placeholder="Name"
                value={editData.name || ''}
                onChange={e => setEditData({ ...editData, name: e.target.value })}
              />
              <input 
                style={{ ...inputStyle, margin: 0, flex: 1 }}
                placeholder="Latitude"
                value={editData.latitude || ''}
                onChange={e => setEditData({ ...editData, latitude: e.target.value })}
              />
              <input 
                style={{ ...inputStyle, margin: 0, flex: 1 }}
                placeholder="Longitude"
                value={editData.longitude || ''}
                onChange={e => setEditData({ ...editData, longitude: e.target.value })}
              />
              <button style={saveButtonStyle} onClick={() => saveEdit('stage', stage.stage_id)}>Save</button>
              <button style={cancelButtonStyle} onClick={cancelEdit}>Cancel</button>
            </div>
          ) : (
            <>
              <span>{stage.name} (Lat: {stage.latitude}, Lng: {stage.longitude})</span>
              <div>
                <button style={editButtonStyle} onClick={() => startEditStage(stage)}>Edit</button>
                <button style={deleteButtonStyle} onClick={() => deleteItem('stages', stage.stage_id, fetchStages)}>Delete</button>
              </div>
            </>
          )}
        </div>
      ))}

      <h2 style={{ fontSize: '1.5rem', marginTop: '2rem' }}>SACCOs</h2>
      <form onSubmit={e => { e.preventDefault(); createSacco(); }}>
        <input style={inputStyle} placeholder="Sacco Name" value={newSacco.sacco_name} onChange={e => setNewSacco({ ...newSacco, sacco_name: e.target.value })} required />
        <input style={inputStyle} placeholder="Base Fare Range" value={newSacco.base_fare_range} onChange={e => setNewSacco({ ...newSacco, base_fare_range: e.target.value })} required />
        <input style={inputStyle} placeholder="Route ID" value={newSacco.route_id} onChange={e => setNewSacco({ ...newSacco, route_id: e.target.value })} required />
        <input style={inputStyle} placeholder="Stage ID" value={newSacco.sacco_stage_id} onChange={e => setNewSacco({ ...newSacco, sacco_stage_id: e.target.value })} required />
        <button type="submit" style={createButtonStyle}>Add Sacco</button>
      </form>
      {saccos.map(sacco => (
        <div key={sacco.sacco_id} style={{ ...inputStyle, backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {editingSacco === sacco.sacco_id ? (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}>
              <input 
                style={{ ...inputStyle, margin: 0, flex: 1 }}
                placeholder="Sacco Name"
                value={editData.sacco_name || ''}
                onChange={e => setEditData({ ...editData, sacco_name: e.target.value })}
              />
              <input 
                style={{ ...inputStyle, margin: 0, flex: 1 }}
                placeholder="Base Fare Range"
                value={editData.base_fare_range || ''}
                onChange={e => setEditData({ ...editData, base_fare_range: e.target.value })}
              />
              <input 
                style={{ ...inputStyle, margin: 0, flex: 1 }}
                placeholder="Route ID"
                value={editData.route_id || ''}
                onChange={e => setEditData({ ...editData, route_id: e.target.value })}
              />
              <input 
                style={{ ...inputStyle, margin: 0, flex: 1 }}
                placeholder="Stage ID"
                value={editData.sacco_stage_id || ''}
                onChange={e => setEditData({ ...editData, sacco_stage_id: e.target.value })}
              />
              <button style={saveButtonStyle} onClick={() => saveEdit('sacco', sacco.sacco_id)}>Save</button>
              <button style={cancelButtonStyle} onClick={cancelEdit}>Cancel</button>
            </div>
          ) : (
            <>
              <span>{sacco.sacco_name} - Fare: {sacco.base_fare_range} (Route ID: {sacco.route_id}, Stage ID: {sacco.sacco_stage_id})</span>
              <div>
                <button style={editButtonStyle} onClick={() => startEditSacco(sacco)}>Edit</button>
                <button style={deleteButtonStyle} onClick={() => deleteItem('saccos', sacco.sacco_id, fetchSaccos)}>Delete</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );

return (
  <div style={{ padding: '2rem', fontFamily: 'monospace', backgroundColor: '#0a0a0a', color: '#00d4ff', minHeight: '100vh' }}>
    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Admin Dashboard</h1>
    <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      <button style={activeTab === 'users' ? { backgroundColor: '#39ff14', color: '#000', ...inputStyle } : { backgroundColor: '#333', color: '#00d4ff', ...inputStyle }} onClick={() => setActiveTab('users')}>Manage Users</button>
      <button style={activeTab === 'claims' ? { backgroundColor: '#39ff14', color: '#000', ...inputStyle } : { backgroundColor: '#333', color: '#00d4ff', ...inputStyle }} onClick={() => setActiveTab('claims')}>Review Claims ({claims.length})</button>
      <button style={activeTab === 'transport' ? { backgroundColor: '#39ff14', color: '#000', ...inputStyle } : { backgroundColor: '#333', color: '#00d4ff', ...inputStyle }} onClick={() => setActiveTab('transport')}>Manage Transport Data</button>
      <button style={activeTab === 'ratings' ? { backgroundColor: '#39ff14', color: '#000', ...inputStyle } : { backgroundColor: '#333', color: '#00d4ff', ...inputStyle }} onClick={() => setActiveTab('ratings')}>Manage Ratings ({ratings.length})</button>
      <button style={activeTab === 'roadupdates' ? { backgroundColor: '#39ff14', color: '#000', ...inputStyle } : { backgroundColor: '#333', color: '#00d4ff', ...inputStyle }} onClick={() => setActiveTab('roadupdates')}>Road Updates</button>
    </div>
    {activeTab === 'users' && renderUsersTab()}
    {activeTab === 'claims' && renderClaimsTab()}
    {activeTab === 'transport' && renderTransportTab()}
    {activeTab === 'ratings' && renderRatingsTab()}
    {activeTab === 'roadupdates' && renderRoadUpdatesTab()}
    <button onClick={handleLogout} style={logoutButtonStyle}>Logout</button>
  </div>
);
}  

export default AdminDashboard;










