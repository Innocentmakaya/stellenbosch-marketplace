import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import supabase from "./supabaseClient"; // Import Supabase client
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import SellItem from "./pages/SellItem";
import Signup from "./pages/Signup";
import MyListings from "./pages/MyListings";
import ListingDetails from "./pages/ListingDetails";
import Login from "./pages/Login";
import "./styles.css";
import EditListing from "./pages/EditListing";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Profile from "./pages/Profile";

function App() {
  useEffect(() => {
    // Request notification permission when the app loads
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        }
      });
    }

    // Subscribe to Supabase Realtime for new listings
    const listingsSubscription = supabase
      .channel("listings") // Create a channel for listings
      .on(
        "postgres_changes", // Listen for PostgreSQL changes
        { event: "INSERT", schema: "public", table: "listings" }, // Only listen for INSERT events on the "listings" table
        (payload) => {
          // When a new listing is added, trigger a notification
          const newListing = payload.new;
          if (Notification.permission === "granted") {
            new Notification("New Listing Added", {
              body: `A new item "${newListing.title}" has been listed in the ${newListing.category} category.`,
              icon: newListing.image_url, // Use the listing image as the notification icon
            });
          }
        }
      )
      .subscribe(); // Subscribe to the channel

    // Cleanup the subscription when the component unmounts
    return () => {
      listingsSubscription.unsubscribe();
    };
  }, []); // Run this effect only once when the component mounts

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