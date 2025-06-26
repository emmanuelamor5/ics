import { useState } from 'react';
import { Star, Send, AlertCircle, CheckCircle } from 'lucide-react';

const RatingForm = () => {
  const [formData, setFormData] = useState({
    sacco_id: '',
    cleanliness_rating: 0,
    safety_rating: 0,
    service_rating: 0,
    review_text: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const validateForm = () => {
    const newErrors = {};
     
    if (!formData.sacco_id) {
      newErrors.sacco_id = 'Sacco ID is required';
    }
    
    if (formData.cleanliness_rating < 1 || formData.cleanliness_rating > 5) {
      newErrors.cleanliness_rating = 'Please select a cleanliness rating';
    }
    
    if (formData.safety_rating < 1 || formData.safety_rating > 5) {
      newErrors.safety_rating = 'Please select a safety rating';
    }
    
    if (formData.service_rating < 1 || formData.service_rating > 5) {
      newErrors.service_rating = 'Please select a service rating';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRatingChange = (category, rating) => {
    setFormData(prev => ({
      ...prev,
      [category]: rating
    }));
    
    // Clear error when user selects rating
    if (errors[category]) {
      setErrors(prev => ({
        ...prev,
        [category]: ''
      }));
    }
  };

  const handleSubmit = async () => {
    console.log('Submit button clicked');
    console.log('Form data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    const submitData = {
      sacco_id: parseInt(formData.sacco_id),
      cleanliness_rating: parseInt(formData.cleanliness_rating),
      safety_rating: parseInt(formData.safety_rating),
      service_rating: parseInt(formData.service_rating),
      review_text: formData.review_text.trim() || null
    };
    
    console.log('Data being sent to API:', submitData);
    
    try {
      const response = await fetch('http://localhost:5000/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Rating submitted successfully!' });
        // Reset form
        setFormData({
          sacco_id: '',
          cleanliness_rating: 0,
          safety_rating: 0,
          service_rating: 0,
          review_text: ''
        });
      } else {
        setSubmitStatus({ type: 'error', message: data.error || 'Failed to submit rating' });
      }
    } catch (error) {
      console.error('Network error:', error);
      setSubmitStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, label, error }) => {
    return (
      <div className="space-y-2">
        <label 
          className="block text-sm font-medium"
          style={{ 
            color: '#00d4ff', 
            fontFamily: 'Monaco, monospace',
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            letterSpacing: '1px'
          }}
        >
          {label} <span style={{ color: '#ff4444' }}>*</span>
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              className="p-2 rounded-full transition-all duration-300 hover:scale-110"
              style={{
                backgroundColor: star <= rating ? 'rgba(255, 215, 0, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                border: `1px solid ${star <= rating ? 'rgba(255, 215, 0, 0.3)' : 'rgba(0, 212, 255, 0.2)'}`,
                backdropFilter: 'blur(8px)',
                boxShadow: star <= rating ? '0 4px 16px rgba(255, 215, 0, 0.3)' : '0 4px 16px rgba(0, 212, 255, 0.1)'
              }}
            >
              <Star
                size={24}
                fill={star <= rating ? '#ffd700' : 'none'}
                style={{ 
                  color: star <= rating ? '#ffd700' : '#666',
                  filter: star <= rating ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))' : 'none'
                }}
              />
            </button>
          ))}
        </div>
        {error && (
          <p 
            className="text-sm"
            style={{ 
              color: '#ff4444', 
              fontFamily: 'Monaco, monospace',
              fontSize: '0.7rem'
            }}
          >
            {error}
          </p>
        )}
      </div>
    );
  };

  // CSS Styles
  const styles = {
    container: {
  height: '100vh',
  width: '100vw',
  background: 'linear-gradient(135deg, #1a0033 0%, #0f0f23 50%, #000000 100%)',
  position: 'relative',
  overflow: 'auto',
  padding: '32px 16px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
},
formCard: {
  width: '100%',
  maxWidth: '960px',
  margin: '0 auto',
  backdropFilter: 'blur(16px)',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  border: '1px solid rgba(0, 212, 255, 0.3)',
  borderRadius: '16px',
  padding: '32px',
  boxShadow: '0 8px 32px rgba(0, 212, 255, 0.1)',
  position: 'relative',
  zIndex: 10
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
    
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      fontFamily: 'Monaco, monospace',
      background: 'linear-gradient(45deg, #00d4ff, #39ff14, #ff1493)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      marginBottom: '8px'
    },
    subtitle: {
      color: 'rgba(224, 247, 255, 0.7)',
      fontSize: '0.9rem',
      fontFamily: 'Monaco, monospace'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(0, 212, 255, 0.3)',
      borderRadius: '8px',
      color: '#e0f7ff',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 16px rgba(0, 212, 255, 0.1)',
      outline: 'none',
      transition: 'all 0.3s ease',
      fontFamily: 'Monaco, monospace',
      fontSize: '0.9rem'
    },
    inputError: {
      borderColor: 'rgba(255, 68, 68, 0.5)',
      boxShadow: '0 4px 16px rgba(255, 68, 68, 0.2)'
    },
    label: {
      display: 'block',
      fontSize: '0.8rem',
      fontWeight: '500',
      color: '#00d4ff',
      marginBottom: '8px',
      fontFamily: 'Monaco, monospace',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    errorText: {
      marginTop: '4px',
      fontSize: '0.7rem',
      color: '#ff4444',
      fontFamily: 'Monaco, monospace'
    },
    button: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '16px 32px',
      background: 'linear-gradient(45deg, #00d4ff, #39ff14)',
      color: '#000',
      border: 'none',
      borderRadius: '8px',
      fontWeight: 'bold',
      fontFamily: 'Monaco, monospace',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 32px rgba(0, 212, 255, 0.3)',
      fontSize: '0.9rem'
    },
    buttonDisabled: {
      background: 'rgba(102, 102, 102, 0.3)',
      color: 'rgba(224, 247, 255, 0.5)',
      cursor: 'not-allowed',
      boxShadow: '0 4px 16px rgba(102, 102, 102, 0.2)'
    },
    statusCard: {
      padding: '16px',
      borderRadius: '8px',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px',
      fontFamily: 'Monaco, monospace',
      fontSize: '0.8rem'
    },
    successCard: {
      backgroundColor: 'rgba(57, 255, 20, 0.1)',
      border: '1px solid rgba(57, 255, 20, 0.3)',
      color: '#39ff14',
      boxShadow: '0 4px 16px rgba(57, 255, 20, 0.2)'
    },
    errorCard: {
      backgroundColor: 'rgba(255, 68, 68, 0.1)',  
      border: '1px solid rgba(255, 68, 68, 0.3)',
      color: '#ff4444',
      boxShadow: '0 4px 16px rgba(255, 68, 68, 0.2)'
    },
    spinner: {
      width: '16px',
      height: '16px',
      border: '2px solid rgba(0, 0, 0, 0.3)',
      borderTop: '2px solid #000',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginRight: '8px'
    }
  };

  // Animation styles
  const animationStyles = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .input-focus:focus {
      border-color: #00d4ff !important;
      box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2) !important;
    }
    .button-hover:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 12px 48px rgba(0, 212, 255, 0.5) !important;
    }
  `;

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

      <div style={styles.formCard}>
        <div className="mb-6">
          <h2 style={styles.title}>Rate Your Sacco Experience</h2>
          <p style={styles.subtitle}>Share your feedback to help improve public transport services</p>
        </div>

        {submitStatus && (
          <div style={{
            ...styles.statusCard,
            ...(submitStatus.type === 'success' ? styles.successCard : styles.errorCard)
          }}>
            {submitStatus.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{submitStatus.message}</span>
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="sacco_id" style={styles.label}>
                Sacco ID <span style={{ color: '#ff4444' }}>*</span>
              </label>
              <input
                type="text"
                id="sacco_id"
                name="sacco_id"
                value={formData.sacco_id}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(errors.sacco_id ? styles.inputError : {})
                }}
                className="input-focus"
                placeholder="Enter sacco ID/Name"
              />
              {errors.sacco_id && (
                <p style={styles.errorText}>{errors.sacco_id}</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <StarRating
              rating={formData.cleanliness_rating}
              onRatingChange={(rating) => handleRatingChange('cleanliness_rating', rating)}
              label="Cleanliness Rating"
              error={errors.cleanliness_rating}
            />

            <StarRating
              rating={formData.safety_rating}
              onRatingChange={(rating) => handleRatingChange('safety_rating', rating)}
              label="Safety Rating"
              error={errors.safety_rating}
            />

            <StarRating
              rating={formData.service_rating}
              onRatingChange={(rating) => handleRatingChange('service_rating', rating)}
              label="Service Rating"
              error={errors.service_rating}
            />
          </div>

          <div>
            <label htmlFor="review_text" style={styles.label}>
              Review (Optional)
            </label>
            <textarea
              id="review_text"
              name="review_text"
              value={formData.review_text}
              onChange={handleInputChange}
              rows={4}
              style={styles.input}
              className="input-focus"
              placeholder="Share your detailed experience..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={isSubmitting ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
              className="button-hover"
            >
              {isSubmitting ? (
                <>
                  <div style={styles.spinner}></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={16} style={{ marginRight: '8px' }} />
                  Submit Rating
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingForm;