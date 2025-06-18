import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ClaimForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemId } = location.state || {};  // `itemId` of the claimed item

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Submit claim data
      const res = await fetch('http://localhost:5000/api/claim-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ ...form, itemId })
      });

      if (!res.ok) {
        throw new Error('Failed to claim item');
      }

      // Ask user if they want to delete the original lost item post
      const confirmDelete = window.confirm('Do you want to delete your lost item report now that it’s found?');
      if (confirmDelete && itemId) {
        await fetch(`http://localhost:5000/api/delete-lost-item/${itemId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        alert('Item deleted successfully!');
      }

      alert('Claim submitted successfully!');
      navigate('/dashboard');  // Go back to dashboard or another page

    } catch (err) {
      console.error(err);
      alert('There was an error processing your claim.');
    }
  };

  return (
    <div className="auth-box">
      <h2>Claim This Item</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="fullName" placeholder="Your Full Name" onChange={handleChange} required />
        <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} required />
        <textarea name="description" placeholder="Describe the item to confirm it's yours" onChange={handleChange} required />
        <button type="submit">Submit Claim</button>
      </form>
    </div>
  );
};

export default ClaimForm;


