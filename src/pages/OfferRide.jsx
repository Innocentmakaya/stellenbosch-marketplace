import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaMoneyBillWave, FaCar, FaInfoCircle, FaChevronLeft, FaSpinner } from 'react-icons/fa';
import supabase from '../supabaseClient';
import './OfferRide.css';
import ensureUserProfile from '../utils/createProfile';

const OfferRide = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    departureLocation: '',
    destination: '',
    departureDate: '',
    departureTime: '',
    totalSeats: 3,
    pricePerSeat: '',
    carModel: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [popularLocations, setPopularLocations] = useState([
    'Stellenbosch University', 'Cape Town', 'Bellville', 'Somerset West', 
    'Paarl', 'Franschhoek', 'Strand', 'Muizenberg', 'Observatory',
    'Wellington', 'Kuilsriver', 'Durbanville'
  ]);
  
  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate('/login', { state: { from: '/offer-ride' } });
        return;
      }
      setUser(data.user);
    };
    
    checkAuth();
  }, [navigate]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.departureLocation) {
      newErrors.departureLocation = 'Departure location is required';
    }
    
    if (!formData.destination) {
      newErrors.destination = 'Destination is required';
    }
    
    if (!formData.departureDate) {
      newErrors.departureDate = 'Departure date is required';
    } else {
      const selectedDate = new Date(formData.departureDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.departureDate = 'Departure date cannot be in the past';
      }
    }
    
    if (!formData.departureTime) {
      newErrors.departureTime = 'Departure time is required';
    }
    
    if (!formData.totalSeats || formData.totalSeats < 1) {
      newErrors.totalSeats = 'At least 1 seat is required';
    }
    
    if (!formData.pricePerSeat) {
      newErrors.pricePerSeat = 'Price per seat is required';
    } else if (isNaN(formData.pricePerSeat) || Number(formData.pricePerSeat) < 0) {
      newErrors.pricePerSeat = 'Price must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Select a popular location
  const selectLocation = (location, field) => {
    setFormData({
      ...formData,
      [field]: location
    });
    
    // Clear error when field is set
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Make sure the user has a profile
      await ensureUserProfile(user.id, { 
        user_type: 'student' 
      });
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('rides')
        .insert({
          user_id: user.id,
          departure_location: formData.departureLocation,
          destination: formData.destination,
          departure_date: formData.departureDate,
          departure_time: formData.departureTime,
          total_seats: Number(formData.totalSeats),
          booked_seats: 0,
          price_per_seat: Number(formData.pricePerSeat),
          car_model: formData.carModel,
          description: formData.description
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      // Redirect to the ride detail page
      navigate(`/ride/${data[0].id}`);
      
    } catch (error) {
      console.error('Error creating ride:', error);
      alert('Failed to create ride. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div className="offer-ride-container">
      <div className="back-navigation">
        <button onClick={() => navigate(-1)} className="back-button">
          <FaChevronLeft /> Back to rides
        </button>
      </div>
      
      <div className="offer-ride-card">
        <h1>Offer a Ride</h1>
        <p className="subtitle">Share your journey with fellow students</p>
        
        <form onSubmit={handleSubmit} className="ride-form">
          <div className="form-group">
            <label htmlFor="departureLocation">
              <FaMapMarkerAlt /> Departure Location *
            </label>
            <input
              type="text"
              id="departureLocation"
              name="departureLocation"
              value={formData.departureLocation}
              onChange={handleChange}
              placeholder="Where are you leaving from?"
              className={errors.departureLocation ? 'error' : ''}
            />
            {errors.departureLocation && (
              <span className="error-message">{errors.departureLocation}</span>
            )}
            <div className="location-suggestions">
              {popularLocations.slice(0, 6).map((location, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectLocation(location, 'departureLocation')}
                  className="location-suggestion"
                >
                  {location}
                </button>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="destination">
              <FaMapMarkerAlt /> Destination *
            </label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="Where are you going to?"
              className={errors.destination ? 'error' : ''}
            />
            {errors.destination && (
              <span className="error-message">{errors.destination}</span>
            )}
            <div className="location-suggestions">
              {popularLocations.slice(0, 6).map((location, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectLocation(location, 'destination')}
                  className="location-suggestion"
                >
                  {location}
                </button>
              ))}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="departureDate">
                <FaCalendarAlt /> Departure Date *
              </label>
              <input
                type="date"
                id="departureDate"
                name="departureDate"
                value={formData.departureDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={errors.departureDate ? 'error' : ''}
              />
              {errors.departureDate && (
                <span className="error-message">{errors.departureDate}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="departureTime">
                <FaClock /> Departure Time *
              </label>
              <input
                type="time"
                id="departureTime"
                name="departureTime"
                value={formData.departureTime}
                onChange={handleChange}
                className={errors.departureTime ? 'error' : ''}
              />
              {errors.departureTime && (
                <span className="error-message">{errors.departureTime}</span>
              )}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="totalSeats">
                <FaUsers /> Available Seats *
              </label>
              <input
                type="number"
                id="totalSeats"
                name="totalSeats"
                value={formData.totalSeats}
                onChange={handleChange}
                min="1"
                max="8"
                className={errors.totalSeats ? 'error' : ''}
              />
              {errors.totalSeats && (
                <span className="error-message">{errors.totalSeats}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="pricePerSeat">
                <FaMoneyBillWave /> Price per Seat (ZAR) *
              </label>
              <input
                type="number"
                id="pricePerSeat"
                name="pricePerSeat"
                value={formData.pricePerSeat}
                onChange={handleChange}
                min="0"
                step="10"
                placeholder="e.g. 50"
                className={errors.pricePerSeat ? 'error' : ''}
              />
              {errors.pricePerSeat && (
                <span className="error-message">{errors.pricePerSeat}</span>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="carModel">
              <FaCar /> Car Model (optional)
            </label>
            <input
              type="text"
              id="carModel"
              name="carModel"
              value={formData.carModel}
              onChange={handleChange}
              placeholder="e.g. Toyota Corolla"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">
              <FaInfoCircle /> Additional Information (optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Leaving from student residences, can pick up from nearby locations, etc."
              rows="3"
            />
          </div>
          
          <div className="info-panel">
            <FaInfoCircle className="info-icon" />
            <p>
              By offering a ride, you agree to safely transport passengers to the
              specified destination. Payment arrangements are made directly between
              you and the passengers.
            </p>
          </div>
          
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (
              <>
                <FaSpinner className="spinner-icon" /> Creating Ride...
              </>
            ) : (
              'Offer Ride'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OfferRide; 