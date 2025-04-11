import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import { FaBars, FaTimes, FaUserCircle, FaCar } from "react-icons/fa";
import "./Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
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
    
    return () => {
      authListener?.subscription?.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
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
              <span><FaCar className="nav-icon" /> Rides</span>
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