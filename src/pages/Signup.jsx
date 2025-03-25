import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../supabaseClient";
import "./Signup.css";
import { FaEnvelope, FaLock, FaUniversity, FaUser, FaPhone, FaUserGraduate } from "react-icons/fa";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("student"); // Default role
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate email domain
    if (!email.endsWith("@sun.ac.za")) {
      setError("You must use a Stellenbosch University email (e.g., 2435438@sun.ac.za)");
      setLoading(false);
      return;
    }

    // Validate required fields
    if (!fullName || !username || !phone || !password) {
      setError("All fields are required!");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Sign up the user with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName, // Save metadata for later
            phone: phone,
          },
          emailRedirectTo: "http://localhost:5173/login", // Redirect to login after confirmation
        },
      });

      if (signUpError) throw new Error(signUpError.message);

      // Step 2: Show success message and redirect to login
      alert("Signup successful! Please check your email to confirm your account.");
      navigate("/login");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form-container">
        <div className="signup-banner">
          <div className="signup-logo">
            <FaUniversity className="university-icon" />
            <h1>Matie Market</h1>
          </div>
          <p className="signup-tagline">Join the Stellenbosch student marketplace</p>
        </div>
        
        <div className="signup-form-box">
          <h2>Create Your Account</h2>
          <p className="signup-subtitle">Fill in your details to get started</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSignup}>
            <div className="input-group">
              <FaUser className="input-icon" />
              <input 
                type="text" 
                placeholder="Full Name" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
              />
            </div>
            
            <div className="input-group">
              <FaUserGraduate className="input-icon" />
              <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
            
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input 
                type="email" 
                placeholder="Stellenbosch Email (@sun.ac.za)" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            
            <div className="input-group">
              <FaPhone className="input-icon" />
              <input 
                type="text" 
                placeholder="Phone Number" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
              />
            </div>
            
            <div className="input-group">
              <FaUniversity className="input-icon" />
              <select 
                value={userType} 
                onChange={(e) => setUserType(e.target.value)} 
                required
              >
                <option value="student">Student</option>
                <option value="seller">Seller</option>
              </select>
            </div>
            
            <div className="input-group">
              <FaLock className="input-icon" />
              <input 
                type="password" 
                placeholder="Password (min 6 chars)" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            
            <button 
              type="submit" 
              className="signup-button" 
              disabled={loading}
            >
              <span>{loading ? "Creating Account..." : "Create Account"}</span>
            </button>
          </form>
          
          <div className="signup-footer">
            <p>Already have an account? <Link to="/login" className="login-link">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;