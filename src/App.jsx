import { useEffect } from "react";
import OneSignal from "react-onesignal";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";


function App() {
  useEffect(() => {
    // Initialize OneSignal
    OneSignal.init({
      appId: "0e5bc7cf-a989-495a-96d8-178e2508d076", // Replace with your OneSignal App ID
      allowLocalhostAsSecureOrigin: true, // Allow localhost for development
    }).then(() => {
      // Prompt the user to allow notifications
      OneSignal.showSlidedownPrompt();
    });
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
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;