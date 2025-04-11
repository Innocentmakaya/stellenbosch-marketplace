import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaMoneyBillWave, FaCar } from 'react-icons/fa';
import './RideCard.css';

const RideCard = ({ ride }) => {
  // Format date to a readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Format time from ISO string or time string
  const formatTime = (timeString) => {
    if (!timeString) return '';
    let time;
    if (timeString.includes('T')) {
      // If it's a full ISO date-time string
      time = new Date(timeString);
    } else {
      // If it's just a time string like "14:30"
      const [hours, minutes] = timeString.split(':');
      time = new Date();
      time.setHours(hours, minutes);
    }
    return time.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate days from now
  const getDaysFromNow = (dateString) => {
    const rideDate = new Date(dateString);
    const today = new Date();
    
    // Set time to midnight for accurate day comparison
    rideDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    // Calculate the difference in days
    const diffTime = rideDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 0) return "Past";
    return `In ${diffDays} days`;
  };

  // Calculate seats left
  const seatsLeft = ride.total_seats - (ride.booked_seats || 0);

  return (
    <Link to={`/ride/${ride.id}`} className="ride-card">
      <div className="ride-card-badge">
        <span>{getDaysFromNow(ride.departure_date)}</span>
      </div>
      
      <div className="ride-card-header">
        <h3 className="ride-route">
          <span className="from">{ride.departure_location}</span>
          <span className="route-arrow">→</span>
          <span className="to">{ride.destination}</span>
        </h3>
      </div>
      
      <div className="ride-card-details">
        <div className="ride-detail">
          <FaCalendarAlt className="ride-icon" />
          <span>{formatDate(ride.departure_date)}</span>
        </div>
        
        <div className="ride-detail">
          <FaClock className="ride-icon" />
          <span>{formatTime(ride.departure_time)}</span>
        </div>
        
        <div className="ride-detail">
          <FaUsers className="ride-icon" />
          <span className={seatsLeft === 0 ? 'no-seats' : ''}>
            {seatsLeft} {seatsLeft === 1 ? 'seat' : 'seats'} left
          </span>
        </div>
        
        <div className="ride-detail">
          <FaMoneyBillWave className="ride-icon" />
          <span className="ride-price">R{ride.price_per_seat}</span>
        </div>
      </div>
      
      <div className="ride-card-footer">
        <div className="driver-info">
          <div className="driver-avatar">
            {ride.driver_avatar ? (
              <img src={ride.driver_avatar} alt={`${ride.driver_name}`} />
            ) : (
              <div className="avatar-placeholder">
                {ride.driver_name?.charAt(0) || "D"}
              </div>
            )}
          </div>
          <div className="driver-details">
            <span className="driver-name">{ride.driver_name}</span>
            {ride.driver_phone && (
              <span className="driver-phone">{ride.driver_phone}</span>
            )}
          </div>
        </div>
        
        <div className="car-info">
          <FaCar className="car-icon" />
          <span>{ride.car_model || "Car"}</span>
        </div>
      </div>
    </Link>
  );
};

export default RideCard; 