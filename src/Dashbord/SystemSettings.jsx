import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'https://cryptonest-backend.onrender.com').replace(/\/+$/, '') + '/api/';

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    registrationAmount: 10,
    parentIncome: 1,
    maxParents: 9,
    registrationStatus: "ON",
    maintenanceMode: "OFF",
  });
  const [loading, setLoading] = useState(false);
  const [companyBalance, setCompanyBalance] = useState(0);
  const [systemStats, setSystemStats] = useState({});

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("superAdminToken");

      // Fetch company balance from working API
      const balanceRes = await axios.get(
        `${API_URL}admin/company-balance`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (balanceRes.data.success) {
        setCompanyBalance(balanceRes.data.data.totalBalance || 0);
      }

      // Fetch users for stats
      const usersRes = await axios.get(
        `${API_URL}auth/Getuser`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const users = usersRes.data.data || usersRes.data || [];
      setSystemStats({
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.isActive).length,
        totalBalance: users.reduce((sum, u) => sum + (u.balance || 0), 0),
      });
    } catch (error) {
      console.error("Error fetching system data:", error);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate save (you can implement actual API call here)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Swal.fire({
        icon: "success",
        title: "Settings Saved!",
        text: "System settings updated successfully",
        confirmButtonColor: "#9333ea",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save settings" + error,
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">⚙️ System Settings</h1>
        <p className="text-gray-500 mt-1">SUPER ADMIN ONLY - Runtime Control</p>
        <p className="text-blue-600 text-sm mt-1">
          👉 Changes apply to future users
        </p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-2xl text-white">
          <h3 className="text-lg font-bold">
            ${companyBalance.toLocaleString()}
          </h3>
          <p className="text-sm opacity-90">Company Balance</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-2xl text-white">
          <h3 className="text-lg font-bold">{systemStats.totalUsers || 0}</h3>
          <p className="text-sm opacity-90">Total Users</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-2xl text-white">
          <h3 className="text-lg font-bold">{systemStats.activeUsers || 0}</h3>
          <p className="text-sm opacity-90">Active Users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Registration Amount (default $10)
          </label>
          <input
            type="number"
            value={settings.registrationAmount}
            onChange={(e) =>
              handleInputChange("registrationAmount", e.target.value)
            }
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold text-lg"
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Per Parent Income ($1)
          </label>
          <input
            type="number"
            value={settings.parentIncome}
            onChange={(e) => handleInputChange("parentIncome", e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold text-lg"
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Max Parents Allowed
          </label>
          <input
            type="number"
            value={settings.maxParents}
            onChange={(e) => handleInputChange("maxParents", e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold text-lg"
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Registration Status
          </label>
          <select
            value={settings.registrationStatus}
            onChange={(e) =>
              handleInputChange("registrationStatus", e.target.value)
            }
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold text-lg"
          >
            <option value="ON">ON</option>
            <option value="OFF">OFF</option>
          </select>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Maintenance Mode
          </label>
          <select
            value={settings.maintenanceMode}
            onChange={(e) =>
              handleInputChange("maintenanceMode", e.target.value)
            }
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold text-lg"
          >
            <option value="OFF">OFF</option>
            <option value="ON">ON</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl hover:shadow-2xl transition text-lg disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
        <button
          onClick={() => {
            setSettings({
              registrationAmount: 10,
              parentIncome: 1,
              maxParents: 9,
              registrationStatus: "ON",
              maintenanceMode: "OFF",
            });
          }}
          className="px-8 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition text-lg"
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
}

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";
// import {
//   FaCog,
//   FaUsers,
//   FaGem,
//   FaWallet,
//   FaChartPie,
//   FaUserSlash,
//   FaUserCheck,
//   FaMoneyBillWave,
//   FaFilter,
//   FaSearch,
//   FaSync,
//   FaExclamationCircle,
//   FaCheckCircle,
//   FaTimesCircle,
//   FaEye,
//   FaEdit,
//   FaTrash,
//   FaPlus,
//   FaMinus,
//   FaDownload,
//   FaUpload,
//   FaShieldAlt,
//   FaNetworkWired,
//   FaPercentage,
//   FaCoins,
//   FaHistory,
//   FaKey,
//   FaBell,
//   FaLock,
//   FaUnlock,
//   FaBan,
//   FaCheck,
//   FaTimes,
//   FaArrowUp,
//   FaArrowDown,
// } from "react-icons/fa";
// import {
//   MdSettings,
//   MdDashboard,
//   MdPerson,
//   MdSecurity,
//   MdAttachMoney,
// } from "react-icons/md";

// // Custom CSS for admin panel
// const adminStyles = `
//   @keyframes fadeInUp {
//     from {
//       opacity: 0;
//       transform: translateY(20px);
//     }
//     to {
//       opacity: 1;
//       transform: translateY(0);
//     }
//   }

//   .admin-fade-in {
//     animation: fadeInUp 0.3s ease-out;
//   }

//   .glass-card {
//     background: rgba(255, 255, 255, 0.05);
//     backdrop-filter: blur(10px);
//     border: 1px solid rgba(255, 255, 255, 0.1);
//   }

//   .hover-glow:hover {
//     box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
//   }
// `;

// export default function AdminSettingsDashboard() {
//   const [activeTab, setActiveTab] = useState("dashboard");
//   const [loading, setLoading] = useState(false);
//   const [stats, setStats] = useState(null);
//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
//   const [systemSettings, setSystemSettings] = useState(null);
//   const [nftStats, setNftStats] = useState(null);

//   // Filter states
//   const [searchTerm, setSearchTerm] = useState("");
//   const [userStatusFilter, setUserStatusFilter] = useState("all");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);

//   // Form states
//   const [mlmSettings, setMlmSettings] = useState({
//     registrationFee: 10,
//     maxLevels: 10,
//     bonusPerLevel: 1,
//   });

//   const [nftSettings, setNftSettings] = useState({
//     basePrice: 10,
//     sellMultiplier: 2,
//     mintingEnabled: true,
//   });

//   // Get admin token
//   const getAdminToken = () => {
//     return (
//       localStorage.getItem("superAdminToken") || localStorage.getItem("token")
//     );
//   };

//   // Fetch all dashboard data
//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       const token = getAdminToken();

//       // Fetch core data first
//       const [statsRes, usersRes, withdrawalsRes, settingsRes] =
//         await Promise.all([
//           axios.get("https://api.gtnworld.live/api/admin-settings/stats", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get("https://api.gtnworld.live/api/admin-settings/users", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get(
//             "https://api.gtnworld.live/api/admin-settings/withdrawals/pending",
//             {
//               headers: { Authorization: `Bearer ${token}` },
//             },
//           ),
//           axios.get("https://api.gtnworld.live/api/admin-settings/settings", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//         ]);

//       // Handle core data
//       if (statsRes.data.success) setStats(statsRes.data.data);
//       if (usersRes.data.success) {
//         setUsers(usersRes.data.data.users || []);
//         setFilteredUsers(usersRes.data.data.users || []);
//       }
//       if (withdrawalsRes.data.success) {
//         const withdrawals = withdrawalsRes.data.data;
//         setPendingWithdrawals(Array.isArray(withdrawals) ? withdrawals : []);
//       } else {
//         setPendingWithdrawals([]);
//       }
//       if (settingsRes.data.success) {
//         setSystemSettings(settingsRes.data.data);
//         setMlmSettings(settingsRes.data.data.mlmSettings || {});
//         setNftSettings(settingsRes.data.data.nftSettings || {});
//       }

//       // Fetch NFT stats separately with error handling
//       try {
//         const nftStatsRes = await axios.get(
//           "https://api.gtnworld.live/api/admin-settings/nft/stats",
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           },
//         );
//         if (nftStatsRes.data.success) {
//           setNftStats(nftStatsRes.data.data);
//         }
//       } catch (nftError) {
//         console.warn("NFT stats not available:", nftError.message);
//         // Set default NFT stats if API fails
//         setNftStats({
//           totalNFTs: 0,
//           soldNFTs: 0,
//           totalRevenue: 0,
//           availableNFTs: 0,
//         });
//       }
//     } catch (error) {
//       console.error("Dashboard data fetch error:", error);
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: error.response?.data?.message || "Failed to fetch data",
//         confirmButtonColor: "#9333ea",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   // Filter users
//   useEffect(() => {
//     let result = users;

//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       result = result.filter(
//         (user) =>
//           user.name?.toLowerCase().includes(term) ||
//           user.email?.toLowerCase().includes(term) ||
//           user.referralCode?.toLowerCase().includes(term),
//       );
//     }

//     if (userStatusFilter !== "all") {
//       result = result.filter((user) => {
//         if (userStatusFilter === "active") return user.isActive;
//         if (userStatusFilter === "frozen") return !user.isActive;
//         if (userStatusFilter === "premium") return user.planType === "premium";
//         return true;
//       });
//     }

//     setFilteredUsers(result);
//     setCurrentPage(1);
//   }, [searchTerm, userStatusFilter, users]);

//   // Handle user freeze/unfreeze
//   const handleUserStatusChange = async (userId, action) => {
//     try {
//       const token = getAdminToken();
//       const result = await Swal.fire({
//         title: `${action === "freeze" ? "Freeze" : "Unfreeze"} User`,
//         text: `Are you sure you want to ${action} this user?`,
//         icon: "warning",
//         showCancelButton: true,
//         confirmButtonColor: "#3085d6",
//         cancelButtonColor: "#d33",
//         confirmButtonText: "Yes, proceed",
//       });

//       if (result.isConfirmed) {
//         await axios.put(
//           `https://api.gtnworld.live/api/admin-settings/users/${userId}/status`,
//           { action },
//           { headers: { Authorization: `Bearer ${token}` } },
//         );

//         Swal.fire({
//           icon: "success",
//           title: "Success",
//           text: `User ${action}d successfully`,
//           confirmButtonColor: "#9333ea",
//         });

//         fetchDashboardData();
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: error.response?.data?.message || "Operation failed",
//         confirmButtonColor: "#9333ea",
//       });
//     }
//   };

//   // Handle balance adjustment
//   const handleBalanceAdjustment = async (userId, type) => {
//     try {
//       const { value: amount } = await Swal.fire({
//         title: `${type === "add" ? "Add" : "Deduct"} Balance`,
//         input: "number",
//         inputLabel: `Amount to ${type === "add" ? "add" : "deduct"}`,
//         inputPlaceholder: "Enter amount",
//         showCancelButton: true,
//         inputValidator: (value) => {
//           if (!value || value <= 0) return "Please enter a valid amount";
//         },
//       });

//       if (amount) {
//         const { value: reason } = await Swal.fire({
//           title: "Reason",
//           input: "text",
//           inputLabel: "Reason for this adjustment",
//           inputPlaceholder: "Enter reason",
//           showCancelButton: true,
//           inputValidator: (value) => {
//             if (!value) return "Please enter a reason";
//           },
//         });

//         if (reason) {
//           const token = getAdminToken();
//           await axios.put(
//             `https://api.gtnworld.live/api/admin-settings/users/${userId}/balance`,
//             { amount: parseFloat(amount), type, reason },
//             { headers: { Authorization: `Bearer ${token}` } },
//           );

//           Swal.fire({
//             icon: "success",
//             title: "Success",
//             text: `Balance ${type === "add" ? "added" : "deducted"} successfully`,
//             confirmButtonColor: "#9333ea",
//           });

//           fetchDashboardData();
//         }
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: error.response?.data?.message || "Operation failed",
//         confirmButtonColor: "#9333ea",
//       });
//     }
//   };

//   // Handle withdrawal action
//   const handleWithdrawalAction = async (transactionId, action) => {
//     try {
//       const token = getAdminToken();

//       if (action === "approve") {
//         const { value: txHash } = await Swal.fire({
//           title: "Approve Withdrawal",
//           input: "text",
//           inputLabel: "Transaction Hash",
//           inputPlaceholder: "Enter blockchain transaction hash",
//           showCancelButton: true,
//           inputValidator: (value) => {
//             if (!value) return "Please enter transaction hash";
//           },
//         });

//         if (txHash) {
//           await axios.put(
//             `https://api.gtnworld.live/api/admin-settings/withdrawals/${transactionId}/process`,
//             { action, txHash },
//             { headers: { Authorization: `Bearer ${token}` } },
//           );

//           Swal.fire({
//             icon: "success",
//             title: "Approved",
//             text: "Withdrawal approved successfully",
//             confirmButtonColor: "#9333ea",
//           });

//           fetchDashboardData();
//         }
//       } else {
//         const { value: reason } = await Swal.fire({
//           title: "Reject Withdrawal",
//           input: "text",
//           inputLabel: "Reason for rejection",
//           inputPlaceholder: "Enter reason",
//           showCancelButton: true,
//           inputValidator: (value) => {
//             if (!value) return "Please enter reason";
//           },
//         });

//         if (reason) {
//           await axios.put(
//             `https://api.gtnworld.live/api/admin-settings/withdrawals/${transactionId}/process`,
//             { action, reason },
//             { headers: { Authorization: `Bearer ${token}` } },
//           );

//           Swal.fire({
//             icon: "success",
//             title: "Rejected",
//             text: "Withdrawal rejected successfully",
//             confirmButtonColor: "#9333ea",
//           });

//           fetchDashboardData();
//         }
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: error.response?.data?.message || "Operation failed",
//         confirmButtonColor: "#9333ea",
//       });
//     }
//   };

//   // Handle system settings update
//   const handleSystemSettingsUpdate = async () => {
//     try {
//       const token = getAdminToken();

//       const mlmRes = await axios.put(
//         "https://api.gtnworld.live/api/admin-settings/settings",
//         {
//           settingType: "mlm",
//           settings: mlmSettings,
//         },
//         { headers: { Authorization: `Bearer ${token}` } },
//       );

//       const nftRes = await axios.put(
//         "https://api.gtnworld.live/api/admin-settings/settings",
//         {
//           settingType: "nft",
//           settings: nftSettings,
//         },
//         { headers: { Authorization: `Bearer ${token}` } },
//       );

//       if (mlmRes.data.success && nftRes.data.success) {
//         Swal.fire({
//           icon: "success",
//           title: "Success",
//           text: "System settings updated successfully",
//           confirmButtonColor: "#9333ea",
//         });
//         fetchDashboardData();
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: error.response?.data?.message || "Update failed",
//         confirmButtonColor: "#9333ea",
//       });
//     }
//   };

//   // Create NFT batch
//   const handleCreateNFTBatch = async () => {
//     try {
//       const { value: batchSize } = await Swal.fire({
//         title: "Create NFT Batch",
//         input: "number",
//         inputLabel: "Batch Size",
//         inputPlaceholder: "Enter number of NFTs to create",
//         showCancelButton: true,
//         inputValidator: (value) => {
//           if (!value || value <= 0) return "Please enter valid batch size";
//         },
//       });

//       if (batchSize) {
//         const token = getAdminToken();
//         try {
//           await axios.post(
//             "https://api.gtnworld.live/api/admin-settings/nft/create-batch",
//             { batchSize: parseInt(batchSize), basePrice: nftSettings.basePrice },
//             { headers: { Authorization: `Bearer ${token}` } },
//           );

//           Swal.fire({
//             icon: "success",
//             title: "Success",
//             text: `Created ${batchSize} NFTs successfully`,
//             confirmButtonColor: "#9333ea",
//           });

//           fetchDashboardData();
//         } catch (apiError) {
//           if (apiError.response?.data?.message?.includes("countDocuments")) {
//             Swal.fire({
//               icon: "warning",
//               title: "NFT Service Not Available",
//               text: "NFT functionality is currently unavailable. Please check backend configuration.",
//               confirmButtonColor: "#9333ea",
//             });
//           } else {
//             throw apiError;
//           }
//         }
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: error.response?.data?.message || "Creation failed",
//         confirmButtonColor: "#9333ea",
//       });
//     }
//   };

//   // Bulk actions
//   const handleBulkAction = async (action) => {
//     const selectedUsers = users.filter((u) => u.selected);

//     if (selectedUsers.length === 0) {
//       Swal.fire({
//         icon: "warning",
//         title: "No users selected",
//         text: "Please select users first",
//         confirmButtonColor: "#9333ea",
//       });
//       return;
//     }

//     try {
//       const token = getAdminToken();
//       const userIds = selectedUsers.map((u) => u._id);

//       if (action === "freeze" || action === "unfreeze") {
//         await axios.post(
//           "https://api.gtnworld.live/api/admin-settings/users/bulk-action",
//           { userIds, action },
//           { headers: { Authorization: `Bearer ${token}` } },
//         );

//         Swal.fire({
//           icon: "success",
//           title: "Success",
//           text: `Bulk ${action} completed`,
//           confirmButtonColor: "#9333ea",
//         });

//         fetchDashboardData();
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: error.response?.data?.message || "Bulk action failed",
//         confirmButtonColor: "#9333ea",
//       });
//     }
//   };

//   // Pagination
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

//   // Loading state
//   if (loading && !stats) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500 mx-auto"></div>
//           <h3 className="text-white mt-4 text-xl">
//             Loading Admin Dashboard...
//           </h3>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-gray-100">
//       <style>{adminStyles}</style>

//       {/* Header */}
//       <div className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700/50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <div className="flex items-center space-x-3">
//               <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
//                 <MdSettings className="text-2xl text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-white">
//                   Admin Dashboard
//                 </h1>
//                 <p className="text-sm text-gray-400">
//                   Complete system management
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center space-x-4">
//               <button
//                 onClick={fetchDashboardData}
//                 className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
//               >
//                 <FaSync className={loading ? "animate-spin" : ""} />
//                 <span>Refresh</span>
//               </button>

//               <div className="flex items-center space-x-2 text-sm">
//                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                 <span className="text-green-400">System Active</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Navigation Tabs */}
//         <div className="flex space-x-1 bg-gray-800/50 rounded-xl p-1 mb-8">
//           {[
//             { id: "dashboard", label: "Dashboard", icon: <MdDashboard /> },
//             { id: "users", label: "User Management", icon: <FaUsers /> },
//             { id: "nft", label: "NFT Management", icon: <FaGem /> },
//             { id: "withdrawals", label: "Withdrawals", icon: <FaWallet /> },
//             { id: "settings", label: "System Settings", icon: <FaCog /> },
//             { id: "security", label: "Security", icon: <FaShieldAlt /> },
//           ].map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
//                 activeTab === tab.id
//                   ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
//                   : "text-gray-400 hover:text-white hover:bg-gray-700/50"
//               }`}
//             >
//               {tab.icon}
//               <span className="font-medium">{tab.label}</span>
//             </button>
//           ))}
//         </div>

//         {/* Content Area */}
//         <div className="admin-fade-in">
//           {/* Dashboard Tab */}
//           {activeTab === "dashboard" && stats && (
//             <div className="space-y-6">
//               {/* Stats Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                 <div className="glass-card rounded-2xl p-6 hover-glow transition-all">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="p-3 bg-blue-500/20 rounded-xl">
//                       <FaUsers className="text-2xl text-blue-400" />
//                     </div>
//                     <span className="text-sm font-semibold text-blue-400">
//                       USERS
//                     </span>
//                   </div>
//                   <h3 className="text-3xl font-bold text-white mb-2">
//                     {stats.users?.total || 0}
//                   </h3>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-green-400">
//                       Active: {stats.users?.active || 0}
//                     </span>
//                     <span className="text-red-400">
//                       Frozen: {stats.users?.frozen || 0}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="glass-card rounded-2xl p-6 hover-glow transition-all">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="p-3 bg-green-500/20 rounded-xl">
//                       <FaMoneyBillWave className="text-2xl text-green-400" />
//                     </div>
//                     <span className="text-sm font-semibold text-green-400">
//                       FINANCE
//                     </span>
//                   </div>
//                   <h3 className="text-3xl font-bold text-white mb-2">
//                     ${stats.financial?.totalUserBalance?.toLocaleString() || 0}
//                   </h3>
//                   <div className="text-sm text-gray-400">
//                     Total User Balance
//                   </div>
//                 </div>

//                 <div className="glass-card rounded-2xl p-6 hover-glow transition-all">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="p-3 bg-purple-500/20 rounded-xl">
//                       <FaGem className="text-2xl text-purple-400" />
//                     </div>
//                     <span className="text-sm font-semibold text-purple-400">
//                       NFT
//                     </span>
//                   </div>
//                   <h3 className="text-3xl font-bold text-white mb-2">
//                     {nftStats?.totalNFTs || 0}
//                   </h3>
//                   <div className="text-sm text-gray-400">
//                     Total NFTs Created
//                   </div>
//                 </div>

//                 <div className="glass-card rounded-2xl p-6 hover-glow transition-all">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="p-3 bg-yellow-500/20 rounded-xl">
//                       <FaChartPie className="text-2xl text-yellow-400" />
//                     </div>
//                     <span className="text-sm font-semibold text-yellow-400">
//                       EARNINGS
//                     </span>
//                   </div>
//                   <h3 className="text-3xl font-bold text-white mb-2">
//                     ${stats.financial?.companyEarnings?.toLocaleString() || 0}
//                   </h3>
//                   <div className="text-sm text-gray-400">Company Revenue</div>
//                 </div>
//               </div>

//               {/* Recent Activity */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <div className="glass-card rounded-2xl p-6">
//                   <h3 className="text-xl font-bold text-white mb-4 flex items-center">
//                     <FaExclamationCircle className="mr-2 text-yellow-500" />
//                     Pending Withdrawals
//                   </h3>
//                   <div className="space-y-3">
//                     {(pendingWithdrawals || []).slice(0, 5).map((withdrawal) => (
//                       <div
//                         key={withdrawal._id}
//                         className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
//                       >
//                         <div>
//                           <p className="font-medium text-white">
//                             {withdrawal.userName}
//                           </p>
//                           <p className="text-sm text-gray-400">
//                             ${withdrawal.amount}
//                           </p>
//                         </div>
//                         <button
//                           onClick={() =>
//                             handleWithdrawalAction(withdrawal._id, "approve")
//                           }
//                           className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
//                         >
//                           Approve
//                         </button>
//                       </div>
//                     ))}
//                     {pendingWithdrawals.length === 0 && (
//                       <p className="text-gray-500 text-center py-4">
//                         No pending withdrawals
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="glass-card rounded-2xl p-6">
//                   <h3 className="text-xl font-bold text-white mb-4 flex items-center">
//                     <FaBell className="mr-2 text-blue-500" />
//                     System Status
//                   </h3>
//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between">
//                       <span className="text-gray-300">
//                         Registration Enabled
//                       </span>
//                       <span
//                         className={`px-2 py-1 rounded text-xs ${systemSettings?.systemStatus?.registrationEnabled ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
//                       >
//                         {systemSettings?.systemStatus?.registrationEnabled
//                           ? "ON"
//                           : "OFF"}
//                       </span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-gray-300">Trading Enabled</span>
//                       <span
//                         className={`px-2 py-1 rounded text-xs ${systemSettings?.systemStatus?.tradingEnabled ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
//                       >
//                         {systemSettings?.systemStatus?.tradingEnabled
//                           ? "ON"
//                           : "OFF"}
//                       </span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-gray-300">Maintenance Mode</span>
//                       <span
//                         className={`px-2 py-1 rounded text-xs ${systemSettings?.systemStatus?.maintenanceMode ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}
//                       >
//                         {systemSettings?.systemStatus?.maintenanceMode
//                           ? "ON"
//                           : "OFF"}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* User Management Tab */}
//           {activeTab === "users" && (
//             <div className="space-y-6">
//               {/* User Management Header */}
//               <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
//                 <div>
//                   <h2 className="text-2xl font-bold text-white">
//                     User Management
//                   </h2>
//                   <p className="text-gray-400">Manage all registered users</p>
//                 </div>

//                 <div className="flex flex-wrap gap-2">
//                   <button
//                     onClick={() => handleBulkAction("freeze")}
//                     className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center space-x-2"
//                   >
//                     <FaUserSlash />
//                     <span>Freeze Selected</span>
//                   </button>
//                   <button
//                     onClick={() => handleBulkAction("unfreeze")}
//                     className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center space-x-2"
//                   >
//                     <FaUserCheck />
//                     <span>Unfreeze Selected</span>
//                   </button>
//                 </div>
//               </div>

//               {/* Filters */}
//               <div className="glass-card rounded-2xl p-4">
//                 <div className="flex flex-col lg:flex-row gap-4">
//                   <div className="flex-1">
//                     <div className="relative">
//                       <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                       <input
//                         type="text"
//                         placeholder="Search users by name, email, or code..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
//                       />
//                     </div>
//                   </div>

//                   <div className="flex gap-2">
//                     <select
//                       value={userStatusFilter}
//                       onChange={(e) => setUserStatusFilter(e.target.value)}
//                       className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
//                     >
//                       <option value="all">All Users</option>
//                       <option value="active">Active Only</option>
//                       <option value="frozen">Frozen Only</option>
//                       <option value="premium">Premium Users</option>
//                     </select>

//                     <button
//                       onClick={() => {
//                         setSearchTerm("");
//                         setUserStatusFilter("all");
//                       }}
//                       className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center space-x-2"
//                     >
//                       <FaFilter />
//                       <span>Clear Filters</span>
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Users Table */}
//               <div className="glass-card rounded-2xl overflow-hidden">
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead className="bg-gray-800/50">
//                       <tr>
//                         <th className="py-4 px-4 text-left">
//                           <input type="checkbox" className="rounded" />
//                         </th>
//                         <th className="py-4 px-4 text-left text-gray-400 font-medium">
//                           User
//                         </th>
//                         <th className="py-4 px-4 text-left text-gray-400 font-medium">
//                           Status
//                         </th>
//                         <th className="py-4 px-4 text-left text-gray-400 font-medium">
//                           Balance
//                         </th>
//                         <th className="py-4 px-4 text-left text-gray-400 font-medium">
//                           Earnings
//                         </th>
//                         <th className="py-4 px-4 text-left text-gray-400 font-medium">
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-800/50">
//                       {currentUsers.map((user) => (
//                         <tr
//                           key={user._id}
//                           className="hover:bg-gray-800/30 transition-colors"
//                         >
//                           <td className="py-4 px-4">
//                             <input type="checkbox" className="rounded" />
//                           </td>
//                           <td className="py-4 px-4">
//                             <div className="flex items-center space-x-3">
//                               <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white">
//                                 {user.name?.charAt(0) || "U"}
//                               </div>
//                               <div>
//                                 <p className="font-medium text-white">
//                                   {user.name}
//                                 </p>
//                                 <p className="text-sm text-gray-400">
//                                   {user.email}
//                                 </p>
//                                 <p className="text-xs text-gray-500">
//                                   Code: {user.referralCode}
//                                 </p>
//                               </div>
//                             </div>
//                           </td>
//                           <td className="py-4 px-4">
//                             <span
//                               className={`px-3 py-1 rounded-full text-sm ${
//                                 user.isActive
//                                   ? "bg-green-500/20 text-green-400"
//                                   : "bg-red-500/20 text-red-400"
//                               }`}
//                             >
//                               {user.isActive ? "Active" : "Frozen"}
//                             </span>
//                           </td>
//                           <td className="py-4 px-4">
//                             <p className="text-xl font-bold text-white">
//                               ${user.balance || 0}
//                             </p>
//                           </td>
//                           <td className="py-4 px-4">
//                             <p className="text-lg text-yellow-400">
//                               ${user.totalEarnings || 0}
//                             </p>
//                           </td>
//                           <td className="py-4 px-4">
//                             <div className="flex space-x-2">
//                               <button
//                                 onClick={() =>
//                                   handleUserStatusChange(
//                                     user._id,
//                                     user.isActive ? "freeze" : "unfreeze",
//                                   )
//                                 }
//                                 className={`px-3 py-1 rounded text-sm ${
//                                   user.isActive
//                                     ? "bg-red-600 hover:bg-red-700"
//                                     : "bg-green-600 hover:bg-green-700"
//                                 }`}
//                               >
//                                 {user.isActive ? (
//                                   <FaUserSlash />
//                                 ) : (
//                                   <FaUserCheck />
//                                 )}
//                               </button>
//                               <button
//                                 onClick={() =>
//                                   handleBalanceAdjustment(user._id, "add")
//                                 }
//                                 className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
//                               >
//                                 <FaPlus />
//                               </button>
//                               <button
//                                 onClick={() =>
//                                   handleBalanceAdjustment(user._id, "deduct")
//                                 }
//                                 className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
//                               >
//                                 <FaMinus />
//                               </button>
//                               <button
//                                 className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
//                                 onClick={() => setActiveTab("nft")}
//                               >
//                                 <FaEye />
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Pagination */}
//                 {totalPages > 1 && (
//                   <div className="px-4 py-4 border-t border-gray-800/50">
//                     <div className="flex justify-between items-center">
//                       <p className="text-gray-400">
//                         Showing {indexOfFirstItem + 1} to{" "}
//                         {Math.min(indexOfLastItem, filteredUsers.length)} of{" "}
//                         {filteredUsers.length} users
//                       </p>
//                       <div className="flex space-x-2">
//                         <button
//                           onClick={() =>
//                             setCurrentPage((p) => Math.max(1, p - 1))
//                           }
//                           disabled={currentPage === 1}
//                           className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
//                         >
//                           Previous
//                         </button>
//                         <span className="px-3 py-2">
//                           Page {currentPage} of {totalPages}
//                         </span>
//                         <button
//                           onClick={() =>
//                             setCurrentPage((p) => Math.min(totalPages, p + 1))
//                           }
//                           disabled={currentPage === totalPages}
//                           className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
//                         >
//                           Next
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* NFT Management Tab */}
//           {activeTab === "nft" && nftStats && (
//             <div className="space-y-6">
//               <div className="flex justify-between items-center mb-6">
//                 <div>
//                   <h2 className="text-2xl font-bold text-white">
//                     NFT Management
//                   </h2>
//                   <p className="text-gray-400">
//                     Manage NFT creation and statistics
//                   </p>
//                 </div>

//                 <button
//                   onClick={handleCreateNFTBatch}
//                   className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg flex items-center space-x-2 shadow-lg"
//                 >
//                   <FaPlus />
//                   <span>Create NFT Batch</span>
//                 </button>
//               </div>

//               {/* NFT Stats */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="glass-card rounded-2xl p-6">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="p-3 bg-purple-500/20 rounded-xl">
//                       <FaGem className="text-2xl text-purple-400" />
//                     </div>
//                     <span className="text-sm font-semibold text-purple-400">
//                       TOTAL NFTS
//                     </span>
//                   </div>
//                   <h3 className="text-3xl font-bold text-white mb-2">
//                     {nftStats.totalNFTs || 0}
//                   </h3>
//                   <p className="text-sm text-gray-400">Created NFTs</p>
//                 </div>

//                 <div className="glass-card rounded-2xl p-6">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="p-3 bg-green-500/20 rounded-xl">
//                       <FaCoins className="text-2xl text-green-400" />
//                     </div>
//                     <span className="text-sm font-semibold text-green-400">
//                       SOLD NFTS
//                     </span>
//                   </div>
//                   <h3 className="text-3xl font-bold text-white mb-2">
//                     {nftStats.soldNFTs || 0}
//                   </h3>
//                   <p className="text-sm text-gray-400">NFTs sold to users</p>
//                 </div>

//                 <div className="glass-card rounded-2xl p-6">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="p-3 bg-blue-500/20 rounded-xl">
//                       <FaMoneyBillWave className="text-2xl text-blue-400" />
//                     </div>
//                     <span className="text-sm font-semibold text-blue-400">
//                       NFT REVENUE
//                     </span>
//                   </div>
//                   <h3 className="text-3xl font-bold text-white mb-2">
//                     ${nftStats.totalRevenue || 0}
//                   </h3>
//                   <p className="text-sm text-gray-400">From NFT sales</p>
//                 </div>
//               </div>

//               {/* NFT Settings */}
//               <div className="glass-card rounded-2xl p-6">
//                 <h3 className="text-xl font-bold text-white mb-6">
//                   NFT Settings
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Base Price ($)
//                     </label>
//                     <input
//                       type="number"
//                       value={nftSettings.basePrice}
//                       onChange={(e) =>
//                         setNftSettings({
//                           ...nftSettings,
//                           basePrice: e.target.value,
//                         })
//                       }
//                       className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Sell Multiplier
//                     </label>
//                     <input
//                       type="number"
//                       step="0.1"
//                       value={nftSettings.sellMultiplier}
//                       onChange={(e) =>
//                         setNftSettings({
//                           ...nftSettings,
//                           sellMultiplier: e.target.value,
//                         })
//                       }
//                       className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
//                     />
//                   </div>

//                   <div className="md:col-span-2">
//                     <div className="flex items-center space-x-3">
//                       <input
//                         type="checkbox"
//                         id="mintingEnabled"
//                         checked={nftSettings.mintingEnabled}
//                         onChange={(e) =>
//                           setNftSettings({
//                             ...nftSettings,
//                             mintingEnabled: e.target.checked,
//                           })
//                         }
//                         className="rounded"
//                       />
//                       <label htmlFor="mintingEnabled" className="text-gray-300">
//                         Enable NFT Minting
//                       </label>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-6">
//                   <button
//                     onClick={handleSystemSettingsUpdate}
//                     className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg"
//                   >
//                     Save NFT Settings
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Withdrawal Management Tab */}
//           {activeTab === "withdrawals" && (
//             <div className="space-y-6">
//               <div className="flex justify-between items-center mb-6">
//                 <div>
//                   <h2 className="text-2xl font-bold text-white">
//                     Withdrawal Management
//                   </h2>
//                   <p className="text-gray-400">
//                     Approve or reject user withdrawal requests
//                   </p>
//                 </div>

//                 <div className="flex items-center space-x-4">
//                   <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
//                     Pending: {pendingWithdrawals.length}
//                   </span>
//                 </div>
//               </div>

//               {/* Withdrawals Table */}
//               <div className="glass-card rounded-2xl overflow-hidden">
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead className="bg-gray-800/50">
//                       <tr>
//                         <th className="py-4 px-4 text-left text-gray-400 font-medium">
//                           User
//                         </th>
//                         <th className="py-4 px-4 text-left text-gray-400 font-medium">
//                           Amount
//                         </th>
//                         <th className="py-4 px-4 text-left text-gray-400 font-medium">
//                           Wallet Address
//                         </th>
//                         <th className="py-4 px-4 text-left text-gray-400 font-medium">
//                           Date
//                         </th>
//                         <th className="py-4 px-4 text-left text-gray-400 font-medium">
//                           Status
//                         </th>
//                         <th className="py-4 px-4 text-left text-gray-400 font-medium">
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-800/50">
//                       {pendingWithdrawals.map((withdrawal) => (
//                         <tr
//                           key={withdrawal._id}
//                           className="hover:bg-gray-800/30"
//                         >
//                           <td className="py-4 px-4">
//                             <div>
//                               <p className="font-medium text-white">
//                                 {withdrawal.userName}
//                               </p>
//                               <p className="text-sm text-gray-400">
//                                 {withdrawal.userEmail}
//                               </p>
//                             </div>
//                           </td>
//                           <td className="py-4 px-4">
//                             <p className="text-xl font-bold text-green-400">
//                               ${withdrawal.amount}
//                             </p>
//                           </td>
//                           <td className="py-4 px-4">
//                             <code className="text-sm bg-gray-800/50 px-2 py-1 rounded">
//                               {withdrawal.walletAddress?.slice(0, 20)}...
//                             </code>
//                           </td>
//                           <td className="py-4 px-4">
//                             <p className="text-gray-300">
//                               {new Date(
//                                 withdrawal.createdAt,
//                               ).toLocaleDateString()}
//                             </p>
//                             <p className="text-sm text-gray-500">
//                               {new Date(
//                                 withdrawal.createdAt,
//                               ).toLocaleTimeString()}
//                             </p>
//                           </td>
//                           <td className="py-4 px-4">
//                             <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
//                               Pending
//                             </span>
//                           </td>
//                           <td className="py-4 px-4">
//                             <div className="flex space-x-2">
//                               <button
//                                 onClick={() =>
//                                   handleWithdrawalAction(
//                                     withdrawal._id,
//                                     "approve",
//                                   )
//                                 }
//                                 className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center space-x-2"
//                               >
//                                 <FaCheckCircle />
//                                 <span>Approve</span>
//                               </button>
//                               <button
//                                 onClick={() =>
//                                   handleWithdrawalAction(
//                                     withdrawal._id,
//                                     "reject",
//                                   )
//                                 }
//                                 className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center space-x-2"
//                               >
//                                 <FaTimesCircle />
//                                 <span>Reject</span>
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>

//                   {pendingWithdrawals.length === 0 && (
//                     <div className="text-center py-12">
//                       <FaCheckCircle className="text-4xl text-green-400 mx-auto mb-4" />
//                       <h3 className="text-xl font-semibold text-white mb-2">
//                         No Pending Withdrawals
//                       </h3>
//                       <p className="text-gray-400">
//                         All withdrawal requests have been processed
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* System Settings Tab */}
//           {activeTab === "settings" && systemSettings && (
//             <div className="space-y-6">
//               <h2 className="text-2xl font-bold text-white mb-6">
//                 System Settings
//               </h2>

