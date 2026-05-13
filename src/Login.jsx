import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaLock, FaEnvelope, FaRocket } from "react-icons/fa";
import { generateAndSaveFCMToken } from "./config/firebase";

const API_URL = (import.meta.env.VITE_API_URL || 'https://cryptonest-backend.onrender.com').replace(/\/$/, '').replace(/\/api$/, '');

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/SuperAdmin/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const data = await response.json();

      if (response.ok && data.message === "Login successful") {
        // Store token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("superAdminToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // ✅ FCM Token generate karo aur backend pe save karo
        generateAndSaveFCMToken(data.token);

        await Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: `Welcome back, ${data.user.name}!`,
          background: "#000000",
          color: "#F3C06A",
          confirmButtonColor: "#D4AF37",
          timer: 1500,
          showConfirmButton: false,
        });

        navigate("/Dashbord");
      } else {
        throw new Error(data.message || "Invalid credentials");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err.message || "Network error or invalid credentials",
        background: "#000000",
        color: "#F3C06A",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-black">
        {/* Floating Golden Orbs Animation */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#D4AF37] rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-[#F3C06A] rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-[#D4AF37] rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md z-10">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37] via-[#F3C06A] to-[#D4AF37] rounded-3xl blur opacity-20 animate-pulse"></div>

        <div className="relative bg-black/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-[#D4AF37]/20 overflow-hidden">
          {/* Header with Logo */}
          <div className="bg-gradient-to-b from-[#1a1a1a] to-black p-10 text-center relative border-b border-[#D4AF37]/10">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="mb-6 flex justify-center transform hover:scale-110 transition-transform duration-500">
                <img src="/image.png" alt="CryptoNext Logo" className="h-32 w-auto object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]" />
              </div>
              <h1 className="text-3xl font-black text-[#F3C06A] mb-2 tracking-[0.3em] uppercase">
                Admin Panel
              </h1>
              <p className="text-[#D4AF37]/60 text-xs font-bold uppercase tracking-widest">
                Authorized Access Only
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-[#D4AF37]/80 text-xs font-bold uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/50 group-focus-within:text-[#F3C06A] transition-colors">
                    <FaEnvelope />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@cryptonext.com"
                    className="w-full pl-12 pr-4 py-4 bg-[#1a1a1a]/50 border border-[#D4AF37]/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-[#D4AF37]/80 text-xs font-bold uppercase tracking-widest ml-1">Security Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/50 group-focus-within:text-[#F3C06A] transition-colors">
                    <FaLock />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-[#1a1a1a]/50 border border-[#D4AF37]/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all duration-300"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#D4AF37] via-[#F3C06A] to-[#D4AF37] text-black font-black py-4 px-4 rounded-xl hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,175,55,0.2)] uppercase tracking-widest text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                "Secure Login"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-8 text-center">
            <p className="text-[#D4AF37]/40 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <span className="w-8 h-[1px] bg-[#D4AF37]/10"></span>
              Secure Blockchain Infrastructure
              <span className="w-8 h-[1px] bg-[#D4AF37]/10"></span>
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
