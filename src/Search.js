// src/pages/Search.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Search.css';

function Search() {
  const [operations, setOperations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOperations, setFilteredOperations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch operations (SACCO details with routes and stages)
  useEffect(() => {
    const fetchOperations = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/operations');
        setOperations(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching operations:', error);
        setLoading(false);
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
  }, [searchTerm, operations]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const viewOnMap = (operation) => {
    // You can implement navigation to map page with coordinates
    // For now, just log the coordinates
    console.log('Navigate to map:', operation.stage_latitude, operation.stage_longitude);
    // Example: navigate('/map', { state: { lat: operation.stage_latitude, lng: operation.stage_longitude } });
  };

  if (loading) {
    return <div className="search-container"><p>Loading search data...</p></div>;
  }

  return (
    <div className="search-container">
      <h1>Search Transit Options</h1>
      
      {/* Search Bar */}
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Search by Matatu sacco name, stage or route..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {/* Search Statistics */}
      <div className="search-stats">
        <p>Total Operations: {operations.length}</p>
        {searchTerm.trim() !== '' && (
          <p>Search Results: {filteredOperations.length}</p>
        )}
      </div>

      {/* Search Results */}
      {searchTerm.trim() !== '' ? (
        <div className="search-results">
          <h2>Search Results</h2>
          {filteredOperations.length > 0 ? (
            <div className="sacco-grid">
              {filteredOperations.map(operation => (
                <div key={operation.sacco_id} className="sacco-card">
                  <h3>{operation.sacco_name}</h3>
                  <div className="sacco-details">
                    <p><strong>Base Fare:</strong> {operation.base_fare_range}</p>
                    <p><strong>Route:</strong> {operation.route_name}</p>
                    <p><strong>From Stage:</strong> {operation.from_stage}</p>
                    <p><strong>To Stage:</strong> {operation.to_stage || 'N/A'}</p>
                    {operation.operating_hours && (
                      <p><strong>Operating Hours:</strong> {operation.operating_hours}</p>
                    )}
                  </div>
                  {operation.stage_latitude && operation.stage_longitude && (
                    <button 
                      className="view-map-btn"
                      onClick={() => viewOnMap(operation)}
                    >
                      View on Map
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No transit options found matching "{searchTerm}"</p>
              <p>Try searching for:</p>
              <ul>
                <li>SACCO names (e.g., "Kiambu Road")</li>
                <li>Stage names (e.g., "Railway")</li>
                <li>Route names</li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="search-placeholder">
          <h2>Start typing to search for transit options</h2>
          <p>Search through {operations.length} available operations</p>
        </div>
      )}
    </div>
  );
}

export default Search;