//               {/* MLM Settings */}
//               <div className="glass-card rounded-2xl p-6">
//                 <h3 className="text-xl font-bold text-white mb-6 flex items-center">
//                   <FaNetworkWired className="mr-3 text-blue-400" />
//                   MLM Settings
//                 </h3>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Registration Fee ($)
//                     </label>
//                     <input
//                       type="number"
//                       value={mlmSettings.registrationFee}
//                       onChange={(e) =>
//                         setMlmSettings({
//                           ...mlmSettings,
//                           registrationFee: e.target.value,
//                         })
//                       }
//                       className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Max Levels
//                     </label>
//                     <input
//                       type="number"
//                       value={mlmSettings.maxLevels}
//                       onChange={(e) =>
//                         setMlmSettings({
//                           ...mlmSettings,
//                           maxLevels: e.target.value,
//                         })
//                       }
//                       className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Bonus Per Level (%)
//                     </label>
//                     <input
//                       type="number"
//                       step="0.1"
//                       value={mlmSettings.bonusPerLevel}
//                       onChange={(e) =>
//                         setMlmSettings({
//                           ...mlmSettings,
//                           bonusPerLevel: e.target.value,
//                         })
//                       }
//                       className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* System Status Settings */}
//               <div className="glass-card rounded-2xl p-6">
//                 <h3 className="text-xl font-bold text-white mb-6 flex items-center">
//                   <FaShieldAlt className="mr-3 text-green-400" />
//                   System Status
//                 </h3>

