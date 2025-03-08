import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import supabase from "../supabaseClient";

function Navbar() {
  const [user, setUser] = useState(null);
  const location = useLocation(); // Get the current route

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Listen for auth changes
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

  return (
    <nav style={styles.navbar}>
      <h1 style={styles.logo}>Student Marketplace</h1>
      
      {/* Navbar links (only shown when user is logged in) */}
      {user && (
        <div style={styles.navLinks}>
          <Link 
            to="/listings" 
            style={location.pathname === "/listings" ? { ...styles.link, ...styles.activeLink } : styles.link}
          >
            Browse Listings
          </Link>
          <Link 
            to="/my-listings" 
            style={location.pathname === "/my-listings" ? { ...styles.link, ...styles.activeLink } : styles.link}
          >
            My Listings
          </Link>
          <Link 
            to="/sell" 
            style={location.pathname === "/sell" ? { ...styles.link, ...styles.activeLink } : styles.link}
          >
            Sell Item
          </Link>
          <Link 
            to="/profile" 
            style={location.pathname === "/profile" ? { ...styles.link, ...styles.activeLink } : styles.link}
          >
            Profile
          </Link>
        </div>
      )}

      {/* Auth buttons (always on the right) */}
      <div style={styles.authSection}>
        {user ? (
          <div style={styles.userSection}>
            <span style={styles.userEmail}>{user.email}</span>
            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
          </div>
        ) : (
          <div style={styles.authButtons}>
            <Link to="/login">
              <button style={styles.authButton}>Login</button>
            </Link>
            <Link to="/signup">
              <button style={styles.authButton}>Sign Up</button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    width: "100%",
    backgroundColor: "#6200ea",
    padding: "15px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
  },
  logo: {
    color: "white",
    fontSize: "24px",
    fontWeight: "bold",
  },
  navLinks: {
    display: "flex",
    gap: "20px",
    flex: 1, // Take up remaining space
    marginLeft: "20px", // Add some spacing
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "18px",
    padding: "5px 10px",
    borderRadius: "5px",
    transition: "background 0.3s ease",
  },
  activeLink: {
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Highlight active link
    borderBottom: "2px solid white", // Add an underline
  },
  authSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  authButtons: {
    display: "flex",
    gap: "10px",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  userEmail: {
    color: "white",
    fontSize: "16px",
  },
  authButton: {
    background: "white",
    color: "#6200ea",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },
  logoutButton: {
    background: "#ff4d4d",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },
};

export default Navbar;