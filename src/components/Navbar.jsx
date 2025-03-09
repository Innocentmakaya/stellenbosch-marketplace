import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import supabase from "../supabaseClient";
import { FaBars, FaTimes } from "react-icons/fa";
import "./Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Hide navbar on login and signup pages
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  // Hide hamburger menu on the Home page
  const isHomePage = location.pathname === "/";

  // Do not render the navbar on login and signup pages
  if (isAuthPage) {
    return null;
  }

  return (
    <nav className="navbar">
      {/* Logo */}
      <h1 className="logo">Student Marketplace</h1>

      {/* Mobile Menu Toggle (Hidden on the Home page) */}
      {!isHomePage && (
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
      )}

      {/* Navbar Links (Desktop) */}
      <div className={`nav-links ${isMobileMenuOpen ? "active" : ""}`}>
        {user && !isHomePage && ( // Only show links if user is logged in and not on the Home page
          <>
            <Link
              to="/listings"
              className={location.pathname === "/listings" ? "link active-link" : "link"}
              onClick={toggleMobileMenu}
            >
              Browse Listings
            </Link>
            <Link
              to="/my-listings"
              className={location.pathname === "/my-listings" ? "link active-link" : "link"}
              onClick={toggleMobileMenu}
            >
              My Listings
            </Link>
            <Link
              to="/sell"
              className={location.pathname === "/sell" ? "link active-link" : "link"}
              onClick={toggleMobileMenu}
            >
              Sell Item
            </Link>
            <Link
              to="/profile"
              className={location.pathname === "/profile" ? "link active-link" : "link"}
              onClick={toggleMobileMenu}
            >
              Profile
            </Link>
          </>
        )}
      </div>

      {/* Auth Section */}
      <div className="auth-section">
        {user ? (
          <div className="user-section">
            <span className="user-email">{user.email}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        ) : (
          // Show Login/Sign Up buttons on the Home page
          isHomePage && (
            <div className="auth-buttons">
              <Link to="/login">
                <button className="auth-button">Login</button>
              </Link>
              <Link to="/signup">
                <button className="auth-button">Sign Up</button>
              </Link>
            </div>
          )
        )}
      </div>
    </nav>
  );
}

export default Navbar;