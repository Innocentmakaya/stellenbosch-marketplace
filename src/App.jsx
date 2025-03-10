import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
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
import Profile from "./pages/Profile";
import { supabase } from "./supabaseClient";
import { requestNotificationPermission } from "./firebase";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);

        // Request Notification Permission and store FCM token
        const fcmToken = await requestNotificationPermission();
        if (fcmToken) {
          await supabase.from("users").update({ fcm_token: fcmToken }).eq("id", data.user.id);
        }
      }
    };

    fetchUser();
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
