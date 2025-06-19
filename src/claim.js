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
      <div style={styles.card}>
        <h3>Claim submitted!</h3>
        <button style={styles.button} onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Claim Item: {item.lostitem}</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={claimForm.name}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={claimForm.phone}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <textarea
          name="reason"
          placeholder="Why do you believe this item is yours?"
          value={claimForm.reason}
          onChange={handleChange}
          required
          style={styles.textarea}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button type="submit" style={styles.button}>Submit Claim</button>
          <button type="button" onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  card: {
    maxWidth: '450px',
    margin: '0 auto',
    padding: '25px',
    backgroundColor: '#ffffff',
    border: '1px solid #ddd',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    marginBottom: '20px',
    textAlign: 'center',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  textarea: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    minHeight: '80px',
    resize: 'vertical',
    fontSize: '16px',
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    flex: 1,
  },
  cancelButton: {
    padding: '10px 15px',
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    flex: 1,
    marginLeft: '10px',
  }
};

export default ClaimForm;


