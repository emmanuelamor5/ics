import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


// Fix marker icon issue for Leaflet + Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Create a cyberpunk glowing marker icon
const createCyberGlowingIcon = () => {
  const cyberMarkerHtml = `
    <div style="
      width: 30px;
      height: 30px;
      background: linear-gradient(45deg, #00d4ff, #39ff14);
      border-radius: 50%;
      box-shadow: 0 0 20px #00d4ff, 0 0 40px #39ff14;
      animation: cyberPulse 2s ease-in-out infinite;
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 10px;
        height: 10px;
        background: #0a0a0a;
        border-radius: 50%;
      "></div>
    </div>
    <style>
      @keyframes cyberPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
      }
    </style>
  `;

  return L.divIcon({
    html: cyberMarkerHtml,
    className: 'cyber-glow-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

// Default cyberpunk icon
const createDefaultCyberIcon = () => {
  const defaultCyberHtml = `
    <div style="
      width: 25px;
      height: 25px;
      background: linear-gradient(45deg, #00d4ff, #1a0b2e);
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
      border: 2px solid #00d4ff;
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        background: #39ff14;
        border-radius: 50%;
      "></div>
    </div>
  `;

  return L.divIcon({
    html: defaultCyberHtml,
    className: 'cyber-default-marker',
    iconSize: [25, 25],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

// Component to handle map view changes
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Floating particles component
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => (
    <div
      key={i}
      className="particle"
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 6}s`,
        animationDuration: `${Math.random() * 4 + 4}s`
      }}
    />
  ));
  
  return <div className="particles">{particles}</div>;
};

function Home() {
  const [weather, setWeather] = useState(null);
  const [stages, setStages] = useState([]);
  const [operations, setOperations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOperations, setFilteredOperations] = useState([]);
  const [mapCenter, setMapCenter] = useState([-1.286389, 36.817223]);
  const [mapZoom, setMapZoom] = useState(14.5);
  const [highlightedMarkerId, setHighlightedMarkerId] = useState(null);
  const markersRef = useRef({});

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = '17ced4ffb7c054e71e04110fd7051752';
      const lat = -1.286389;
      const lon = 36.817223;
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };
    fetchWeather();
  }, []);

  // Fetch stages from backend
  useEffect(() => {
    const fetchStages = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/stages');
        const data = await response.json();
        setStages(data);
      } catch (error) {
        console.error('Error fetching stages:', error);
      }
    };
    fetchStages();
  }, []);

  // Fetch operations (SACCO details with routes and stages)
  useEffect(() => {
    const fetchOperations = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/operations');
        const data = await response.json();
        setOperations(data);
      } catch (error) {
        console.error('Error fetching operations:', error);
      }
    };
    fetchOperations();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOperations([]);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = operations.filter(operation => 
      operation.sacco_name?.toLowerCase().includes(searchTermLower) ||
      operation.route_name?.toLowerCase().includes(searchTermLower) ||
      operation.from_stage?.toLowerCase().includes(searchTermLower)
    );

    setFilteredOperations(filtered);

    // If we have search results, center the map on the first result
    if (filtered.length > 0 && filtered[0].stage_latitude && filtered[0].stage_longitude) {
      setMapCenter([filtered[0].stage_latitude, filtered[0].stage_longitude]);
      setMapZoom(16);
    }
  }, [searchTerm, operations]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const highlightMarker = (operation) => {
    setMapCenter([operation.stage_latitude, operation.stage_longitude]);
    setMapZoom(17);
    
    // Set the highlighted marker ID
    setHighlightedMarkerId(`op-${operation.sacco_id}`);
    
    // Remove highlight after 9 seconds
    setTimeout(() => {
      setHighlightedMarkerId(null);
    }, 9000);
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Courier New', monospace;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a0b2e 50%, #0a0a0a 100%);
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

        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -1;
        }

        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: linear-gradient(45deg, #39ff14, #00d4ff);
          border-radius: 50%;
          animation: float 6s linear infinite;
        }

        @keyframes float {
          0% { transform: translateY(100vh) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-10vh) translateX(100px); opacity: 0; }
        }

        .home-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          position: relative;
          z-index: 1;
        }

        .home-container h1 {
          font-size: 3rem;
          font-weight: bold;
          background: linear-gradient(45deg, #00d4ff, #39ff14, #ff1493);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-align: center;
          margin-bottom: 30px;
          text-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
          animation: logoGlow 2s ease-in-out infinite alternate;
        }

        @keyframes logoGlow {
          0% { filter: drop-shadow(0 0 10px #00d4ff); }
          100% { filter: drop-shadow(0 0 20px #39ff14); }
        }

        .search-container {
          position: relative;
          margin-bottom: 30px;
        }

        .search-input {
          width: 100%;
          padding: 20px 25px;
          background: rgba(26, 11, 46, 0.5);
          border: 2px solid rgba(0, 212, 255, 0.3);
          border-radius: 25px;
          color: #00d4ff;
          font-family: 'Courier New', monospace;
          font-size: 1.1rem;
          outline: none;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          
          
        }

        .search-input:focus {
          border-color: #39ff14;
          box-shadow: 0 0 20px rgba(57, 255, 20, 0.3);
          transform: scale(1.02);
        }

        .search-input::placeholder {
          color: rgba(0, 212, 255, 0.6);
          font-style: italic;
        }

        .weather {
          background: rgba(26, 11, 46, 0.4);
          border: 1px solid rgba(0, 212, 255, 0.4);
          border-radius: 15px;
          padding: 25px;
          margin-bottom: 30px;
          backdrop-filter: blur(15px);
          position: relative;
          overflow: hidden;
        }

        .weather::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #00d4ff, #39ff14, #ff1493, #00d4ff);
          background-size: 200% 100%;
          animation: borderGlow 3s linear infinite;
        }

        @keyframes borderGlow {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }

        .weather h3 {
          color: #39ff14;
          font-size: 1.5rem;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .weather p {
          color: #00d4ff;
          font-size: 1.1rem;
          margin-bottom: 10px;
          padding-left: 10px;
        }

        .search-results {
          margin-bottom: 30px;
        }

        .search-results h3 {
          color: #39ff14;
          font-size: 1.8rem;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-align: center;
        }

        .sacco-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .sacco-card {
          background: rgba(26, 11, 46, 0.4);
          border: 1px solid rgba(0, 212, 255, 0.4);
          border-radius: 15px;
          padding: 25px;
          backdrop-filter: blur(15px);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .sacco-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #00d4ff, #39ff14, #ff1493, #00d4ff);
          background-size: 200% 100%;
          animation: borderGlow 3s linear infinite;
        }

        .sacco-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
          border-color: #39ff14;
        }

        .sacco-card h4 {
          color: #39ff14;
          font-size: 1.3rem;
          margin-bottom: 15px;
          text-transform: uppercase;
        }

        .sacco-card p {
          color: #00d4ff;
          margin-bottom: 10px;
          font-size: 1rem;
        }

        .sacco-card p strong {
          color: #ff1493;
        }

        .sacco-card button {
          background: linear-gradient(45deg, #00d4ff, #39ff14);
          border: none;
          color: #0a0a0a;
          padding: 12px 20px;
          border-radius: 25px;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 15px;
        }

        .sacco-card button:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 20px rgba(0, 212, 255, 0.4);
        }

        .leaflet-container {
          border: 2px solid rgba(0, 212, 255, 0.3);
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 212, 255, 0.2);
        }

        .leaflet-popup-content-wrapper {
          background: rgba(26, 11, 46, 0.9);
          border: 1px solid #00d4ff;
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }

        .leaflet-popup-content {
          color: #00d4ff;
          font-family: 'Courier New', monospace;
        }

        .leaflet-popup-content h4 {
          color: #39ff14;
          margin-bottom: 10px;
          text-transform: uppercase;
        }

        .leaflet-popup-content p {
          margin-bottom: 5px;
        }

        .leaflet-popup-content strong {
          color: #ff1493;
        }

        .leaflet-popup-tip {
          background: rgba(26, 11, 46, 0.9);
          border: 1px solid #00d4ff;
        }

        @media (max-width: 768px) {
          .home-container h1 {
            font-size: 2rem;
          }
          
          .sacco-list {
            grid-template-columns: 1fr;
          }
          
          .search-input {
            font-size: 1rem;
            padding: 15px 20px;
          }
        }
      `}</style>
      
      <div className="cyber-grid"></div>
      <FloatingParticles />
      
      <div className="home-container">
        <h1>Nairobi CBD Stages Map & Weather</h1>
        
        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by Matatu sacco name, stage or route..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        {/* Weather Section */}
        {weather ? (
          <div className="weather">
            <h3>🌐Current Weather in CBD </h3>
            <p>🌡️ Temperature: {weather.main.temp}°C</p>
            <p>🌥️ Conditions: {weather.weather[0].description}</p>
            <p>💨 Wind Speed: {weather.wind.speed} m/s</p>
            <p>💧 Humidity: {weather.main.humidity}%</p>
          </div>
        ) : (
          <div className="weather">
            <h3>🔄 LOADING WEATHER ...</h3>
          </div>
        )}

        {/* SACCO Search Results */}
        {searchTerm.trim() !== '' && (
          <div className="search-results">
            <h3></h3>
            {filteredOperations.length > 0 ? (
              <div className="sacco-list">
                {filteredOperations.map(operation => (
                  <div key={operation.sacco_id} className="sacco-card">
                    <h4>🚌 {operation.sacco_name}</h4>
                    <p><strong>Base Fare:</strong> {operation.base_fare_range}</p>
                    <p><strong>Route:</strong> {operation.route_name}</p>
                    <p><strong>Stage:</strong> {operation.from_stage}</p>
                    {operation.stage_latitude && operation.stage_longitude && (
                      <button onClick={() => highlightMarker(operation)}>
                        🎯 LOCATE ON MAP
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="sacco-card">
                <h4>⚠️ NO MATRIX FOUND</h4>
                <p>No transit options found matching your search parameters.</p>
              </div>
            )}
          </div>
        )}

        {/* Map Section */}
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ height: '600px', width: '100%', marginTop: '2rem' }}
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; CyberMatatu | OpenStreetMap contributors'
          />
          
          {/* Render all stages as Markers */}
          {stages.map((stage) => (
            <Marker
              key={stage.stage_id}
              position={[stage.latitude, stage.longitude]}
              icon={createDefaultCyberIcon()}
            >
              <Popup>
                <div>
                  <h4>🚏 {stage.name}</h4>
                  <p>Stage ID: {stage.stage_id}</p>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Render filtered operations with potential highlighting */}
          {filteredOperations.map((operation) => {
            if (!operation.stage_latitude || !operation.stage_longitude) return null;
            
            const markerId = `op-${operation.sacco_id}`;
            const isHighlighted = markerId === highlightedMarkerId;
            
            return (
              <Marker
                key={markerId}
                position={[operation.stage_latitude, operation.stage_longitude]}
                icon={isHighlighted ? createCyberGlowingIcon() : createDefaultCyberIcon()}
                ref={(ref) => {
                  if (ref) {
                    markersRef.current[markerId] = ref;
                  }
                }}
              >
                <Popup>
                  <div>
                    <h4>🚌 {operation.sacco_name}</h4>
                    <p><strong>Base Fare:</strong> {operation.base_fare_range}</p>
                    <p><strong>Route:</strong> {operation.route_name}</p>
                    <p><strong>Stage:</strong> {operation.from_stage}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </>
  );
}

export default Home;
