import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaMoneyBillWave, 
  FaCar, FaInfoCircle, FaChevronLeft, FaUserCircle, FaCheck, FaSpinner, FaShare } from 'react-icons/fa';
import supabase from '../supabaseClient';
import './RideDetails.css';

const RideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [bookingSeats, setBookingSeats] = useState(1);
  const [userBooking, setUserBooking] = useState(null);
  const [error, setError] = useState(null);

  // Fetch ride details and check authentication
  useEffect(() => {
    const fetchRideAndUser = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // Get the ride details
        const { data: rideData, error: rideError } = await supabase
          .from('rides')
          .select('*')
          .eq('id', id)
          .single();

        if (rideError) throw rideError;

        if (!rideData) {
          setError('Ride not found');
          setLoading(false);
          return;
        }

        // Get the driver's profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', rideData.user_id)
          .single();

        // Format the ride data with driver info from profiles
        const formattedRide = {
          ...rideData,
          driver_name: profileData?.full_name || `Driver ${rideData.user_id.substring(0, 4)}`,
          driver_phone: profileData?.phone || null,
          driver_avatar: null,
        };

        setRide(formattedRide);

        // If user is logged in, check if they have already booked this ride
        if (user) {
          const { data: bookingData } = await supabase
            .from('ride_bookings')
            .select('*')
            .eq('ride_id', id)
            .eq('user_id', user.id)
            .single();

          setUserBooking(bookingData || null);
        }

      } catch (error) {
        console.error('Error fetching ride:', error);
        setError('Failed to load ride details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRideAndUser();
  }, [id]);

  // Format date to a readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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

  // Calculate seats left
  const getSeatsLeft = () => {
    if (!ride) return 0;
    return ride.total_seats - (ride.booked_seats || 0);
  };

  // Handle booking a ride
  const handleBookRide = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/ride/${id}` } });
      return;
    }

    // Validate booking
    if (bookingSeats <= 0) {
      alert('Please select at least 1 seat');
      return;
    }

    if (bookingSeats > getSeatsLeft()) {
      alert(`Only ${getSeatsLeft()} seats available`);
      return;
    }

    setBookingLoading(true);

    try {
      // Start a transaction to book seats
      const { data: bookingData, error: bookingError } = await supabase
        .from('ride_bookings')
        .insert({
          ride_id: id,
          user_id: user.id,
          seats_booked: bookingSeats,
          status: 'confirmed'
        })
        .select();

      if (bookingError) throw bookingError;

      // Update the ride's booked seats count
      const { error: updateError } = await supabase
        .from('rides')
        .update({ 
          booked_seats: (ride.booked_seats || 0) + bookingSeats 
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update the local state
      setRide({
        ...ride,
        booked_seats: (ride.booked_seats || 0) + bookingSeats
      });
      
      setUserBooking(bookingData[0]);
      alert('Booking successful! Enjoy your ride.');

    } catch (error) {
      console.error('Error booking ride:', error);
      alert('Failed to book ride. Please try again later.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Handle canceling a booking
  const handleCancelBooking = async () => {
    if (!userBooking) return;
    
    if (!confirm('Are you sure you want to cancel your booking?')) {
      return;
    }

    setBookingLoading(true);

    try {
      // Delete the booking
      const { error: deleteError } = await supabase
        .from('ride_bookings')
        .delete()
        .eq('id', userBooking.id);

      if (deleteError) throw deleteError;

      // Update the ride's booked seats count
      const { error: updateError } = await supabase
        .from('rides')
        .update({ 
          booked_seats: Math.max(0, (ride.booked_seats || 0) - userBooking.seats_booked)
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update the local state
      setRide({
        ...ride,
        booked_seats: Math.max(0, (ride.booked_seats || 0) - userBooking.seats_booked)
      });
      
      setUserBooking(null);
      alert('Booking canceled successfully.');

    } catch (error) {
      console.error('Error canceling booking:', error);
      alert('Failed to cancel booking. Please try again later.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Check if the user is the driver
  const isDriver = user && ride && user.id === ride.user_id;

  // Add a new function to handle sharing the ride
  const handleShareRide = async () => {
    if (!ride) return;
    
    try {
      const displayDate = formatDate(ride.departure_date);
      const displayTime = formatTime(ride.departure_time);
      
      const response = await fetch("/api/shareRide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: ride.departure_location,
          to: ride.destination,
          date: displayDate,
          time: displayTime,
          rideId: id
        }),
      });
      
      const result = await response.json();
      alert("Ride shared successfully!");
      console.log("Ride shared:", result);
    } catch (error) {
      console.error("Error sharing ride:", error);
      alert("Failed to share ride. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="ride-details-container loading-container">
        <div className="loading-spinner"></div>
        <p>Loading ride details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ride-details-container error-container">
        <FaInfoCircle className="error-icon" />
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <Link to="/rides" className="back-link">
          <FaChevronLeft /> Back to all rides
        </Link>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="ride-details-container error-container">
        <FaInfoCircle className="error-icon" />
        <h2>Ride Not Found</h2>
        <p>The ride you're looking for doesn't exist or has been removed.</p>
        <Link to="/rides" className="back-link">
          <FaChevronLeft /> Back to all rides
        </Link>
      </div>
    );
  }

  return (
    <div className="ride-details-container">
      <div className="back-navigation">
        <Link to="/rides" className="back-button">
          <FaChevronLeft /> Back to rides
        </Link>
      </div>

      <div className="ride-details-card">
        <div className="ride-header">
          <div className="ride-route-details">
            <h1 className="ride-route">
              <span className="from">{ride.departure_location}</span>
              <span className="route-arrow">→</span>
              <span className="to">{ride.destination}</span>
            </h1>
            <div className="ride-date-time">
              <FaCalendarAlt className="icon" /> {formatDate(ride.departure_date)}
              <span className="time-separator">•</span>
              <FaClock className="icon" /> {formatTime(ride.departure_time)}
            </div>
          </div>
          <button className="share-ride-button" onClick={handleShareRide}>
            <FaShare /> Share Ride
          </button>
        </div>

        <div className="ride-info-grid">
          <div className="info-item seats-info">
            <div className="info-icon">
              <FaUsers />
            </div>
            <div className="info-content">
              <h3>Seats</h3>
              <p>
                <span className="seats-count">{getSeatsLeft()}</span> available out of {ride.total_seats}
              </p>
            </div>
          </div>

          <div className="info-item price-info">
            <div className="info-icon">
              <FaMoneyBillWave />
            </div>
            <div className="info-content">
              <h3>Price per Seat</h3>
              <p className="price">R{ride.price_per_seat}</p>
            </div>
          </div>

          {ride.car_model && (
            <div className="info-item car-info">
              <div className="info-icon">
                <FaCar />
              </div>
              <div className="info-content">
                <h3>Car</h3>
                <p>{ride.car_model}</p>
              </div>
            </div>
          )}

          <div className="info-item driver-info">
            <div className="info-icon">
              <FaUserCircle />
            </div>
            <div className="info-content">
              <h3>Driver</h3>
              <div className="driver-profile">
                <div className="driver-avatar">
                  {ride.driver_avatar ? (
                    <img src={ride.driver_avatar} alt={ride.driver_name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {ride.driver_name.charAt(0)}
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
            </div>
          </div>
        </div>

        {ride.description && (
          <div className="ride-description">
            <h3>
              <FaInfoCircle className="icon" /> Additional Information
            </h3>
            <p>{ride.description}</p>
          </div>
        )}

        {!isDriver && (
          <div className="booking-section">
            {userBooking ? (
              <div className="booking-confirmed">
                <div className="booking-status">
                  <FaCheck className="check-icon" />
                  <div className="booking-info">
                    <h3>You're booked!</h3>
                    <p>You've reserved {userBooking.seats_booked} {userBooking.seats_booked === 1 ? 'seat' : 'seats'} on this ride.</p>
                  </div>
                </div>
                <button 
                  className="cancel-booking-button" 
                  onClick={handleCancelBooking}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <>
                      <FaSpinner className="spinner-icon" /> Processing...
                    </>
                  ) : (
                    'Cancel Booking'
                  )}
                </button>
              </div>
            ) : getSeatsLeft() > 0 ? (
              <div className="booking-form">
                <h3>Book Your Seats</h3>
                <div className="booking-inputs">
                  <div className="seat-selector">
                    <label htmlFor="booking-seats">Number of seats:</label>
                    <div className="seat-counter">
                      <button 
                        type="button" 
                        className="seat-btn decrease" 
                        onClick={() => setBookingSeats(Math.max(1, bookingSeats - 1))}
                        disabled={bookingSeats <= 1}
                      >
                        -
                      </button>
                      <span className="seat-count">{bookingSeats}</span>
                      <button 
                        type="button" 
                        className="seat-btn increase" 
                        onClick={() => setBookingSeats(Math.min(getSeatsLeft(), bookingSeats + 1))}
                        disabled={bookingSeats >= getSeatsLeft()}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="booking-price">
                    <span>Total:</span>
                    <span className="total-price">R{(bookingSeats * parseFloat(ride.price_per_seat)).toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  className="book-button" 
                  onClick={handleBookRide}
                  disabled={bookingLoading || !user}
                >
                  {bookingLoading ? (
                    <>
                      <FaSpinner className="spinner-icon" /> Processing...
                    </>
                  ) : !user ? (
                    'Sign in to Book'
                  ) : (
                    'Book Now'
                  )}
                </button>
                <p className="booking-note">
                  <FaInfoCircle className="note-icon" /> By booking, you agree to pay the driver directly. Contact details will be shared after booking.
                </p>
              </div>
            ) : (
              <div className="fully-booked">
                <h3>Fully Booked</h3>
                <p>This ride has no available seats left. Try looking for another ride.</p>
                <Link to="/rides" className="find-rides-button">
                  Find Other Rides
                </Link>
              </div>
            )}
          </div>
        )}

        {isDriver && (
          <div className="driver-controls">
            <h3>You're the driver</h3>
            <p>This is your ride listing. You can manage your ride here.</p>
            <div className="driver-actions">
              <button className="edit-ride-button">
                Edit Ride
              </button>
              <button className="delete-ride-button">
                Cancel Ride
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideDetails; 