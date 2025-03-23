import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import "./Login.css";
import { FaEnvelope, FaLock, FaUniversity } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("Attempting to log in...");

      // Step 1: Sign in the user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Sign-in response:", signInData, signInError);

      if (signInError) throw new Error(signInError.message);

      const user = signInData.user;
      if (!user) throw new Error("User not found.");

      console.log("🔑 User signed in:", user);

      // Step 2: Check if the user has a profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      console.log("Profile check result:", profile, profileError);

      if (profileError) throw new Error(profileError.message);

      // Step 3: If the user doesn't have a profile, create one
      if (!profile) {
        console.log("➕ Inserting user into profiles table...");

        const { error: insertError } = await supabase.from("profiles").insert([
          {
            id: user.id,
            full_name: user.user_metadata?.full_name || "",
            username: email.split("@")[0],
            email,
            phone: user.user_metadata?.phone || "",
            user_type: "student",
            created_at: new Date(),
          },
        ]);

        console.log("Insert result:", insertError);

        if (insertError) throw new Error(insertError.message);

        console.log("✅ User inserted into profiles table.");
      }

      console.log("Login successful! Redirecting to Home page...");
      navigate("/listings");
    } catch (error) {
      console.error("❌ Error during login:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="login-banner">
          <div className="login-logo">
            <FaUniversity className="university-icon" />
            <h1>Matie Market</h1>
          </div>
          <p className="login-tagline">Buy, sell, and connect with fellow Maties</p>
        </div>
        
        <div className="login-form-box">
          <h2>Welcome Back!</h2>
          <p className="login-subtitle">Sign in to continue to Matie Market</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="Stellenbosch Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="login-options">
              <a href="/reset-password" className="forgot-password">
                Forgot Password?
              </a>
            </div>
            
            <button 
              type="submit" 
              className={`login-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          
          <div className="login-footer">
            <p>Don't have an account? <a href="/signup" className="signup-link">Sign Up</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;