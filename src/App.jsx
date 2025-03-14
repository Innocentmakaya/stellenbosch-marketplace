import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import supabase from "./supabaseClient";
import { requestForToken, onMessageListener } from "./firebase";
import "./styles.css";

function App() {
  useEffect(() => {
    const getUserToken = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const token = await requestForToken();
        if (token) {
          await supabase
            .from("profiles")
            .update({ fcm_token: token })
            .eq("id", user.id);
          console.log("FCM Token saved:", token);
        }
      }
    };

    getUserToken();

    // Listen for foreground notifications
    onMessageListener()
      .then((payload) => {
        alert(`Notification: ${payload.notification.title} - ${payload.notification.body}`);
      })
      .catch((err) => console.log("Failed to receive message: ", err));
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
