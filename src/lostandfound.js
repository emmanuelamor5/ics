import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClaimForm from './claim';

const LostAndFound = () => {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ lostitem: '', route: '', date: '', sacco: '', description: '', image: null });
  const [showClaimFormId, setShowClaimFormId] = useState(null);
  const navigate = useNavigate();

  // Fetch current user and lost items
  useEffect(() => {
    const fetchUserAndItems = async () => {
      try {
        const resUser = await fetch('http://localhost:5000/api/me', { credentials: 'include' });
        if (!resUser.ok) throw new Error('Not logged in');
        const userData = await resUser.json();
        setUser(userData);
        fetchItems();
      } catch {
        navigate('/');
      }
    };

    fetchUserAndItems();
  }, [navigate]);

 const fetchItems = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/lost-items');
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error('Unexpected response format:', data);
      return;
    }

    const grouped = groupItemsWithClaims(data);
    setItems(grouped);
  } catch (err) {
    console.error('Error fetching items:', err);
  }
};
 

  const groupItemsWithClaims = (data) => {
    const map = new Map();
    data.forEach(item => {
      if (!map.has(item.id)) {
        map.set(item.id, { ...item, claims: [] });
      }
      if (item.claimer_name) {
        map.get(item.id).claims.push({
          id: item.claim_id,
          claimer_name: item.claimer_name,
          contact_info: item.contact_info,
          details: item.claim_details,
          is_confirmed: item.is_confirmed,
          is_approved: item.is_approved,
          created_at: item.claim_created_at
        });
      }
    });
    return Array.from(map.values());
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    Object.entries(form).forEach(([key, val]) => val && payload.append(key, val));

    try {
      const res = await fetch('http://localhost:5000/api/lost-item', {
        method: 'POST',
        body: payload,
        credentials: 'include'
      });

      if (res.ok) {
        alert('Lost item reported.');
        setForm({ lostitem: '', route: '', date: '', sacco: '', description: '', image: null });
        fetchItems();
      } else {
        alert('Failed to report item.');
      }
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const handleClaimSubmit = async (lost_item_id, claimData) => {
    try {
      const res = await fetch('http://localhost:5000/api/claim-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          lost_item_id,
          claimer_name: claimData.name,
          contact_info: claimData.phone,
          details: claimData.reason
        })
      });

      if (res.ok) {
        alert('Claim submitted to driver. Awaiting confirmation.');
        setShowClaimFormId(null);
        fetchItems();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to submit claim');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting claim');
    }
  };

 const handleDriverConfirmClaim = async (claimId) => {
  if (!claimId) {
    alert('Invalid claim ID');
    return;
  }

  if (!window.confirm('Are you sure you want to confirm this claim?')) return;

  try {
    const res = await fetch(`http://localhost:5000/api/claims/${claimId}/confirm`, {
      method: 'PUT',
      credentials: 'include'
    });

    if (res.ok) {
      alert('Claim confirmed! Sent to admin for approval.');
      fetchItems();
    } else {
      const data = await res.json();
      alert(data.message || 'Failed to confirm claim');
    }
  } catch (err) {
    console.error(err);
    alert('Error confirming claim');
  }
};


  const handleDeleteItem = async (lost_item_id) => {
    if (user?.specify !== 'Admin') {
      alert('Only admin can delete items.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/admin/lost-item/${lost_item_id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        alert('Item deleted successfully.');
        fetchItems();
      } else {
        alert('Failed to delete item.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting item.');
    }
  };

  const handleDriverDeleteItem = async (lostItemId) => {
  if (!window.confirm('Are you sure you want to delete this post? It has been approved.')) return;

  try {
    const res = await fetch(`http://localhost:5000/api/lost-item/${lostItemId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const data = await res.json();
    if (res.ok) {
      alert(data.message || 'Item deleted.');
      fetchItems();
    } else {
      alert(data.error || 'Failed to delete item.');
    }
  } catch (err) {
    console.error('Error deleting post:', err);
    alert('Error occurred while deleting the post.');
  }
};


  // Group items by ID to handle multiple claims per item
  const groupedItems = items.reduce((acc, item) => {
    const existingItem = acc.find(i => i.id === item.id);
    if (existingItem) {
      if (item.claimer_name) {
        existingItem.claims = existingItem.claims || [];
        existingItem.claims.push({
          id: item.claim_id,
          claimer_name: item.claimer_name,
          contact_info: item.contact_info,
          details: item.claim_details,
          is_confirmed: item.is_confirmed,
          is_approved: item.is_approved,
          created_at: item.claim_created_at
        });
      }
    } else {
      const newItem = { ...item };
      if (item.claimer_name) {
        newItem.claims = [{
          id: item.claim_id,
          claimer_name: item.claimer_name,
          contact_info: item.contact_info,
          details: item.claim_details,
          is_confirmed: item.is_confirmed,
          is_approved: item.is_approved,
          created_at: item.claim_created_at
        }];
      }
      acc.push(newItem);
    }
    return acc;
  }, []);

  return (
    <>
      <style>{`
        body {
          background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
          font-family: 'Courier New', monospace;
          color: #00fff7;
        }

        .page-container {
          padding: 40px;
        }

        .auth-box {
          background: rgba(10, 10, 20, 0.6);
          backdrop-filter: blur(12px);
          padding: 30px;
          border-radius: 16px;
          border: 1px solid rgba(0, 255, 247, 0.2);
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
          max-width: 800px;
          margin: auto;
        }

        .auth-box h2, .auth-box h3 {
          text-align: center;
          color: #39ff14;
          margin-bottom: 20px;
        }

        .post-form input,
        .post-form select,
        .post-form textarea {
          width: 100%;
          margin-bottom: 12px;
          padding: 10px;
          border-radius: 8px;
          background: #1c1c3b;
          color: #00fff7;
          border: 1px solid #00fff755;
        }

        .post-form button {
          width: 100%;
          padding: 12px;
          background: linear-gradient(90deg, #00fff7, #39ff14);
          color: #000;
          font-weight: bold;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.3s;
        }

        .post-form button:hover {
          transform: scale(1.02);
          box-shadow: 0 0 12px #00fff7aa;
        }

        .auth-box img {
          margin-top: 10px;
          width: 100%;
          border-radius: 10px;
          max-height: 300px;
          object-fit: cover;
        }

        .item-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid #00fff733;
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 20px;
          color: #ddd;
        }

        .item-card button {
          margin: 5px 5px 5px 0;
          padding: 8px 12px;
          border-radius: 6px;
          border: none;
          background: #39ff14;
          color: #000;
          font-weight: bold;
          cursor: pointer;
        }

        .item-card button:hover {
          background: #00fff7;
        }

        .alert-box {
          background: rgba(0, 255, 247, 0.05);
          border: 1px solid #00fff7aa;
          border-radius: 8px;
          padding: 16px;
          margin-top: 15px;
        }

        .alert-box h4 {
          color: #39ff14;
          margin-bottom: 10px;
        }

        .claim-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid #00fff722;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 10px;
        }

        .admin-delete, .danger-btn {
          background: #ff4d4d !important;
          color: #fff !important;
        }

        .confirm-btn {
          background: #28a745 !important;
          color: #fff !important;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8em;
          font-weight: bold;
          margin-left: 10px;
        }

        .status-pending {
          background: #ffc107;
          color: #000;
        }

        .status-confirmed {
          background: #17a2b8;
          color: #fff;
        }

        .status-approved {
          background: #28a745;
          color: #fff;
        }
      `}</style>

      <div className="page-container">
        <div className="auth-box">
          <h2>Lost & Found</h2>

          {user?.specify === 'Driver' && (
            <>
              <h3>Report Lost Item</h3>
              <form onSubmit={handleSubmit} className="post-form">
                <input 
                  type="text" 
                  name="lostitem" 
                  placeholder="Item Description (e.g. Phone, ID)" 
                  value={form.lostitem}
                  onChange={handleChange} 
                  required 
                />
                <input 
                  type="text" 
                  name="route" 
                  placeholder="Route (e.g. CBD to Westlands)" 
                  value={form.route}
                  onChange={handleChange} 
                  required 
                />
                <input 
                  type="date" 
                  name="date" 
                  value={form.date}
                  onChange={handleChange} 
                  required 
                />
                <input 
                  type="text" 
                  name="sacco" 
                  placeholder="SACCO (e.g. City Hoppa)" 
                  value={form.sacco}
                  onChange={handleChange} 
                  required 
                />
                <textarea 
                  name="description" 
                  placeholder="Additional details (e.g. Found under seat, Lost during morning trip...)" 
                  value={form.description}
                  onChange={handleChange} 
                />
                <input 
                  type="file" 
                  name="image" 
                  accept="image/*" 
                  onChange={handleChange} 
                />
                <button type="submit">Report Item</button>
              </form>
            </>
          )}

          <h3>Recent Items</h3>
          {groupedItems.length === 0 && <p>No items reported yet.</p>}

          {groupedItems.map((item) => (
            <div key={item.id} className="item-card">
              <strong>{item.description?.toLowerCase().includes('found') ? 'Found:' : 'Lost:'}</strong> {item.lostitem}<br />
              <strong>Route:</strong> {item.route}<br />
              <strong>Date:</strong> {new Date(item.date).toLocaleDateString()}<br />
              <strong>Sacco:</strong> {item.sacco}<br />
              <strong>Description:</strong> {item.description || 'No additional details'}<br />
              <strong><em>Posted: {new Date(item.created_at).toLocaleString()}</em></strong><br />
              
              {item.image_url && (
                <img src={`http://localhost:5000${item.image_url}`} alt="Item" />
              )}

              {/* Commuter can claim items */}
              {user?.specify === 'Commuter' && (
                <>
                  {showClaimFormId === item.id ? (
                    <ClaimForm
                      item={item}
                      onClose={() => setShowClaimFormId(null)}
                      onSubmit={(formData) => handleClaimSubmit(item.id, formData)}
                    />
                  ) : (
                    <button onClick={() => setShowClaimFormId(item.id)}>Claim This Item</button>
                  )}
                </>
              )}

              {/* Display claims for drivers */}
              {user?.specify === 'Driver' && item.claims && item.claims.length > 0 && (
                <div className="alert-box">
                  <h4>🚨 Claims for this item:</h4>
                  {item.claims.map((claim) => (
                    <div key={claim.id} className="claim-item">
                      <p><strong>Claimer:</strong> {claim.claimer_name}
                        {claim.is_approved && <span className="status-badge status-approved">APPROVED</span>}
                        {claim.is_confirmed && !claim.is_approved && <span className="status-badge status-confirmed">AWAITING ADMIN</span>}
                        {!claim.is_confirmed && <span className="status-badge status-pending">PENDING</span>}
                      </p>
                      <p><strong>Contact:</strong> {claim.contact_info}</p>
                      <p><strong>Reason:</strong> {claim.details}</p>
                      <p><strong>Claimed:</strong> {new Date(claim.created_at).toLocaleDateString()}</p>
                      
                      {!claim.is_confirmed && (
                        <button 
                          className="confirm-btn"
                          onClick={() => handleDriverConfirmClaim(claim.id)}
                        >
                          ✅ Confirm Claim
                        </button>
                        
                      )}
                      
                      {item.claims.some(c => c.is_approved) && (
  <button
    className="danger-btn"
    onClick={() => handleDriverDeleteItem(item.id)}
  >
    🗑️ Delete Post (Approved)
  </button>
)}

                    </div>

                  ))}
                </div>
              )}

              {/* Admin can delete items */}
              {user?.specify === 'Admin' && (
                <button 
                  className="admin-delete" 
                  onClick={() => handleDeleteItem(item.id)}
                >
                  Delete Item
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default LostAndFound;






