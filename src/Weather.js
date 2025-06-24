import React, { useState, useEffect } from 'react';
import { Star, Plus, Filter, Search, User, Calendar, MessageCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RatingsDisplay = () => {
  const [ratings, setRatings] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    sacco_id: '',
    sort: 'newest',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRatings: 0,
    hasNext: false,
    hasPrev: false
  });

  // API configuration - adjust this to match your backend
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const fetchRatings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: '10',
        sort: filters.sort
      });

      // Add optional filters
      if (filters.sacco_id) {
        queryParams.append('sacco_id', filters.sacco_id);
      }

      console.log('Making API call to:', `${API_BASE_URL}/api/ratings?${queryParams}`);

      // Make API call
      const response = await fetch(`${API_BASE_URL}/api/ratings?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('API endpoint not found. Check if your backend server is running.');
        }
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      setRatings(data.ratings || []);
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalRatings: 0,
        hasNext: false,
        hasPrev: false
      });

    } catch (err) {
      console.error('Error fetching ratings:', err);
      setError(err.message || 'Failed to fetch ratings');
      
      // Fallback to mock data for development
      if (process.env.NODE_ENV === 'development') {
        console.log('Using fallback mock data for development');
        const mockRatings = [
          {
            id: 1,
            commuter_firstname: 'John',
            commuter_lastname: 'Doe',
            sacco_name: 'City Express SACCO',
            cleanliness_rating: 4,
            safety_rating: 5,
            service_rating: 4,
            average_rating: 4.33,
            review_text: 'Great service overall! The vehicles are clean and the drivers are professional.',
            created_at: '2024-06-15T10:30:00Z'
          },
          {
            id: 2,
            commuter_firstname: 'Sarah',
            commuter_lastname: 'Johnson',
            sacco_name: 'Metro Transport',
            cleanliness_rating: 3,
            safety_rating: 4,
            service_rating: 3,
            average_rating: 3.33,
            review_text: 'Average experience. The buses are okay but could be cleaner.',
            created_at: '2024-06-14T14:20:00Z'
          }
        ];
        setRatings(mockRatings);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalRatings: mockRatings.length,
          hasNext: false,
          hasPrev: false
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [filters.sort, filters.sacco_id, pagination.currentPage]);

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Handle filter changes with debouncing for search
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [filters.search]);

  // Client-side filtering for search (since backend doesn't support search yet)
  const filteredRatings = ratings.filter(rating => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        rating.sacco_name?.toLowerCase().includes(searchLower) ||
        rating.commuter_firstname?.toLowerCase().includes(searchLower) ||
        rating.commuter_lastname?.toLowerCase().includes(searchLower) ||
        rating.review_text?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        style={{
          color: i < rating ? '#ffd700' : '#666',
          fill: i < rating ? '#ffd700' : 'none',
          animation: i < rating ? 'pulse 2s infinite' : 'none'
        }}
      />
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return { color: '#39ff14', backgroundColor: 'rgba(57, 255, 20, 0.1)', borderColor: 'rgba(57, 255, 20, 0.3)' };
    if (rating >= 3) return { color: '#ffd700', backgroundColor: 'rgba(255, 215, 0, 0.1)', borderColor: 'rgba(255, 215, 0, 0.3)' };
    return { color: '#ff4444', backgroundColor: 'rgba(255, 68, 68, 0.1)', borderColor: 'rgba(255, 68, 68, 0.3)' };
  };

  const handleRetry = () => {
    setError(null);
    fetchRatings();
  };

  // CSS Styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a0033 0%, #0f0f23 50%, #000000 100%)',
      position: 'relative',
      overflow: 'hidden'
    },
    gridOverlay: {
      position: 'absolute',
      inset: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v1H0zM0 0v100h1V0z' fill='%2300d4ff' fill-opacity='0.1'/%3E%3C/svg%3E")`,
      animation: 'pulse 3s infinite'
    },
    particle: {
      position: 'absolute',
      width: '4px',
      height: '4px',
      backgroundColor: '#00d4ff',
      borderRadius: '50%',
      animation: 'pulse 3s infinite'
    },
    header: {
      backdropFilter: 'blur(16px)',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderBottom: '1px solid rgba(0, 212, 255, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 212, 255, 0.1)'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      fontFamily: 'Monaco, monospace',
      background: 'linear-gradient(45deg, #00d4ff, #39ff14, #ff1493)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textTransform: 'uppercase',
      letterSpacing: '2px'
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px 12px 40px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(0, 212, 255, 0.3)',
      borderRadius: '8px',
      color: '#e0f7ff',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 16px rgba(0, 212, 255, 0.1)',
      outline: 'none',
      transition: 'all 0.3s ease',
      fontFamily: 'Monaco, monospace'
    },
    select: {
      padding: '12px 16px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(0, 212, 255, 0.3)',
      borderRadius: '8px',
      color: '#e0f7ff',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 16px rgba(0, 212, 255, 0.1)',
      outline: 'none',
      fontFamily: 'Monaco, monospace'
    },
    button: {
      padding: '12px 16px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(0, 212, 255, 0.3)',
      borderRadius: '8px',
      color: '#00d4ff',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 16px rgba(0, 212, 255, 0.1)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontFamily: 'Monaco, monospace',
      textTransform: 'uppercase',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    card: {
      backdropFilter: 'blur(16px)',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(0, 212, 255, 0.3)',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 8px 32px rgba(0, 212, 255, 0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    saccoName: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#00d4ff',
      fontFamily: 'Monaco, monospace',
      marginBottom: '8px',
      transition: 'color 0.3s ease'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: '#e0f7ff',
      fontSize: '0.9rem'
    },
    ratingBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '0.9rem',
      fontWeight: 'bold',
      fontFamily: 'Monaco, monospace',
      border: '1px solid',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
    },
    ratingGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      margin: '16px 0'
    },
    ratingItem: {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '8px',
      padding: '12px',
      border: '1px solid rgba(0, 212, 255, 0.2)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    reviewBox: {
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2))',
      borderRadius: '8px',
      padding: '16px',
      border: '1px solid rgba(0, 212, 255, 0.2)',
      backdropFilter: 'blur(8px)',
      marginTop: '16px'
    },
    floatingButton: {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: 'linear-gradient(45deg, #00d4ff, #39ff14)',
      color: '#000',
      border: 'none',
      borderRadius: '50%',
      width: '64px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 8px 32px rgba(0, 212, 255, 0.5)',
      transition: 'all 0.3s ease',
      zIndex: 1000
    },
    loadingContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a0033 0%, #0f0f23 50%, #000000 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    },
    spinner: {
      width: '64px',
      height: '64px',
      border: '4px solid rgba(0, 212, 255, 0.3)',
      borderTop: '4px solid #00d4ff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      boxShadow: '0 0 32px rgba(0, 212, 255, 0.5)'
    },
    errorBanner: {
      padding: '16px',
      backgroundColor: 'rgba(255, 68, 68, 0.1)',
      border: '1px solid rgba(255, 68, 68, 0.3)',
      borderRadius: '8px',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 16px rgba(255, 68, 68, 0.2)',
      marginBottom: '16px'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '32px',
      gap: '16px',
      flexWrap: 'wrap'
    },
    pageButton: {
      padding: '8px 16px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(0, 212, 255, 0.3)',
      borderRadius: '6px',
      color: '#00d4ff',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontFamily: 'Monaco, monospace'
    },
    activePageButton: {
      backgroundColor: '#00d4ff',
      color: '#000',
      boxShadow: '0 4px 16px rgba(0, 212, 255, 0.5)'
    }
  };

  // Create keyframes for animations
  const animationStyles = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .hover-glow:hover {
      box-shadow: 0 8px 32px rgba(0, 212, 255, 0.3) !important;
      border-color: rgba(0, 212, 255, 0.5) !important;
    }
    .hover-scale:hover {
      transform: scale(1.05);
    }
    .search-focus:focus {
      border-color: #00d4ff !important;
      box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2) !important;
    }
  `;

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <style>{animationStyles}</style>
        <div style={styles.gridOverlay}></div>
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.particle,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
        <div style={{ textAlign: 'center', zIndex: 10 }}>
          <div style={styles.spinner}></div>
          <p style={{ marginTop: '24px', color: '#00d4ff', fontSize: '1.1rem', fontFamily: 'Monaco, monospace' }}>
            Loading ratings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{animationStyles}</style>
      <div style={styles.gridOverlay}></div>
      
      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          style={{
            ...styles.particle,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        />
      ))}

      {/* Header */}
      <div style={styles.header}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h1 style={styles.title}>SACCO RATINGS</h1>
            {error && (
              <button
                onClick={handleRetry}
                style={{
                  ...styles.button,
                  backgroundColor: 'rgba(255, 68, 68, 0.1)',
                  borderColor: 'rgba(255, 68, 68, 0.3)',
                  color: '#ff4444'
                }}
                className="hover-glow"
              >
                <RefreshCw size={16} />
                RETRY
              </button>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div style={styles.errorBanner}>
              <h3 style={{ color: '#ff4444', fontSize: '0.9rem', fontWeight: 'bold', fontFamily: 'Monaco, monospace', margin: '0 0 8px 0' }}>
                CONNECTION ERROR
              </h3>
              <p style={{ color: '#ffaaaa', fontSize: '0.8rem', margin: '0 0 8px 0' }}>{error}</p>
              <p style={{ color: 'rgba(255, 68, 68, 0.7)', fontSize: '0.7rem', fontFamily: 'Monaco, monospace', margin: 0 }}>
                Backend URL: {API_BASE_URL}/api/ratings
              </p>
            </div>
          )}
          
          {/* Search and Filters */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, position: 'relative', minWidth: '300px' }}>
              <Search 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#00d4ff' }} 
                size={20} 
              />
              <input
                type="text"
                placeholder="Search ratings, SACCOs, or commuters..."
                style={styles.searchInput}
                className="search-focus"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                style={styles.select}
                value={filters.sort}
                onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
              >
                <option value="newest">NEWEST FIRST</option>
                <option value="highest">HIGHEST RATED</option>
                <option value="lowest">LOWEST RATED</option>
              </select>
              
              <button style={styles.button} className="hover-glow">
                <Filter size={16} />
                FILTER
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings List */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', position: 'relative', zIndex: 10 }}>
        {filteredRatings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            {error ? (
              <div style={{
                ...styles.card,
                borderColor: 'rgba(255, 68, 68, 0.3)',
                maxWidth: '400px',
                margin: '0 auto'
              }}>
                <p style={{ color: '#ff4444', fontSize: '1.1rem', fontFamily: 'Monaco, monospace', margin: '0 0 8px 0' }}>
                  UNABLE TO LOAD RATINGS
                </p>
                <p style={{ color: 'rgba(255, 170, 170, 0.7)', margin: 0 }}>
                  Please check your connection and try again
                </p>
              </div>
            ) : (
              <div style={{ ...styles.card, maxWidth: '400px', margin: '0 auto' }}>
                <p style={{ color: '#00d4ff', fontSize: '1.1rem', fontFamily: 'Monaco, monospace', margin: '0 0 8px 0' }}>
                  NO RATINGS FOUND
                </p>
                <p style={{ color: 'rgba(224, 247, 255, 0.7)', margin: 0 }}>
                  Be the first to rate a SACCO!
                </p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {filteredRatings.map((rating) => (
              <div 
                key={rating.id} 
                style={styles.card}
                className="hover-glow"
                onMouseEnter={(e) => {
                  e.currentTarget.querySelector('.sacco-name').style.color = '#39ff14';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.querySelector('.sacco-name').style.color = '#00d4ff';
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h3 className="sacco-name" style={styles.saccoName}>
                      {rating.sacco_name}
                    </h3>
                    <div style={styles.userInfo}>
                      <User size={16} style={{ color: '#ff1493' }} />
                      <span>{rating.commuter_firstname} {rating.commuter_lastname}</span>
                      <Calendar size={16} style={{ color: '#ff1493', marginLeft: '8px' }} />
                      <span style={{ color: 'rgba(224, 247, 255, 0.7)', fontSize: '0.8rem', fontFamily: 'Monaco, monospace' }}>
                        {formatDate(rating.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{
                    ...styles.ratingBadge,
                    ...getRatingColor(rating.average_rating)
                  }}>
                    {Number.isFinite(Number(rating.average_rating))
                      ? Number(rating.average_rating).toFixed(1)
                      : 'N/A'} ★
                  </div>
                </div>

                {/* Individual Ratings */}
                <div style={styles.ratingGrid}>
                  <div style={{ ...styles.ratingItem, borderColor: 'rgba(57, 255, 20, 0.2)' }}>
                    <span style={{ color: '#39ff14', fontSize: '0.8rem', fontFamily: 'Monaco, monospace' }}>CLEANLINESS</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {renderStars(rating.cleanliness_rating)}
                      <span style={{ color: '#4ade80', marginLeft: '4px', fontSize: '0.8rem', fontFamily: 'Monaco, monospace' }}>
                        ({rating.cleanliness_rating})
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ ...styles.ratingItem, borderColor: 'rgba(255, 20, 147, 0.2)' }}>
                    <span style={{ color: '#ff1493', fontSize: '0.8rem', fontFamily: 'Monaco, monospace' }}>SAFETY</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {renderStars(rating.safety_rating)}
                      <span style={{ color: '#f472b6', marginLeft: '4px', fontSize: '0.8rem', fontFamily: 'Monaco, monospace' }}>
                        ({rating.safety_rating})
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ ...styles.ratingItem, borderColor: 'rgba(0, 212, 255, 0.2)' }}>
                    <span style={{ color: '#00d4ff', fontSize: '0.8rem', fontFamily: 'Monaco, monospace' }}>SERVICE</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {renderStars(rating.service_rating)}
                      <span style={{ color: '#38bdf8', marginLeft: '4px', fontSize: '0.8rem', fontFamily: 'Monaco, monospace' }}>
                        ({rating.service_rating})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                {rating.review_text && (
                  <div style={styles.reviewBox}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <MessageCircle size={16} style={{ color: '#00d4ff', marginTop: '4px', flexShrink: 0 }} />
                      <p style={{ color: '#e0f7ff', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                        {rating.review_text}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && !error && (
          <div style={styles.pagination}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                style={{
                  ...styles.pageButton,
                  opacity: !pagination.hasPrev ? 0.5 : 1,
                  cursor: !pagination.hasPrev ? 'not-allowed' : 'pointer'
                }}
                className={pagination.hasPrev ? "hover-glow" : ""}
              >
                PREVIOUS
              </button>
              
              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === pagination.currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      style={isActive ? { ...styles.pageButton, ...styles.activePageButton } : styles.pageButton}
                      className={!isActive ? "hover-glow" : ""}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                style={{
                  ...styles.pageButton,
                  opacity: !pagination.hasNext ? 0.5 : 1,
                  cursor: !pagination.hasNext ? 'not-allowed' : 'pointer'
                }}
                className={pagination.hasNext ? "hover-glow" : ""}
              >
                NEXT
              </button>
            </div>
            
            <div style={{ color: 'rgba(224, 247, 255, 0.7)', fontSize: '0.8rem', fontFamily: 'Monaco, monospace' }}>
              Showing {((pagination.currentPage - 1) * 10) + 1} - {Math.min(pagination.currentPage * 10, pagination.totalRatings)} of {pagination.totalRatings} ratings
            </div>
          </div>
        )}
      </div>

      {/* Floating Plus Button */}
      <button
  className="fixed top-6 right-6 z-50 w-16 h-16 rounded-full border border-cyan-400/30 backdrop-blur-md shadow-lg hover:shadow-cyan-400/50 transition-all duration-300 focus:ring-4 focus:ring-cyan-400/20 focus:outline-none group"
  style={{
    background: 'linear-gradient(45deg, #00d4ff, #39ff14)',
    boxShadow: '0 8px 32px rgba(0, 212, 255, 0.5)',
    animation: 'pulse 3s infinite'
  }}
  onClick={() => navigate('/ratingform')}
  title="Add new rating"
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'scale(1.1)';
    e.currentTarget.style.boxShadow = '0 12px 48px rgba(0, 212, 255, 0.7)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 212, 255, 0.5)';
  }}
>
  <Plus 
    size={24} 
    className="text-black group-hover:rotate-90 transition-transform duration-300"
    style={{ 
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
    }}
  />
</button>
    </div>
  );
};

export default RatingsDisplay;
