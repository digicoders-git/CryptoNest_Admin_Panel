import { useState, useEffect } from "react";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaShieldAlt,
  FaEnvelope,
  FaFingerprint,
  FaUserShield,
  FaServer,
  FaDatabase,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSyncAlt,
  FaArrowLeft,
  FaHome
} from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'https://cryptonest-backend.onrender.com').replace(/\/+$/, '').replace(/\/api$/, '') + '/api/';

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, []);

  // Check password strength
  useEffect(() => {
    const password = formData.newPassword;
    const checks = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    setPasswordChecks(checks);

    let strength = 0;
    if (checks.length) strength += 20;
    if (checks.uppercase) strength += 20;
    if (checks.lowercase) strength += 20;
    if (checks.number) strength += 20;
    if (checks.special) strength += 20;
    setPasswordStrength(strength);
  }, [formData.newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Mismatch Detected",
        text: "New credentials do not match the confirmation field.",
        confirmButtonColor: "#D4AF37",
        background: "#1a1a2e",
        color: "#D4AF37",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Weak Protocol",
        text: "Credentials must contain at least 6 characters for security.",
        confirmButtonColor: "#D4AF37",
        background: "#1a1a2e",
        color: "#D4AF37",
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("superAdminToken");

      const response = await axios.put(
        `${API_URL}SuperAdmin/change-password`,
        {
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data) {
        Swal.fire({
          icon: "success",
          title: "Access Updated",
          text: "System access credentials synchronized successfully.",
          confirmButtonColor: "#D4AF37",
          background: "#1a1a2e",
          color: "#D4AF37",
          timer: 2000,
          showConfirmButton: false,
        });

        setFormData({
          email: formData.email,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Blocked",
        text: error.response?.data?.message || "Internal server error during synchronization.",
        confirmButtonColor: "#D4AF37",
        background: "#1a1a2e",
        color: "#D4AF37",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggle = (field) =>
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));

  const getStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500";
    if (passwordStrength < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength < 40) return "Weak";
    if (passwordStrength < 70) return "Medium";
    return "Strong";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="p-6 lg:p-8">

        {/* Header with Back Button */}
        <div className="border-b border-yellow-500/30 pb-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">

              <div>
                <h1 className="text-xl lg:text-3xl font-semibold bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent flex items-center gap-3">
                  Security Settings
                </h1>
                <p className="text-gray-400 text-sm mt-2">
                  Maintain the integrity of the CryptoNext infrastructure by periodically rotating your administrative access credentials.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] uppercase tracking-widest text-yellow-500">System Online</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Left Column: Security Tech Info */}
          <div className="space-y-6 animate-fadeInLeft">
            {/* Security Header Card */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/30">
                  <FaFingerprint className="text-3xl text-yellow-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Identity Protection</h2>
                  <p className="text-yellow-500/60 text-sm">Multi-layered verification protocols active</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your account security is our top priority. This portal allows you to securely update your access credentials
                while maintaining full audit logging and compliance with industry standards.
              </p>
            </div>

            {/* Security Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: FaFingerprint, label: "Identity Sync", desc: "Multi-layered verification protocols.", color: "text-purple-400" },
                { icon: FaServer, label: "Node Security", desc: "End-to-end encrypted terminal access.", color: "text-blue-400" },
                { icon: FaDatabase, label: "Ledger Integrity", desc: "Immutable transaction record protection.", color: "text-emerald-400" },
                { icon: FaUserShield, label: "Admin Shield", desc: "Advanced session management systems.", color: "text-amber-400" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group bg-gray-800/30 border border-gray-700 rounded-xl p-4 hover:border-yellow-500/30 hover:bg-gray-800/50 transition-all duration-300"
                >
                  <item.icon className={`${item.color} text-xl mb-2 opacity-70 group-hover:opacity-100 transition-opacity`} />
                  <h3 className="text-white text-sm font-semibold mb-1">{item.label}</h3>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* System Status Card */}
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <FaShieldAlt className="text-yellow-500 text-lg" />
                <span className="text-[10px] text-yellow-500 uppercase tracking-wider font-bold">System Status</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                All core nodes are currently operating under heightened security parameters.
                Password rotations are logged for audit compliance.
              </p>
              <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-500">
                <FaCheckCircle className="text-emerald-500" />
                <span>All systems operational</span>
              </div>
            </div>
          </div>

          {/* Right Column: Password Form */}
          <div className="animate-fadeInRight">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>

              <div className="mb-8">
                <h2 className="text-2xl text-white font-bold flex items-center gap-2">
                  <FaKey className="text-yellow-500" /> Update Access
                </h2>
                <p className="text-gray-500 text-sm mt-1">Credential Synchronization Portal</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field - Disabled */}
                <div className="space-y-2">
                  <label className="text-[10px] text-yellow-500/60 uppercase tracking-wider font-bold flex items-center gap-2">
                    <FaEnvelope className="text-yellow-500/40" /> Registered Identity
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="admin@cryptonext.com"
                      disabled
                      className="w-full px-5 py-3.5 rounded-xl border border-gray-700 bg-gray-800/30 text-gray-400 cursor-not-allowed placeholder:text-gray-600 text-sm"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <FaLock className="text-gray-600 text-sm" />
                    </div>
                  </div>
                </div>

                {/* Current Password */}
                <div className="space-y-2">
                  <label className="text-[10px] text-yellow-500/60 uppercase tracking-wider font-bold flex items-center gap-2">
                    <FaLock className="text-yellow-500/40" /> Current Credentials
                  </label>
                  <div className="relative group">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      placeholder="••••••••••••"
                      required
                      className="w-full px-5 py-3.5 rounded-xl border border-gray-700 bg-gray-800/50 text-white focus:border-yellow-500 focus:outline-none transition-all placeholder:text-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => toggle("current")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-500 transition-colors"
                    >
                      {showPasswords.current ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-[10px] text-yellow-500/60 uppercase tracking-wider font-bold flex items-center gap-2">
                    <FaKey className="text-yellow-500/40" /> New Access Credentials
                  </label>
                  <div className="relative group">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      placeholder="Create new protocol"
                      required
                      className="w-full px-5 py-3.5 rounded-xl border border-gray-700 bg-gray-800/50 text-white focus:border-yellow-500 focus:outline-none transition-all placeholder:text-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => toggle("new")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-500 transition-colors"
                    >
                      {showPasswords.new ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.newPassword && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getStrengthColor()} rounded-full transition-all duration-300`}
                            style={{ width: `${passwordStrength}%` }}
                          ></div>
                        </div>
                        <span className={`text-[10px] font-bold ml-3 ${passwordStrength < 40 ? 'text-red-400' : passwordStrength < 70 ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                          {getStrengthText()}
                        </span>
                      </div>

                      {/* Password Requirements */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className={`flex items-center gap-1.5 text-[9px] ${passwordChecks.length ? 'text-green-400' : 'text-gray-500'}`}>
                          {passwordChecks.length ? <FaCheckCircle size={8} /> : <FaExclamationTriangle size={8} />}
                          Min 6 characters
                        </div>
                        <div className={`flex items-center gap-1.5 text-[9px] ${passwordChecks.uppercase ? 'text-green-400' : 'text-gray-500'}`}>
                          {passwordChecks.uppercase ? <FaCheckCircle size={8} /> : <FaExclamationTriangle size={8} />}
                          Uppercase letter
                        </div>
                        <div className={`flex items-center gap-1.5 text-[9px] ${passwordChecks.lowercase ? 'text-green-400' : 'text-gray-500'}`}>
                          {passwordChecks.lowercase ? <FaCheckCircle size={8} /> : <FaExclamationTriangle size={8} />}
                          Lowercase letter
                        </div>
                        <div className={`flex items-center gap-1.5 text-[9px] ${passwordChecks.number ? 'text-green-400' : 'text-gray-500'}`}>
                          {passwordChecks.number ? <FaCheckCircle size={8} /> : <FaExclamationTriangle size={8} />}
                          Number
                        </div>
                        <div className={`flex items-center gap-1.5 text-[9px] ${passwordChecks.special ? 'text-green-400' : 'text-gray-500'} col-span-2`}>
                          {passwordChecks.special ? <FaCheckCircle size={8} /> : <FaExclamationTriangle size={8} />}
                          Special character (!@#$%^&*)
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-[10px] text-yellow-500/60 uppercase tracking-wider font-bold flex items-center gap-2">
                    <FaUserShield className="text-yellow-500/40" /> Verify New Credentials
                  </label>
                  <div className="relative group">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm new protocol"
                      required
                      className="w-full px-5 py-3.5 rounded-xl border border-gray-700 bg-gray-800/50 text-white focus:border-yellow-500 focus:outline-none transition-all placeholder:text-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => toggle("confirm")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-500 transition-colors"
                    >
                      {showPasswords.confirm ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                    <p className="text-[10px] text-red-400 flex items-center gap-1 mt-1">
                      <FaExclamationTriangle size={10} /> Passwords do not match
                    </p>
                  )}
                  {formData.confirmPassword && formData.newPassword === formData.confirmPassword && formData.newPassword && (
                    <p className="text-[10px] text-green-400 flex items-center gap-1 mt-1">
                      <FaCheckCircle size={10} /> Passwords match
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold uppercase text-sm tracking-wider rounded-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 mt-6 shadow-lg"
                >
                  {loading ? (
                    <FaSyncAlt className="animate-spin" />
                  ) : (
                    <FaShieldAlt />
                  )}
                  {loading ? "Synchronizing..." : "Update Protocol"}
                </button>

                {/* Security Note */}
                <div className="text-center pt-4">
                  <p className="text-[9px] text-gray-600">
                    This action will be logged for security audit purposes
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-xs border-t border-gray-800 pt-6">
          <p>© 2026 Security Settings | CryptoNext Protocol</p>
        </div>

      </div>

      <style>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeInLeft {
          animation: fadeInLeft 0.6s ease-out;
        }
        
        .animate-fadeInRight {
          animation: fadeInRight 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}