import React, { useState } from 'react';

const ClaimForm = ({ item, onClose }) => {
  const [claimForm, setClaimForm] = useState({
    name: '',
    phone: '',
    reason: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClaimForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/claim-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          lost_item_id: item.id,
          claimer_name: claimForm.name,
          contact_info: claimForm.phone,
          details: claimForm.reason
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Claim submitted!');
        setSubmitted(true);
      } else {
        alert(data.message || 'Failed to submit claim');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting claim');
    }
  };

  if (submitted) {
    return (
      <>
        <style>{cyberpunkStyle}</style>
        <div className="cyber-form">
          <h3 className="cyber-title">Claim submitted!</h3>
          <button className="cyber-button" onClick={onClose}>Close</button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{cyberpunkStyle}</style>
      <div className="cyber-form">
        <h3 className="cyber-title">Claim Item: {item.lostitem}</h3>
        <form onSubmit={handleSubmit} className="cyber-form-content">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={claimForm.name}
            onChange={handleChange}
            required
            className="cyber-input"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={claimForm.phone}
            onChange={handleChange}
            required
            className="cyber-input"
          />
          <textarea
            name="reason"
            placeholder="Why do you believe this item is yours?"
            value={claimForm.reason}
            onChange={handleChange}
            required
            className="cyber-textarea"
          />
          <div className="cyber-buttons">
            <button type="submit" className="cyber-button">Submit Claim</button>
            <button type="button" className="cyber-cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </>
  );
};

const cyberpunkStyle = `
  .cyber-form {
    max-width: 500px;
    margin: 0 auto;
    padding: 30px;
    background: rgba(10, 10, 30, 0.8);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 12px;
    box-shadow: 0 0 25px rgba(0, 212, 255, 0.2);
    backdrop-filter: blur(10px);
    font-family: 'Courier New', monospace;
    color: #00d4ff;
    animation: pulseForm 3s infinite alternate;
  }

  @keyframes pulseForm {
    0% { box-shadow: 0 0 25px rgba(0, 212, 255, 0.2); }
    100% { box-shadow: 0 0 50px rgba(57, 255, 20, 0.3); }
  }

  .cyber-title {
    text-align: center;
    font-size: 1.5rem;
    color: #39ff14;
    margin-bottom: 20px;
  }

  .cyber-form-content {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .cyber-input, .cyber-textarea {
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 8px;
    color: #00d4ff;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;
  }

  .cyber-input:focus, .cyber-textarea:focus {
    border-color: #39ff14;
    box-shadow: 0 0 10px rgba(57, 255, 20, 0.4);
  }

  .cyber-textarea {
    min-height: 100px;
    resize: vertical;
  }

  .cyber-buttons {
    display: flex;
    gap: 10px;
  }

  .cyber-button, .cyber-cancel {
    flex: 1;
    padding: 12px;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    text-transform: uppercase;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .cyber-button {
    background: linear-gradient(45deg, #00d4ff, #39ff14);
    color: #0a0a0a;
  }

  .cyber-cancel {
    background: linear-gradient(45deg, #e74c3c, #ff6f61);
    color: #fff;
  }

  .cyber-button:hover, .cyber-cancel:hover {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
  }
`;

export default ClaimForm;



