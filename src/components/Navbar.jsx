import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import supabase from "../supabaseClient";

function Navbar() {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav style={styles.navbar}>
      <h1 style={styles.logo}>Student Marketplace</h1>

      <button style={styles.menuButton} onClick={toggleMobileMenu}>
        ☰
      </button>

      <div
        style={{
          ...styles.navLinks,
          ...(isMobileMenuOpen ? styles.navLinksMobile : {}),
        }}
      >
        {user && (
          <>
            <Link
              to="/listings"
              style={
                location.pathname === "/listings"
                  ? { ...styles.link, ...styles.activeLink }
                  : styles.link
              }
              onClick={toggleMobileMenu}
            >
              Browse Listings
            </Link>
            <Link
              to="/my-listings"
              style={
                location.pathname === "/my-listings"
                  ? { ...styles.link, ...styles.activeLink }
                  : styles.link
              }
              onClick={toggleMobileMenu}
            >
              My Listings
            </Link>
            <Link
              to="/sell"
              style={
                location.pathname === "/sell"
                  ? { ...styles.link, ...styles.activeLink }
                  : styles.link
              }
              onClick={toggleMobileMenu}
            >
              Sell Item
            </Link>
            <Link
              to="/profile"
              style={
                location.pathname === "/profile"
                  ? { ...styles.link, ...styles.activeLink }
                  : styles.link
              }
              onClick={toggleMobileMenu}
            >
              Profile
            </Link>
          </>
        )}
        {user ? (
          <div style={styles.userSection}>
            <span style={styles.userEmail}>{user.email}</span>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        ) : (
          <div style={styles.authButtons}>
            <Link to="/login" onClick={toggleMobileMenu}>
              <button style={styles.authButton}>Login</button>
            </Link>
            <Link to="/signup" onClick={toggleMobileMenu}>
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
  menuButton: {
    background: "none",
    border: "none",
    color: "white",
    fontSize: "24px",
    cursor: "pointer",
    display: "none", // Hidden on desktop
  },
  navLinks: {
    display: "flex",
    gap: "20px",
    flex: 1,
    marginLeft: "20px",
  },
  navLinksMobile: {
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    top: "60px",
    left: 0,
    width: "100%",
    backgroundColor: "#6200ea",
    padding: "10px",
    zIndex: 1001,
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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderBottom: "2px solid white",
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

  // Media Query for Mobile Screens
  "@media (max-width: 768px)": {
    navLinks: {
      display: "none",
    },
    menuButton: {
      display: "block",
    },
  },
};

export default Navbar;
