import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import "./Profile.css";

const Profile = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      // Fetch profile data from the `profiles` table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setErrorMessage("Failed to fetch profile data.");
        return;
      }

      // Populate form fields with profile data
      setFullName(profile.full_name || "");
      setUsername(profile.username || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
    };

    fetchProfile();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      // Update profile data in the `profiles` table
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          username,
          phone,
        })
        .eq("id", user.id);

      if (error) throw new Error(error.message);

      setSuccessMessage("Profile updated successfully!");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2>Profile</h2>
        </div>
        
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="text"
            value={email}
            disabled
          />
        </div>
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            value={fullName || ''}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username || ''}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="tel"
            value={phone || ''}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <button
          className="profile-submit-btn"
          onClick={(e) => handleSubmit(e)}
          disabled={loading}
        >
          <span>{loading ? 'Updating...' : 'Update Profile'}</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;