//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
//                     <div>
//                       <p className="font-medium text-white">
//                         Registration System
//                       </p>
//                       <p className="text-sm text-gray-400">
//                         Enable/Disable user registration
//                       </p>
//                     </div>
//                     <button
//                       onClick={() => {
//                         // Toggle registration status
//                       }}
//                       className={`px-4 py-2 rounded-lg ${
//                         systemSettings.systemStatus?.registrationEnabled
//                           ? "bg-green-600 hover:bg-green-700"
//                           : "bg-red-600 hover:bg-red-700"
//                       }`}
//                     >
//                       {systemSettings.systemStatus?.registrationEnabled
//                         ? "Disable"
//                         : "Enable"}
//                     </button>
//                   </div>

//                   <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
//                     <div>
//                       <p className="font-medium text-white">Trading System</p>
//                       <p className="text-sm text-gray-400">
//                         Enable/Disable NFT trading
//                       </p>
//                     </div>
//                     <button
//                       className={`px-4 py-2 rounded-lg ${
//                         systemSettings.systemStatus?.tradingEnabled
//                           ? "bg-green-600 hover:bg-green-700"
//                           : "bg-red-600 hover:bg-red-700"
//                       }`}
//                     >
//                       {systemSettings.systemStatus?.tradingEnabled
//                         ? "Disable"
//                         : "Enable"}
//                     </button>
//                   </div>

