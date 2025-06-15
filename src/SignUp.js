import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    username: '',
    password: '',
    email: '',
    specify: 'Driver'
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
    <div className="page-container">
      <div className="auth-box">
        <h1>Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <input
            name="firstname"
            value={form.firstname}
            onChange={handleChange}
            placeholder="First Name"
            required
          />
          <input
            name="lastname"
            value={form.lastname}
            onChange={handleChange}
            placeholder="Last Name"
            required
          />
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Username"
            required
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
          <select
            name="specify"
            value={form.specify}
            onChange={handleChange}
            required
          >
            <option value="Driver">Driver</option>
            <option value="Commuter">Commuter</option>
          </select>
          <button type="submit">Sign Up</button>
        </form>

        <p>
          Already have an account?{' '}
          <Link to="/login">Log in here</Link>
        </p>
      </div>
    </div>
  );
}



