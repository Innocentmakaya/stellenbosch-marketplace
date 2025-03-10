import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import supabase from "./supabaseClient";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import SellItem from "./pages/SellItem";
import Signup from "./pages/Signup";
import MyListings from "./pages/MyListings";
import ListingDetails from "./pages/ListingDetails";
import Login from "./pages/Login";
import EditListing from "./pages/EditListing";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Profile from "./pages/Profile"; // Import the Profile component
import "./styles.css";

function App() {
  useEffect(() => {
    // Request notification permission when the app loads
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Listen for new listings using Supabase Realtime
    const subscription = supabase
      .channel("listings")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "listings" }, (payload) => {
        if (Notification.permission === "granted") {
          new Notification("New Item for Sale!", {
            body: `${payload.new.title} is now available for sale.`,
            icon: payload.new.image_url,
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <Router>
      <Navbar />
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/sell" element={<SellItem />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/edit-listing/:id" element={<EditListing />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/listing/:id" element={<ListingDetails />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;