import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const data = await res.json();
      const role = (data.specify || '').toLowerCase();

      if (res.ok) {
        alert('Login successful!');
        if (role === 'driver') navigate('/driver-dashboard');
        else if (role === 'commuter') navigate('/dashboard');
        else if (role === 'admin') navigate('/profile');
        else navigate('/profile');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
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

        .login-box input {
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

        .login-box input:focus {
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

        .login-error {
          color: #ff4d4d;
          text-align: center;
          margin-top: 15px;
          font-size: 0.95rem;
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
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <input
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button type="submit">Login</button>
          </form>

          

          {error && <p className="login-error">{error}</p>}
        </div>
      </div>
    </>
  );
}

export default Login;







