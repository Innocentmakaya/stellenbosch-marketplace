import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import { FaBars, FaTimes, FaUserCircle, FaCar, FaBell } from "react-icons/fa";
import "./Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [newRidesCount, setNewRidesCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Function to check for new rides
  const checkForNewRides = async () => {
    if (!user) return;
    
    try {
      // Get the last time rides were checked from localStorage
      const lastChecked = localStorage.getItem('lastRidesCheck') || '2000-01-01T00:00:00Z';
      
      // Get rides created after the last check
      const { data: rides, error } = await supabase
        .from('rides')
        .select('id, created_at, user_id')
        .gt('created_at', lastChecked)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching new rides:', error);
        return;
      }
      
      // Don't count the user's own rides as "new"
      const otherUserRides = rides.filter(ride => ride.user_id !== user.id);
      
      // Update the new rides count
      setNewRidesCount(otherUserRides.length);
      
      // If currently on the rides page, update the last checked time
      if (location.pathname === '/rides') {
        localStorage.setItem('lastRidesCheck', new Date().toISOString());
        setNewRidesCount(0);
      }
    } catch (error) {
      console.error('Error checking for new rides:', error);
    }
  };
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Once we have the user, check for new rides
      if (user) {
        checkForNewRides();
      }
    };
    
    getUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    
    // Add scroll event listener
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Set up interval to periodically check for new rides (every 2 minutes)
    const rideCheckInterval = setInterval(() => {
      if (user) {
        checkForNewRides();
      }
    }, 120000); // 2 minutes
    
    return () => {
      authListener?.subscription?.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
      clearInterval(rideCheckInterval);
    };
  }, [user]);
  
  // Reset new rides counter when navigating to the rides page
  useEffect(() => {
    if (location.pathname === '/rides') {
      localStorage.setItem('lastRidesCheck', new Date().toISOString());
      setNewRidesCount(0);
    }
  }, [location.pathname]);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/'); // Redirect to the home page instead of login page
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Toggle body scroll when menu is open
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : '';
  };
  
  // Close mobile menu when location changes
  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
      document.body.style.overflow = '';
    }
  }, [location]);
  
  // Hide hamburger menu on login, signup, and home pages
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  const isHomePage = location.pathname === "/";
  
  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''} ${isMobileMenuOpen ? 'menu-open' : ''}`}>
      {/* Logo */}
      <Link to="/" className="logo-link">
        <h1 className="logo">Matie Market</h1>
      </Link>
      
      {/* Mobile Menu Toggle (Hidden on auth and home pages) */}
      {!isAuthPage && !isHomePage && (
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
      )}
      
      {/* Navbar Links (Desktop) */}
      <div className={`nav-links ${isMobileMenuOpen ? "active" : ""}`}>
        {user && (
          <>
            <Link
              to="/listings"
              className={location.pathname === "/listings" ? "link active-link" : "link"}
              onClick={toggleMobileMenu}
            >
              <span>Browse Listings</span>
            </Link>
            <Link
              to="/rides"
              className={location.pathname.includes("/ride") ? "link active-link" : "link"}
              onClick={toggleMobileMenu}
            >
              <div className="nav-link-with-badge">
                <span><FaCar className="nav-icon" /> Rides</span>
                {newRidesCount > 0 && (
                  <span className="notification-badge">{newRidesCount}</span>
                )}
              </div>
            </Link>
            <Link
              to="/my-listings"
              className={location.pathname === "/my-listings" ? "link active-link" : "link"}
              onClick={toggleMobileMenu}
            >
              <span>My Listings</span>
            </Link>
            <Link
              to="/sell"
              className={location.pathname === "/sell" ? "link active-link" : "link"}
              onClick={toggleMobileMenu}
            >
              <span>Sell Item</span>
            </Link>
            <Link
              to="/profile"
              className={location.pathname === "/profile" ? "link active-link" : "link"}
              onClick={toggleMobileMenu}
            >
              <span>Profile</span>
            </Link>
          </>
        )}
      </div>
      
      {/* Auth Section */}
      <div className="auth-section">
        {user ? (
          <div className="user-section">
            <Link to="/profile" className="user-profile-link">
              <span className="user-email">
                <FaUserCircle className="user-icon" /> {user.email && user.email.split('@')[0]}
              </span>
            </Link>
            <button onClick={handleLogout} className="logout-button">
              <span>Logout</span>
            </button>
          </div>
        ) : (
          !isAuthPage && ( // Hide auth buttons on login/signup pages
            <div className="auth-buttons">
              <Link to="/login">
                <button className="auth-button">
                  <span>Login</span>
                </button>
              </Link>
              <Link to="/signup">
                <button className="auth-button">
                  <span>Sign Up</span>
                </button>
              </Link>
            </div>
          )
        )}
      </div>
    </nav>
  );
}

export default Navbar;