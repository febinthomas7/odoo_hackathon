import { Eye, EyeClosed } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [eyePassword, setEyePassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Dynamic portal state
  const [portalConfig, setPortalConfig] = useState({
    name: "Asset FLow",
    role: "user",
    dashboardRoute: null,
  });

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotMsg, setForgotMsg] = useState(null);

  // The O(1) Speed dynamic prefix detector
  const detectPortalType = (id) => {
    // Check if ID exists, is long enough, and has a hyphen at the exact 3rd position
    if (!id || id.length < 3 || id[2] !== "-") {
      return { name: "Asset FLow", role: "user", dashboardRoute: null };
    }

    // Extract exactly the 2-character prefix (e.g., "AD")
    const prefix = id.substring(0, 2).toUpperCase();

    return {
      name: prefix,
      role: prefix,
      dashboardRoute: `/${prefix.toLowerCase()}/dashboard`,
    };
  };

  // Update UI dynamically as user types their ID
  const handleIdChange = (e) => {
    setErrorMessage(""); // clear errors when typing
    setPortalConfig(detectPortalType(e.target.value));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Prevent submission if the ID format is invalid
    if (!portalConfig.dashboardRoute) {
      setErrorMessage(
        "Invalid ID format. Must include a valid prefix (e.g., AD-).",
      );
      return;
    }

    setIsLoading(true);

    const formData = new FormData(e.target);

    const credentials = {
      id: formData.get("userId"),
      password: formData.get("password"),
      role: portalConfig.role,
    };

    try {
      // Dynamic API URL
      const apiUrl = `http://127.0.0.1:8000/api/${portalConfig.role.toLowerCase()}/login/`;

      console.log("API URL =>", apiUrl);
      console.log("Credentials =>", credentials);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      console.log("Response Data =>", data);

      // SUCCESS LOGIN
      if (response.ok) {
        // Store JWT tokens
        localStorage.setItem("token", data.access);
        localStorage.setItem("refresh", data.refresh);

        // Store user info
        localStorage.setItem("role", data.role);
        localStorage.setItem("dashboardName", data.name);
        localStorage.setItem("user_id", data.user_id);

        e.target.reset();

        // Navigate dynamically
        setTimeout(() => {
          navigate(portalConfig.dashboardRoute);
        }, 800);
      } else {
        setErrorMessage(data.error || "Invalid Credentials");
      }
    } catch (error) {
      console.log("FULL ERROR =>", error);
      setErrorMessage(
        "Server connection failed. Is the Django server running?",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[128px] animate-blob" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/30 rounded-full mix-blend-screen filter blur-[128px] animate-blob animation-delay-2000" />

      {/* Login Card (Glassmorphism) */}
      <div className="relative z-10 w-full max-w-[400px] mx-4 px-8 py-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300">
        {/* Header & Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex justify-center items-center text-xl font-bold text-white shadow-lg mb-4 ring-2 ring-white/10">
            AF
          </div>
          <h2 className="text-2xl font-semibold text-white tracking-wide transition-colors duration-300">
            {portalConfig.name === "Asset FLow"
              ? "Welcome to AssetFlow"
              : `${portalConfig.name} Portal`}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Sign in to manage your assets
          </p>
        </div>

        {/* Inline Error Message Replacement for Toast */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
            {errorMessage}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          {/* USER ID */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="userId"
              className="text-sm font-medium text-slate-300 transition-all"
            >
              {portalConfig.name === "Asset FLow"
                ? "User ID"
                : `${portalConfig.name} ID`}
            </label>
            <input
              type="text"
              id="userId"
              name="userId"
              onChange={handleIdChange}
              placeholder="e.g. AD-190080070011"
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-2.5 px-3 text-white text-base outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-500 uppercase"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-300"
              >
                Password
              </label>
              <a
                href="#forgot"
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                type={eyePassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="••••••••"
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-2.5 px-3 pr-10 text-white text-base outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
                required
              />
              <div className="absolute right-3 top-3 z-10">
                {eyePassword ? (
                  <Eye
                    onClick={() => setEyePassword(!eyePassword)}
                    className="h-5 w-5 text-slate-400 hover:text-indigo-400 cursor-pointer transition-colors"
                  />
                ) : (
                  <EyeClosed
                    onClick={() => setEyePassword(!eyePassword)}
                    className="h-5 w-5 text-slate-400 hover:text-indigo-400 cursor-pointer transition-colors"
                  />
                )}
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className={`mt-2 w-full flex justify-center items-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium py-3 rounded-lg text-base shadow-lg shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 ${
              isLoading ? "cursor-not-allowed opacity-70" : ""
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              `Sign in as ${
                portalConfig.name === "Asset FLow" ? "User" : portalConfig.name
              }`
            )}
          </button>
        </form>

        <div className="mt-5 flex items-center gap-3">
          <div className="h-px w-full bg-white/10"></div>
          <span className="text-xs text-slate-400 uppercase tracking-wider">
            New
          </span>
          <div className="h-px w-full bg-white/10"></div>
        </div>

        <div className="mt-4">
          <div className="bg-slate-900/40 border border-white/5 rounded-lg p-3 text-center mb-3">
            <p className="text-sm text-slate-400 leading-snug">
              Sign up creates an{" "}
              <span className="text-slate-300 font-medium">
                employee account
              </span>
              . Admin roles are assigned later.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-lg text-base transition-all duration-300"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