//                   <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
//                     <div>
//                       <p className="font-medium text-white">Maintenance Mode</p>
//                       <p className="text-sm text-gray-400">
//                         Put system under maintenance
//                       </p>
//                     </div>
//                     <button
//                       className={`px-4 py-2 rounded-lg ${
//                         systemSettings.systemStatus?.maintenanceMode
//                           ? "bg-green-600 hover:bg-green-700"
//                           : "bg-yellow-600 hover:bg-yellow-700"
//                       }`}
//                     >
//                       {systemSettings.systemStatus?.maintenanceMode
//                         ? "Disable"
//                         : "Enable"}
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Save Button */}
//               <div className="flex justify-end">
//                 <button
//                   onClick={handleSystemSettingsUpdate}
//                   className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-lg font-medium shadow-lg"
//                 >
//                   Save All Settings
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Security Tab */}
//           {activeTab === "security" && (
//             <div className="space-y-6">
//               <h2 className="text-2xl font-bold text-white mb-6">
//                 Security Settings
//               </h2>

//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 {/* API Access */}
//                 <div className="glass-card rounded-2xl p-6">
//                   <h3 className="text-xl font-bold text-white mb-6 flex items-center">
//                     <FaKey className="mr-3 text-yellow-400" />
//                     API Access Tokens
//                   </h3>

