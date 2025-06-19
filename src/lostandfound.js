import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClaimForm from './claim'; 

const LostAndFound = () => {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ lostitem: '', route: '', date: '', sacco:'', description: '', image: null });
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
          created_at:claimData.date
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
    <div className="page-container">
      <div className="auth-box">
        <h2 style={{ textAlign: 'center' }}>Lost & Found</h2>
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

        <h3 style={{ marginTop: '30px' }}>Recent Items</h3>
        {items.length === 0 && <p>No lost items reported yet.</p>}
        {items.map((item, idx) => (
          <div key={idx} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '8px' }}>
            <strong>{item.description?.toLowerCase().includes('found') ? 'Found:' : 'Lost:'}</strong> {item.lostitem}<br />
            <strong>Route:</strong> {item.route}<br />
            <strong>Sacco:</strong> {item.sacco}<br />
            <strong>Details:</strong> {item.description}<br />
            <strong><em>Posted at: {new Date(item.created_at).toLocaleString()}</em></strong><br />
            {item.image_url && <img src={`http://localhost:5000${item.image_url}`} alt="Item" style={{ maxWidth: '100%', borderRadius: '5px' }} />}

            {user?.specify === 'Commuter' && item.description?.toLowerCase().includes('found') && (
              <>
                {showClaimForm === item.id ? (
                  <ClaimForm
                    item={item}
                    onClose={() => setShowClaimForm(null)}
                    onSubmit={(formData) => handleClaimSubmit(item.id, formData)}
                  />
                ) : (
                  <button style={{ marginTop: '10px' }} onClick={() => setShowClaimForm(item.id)}>This Is Mine</button>
                )}
              </>
            )}

            {user?.specify === 'Driver' && item.claimer_name && (
  <div style={{
    backgroundColor: '#f0f9ff',
    border: '1px solid #90cdf4',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '15px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
  }}>
    <h4 style={{ margin: '0 0 10px 0', color: '#2b6cb0' }}>🚨 Claim Alert</h4>
    <p><strong>Claimer:</strong> {item.claimer_name}</p>
    <p><strong>Contact:</strong> {item.contact_info}</p>
    <p><strong>Reason:</strong> {item.claim_details}</p>
    <p><strong>Date:</strong> {new Date(item.created_at).toLocaleDateString()}</p>

    <button
      onClick={() => setShowConfirmationModal(item.id)}
      style={{
        marginTop: '10px',
        backgroundColor: '#38a169',
        color: '#fff',
        padding: '8px 12px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      ✅ Confirm & Remove from List
    </button>
  </div>
)}

            {user?.specify === 'Admin' && (
              <button style={{ marginTop: '10px', backgroundColor: '#f44336', color: '#fff' }} onClick={() => handleDeleteItem(item.id)}>Delete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LostAndFound;





