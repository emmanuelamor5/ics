import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    username: '',
    password: '',
    email: '',
    specify: 'driver'
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert('Signup successful! Please log in.');
      navigate('/');
    } else {
      const data = await res.json();
      alert(data.message || 'Signup failed');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input name="firstname" value={form.firstname} onChange={handleChange} placeholder="First Name" required /><br />
        <input name="lastname" value={form.lastname} onChange={handleChange} placeholder="Last Name" required /><br />
        <input name="username" value={form.username} onChange={handleChange} placeholder="Username" required /><br />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required type="email" /><br />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Password" required type="password" /><br />
        <select name="specify" value={form.specify} onChange={handleChange} required>
          <option value="Driver">Driver</option>
          <option value="Commuter">Commuter</option>
        </select><br />
        <button type="submit">Sign Up</button>
      </form>

      {/* ✅ React Router Link */}
      <p style={{ marginTop: '20px' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'white', textDecoration: 'underline' }}>
          Log in here
        </Link>
      </p>
    </div>
  );
}


