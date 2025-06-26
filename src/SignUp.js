import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    username: '',
    password: '',
    email: '',
    specify: 'Driver',
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
    <>
      <style>{`
        body {
          font-family: 'Courier New', monospace;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a0b2e 50%, #0a0a0a 100%);
          color: #00d4ff;
          overflow: hidden;
          min-height: 100vh;
        }

        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          padding: 20px;
        }

        .login-box {
          background: rgba(26, 11, 46, 0.5);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 15px;
          padding: 40px;
          max-width: 400px;
          width: 100%;
          backdrop-filter: blur(15px);
          box-shadow: 0 0 25px rgba(0, 212, 255, 0.2);
          animation: pulseBox 4s infinite alternate;
        }

        @keyframes pulseBox {
          0% { box-shadow: 0 0 25px rgba(0, 212, 255, 0.2); }
          100% { box-shadow: 0 0 50px rgba(57, 255, 20, 0.4); }
        }

        .login-box h2 {
          color: #39ff14;
          text-align: center;
          margin-bottom: 25px;
          text-transform: uppercase;
          font-size: 1.8rem;
        }

        .login-box input,
        .login-box select {
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 18px;
          border-radius: 8px;
          border: 1px solid rgba(0, 212, 255, 0.3);
          background: rgba(0,0,0,0.1);
          color: #00d4ff;
          font-family: inherit;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s ease;
        }

        .login-box input:focus,
        .login-box select:focus {
          border-color: #39ff14;
          box-shadow: 0 0 15px rgba(57, 255, 20, 0.3);
        }

        .login-box button {
          width: 100%;
          padding: 12px;
          background: linear-gradient(45deg, #00d4ff, #39ff14);
          color: #0a0a0a;
          font-weight: bold;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          text-transform: uppercase;
          transition: all 0.3s ease;
        }

        .login-box button:hover {
          transform: scale(1.03);
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
        }

        .forgot-password {
          margin-top: 12px;
          text-align: center;
        }

        .forgot-password a {
          color: #00d4ff;
          font-size: 0.95rem;
          text-decoration: none;
          transition: color 0.3s;
        }

        .forgot-password a:hover {
          color: #39ff14;
          text-shadow: 0 0 10px rgba(57, 255, 20, 0.5);
        }
      `}</style>

      <div className="login-container">
        <div className="login-box">
          <h2>Sign Up</h2>
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
                    {form.specify === 'Driver' && (
          <>
            <input
              type="text"
              name="sacco"
              placeholder="Sacco Name or ID"
              value={form.sacco}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="ntsa_license"
              placeholder="NTSA License Number"
              value={form.ntsa_license}
              onChange={handleChange}
              required
            />
          </>
        )}

            <button type="submit">Sign Up</button>
          </form>
          <div className="forgot-password">
            Already have an account?{' '}
            <Link to="/login">Log in here</Link>
          </div>
        </div>
      </div>
    </>
  );
}





