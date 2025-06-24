import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClaimForm from './claim';

const LostAndFound = () => {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ lostitem: '', route: '', date: '', sacco: '', description: '', image: null });
  const [showClaimForm, setShowClaimForm] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(null);
  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/lost-items');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject('Not logged in'))
      .then(data => setUser(data))
      .catch(() => navigate('/'));
    fetchItems();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) payload.append(key, value);
    });

    try {
      const res = await fetch('http://localhost:5000/api/lost-item', {
        method: 'POST',
        body: payload,
        credentials: 'include'
      });
      if (res.ok) {
        alert('Report submitted!');
        fetchItems();
      } else {
        alert('Failed to submit report');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting report');
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
          details: claimData.reason,
          created_at: claimData.date
        })
      });

      if (res.ok) {
        alert('Claim submitted to driver. Awaiting confirmation.');
        setShowClaimForm(null);
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

  const handleDeleteItem = async (lost_item_id) => {
    if (user?.role !== 'Admin') {
      alert('Only admin can delete items.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/delete-lost-item/${lost_item_id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        alert('Item deleted successfully.');
        setShowConfirmationModal(null);
        fetchItems();
      } else {
        alert('Failed to delete item.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting item.');
    }
  };

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
          margin-top: 10px;
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
        }

        .admin-delete {
          background: #ff4d4d;
          color: #fff;
          margin-top: 10px;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
        }
      `}</style>

      <div className="page-container">
        <div className="auth-box">
          <h2>Lost & Found</h2>

          {user?.specify === 'Driver' && (
            <>
              <h3>Report Lost Item</h3>
              <form onSubmit={handleSubmit} className="post-form">
                <input type="text" name="lostitem" placeholder="Item Description (e.g. Phone, ID)" onChange={handleChange} required />
                <input type="text" name="route" placeholder="Route (e.g. CBD to Westlands)" onChange={handleChange} required />
                <input type="date" name="date" onChange={handleChange} required />
                <input type="text" name="sacco" placeholder="SACCO (e.g. City Hoppa)" onChange={handleChange} required />
                <textarea name="description" placeholder="Additional details..." onChange={handleChange} />
                <input type="file" name="image" accept="image/*" onChange={handleChange} />
                <button type="submit">Report Lost Item</button>
              </form>
            </>
          )}

          <h3>Recent Items</h3>
          {items.length === 0 && <p>No lost items reported yet.</p>}

          {items.map((item, idx) => (
            <div key={idx} className="item-card">
              <strong>{item.description?.toLowerCase().includes('found') ? 'Found:' : 'Lost:'}</strong> {item.lostitem}<br />
              <strong>Route:</strong> {item.route}<br />
              <strong>Sacco:</strong> {item.sacco}<br />
              <strong><em>Posted at: {new Date(item.created_at).toLocaleString()}</em></strong><br />
              {item.image_url && <img src={`http://localhost:5000${item.image_url}`} alt="Item" />}

              {user?.specify === 'Commuter' && item.description?.toLowerCase().includes('found') && (
                <>
                  {showClaimForm === item.id ? (
                    <ClaimForm
                      item={item}
                      onClose={() => setShowClaimForm(null)}
                      onSubmit={(formData) => handleClaimSubmit(item.id, formData)}
                    />
                  ) : (
                    <button onClick={() => setShowClaimForm(item.id)}>This Is Mine</button>
                  )}
                </>
              )}

              {user?.specify === 'Driver' && item.claimer_name && (
                <div className="alert-box">
                  <h4>🚨 Claim Alert</h4>
                  <p><strong>Claimer:</strong> {item.claimer_name}</p>
                  <p><strong>Contact:</strong> {item.contact_info}</p>
                  <p><strong>Reason:</strong> {item.claim_details}</p>
                  <p><strong>Date:</strong> {new Date(item.created_at).toLocaleDateString()}</p>
                  <button onClick={() => setShowConfirmationModal(item.id)}>✅ Confirm & Remove from List</button>
                </div>
              )}

              {user?.specify === 'Admin' && (
                <button className="admin-delete" onClick={() => handleDeleteItem(item.id)}>Delete</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default LostAndFound;






