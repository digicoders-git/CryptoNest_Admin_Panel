// import { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   FaUsers,
//   FaWallet,
//   FaMoneyBillWave,
//   FaUserFriends,
//   FaChartLine,
//   FaEye,
//   FaFilter,
//   FaCalendarAlt,
//   FaDownload,
//   FaSearch,
//   FaSort,
//   FaSortUp,
//   FaSortDown
// } from "react-icons/fa";
// import Swal from "sweetalert2";

// export default function RegistrationReport() {
//   const [registrations, setRegistrations] = useState([]);
//   const [filteredRegistrations, setFilteredRegistrations] = useState([]);
//   const [stats, setStats] = useState({
//     totalRegistrations: 0,
//     totalParentsPayout: 0,
//     totalCompanyEarnings: 0,
//     totalRegistrationAmount: 0
//   });
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [dateFilter, setDateFilter] = useState("all");
//   const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
//   const [selectedRow, setSelectedRow] = useState(null);

//   useEffect(() => {
//     fetchRegistrationReport();
//   }, []);

//   useEffect(() => {
//     filterAndSortRegistrations();
//   }, [registrations, searchTerm, dateFilter, sortConfig]);

//   const fetchRegistrationReport = async (showLoader = false) => {
//     try {
//       if (showLoader) setRefreshing(true);
//       setLoading(true);

//       const token = localStorage.getItem('token') || localStorage.getItem('superAdminToken');

//       if (!token) {
//         // Clear all data when no token
//         setRegistrations([]);
//         setFilteredRegistrations([]);
//         setStats({
//           totalRegistrations: 0,
//           totalParentsPayout: 0,
//           totalCompanyEarnings: 0,
//           totalRegistrationAmount: 0
//         });
//         Swal.fire({
//           icon: "error",
//           title: "Authentication Error",
//           text: "Please login again to view registration data",
//           confirmButtonColor: "#9333ea",
//           background: "#0f172a",
//           color: "#fff"
//         });
//         return;
//       }

//       const response = await axios.get('https://api.gtnworld.live/api/SuperAdmin/company-transactions', {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (response.data.success) {
//         const data = response.data;
//         const allTransactions = data.transactions || [];

//         const registrationTxs = allTransactions.filter(tx => tx.type === 'Registration');

//         const processedRegistrations = registrationTxs.map(tx => {
//           const parentPayout = allTransactions.find(
//             ptx => ptx.type === 'Parent Payout' &&
//             ptx.user?.code === tx.user?.code &&
//             Math.abs(new Date(ptx.date) - new Date(tx.date)) < 60000
//           );

//           const registrationAmount = Math.abs(tx.amount);
//           const parentPayoutAmount = parentPayout ? Math.abs(parentPayout.amount) : 0;
//           const companyEarnings = registrationAmount - parentPayoutAmount;
//           const parentCount = tx.parentCount || 0;

//           return {
//             id: tx.id || tx._id,
//             user: tx.user?.name || 'Unknown User',
//             email: tx.user?.email || 'N/A',
//             userCode: tx.user?.code || 'N/A',
//             registrationAmount: registrationAmount,
//             parentsPayout: parentPayoutAmount,
//             companyEarnings: companyEarnings,
//             parentCount: parentCount,
//             date: new Date(tx.date).toLocaleDateString(),
//             fullDate: tx.date,
//             description: tx.description || 'User Registration',
//             status: 'completed',
//             paymentMethod: 'online'
//           };
//         });

//         const totalRegistrations = processedRegistrations.length;
//         const totalRegistrationAmount = processedRegistrations.reduce((sum, reg) => sum + reg.registrationAmount, 0);
//         const totalParentsPayout = processedRegistrations.reduce((sum, reg) => sum + reg.parentsPayout, 0);
//         const totalCompanyEarnings = processedRegistrations.reduce((sum, reg) => sum + reg.companyEarnings, 0);

//         setRegistrations(processedRegistrations);
//         setStats({
//           totalRegistrations,
//           totalRegistrationAmount,
//           totalParentsPayout,
//           totalCompanyEarnings
//         });
//       } else {
//         // Clear data if API response is not successful
//         setRegistrations([]);
//         setFilteredRegistrations([]);
//         setStats({
//           totalRegistrations: 0,
//           totalParentsPayout: 0,
//           totalCompanyEarnings: 0,
//           totalRegistrationAmount: 0
//         });
//       }
//     } catch (error) {
//       console.error('Error fetching registration report:', error);

