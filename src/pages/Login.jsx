import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import "./Login.css";
import { FaEnvelope, FaLock } from "react-icons/fa"; // Import icons

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true); // Start loading

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
      navigate("/"); // Redirect to the Home page after successful login
    } catch (error) {
      console.error("❌ Error during login:", error);
      setError(error.message);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome Back!</h2>
        <p>Log in to continue</p>
        {error && <p className="error">{error}</p>}
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
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="forgot-password">
          <a href="/reset-password">Forgot Password?</a>
        </p>
      </div>
    </div>
  );
};

export default Login;