//                   <div className="space-y-4">
//                     <div className="p-4 bg-gray-800/30 rounded-lg">
//                       <div className="flex justify-between items-center mb-2">
//                         <span className="font-medium text-white">
//                           Super Admin Token
//                         </span>
//                         <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">
//                           Regenerate
//                         </button>
//                       </div>
//                       <code className="text-sm bg-black/50 p-2 rounded block truncate">
//                         {getAdminToken()?.slice(0, 50)}...
//                       </code>
//                     </div>

//                     <div className="p-4 bg-gray-800/30 rounded-lg">
//                       <div className="flex justify-between items-center mb-2">
//                         <span className="font-medium text-white">
//                           API Rate Limit
//                         </span>
//                         <span className="text-green-400">1000/hr</span>
//                       </div>
//                       <input
//                         type="range"
//                         min="100"
//                         max="5000"
//                         step="100"
//                         className="w-full"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Security Logs */}
//                 <div className="glass-card rounded-2xl p-6">
//                   <h3 className="text-xl font-bold text-white mb-6 flex items-center">
//                     <FaHistory className="mr-3 text-blue-400" />
//                     Security Logs
//                   </h3>

//                   <div className="space-y-3">
//                     {[
//                       {
//                         time: "2 mins ago",
//                         action: "User login attempt",
//                         ip: "192.168.1.1",
//                         status: "success",
//                       },
//                       {
//                         time: "5 mins ago",
//                         action: "Settings updated",
//                         ip: "192.168.1.1",
//                         status: "success",
//                       },
//                       {
//                         time: "10 mins ago",
//                         action: "API rate limit exceeded",
//                         ip: "103.56.78.90",
//                         status: "blocked",
//                       },
//                     ].map((log, index) => (
//                       <div
//                         key={index}
//                         className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
//                       >
//                         <div>
//                           <p className="font-medium text-white">{log.action}</p>
//                           <p className="text-sm text-gray-400">
//                             {log.time} • {log.ip}
//                           </p>
//                         </div>
//                         <span
//                           className={`px-2 py-1 rounded text-xs ${
//                             log.status === "success"
//                               ? "bg-green-500/20 text-green-400"
//                               : "bg-red-500/20 text-red-400"
//                           }`}
//                         >
//                           {log.status}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* Security Actions */}
//               <div className="glass-card rounded-2xl p-6">
//                 <h3 className="text-xl font-bold text-white mb-6">
//                   Security Actions
//                 </h3>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <button className="p-4 bg-red-600/20 hover:bg-red-600/30 rounded-lg border border-red-500/30 transition-colors">
//                     <FaBan className="text-2xl text-red-400 mb-2" />
//                     <p className="font-medium text-white">
//                       Force Logout All Users
//                     </p>
//                     <p className="text-sm text-gray-400">Immediate logout</p>
//                   </button>

//                   <button className="p-4 bg-yellow-600/20 hover:bg-yellow-600/30 rounded-lg border border-yellow-500/30 transition-colors">
//                     <FaLock className="text-2xl text-yellow-400 mb-2" />
//                     <p className="font-medium text-white">Enable 2FA</p>
//                     <p className="text-sm text-gray-400">For all admins</p>
//                   </button>

//                   <button className="p-4 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg border border-blue-500/30 transition-colors">
//                     <FaDownload className="text-2xl text-blue-400 mb-2" />
//                     <p className="font-medium text-white">Export Logs</p>
//                     <p className="text-sm text-gray-400">
//                       Download security logs
//                     </p>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
