
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LostAndFound = () => {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ lostitem: '', route: '', date: '', sacco:'', description: '', image: null });
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject('Not logged in'))
      .then(data => setUser(data))
      .catch(() => navigate('/'));

    fetch('http://localhost:5000/api/lost-items')
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error(err));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
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
        window.location.reload();
      } else {
        alert('Failed to submit report');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting report');
    }
  };

  return (
    <div className="page-container">
      <div className="auth-box">
        <h2 style={{ textAlign: 'center' }}>Lost & Found</h2>
        {user?.role === 'Driver' && (
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
            <strong>{item.description.toLowerCase().includes('found') ? 'Found:' : 'Lost:'}</strong> {item.lostitem}<br />
            <strong>Route:</strong> {item.route}<br />
            <strong>Date:</strong> {new Date(item.date).toLocaleDateString()}<br />
            {item.image_url && <img src={`http://localhost:5000${item.image_url}`} alt="Item" style={{ maxWidth: '100%', borderRadius: '5px' }} />}
           {item.description.toLowerCase().includes('found') ? (
  <button style={{ marginTop: '10px' }} onClick={() =>navigate('/claim', { state: { itemId: item.id } })}
>
    This Is Mine
  </button>
) : (
  <button style={{ marginTop: '10px' }}>
    I Found This
  </button>
)}
 
          </div>
        ))}
      </div>
    </div>
  );
};

export default LostAndFound;
