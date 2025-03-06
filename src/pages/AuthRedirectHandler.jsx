import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthRedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🌍 Full URL:", window.location.href); // Log full URL
    console.log("🔍 URL Params:", window.location.search); // Log query params

    const params = new URLSearchParams(window.location.search);

    if (params.has("type")) {
      console.log("✅ Detected 'type' in URL:", params.get("type"));

      if (params.get("type") === "recovery") {
        console.log("🔄 Redirecting to /update-password");
        navigate("/update-password");
      }
    } else {
      console.log("❌ No 'type' found in URL");
    }
  }, [navigate]);

  return null;
};

export default AuthRedirectHandler;
