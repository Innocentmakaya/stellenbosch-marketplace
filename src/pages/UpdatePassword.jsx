import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import "./UpdatePassword.css";

const UpdatePassword = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Hide the navbar when this component mounts
  useEffect(() => {
    const navbar = document.querySelector("nav"); // Select the navbar element
    if (navbar) {
      navbar.style.display = "none"; // Hide the navbar
    }

    // Cleanup: Show the navbar again when the component unmounts
    return () => {
      if (navbar) {
        navbar.style.display = "block"; // Show the navbar again
      }
    };
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      // Use the Supabase client to update the password
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("✅ Password updated successfully! Redirecting to login...");

        // Log the user out after updating the password
        await supabase.auth.signOut();

        // Redirect to the login page in the same tab
        window.location.href = "http://localhost:5173/login"; // Use full URL to ensure a hard redirect
      }
    } catch (err) {
      setError("Failed to update password. Please try again.");
    }
  };

  return (
    <div className="update-password-container">
      <h2>Update Password</h2>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      <form onSubmit={handlePasswordUpdate}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
};

export default UpdatePassword;