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
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw new Error(signInError.message);

      const user = signInData.user;
      if (!user) throw new Error("User not found.");

      console.log("🔑 User signed in:", user);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw new Error(profileError.message);

      console.log("🔍 Profile check result:", profile);

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

        if (insertError) throw new Error(insertError.message);

        console.log("✅ User inserted into profiles table.");
      }

      alert("Login successful!");
      navigate("/");
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