//       // Clear all data on error
//       setRegistrations([]);
//       setFilteredRegistrations([]);
//       setStats({
//         totalRegistrations: 0,
//         totalParentsPayout: 0,
//         totalCompanyEarnings: 0,
//         totalRegistrationAmount: 0
//       });

//       if (error.response?.status === 401) {
//         Swal.fire({
//           icon: "error",
//           title: "Authentication Failed",
//           text: "Your session has expired. Please login again.",
//           confirmButtonColor: "#9333ea",
//           background: "#0f172a",
//           color: "#fff"
//         });
//       } else {
//         Swal.fire({
//           icon: "error",
//           title: "API Error",
//           text: error.response?.data?.message || "Failed to fetch registration data",
//           confirmButtonColor: "#9333ea",
//           background: "#0f172a",
//           color: "#fff"
//         });
//       }
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const filterAndSortRegistrations = () => {
//     let filtered = [...registrations];

//     // Search filter
//     if (searchTerm) {
//       filtered = filtered.filter(reg =>
//         reg.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         reg.userCode.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     // Date filter
//     if (dateFilter !== "all") {
//       const now = new Date();
//       const filterDate = new Date();

//       switch(dateFilter) {
//         case "today":
//           filterDate.setHours(0, 0, 0, 0);
//           filtered = filtered.filter(reg => new Date(reg.fullDate) >= filterDate);
//           break;
//         case "week":
//           filterDate.setDate(now.getDate() - 7);
//           filtered = filtered.filter(reg => new Date(reg.fullDate) >= filterDate);
//           break;
//         case "month":
//           filterDate.setMonth(now.getMonth() - 1);
//           filtered = filtered.filter(reg => new Date(reg.fullDate) >= filterDate);
//           break;
//         default:
//           break;
//       }
//     }

//     // Sorting
//     filtered.sort((a, b) => {
//       if (sortConfig.key === 'date') {
//         return sortConfig.direction === 'asc'
//           ? new Date(a.fullDate) - new Date(b.fullDate)
//           : new Date(b.fullDate) - new Date(a.fullDate);
//       }
//       return sortConfig.direction === 'asc'
//         ? a[sortConfig.key] - b[sortConfig.key]
//         : b[sortConfig.key] - a[sortConfig.key];
//     });

//     setFilteredRegistrations(filtered);
//   };

//   const handleSort = (key) => {
//     setSortConfig(prev => ({
//       key,
//       direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
//     }));
//   };

//   const getSortIcon = (key) => {
//     if (sortConfig.key !== key) return <FaSort className="ml-1 opacity-50" />;
//     return sortConfig.direction === 'asc'
//       ? <FaSortUp className="ml-1" />
//       : <FaSortDown className="ml-1" />;
//   };

//   const showRegistrationDetails = (registration) => {
//     setSelectedRow(registration.id);
//     setTimeout(() => setSelectedRow(null), 300);

//     Swal.fire({
//       title: `<div class="text-center mb-6">
//                 <div class="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg">
//                   ${registration.user.charAt(0)}
//                 </div>
//                 <h3 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">${registration.user}</h3>
//                 <p class="text-gray-500 dark:text-gray-300">${registration.email}</p>
//               </div>`,
//       html: `
//         <div class="space-y-6">
//           <div class="grid grid-cols-3 gap-4">
//             <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white shadow-lg">
//               <div class="text-2xl mb-2">💰</div>
//               <p class="text-sm opacity-90">Registration Fee</p>
//               <h4 class="text-xl font-bold mt-1">$${registration.registrationAmount}</h4>
//             </div>

//             <div class="bg-gradient-to-br from-red-500 to-pink-600 p-4 rounded-xl text-white shadow-lg">
//               <div class="text-2xl mb-2">📤</div>
//               <p class="text-sm opacity-90">Parents Payout</p>
//               <h4 class="text-xl font-bold mt-1">$${registration.parentsPayout}</h4>
//             </div>

//             <div class="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl text-white shadow-lg">
//               <div class="text-2xl mb-2">🏦</div>
//               <p class="text-sm opacity-90">Company Profit</p>
//               <h4 class="text-xl font-bold mt-1">$${registration.companyEarnings}</h4>
//             </div>
//           </div>

//           <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
//             <h5 class="font-semibold text-gray-700 dark:text-gray-300 mb-3">Distribution Breakdown</h5>
//             <div class="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
//               <div class="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 to-pink-600 rounded-l-full"
//                    style="width: ${(registration.parentsPayout / registration.registrationAmount) * 100}%">
//                 <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
//                   Parents (${((registration.parentsPayout / registration.registrationAmount) * 100).toFixed(1)}%)
//                 </span>
//               </div>
//               <div class="absolute right-0 top-0 h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-r-full"
//                    style="width: ${(registration.companyEarnings / registration.registrationAmount) * 100}%">
//                 <span class="absolute inset-0 flex items-center justify-content: center; justify-content: center text-xs font-bold text-white">
//                   Company (${((registration.companyEarnings / registration.registrationAmount) * 100).toFixed(1)}%)
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-4 rounded-xl border border-blue-100 dark:border-gray-700">
//             <div class="grid grid-cols-2 gap-4">
//               <div>
//                 <p class="text-sm text-gray-500 dark:text-gray-400">User Code</p>
//                 <p class="font-semibold text-gray-800 dark:text-white">${registration.userCode}</p>
//               </div>
//               <div>
//                 <p class="text-sm text-gray-500 dark:text-gray-400">Registration Date</p>
//                 <p class="font-semibold text-gray-800 dark:text-white">${registration.date}</p>
//               </div>
//               <div>
//                 <p class="text-sm text-gray-500 dark:text-gray-400">Status</p>
//                 <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
//                   ${registration.status}
//                 </span>
//               </div>
//               <div>
//                 <p class="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
//                 <p class="font-semibold text-gray-800 dark:text-white">${registration.paymentMethod}</p>
//               </div>
//             </div>
//           </div>

//           <div class="flex justify-center space-x-3">
//             <button onclick="Swal.close()" class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium">
//               Close Details
//             </button>
//           </div>
//         </div>
//       `,
//       showCloseButton: true,
//       showConfirmButton: false,
//       width: 600,
//       background: '#ffffff',
//       color: '#000000',
//       customClass: {
//         popup: 'rounded-2xl shadow-2xl',
//         title: 'swal2-title-custom'
//       }
//     });
//   };

//   const exportToCSV = () => {
//     const headers = ['User', 'Email', 'Code', 'Registration Amount', 'Parents Payout', 'Company Earnings', 'Date', 'Status'];
//     const csvData = filteredRegistrations.map(reg => [
//       reg.user,
//       reg.email,
//       reg.userCode,
//       `$${reg.registrationAmount}`,
//       `$${reg.parentsPayout}`,
//       `$${reg.companyEarnings}`,
//       reg.date,
//       reg.status
//     ]);

//     const csvContent = [
//       headers.join(','),
//       ...csvData.map(row => row.join(','))
//     ].join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `registration-report-${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
//         <div className="relative">
//           <div className="w-32 h-32 border-4 border-transparent border-t-purple-500 border-r-blue-500 rounded-full animate-spin"></div>
//           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
//             <div className="w-20 h-20 border-4 border-transparent border-b-green-500 border-l-orange-500 rounded-full animate-spin animation-delay-500"></div>
//           </div>
//         </div>
//         <p className="mt-8 text-xl font-semibold text-gray-700 dark:text-gray-300 animate-pulse">
//           Loading Registration Data...
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
//       <div className="max-w-8xl mx-auto space-y-8">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
//           <div>
//             <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-4">
//               <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
//                 <FaUsers className="text-2xl text-white" />
//               </div>
//               <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                 Registration Analytics
//               </span>
//             </h1>
//             <p className="text-gray-600 dark:text-gray-400 mt-3 text-lg">
//               Comprehensive overview of user registrations and revenue distribution
//             </p>
//           </div>

//           <div className="flex flex-wrap gap-3">
//             <button
//               onClick={() => fetchRegistrationReport(true)}
//               disabled={refreshing}
//               className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-3 overflow-hidden"
//             >
//               <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
//               <FaChartLine className={refreshing ? "animate-spin" : "group-hover:rotate-12 transition-transform"} />
//               <span className="font-semibold">{refreshing ? "Refreshing..." : "Refresh Data"}</span>
//             </button>

//             <button
//               onClick={exportToCSV}
//               className="group px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3"
//             >
//               <FaDownload className="group-hover:-translate-y-1 transition-transform" />
//               <span className="font-semibold">Export CSV</span>
//             </button>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {[
//             {
//               title: "Total Registrations",
//               value: stats.totalRegistrations,
//               icon: <FaUsers className="text-3xl" />,
//               color: "from-blue-500 to-blue-600",
//               bgColor: "bg-blue-500/10",
//               textColor: "text-blue-600"
//             },
//             {
//               title: "Registration Revenue",
//               value: `$${stats.totalRegistrationAmount}`,
//               icon: <FaMoneyBillWave className="text-3xl" />,
//               color: "from-green-500 to-emerald-600",
//               bgColor: "bg-green-500/10",
//               textColor: "text-green-600"
//             },
//             {
//               title: "Parents Payout",
//               value: `$${stats.totalParentsPayout}`,
//               icon: <FaUserFriends className="text-3xl" />,
//               color: "from-orange-500 to-red-600",
//               bgColor: "bg-orange-500/10",
//               textColor: "text-orange-600"
//             },
//             {
//               title: "Company Earnings",
//               value: `$${stats.totalCompanyEarnings}`,
//               icon: <FaWallet className="text-3xl" />,
//               color: "from-purple-500 to-pink-600",
//               bgColor: "bg-purple-500/10",
//               textColor: "text-purple-600"
//             }
//           ].map((stat, index) => (
//             <div
//               key={index}
//               className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 p-6 border border-gray-200 dark:border-gray-700"
//             >
//               <div className="flex items-center justify-between mb-6">
//                 <div className={`p-4 rounded-xl ${stat.bgColor} ${stat.textColor}`}>
//                   {stat.icon}
//                 </div>
//                 <div className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${stat.color} text-white`}>
//                   {index === 0 ? 'USERS' : index === 1 ? 'REVENUE' : index === 2 ? 'PAYOUT' : 'PROFIT'}
//                 </div>
//               </div>
//               <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">{stat.title}</p>
//               <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
//               <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
//                 <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                   <div
//                     className={`h-2 rounded-full bg-gradient-to-r ${stat.color} transition-all duration-1000`}
//                     style={{ width: '100%' }}
//                   ></div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Filters and Search */}
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
//           <div className="flex flex-col md:flex-row gap-6">
//             <div className="flex-1">
//               <div className="relative">
//                 <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search by name, email, or code..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                 />
//               </div>
//             </div>

//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-3">
//                 <FaFilter className="text-gray-500 dark:text-gray-400" />
//                 <select
//                   value={dateFilter}
//                   onChange={(e) => setDateFilter(e.target.value)}
//                   className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
//                 >
//                   <option value="all">All Time</option>
//                   <option value="today">Today</option>
//                   <option value="week">Last 7 Days</option>
//                   <option value="month">Last 30 Days</option>
//                 </select>
//               </div>

//               <div className="text-sm text-gray-500 dark:text-gray-400">
//                 Showing <span className="font-bold text-gray-900 dark:text-white">{filteredRegistrations.length}</span> of {registrations.length} registrations
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Registration Table */}
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
//           <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6">
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//               <h3 className="text-2xl font-bold text-white flex items-center gap-3">
//                 <FaChartLine className="text-2xl" />
//                 Registration Breakdown
//               </h3>
//               <div className="flex items-center gap-3">
//                 <span className="text-blue-100 text-sm">Total Profit</span>
//                 <span className="text-2xl font-bold text-white">${stats.totalCompanyEarnings}</span>
//               </div>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   <th className="px-8 py-4 text-left">
//                     <button
//                       onClick={() => handleSort('user')}
//                       className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
//                     >
//                       User Info {getSortIcon('user')}
//                     </button>
//                   </th>
//                   <th className="px-8 py-4 text-left">
//                     <button
//                       onClick={() => handleSort('registrationAmount')}
//                       className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
//                     >
//                       Registration {getSortIcon('registrationAmount')}
//                     </button>
//                   </th>
//                   <th className="px-8 py-4 text-left">
//                     <button
//                       onClick={() => handleSort('parentsPayout')}
//                       className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
//                     >
//                       Parents Payout {getSortIcon('parentsPayout')}
//                     </button>
//                   </th>
//                   <th className="px-8 py-4 text-left">
//                     <button
//                       onClick={() => handleSort('companyEarnings')}
//                       className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
//                     >
//                       Company Earnings {getSortIcon('companyEarnings')}
//                     </button>
//                   </th>
//                   <th className="px-8 py-4 text-left">
//                     <button
//                       onClick={() => handleSort('date')}
//                       className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
//                     >
//                       <FaCalendarAlt className="mr-2" /> Date {getSortIcon('date')}
//                     </button>
//                   </th>
//                   <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                 {filteredRegistrations.map((reg) => (
//                   <tr
//                     key={reg.id}
//                     className={`
//                       hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300
//                       ${selectedRow === reg.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
//                       ${reg.parentsPayout > reg.registrationAmount * 0.5 ? 'bg-red-50/50 dark:bg-red-900/10' : ''}
//                     `}
//                   >
//                     <td className="px-8 py-4">
//                       <div className="flex items-center gap-4">
//                         <div className="relative">
//                           <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
//                             {reg.user.charAt(0)}
//                           </div>
//                           {reg.parentsPayout > 0 && (
//                             <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
//                               <FaUserFriends className="text-xs text-white" />
//                             </div>
//                           )}
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium text-gray-900 dark:text-white">{reg.user}</p>
//                           <p className="text-xs text-gray-500 dark:text-gray-400">{reg.email}</p>
//                           <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-1">
//                             Code: {reg.userCode}
//                           </p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-8 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
//                           <FaMoneyBillWave className="text-blue-600 dark:text-blue-400" />
//                         </div>
//                         <div>
//                           <span className="text-lg font-bold text-gray-900 dark:text-white">
//                             ${reg.registrationAmount}
//                           </span>
//                           <p className="text-xs text-gray-500 dark:text-gray-400">Full registration</p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-8 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
//                           <FaUserFriends className="text-red-600 dark:text-red-400" />
//                         </div>
//                         <div>
//                           <span className="text-lg font-bold text-gray-900 dark:text-white">
//                             ${reg.parentsPayout}
//                           </span>
//                           <p className="text-xs text-gray-500 dark:text-gray-400">
//                             {reg.parentCount} parents
//                           </p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-8 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
//                           <FaWallet className="text-green-600 dark:text-green-400" />
//                         </div>
//                         <div>
//                           <span className="text-lg font-bold text-gray-900 dark:text-white">
//                             ${reg.companyEarnings}
//                           </span>
//                           <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
//                             <div
//                               className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
//                               style={{ width: `${(reg.companyEarnings / reg.registrationAmount) * 100}%` }}
//                             ></div>
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-8 py-4">
//                       <div className="text-sm text-gray-900 dark:text-white font-medium">
//                         {reg.date}
//                       </div>
//                       <div className="text-xs text-gray-500 dark:text-gray-400">
//                         {new Date(reg.fullDate).toLocaleTimeString()}
//                       </div>
//                     </td>
//                     <td className="px-8 py-4">
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => showRegistrationDetails(reg)}
//                           className="group px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
//                         >
//                           <FaEye className="group-hover:scale-110 transition-transform" />
//                           <span className="font-medium">View</span>
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {filteredRegistrations.length === 0 && (
//               <div className="text-center py-16">
//                 <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
//                   <FaUsers className="text-4xl text-gray-400 dark:text-gray-500" />
//                 </div>
//                 <h3 className="text-2xl font-semibold text-gray-500 dark:text-gray-400 mb-3">
//                   No Registration Data Found
//                 </h3>
//                 <p className="text-gray-400 dark:text-gray-500 max-w-md mx-auto">
//                   {searchTerm || dateFilter !== 'all'
//                     ? 'Try adjusting your search or filter criteria'
//                     : 'No registration transactions available at the moment'}
//                 </p>
//                 {(searchTerm || dateFilter !== 'all') && (
//                   <button
//                     onClick={() => {
//                       setSearchTerm('');
//                       setDateFilter('all');
//                     }}
//                     className="mt-6 px-6 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-medium"
//                   >
//                     Clear filters
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Footer Summary */}
//           {filteredRegistrations.length > 0 && (
//             <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-8 py-6 border-t border-gray-200 dark:border-gray-700">
//               <div className="flex flex-wrap items-center justify-between gap-6">
//                 <div className="text-sm text-gray-600 dark:text-gray-400">
//                   <span className="font-semibold text-gray-900 dark:text-white">{filteredRegistrations.length}</span> registrations
//                   {searchTerm && ` matching "${searchTerm}"`}
//                 </div>
//                 <div className="flex items-center gap-8">
//                   <div className="text-center">
//                     <div className="text-2xl font-bold text-green-600 dark:text-green-400">
//                       ${stats.totalCompanyEarnings}
//                     </div>
//                     <div className="text-xs text-gray-500 dark:text-gray-400">Total Profit</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
//                       {((stats.totalCompanyEarnings / stats.totalRegistrationAmount) * 100).toFixed(1)}%
//                     </div>
//                     <div className="text-xs text-gray-500 dark:text-gray-400">Profit Margin</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
