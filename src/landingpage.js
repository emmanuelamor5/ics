import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        body {
          font-family: 'Courier New', monospace;
          background: linear-gradient(135deg, #0a0a0a, #1a0b2e);
          color: #00d4ff;
          overflow-x: hidden;
          min-height: 100vh;
        }

        .cyber-grid {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          z-index: -2;
          animation: gridPulse 4s ease-in-out infinite;
        }

        @keyframes gridPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        .landing-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          text-align: center;
          padding: 2rem;
          position: relative;
          z-index: 1;
        }

        .landing-container h1 {
          font-size: 3.5rem;
          background: linear-gradient(45deg, #00d4ff, #39ff14, #ff1493);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
          text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
          animation: logoGlow 2s ease-in-out infinite alternate;
        }

        @keyframes logoGlow {
          0% { filter: drop-shadow(0 0 10px #00d4ff); }
          100% { filter: drop-shadow(0 0 20px #39ff14); }
        }

        .landing-container p {
          color: #00d4ff;
          font-size: 1.2rem;
          max-width: 700px;
          margin-bottom: 2rem;
        }

        .landing-buttons {
          display: flex;
          gap: 1rem;
        }

        .landing-buttons button {
          background: linear-gradient(45deg, #00d4ff, #39ff14);
          border: none;
          color: #0a0a0a;
          padding: 14px 28px;
          border-radius: 25px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .landing-buttons button:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 20px rgba(0, 212, 255, 0.4);
        }

        .landing-footer {
          position: absolute;
          bottom: 15px;
          color: rgba(0, 212, 255, 0.4);
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .landing-container h1 {
            font-size: 2.2rem;
          }

          .landing-buttons {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>

      <div className="cyber-grid"></div>

      <div className="landing-container">
        <h1>Matatu Connect</h1>
        <p>
          Reimagine Nairobi commuting. Find routes, get updates, and connect drivers with commuters in real time.
        </p>
        <div className="landing-buttons">
          <button onClick={() => navigate('/signup')}>Get Started</button>
          <button onClick={() => navigate('/login')}>Login</button>
          
        </div>
        
        <div className="landing-footer">
          &copy; {new Date().getFullYear()} Matatu Connect. Powered by CyberGrid.
        </div>
      </div>
    </>
  );
}

export default LandingPage;


