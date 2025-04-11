import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaFilter, FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaSortAmountDown, FaSortAmountUp, FaUser } from 'react-icons/fa';
import supabase from "../supabaseClient";
import RideCard from '../components/RideCard';
import './Rides.css';

const Rides = () => {
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    departureLocation: '',
    destination: '',
    date: '',
    minSeats: 1,
    maxPrice: '',
  });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date-asc'); // date-asc, date-desc, price-asc, price-desc
  const [popularLocations, setPopularLocations] = useState([]);

  // Fetch user and ride data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Ensure tables exist
      await setupRidesTables();
      
      // Get rides from Supabase
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .gte('departure_date', new Date().toISOString().split('T')[0])
        .order('departure_date', { ascending: true });
      
      if (error) {
        console.error('Error fetching rides:', error);
        setLoading(false);
        return;
      }
      
      // Get user profile information for each ride
      const formattedRides = await Promise.all(data.map(async ride => {
        // Get the driver's full_name from the profiles table
        const { data: profileData } = await supabase
          .from('profiles')
          .select('phone, full_name')
          .eq('id', ride.user_id)
          .single();

        return {
          ...ride,
          driver_name: profileData?.full_name || `Driver ${ride.user_id.substring(0, 4)}`,
          driver_phone: profileData?.phone || null,
          driver_avatar: null,
        };
      }));
      
      setRides(formattedRides);
      setFilteredRides(formattedRides);
      
      // Extract unique locations for filter suggestions
      const locations = [...new Set([
        ...formattedRides.map(ride => ride.departure_location),
        ...formattedRides.map(ride => ride.destination)
      ])].filter(Boolean);
      
      setPopularLocations(locations.slice(0, 6));
      setLoading(false);
    };
    
    fetchData();
  }, []);
  
  // Create database tables if they don't exist
  const setupRidesTables = async () => {
    try {
      // Check if rides table exists by trying to get one row
      const { error } = await supabase
        .from('rides')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') {
        // Table doesn't exist, show SQL to create it
        console.log("Rides table doesn't exist yet. Here's the SQL to create it:");
        
        const createRidesTableSQL = `
          CREATE TABLE rides (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users NOT NULL,
            departure_location TEXT NOT NULL,
            destination TEXT NOT NULL,
            departure_date DATE NOT NULL,
            departure_time TIME NOT NULL,
            total_seats INTEGER NOT NULL,
            booked_seats INTEGER DEFAULT 0,
            price_per_seat DECIMAL(10, 2) NOT NULL,
            car_model TEXT,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE TABLE ride_bookings (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            ride_id UUID REFERENCES rides NOT NULL,
            user_id UUID REFERENCES auth.users NOT NULL,
            seats_booked INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE (ride_id, user_id)
          );
          
          -- Security policies
          ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
          ALTER TABLE ride_bookings ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Anyone can view rides" 
          ON rides FOR SELECT 
          USING (true);
          
          CREATE POLICY "Users can create rides" 
          ON rides FOR INSERT 
          TO authenticated
          WITH CHECK (auth.uid() = user_id);
          
          CREATE POLICY "Users can update their own rides" 
          ON rides FOR UPDATE 
          TO authenticated
          USING (auth.uid() = user_id);
          
          CREATE POLICY "Users can delete their own rides" 
          ON rides FOR DELETE 
          TO authenticated
          USING (auth.uid() = user_id);
          
          -- Policies for bookings
          CREATE POLICY "Anyone can view bookings" 
          ON ride_bookings FOR SELECT 
          USING (true);
          
          CREATE POLICY "Users can create bookings" 
          ON ride_bookings FOR INSERT 
          TO authenticated
          WITH CHECK (auth.uid() = user_id);
          
          CREATE POLICY "Users can update their own bookings" 
          ON ride_bookings FOR UPDATE 
          TO authenticated
          USING (auth.uid() = user_id);
          
          CREATE POLICY "Users can delete their own bookings" 
          ON ride_bookings FOR DELETE 
          TO authenticated
          USING (auth.uid() = user_id);
        `;
        
        alert(`Rides table doesn't exist yet. Please run the SQL in your Supabase SQL Editor:\n\n${createRidesTableSQL}`);
      }
    } catch (error) {
      console.error('Error setting up rides tables:', error);
    }
  };

  // Filter rides when filters or search change
  useEffect(() => {
    if (!rides.length) return;
    
    let result = [...rides];
    
    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(ride => 
        ride.departure_location.toLowerCase().includes(searchLower) ||
        ride.destination.toLowerCase().includes(searchLower) ||
        ride.description?.toLowerCase().includes(searchLower) ||
        ride.car_model?.toLowerCase().includes(searchLower) ||
        ride.driver_name.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply filters
    if (filters.departureLocation) {
      result = result.filter(ride => 
        ride.departure_location.toLowerCase().includes(filters.departureLocation.toLowerCase())
      );
    }
    
    if (filters.destination) {
      result = result.filter(ride => 
        ride.destination.toLowerCase().includes(filters.destination.toLowerCase())
      );
    }
    
    if (filters.date) {
      result = result.filter(ride => 
        ride.departure_date === filters.date
      );
    }
    
    if (filters.minSeats) {
      result = result.filter(ride => 
        (ride.total_seats - (ride.booked_seats || 0)) >= parseInt(filters.minSeats)
      );
    }
    
    if (filters.maxPrice) {
      result = result.filter(ride => 
        parseFloat(ride.price_per_seat) <= parseFloat(filters.maxPrice)
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'date-asc':
        result.sort((a, b) => new Date(a.departure_date) - new Date(b.departure_date));
        break;
      case 'date-desc':
        result.sort((a, b) => new Date(b.departure_date) - new Date(a.departure_date));
        break;
      case 'price-asc':
        result.sort((a, b) => parseFloat(a.price_per_seat) - parseFloat(b.price_per_seat));
        break;
      case 'price-desc':
        result.sort((a, b) => parseFloat(b.price_per_seat) - parseFloat(a.price_per_seat));
        break;
      default:
        break;
    }
    
    setFilteredRides(result);
  }, [rides, filters, search, sortBy]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      departureLocation: '',
      destination: '',
      date: '',
      minSeats: 1,
      maxPrice: '',
    });
    setSearch('');
  };

  // Select a popular location as origin or destination
  const handleSelectLocation = (location, type) => {
    setFilters({
      ...filters,
      [type]: location
    });
  };

  return (
    <div className="rides-container">
      <div className="rides-header">
        <h1>Student Rides</h1>
        <p className="rides-subtitle">Find or offer rides with fellow students</p>
        
        <div className="rides-actions">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search rides, destinations, or drivers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="header-buttons">
            <button 
              className="filter-button"
              onClick={() => setFilterOpen(!filterOpen)}
              aria-expanded={filterOpen}
            >
              <FaFilter /> {filterOpen ? 'Hide Filters' : 'Filters'}
            </button>
            <Link to="/offer-ride" className="offer-ride-button">
              <FaPlus /> Offer a Ride
            </Link>
          </div>
        </div>
        
        {filterOpen && (
          <div className="filters-panel">
            <div className="filters-form">
              <div className="filter-group">
                <label htmlFor="departureLocation">
                  <FaMapMarkerAlt /> From
                </label>
                <input
                  type="text"
                  id="departureLocation"
                  name="departureLocation"
                  placeholder="Departure location"
                  value={filters.departureLocation}
                  onChange={handleFilterChange}
                  list="departure-locations"
                />
                <datalist id="departure-locations">
                  {popularLocations.map((location, index) => (
                    <option key={`from-${index}`} value={location} />
                  ))}
                </datalist>
              </div>
              
              <div className="filter-group">
                <label htmlFor="destination">
                  <FaMapMarkerAlt /> To
                </label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  placeholder="Destination"
                  value={filters.destination}
                  onChange={handleFilterChange}
                  list="destination-locations"
                />
                <datalist id="destination-locations">
                  {popularLocations.map((location, index) => (
                    <option key={`to-${index}`} value={location} />
                  ))}
                </datalist>
              </div>
              
              <div className="filter-group">
                <label htmlFor="date">
                  <FaCalendarAlt /> Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="filter-group">
                <label htmlFor="minSeats">
                  <FaUser /> Min Seats
                </label>
                <input
                  type="number"
                  id="minSeats"
                  name="minSeats"
                  placeholder="Min seats"
                  value={filters.minSeats}
                  onChange={handleFilterChange}
                  min="1"
                />
              </div>
              
              <div className="filter-group">
                <label htmlFor="maxPrice">
                  <FaUser /> Max Price (R)
                </label>
                <input
                  type="number"
                  id="maxPrice"
                  name="maxPrice"
                  placeholder="Max price"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  min="0"
                />
              </div>
              
              <button 
                className="reset-filters-button"
                onClick={handleResetFilters}
              >
                Reset Filters
              </button>
            </div>
            
            {popularLocations.length > 0 && (
              <div className="popular-locations">
                <h4>Popular Locations</h4>
                <div className="location-tags">
                  {popularLocations.map((location, index) => (
                    <div key={index} className="location-tag-container">
                      <button 
                        className="location-tag from-tag"
                        onClick={() => handleSelectLocation(location, 'departureLocation')}
                      >
                        From {location}
                      </button>
                      <button 
                        className="location-tag to-tag"
                        onClick={() => handleSelectLocation(location, 'destination')}
                      >
                        To {location}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="sorting-container">
        <span className="results-count">
          {filteredRides.length} {filteredRides.length === 1 ? 'ride' : 'rides'} found
        </span>
        
        <div className="sort-controls">
          <label htmlFor="sortBy">Sort by:</label>
          <select 
            id="sortBy" 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date-asc">Date (Earliest first)</option>
            <option value="date-desc">Date (Latest first)</option>
            <option value="price-asc">Price (Low to high)</option>
            <option value="price-desc">Price (High to low)</option>
          </select>
          {sortBy.includes('asc') ? <FaSortAmountUp /> : <FaSortAmountDown />}
        </div>
      </div>
      
      <div className="rides-list">
        {loading ? (
          <div className="loading-rides">
            <div className="loading-spinner"></div>
            <p>Loading available rides...</p>
          </div>
        ) : filteredRides.length > 0 ? (
          filteredRides.map(ride => (
            <RideCard key={ride.id} ride={ride} />
          ))
        ) : (
          <div className="no-rides-found">
            <div className="no-rides-icon">
              <FaMapMarkerAlt />
            </div>
            <h3>No rides found</h3>
            <p>Try adjusting your filters or offer a ride yourself!</p>
            <Link to="/offer-ride" className="offer-ride-button">
              <FaPlus /> Offer a Ride
            </Link>
          </div>
        )}
      </div>
      
      <div className="rides-cta">
        <div className="cta-card">
          <h3>Going somewhere?</h3>
          <p>Share your ride, split costs, and reduce your carbon footprint!</p>
          <Link to="/offer-ride" className="cta-button">
            <FaPlus /> Offer a Ride
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Rides; 