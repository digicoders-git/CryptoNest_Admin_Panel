import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaWallet,
  FaKey,
  FaEdit,
  FaSave,
  FaShieldAlt,
  FaChartPie,
  FaUsers,
  FaExchangeAlt,
  FaCrown,
  FaCopy,
  FaCheckCircle,
  FaTimesCircle,
  FaSync,
  FaCalendarAlt,
  FaLock,
  FaDatabase,
  FaServer,
  FaArrowLeft,
  FaStar,
  FaGem,
  FaChartLine
} from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'https://cryptonest-backend.onrender.com').replace(/\/+$/, '') + '/api/';

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    cryptoWalletAddress: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const getAuthToken = () => localStorage.getItem("token") || localStorage.getItem("superAdminToken");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}SuperAdmin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const data = response.data.data;
        setProfileData(data);
        setFormData({
          name: data.name,
          mobile: data.mobile || "",
          cryptoWalletAddress: data.cryptoWalletAddress || "",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "Failed to synchronize profile telemetry.",
        background: "#1a1a2e",
        color: "#D4AF37",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const token = getAuthToken();
      const response = await axios.put(
        `${API_URL}SuperAdmin/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Identity Synchronized",
          text: "Profile updated successfully.",
          timer: 2000,
          background: "#1a1a2e",
          color: "#D4AF37",
          confirmButtonColor: "#D4AF37",
        });
        setEditMode(false);
        fetchProfile();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Blocked",
        text: error.response?.data?.message || "Failed to update profile parameters.",
        background: "#1a1a2e",
        color: "#D4AF37",
      });
    } finally {
      setUpdating(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      icon: "success",
      title: "Copied!",
      text: `${label} copied to clipboard.`,
      timer: 1000,
      showConfirmButton: false,
      background: "#1a1a2e",
      color: "#D4AF37",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 border-4 border-yellow-500/10 rounded-full"></div>
            <div className="w-24 h-24 border-4 border-transparent border-t-yellow-500 border-r-yellow-600 rounded-full animate-spin absolute"></div>
            <FaCrown className="text-yellow-500 text-3xl animate-pulse absolute" />
          </div>
          <p className="text-xl font-bold text-yellow-500 tracking-wider animate-pulse uppercase">Retrieving Account Parameters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="p-6 lg:p-8">

        {/* Header with Back Button */}
        <div className="border-b border-yellow-500/30 pb-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">

              <div>
                <h1 className="text-xl lg:text-3xl font-semibold bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent flex items-center gap-3">
                  Account Settings
                </h1>
                <p className="text-gray-400 text-sm mt-2">Global infrastructure & administrative identity</p>
              </div>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 font-semibold text-sm ${editMode
                ? "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
                : "bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20"
                }`}
            >
              {editMode ? <FaTimesCircle /> : <FaEdit />}
              {editMode ? "Cancel Editing" : "Modify Profile"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Profile Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Identity Card */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
              <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-gray-800">
                <div className="w-28 h-28 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center text-black text-4xl font-bold shadow-lg">
                  {profileData?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-center md:text-left space-y-2">
                  <h2 className="text-2xl text-white font-bold">{profileData?.name}</h2>
                  <p className="text-yellow-500 text-xs font-bold tracking-wider uppercase">
                    Super Admin ID: {profileData?._id?.slice(-8).toUpperCase()}
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
                    <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold rounded-lg flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      Active
                    </span>
                    <span className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-bold rounded-lg">
                      {profileData?.referralCode}
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Administrative Name"
                    icon={<FaUser />}
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!editMode}
                    placeholder="System Identity Name"
                  />
                  <InputField
                    label="Registered Email"
                    icon={<FaEnvelope />}
                    type="email"
                    value={profileData?.email}
                    disabled={true}
                    placeholder="admin@CryptoNestworld.live"
                  />
                  <InputField
                    label="Mobile Number"
                    icon={<FaPhone />}
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    disabled={!editMode}
                    placeholder="+91 00000-00000"
                  />
                  <InputField
                    label="Root Referral Code"
                    icon={<FaCrown />}
                    type="text"
                    value={profileData?.referralCode}
                    disabled={true}
                  />
                </div>

                {/* Wallet Address Field */}
                <div className="space-y-2">
                  <label className="text-[10px] text-yellow-500/60 uppercase tracking-wider font-bold flex items-center gap-2">
                    <FaWallet className="text-yellow-500/40" /> Crypto Wallet Infrastructure
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={formData.cryptoWalletAddress}
                      onChange={(e) => setFormData({ ...formData, cryptoWalletAddress: e.target.value })}
                      disabled={!editMode}
                      placeholder="0x..."
                      className={`w-full px-5 py-3.5 rounded-xl border transition-all duration-300 font-mono text-sm ${!editMode
                        ? 'bg-gray-800/30 border-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-800/50 border-gray-700 text-white focus:border-yellow-500 focus:outline-none'
                        }`}
                    />
                    {!editMode && formData.cryptoWalletAddress && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(formData.cryptoWalletAddress, "Wallet Address")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-500 transition-colors"
                      >
                        <FaCopy size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {editMode && (
                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold uppercase text-sm tracking-wider rounded-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 mt-4"
                  >
                    {updating ? <FaSync className="animate-spin" /> : <FaSave />}
                    {updating ? "Synchronizing..." : "Save Identity Parameters"}
                  </button>
                )}
              </form>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Topology Card */}
              <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/20 rounded-2xl p-6 relative overflow-hidden hover:border-yellow-500/40 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl -mr-12 -mt-12"></div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-yellow-500/10 rounded-xl">
                    <FaUsers className="text-yellow-500 text-lg" />
                  </div>
                  <h3 className="text-white text-sm font-bold uppercase tracking-wider">User Topology</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-500 text-xs">Total Nodes</span>
                    <span className="text-white font-bold">{profileData?.stats?.totalUsers || 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-800">
                    <span className="text-green-400/70 text-xs">Active Pulse</span>
                    <span className="text-green-400 font-bold">{profileData?.stats?.activeUsers || 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-red-400/70 text-xs">Dormant</span>
                    <span className="text-red-400 font-bold">{profileData?.stats?.inactiveUsers || 0}</span>
                  </div>
                </div>
              </div>

              {/* Fiscal Health Card */}
              <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/20 rounded-2xl p-6 relative overflow-hidden hover:border-yellow-500/40 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-12 -mt-12"></div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-blue-500/10 rounded-xl">
                    <FaExchangeAlt className="text-blue-400 text-lg" />
                  </div>
                  <h3 className="text-white text-sm font-bold uppercase tracking-wider">Fiscal Health</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-500 text-xs">Transactions</span>
                    <span className="text-white font-bold">{profileData?.stats?.totalTransactions || 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-800">
                    <span className="text-blue-400/70 text-xs">Corporate Earnings</span>
                    <span className="text-blue-400 font-bold">${profileData?.stats?.companyEarnings?.toFixed(2) || 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-yellow-500/70 text-xs">Wallet Balance</span>
                    <span className="text-yellow-500 font-bold">${profileData?.walletBalance?.toFixed(2) || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/30 rounded-xl p-4 text-center border border-gray-700">
                <FaGem className="text-yellow-500 text-lg mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{profileData?.stats?.totalNFTs || 0}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">NFTs Minted</div>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4 text-center border border-gray-700">
                <FaChartLine className="text-green-400 text-lg mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{profileData?.stats?.totalSales || 0}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Total Sales</div>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4 text-center border border-gray-700">
                <FaStar className="text-purple-400 text-lg mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{profileData?.level || 1}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Admin Level</div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            {/* System Compliance Card */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <FaShieldAlt className="text-yellow-500/10 text-5xl rotate-12" />
              </div>
              <div className="relative z-10">
                <h3 className="text-lg text-white font-bold mb-5 flex items-center gap-2">
                  <FaLock className="text-yellow-500 text-sm" /> System Compliance
                </h3>
                <div className="space-y-5">
                  <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl">
                    <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                      <FaCheckCircle size={16} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Active Identity</p>
                      <p className="text-[9px] text-gray-500 uppercase tracking-wider">Super Admin Verified</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl">
                    <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                      <FaCalendarAlt size={16} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Deployment Date</p>
                      <p className="text-[9px] text-gray-500 uppercase tracking-wider">
                        {new Date(profileData?.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-800">
                  <p className="text-[10px] text-yellow-500 uppercase tracking-wider font-bold mb-3">Security Protocols</p>
                  <ul className="space-y-2">
                    {[
                      { name: "Multi-Node Auth", icon: FaShieldAlt },
                      { name: "Ledger Snapshots", icon: FaDatabase },
                      { name: "API Telemetry", icon: FaServer }
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-gray-500 p-2 hover:bg-gray-800/30 rounded-lg transition-all">
                        <item.icon className="text-yellow-500/50 text-[10px]" />
                        <span>{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Access Card */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/20 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <FaKey className="text-yellow-500" /> Quick Terminals
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/Dashbord/change-password")}
                  className="w-full p-3 bg-gray-800/30 border border-gray-700 rounded-xl flex items-center justify-between hover:bg-gray-800/50 hover:border-yellow-500/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <FaKey className="text-yellow-500 text-sm" />
                    <span className="text-white text-sm">Change Security Key</span>
                  </div>
                  <FaChartPie className="text-gray-500 group-hover:text-yellow-500 transition-colors text-xs" />
                </button>
              </div>
            </div>

            {/* Session Info Card */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/20 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <FaSync className="text-yellow-500 text-sm" /> Session Info
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Last Login</span>
                  <span className="text-gray-400">{new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-800">
                  <span className="text-gray-500">Session Status</span>
                  <span className="text-green-400 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-xs border-t border-gray-800 pt-6">
          <p>© 2026 Account Settings | CryptoNext Protocol</p>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

// Input Field Component
function InputField({
  label,
  icon,
  type,
  value,
  onChange,
  placeholder,
  disabled = false,
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] text-yellow-500/60 uppercase tracking-wider font-bold ml-1 flex items-center gap-2">
        <span className="text-yellow-500/40">{icon}</span>
        {label}
      </label>
      <div className="relative group">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={!disabled}
          className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 text-sm
          ${disabled
              ? 'bg-gray-800/30 border-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gray-800/50 border-gray-700 text-white focus:border-yellow-500 focus:outline-none hover:border-gray-600'
            }`}
        />
      </div>
    </div>
  );
}