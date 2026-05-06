// import { useState, useEffect } from "react";
// import axios from "axios";
// import { FaWallet, FaChartLine, FaUsers, FaExchangeAlt, FaDollarSign } from "react-icons/fa";

// export default function Overview() {
//   const [loading, setLoading] = useState(true);
//   const [data, setData] = useState({
//     transactions: [],
//     totalEarnings: 0,
//     companyWallet: ""
//   });

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

//       if (!token) return;

//       const response = await axios.get(
//         "https://api.gtnworld.live/api/admin/company-transactions",
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data.success) {
//         setData(response.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-[60vh]">
//         <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 text-gray-200">
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-extrabold flex items-center gap-3">
//           <FaChartLine className="text-indigo-500" />
//           Overview
//         </h1>
//         <p className="text-gray-400 mt-1">Company financial overview & statistics</p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-400 text-sm">Total Earnings</p>
//               <p className="text-2xl font-bold text-emerald-400">${data.totalEarnings}</p>
//             </div>
//             <FaWallet className="text-3xl text-emerald-500" />
//           </div>
//         </div>

//         <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-400 text-sm">Total Transactions</p>
//               <p className="text-2xl font-bold text-blue-400">{data.transactions?.length || 0}</p>
//             </div>
//             <FaExchangeAlt className="text-3xl text-blue-500" />
//           </div>
//         </div>

//         <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-400 text-sm">Company Wallet</p>
//               <p className="text-sm font-bold text-purple-400">
//                 {data.companyWallet ? `${data.companyWallet.slice(0, 10)}...` : "N/A"}
//               </p>
//             </div>
//             <FaDollarSign className="text-3xl text-purple-500" />
//           </div>
//         </div>

//         <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-400 text-sm">Avg Transaction</p>
//               <p className="text-2xl font-bold text-yellow-400">
//                 ${data.transactions?.length ? (data.totalEarnings / data.transactions.length).toFixed(2) : 0}
//               </p>
//             </div>
//             <FaChartLine className="text-3xl text-yellow-500" />
//           </div>
//         </div>
//       </div>

//       {/* Recent Transactions */}
//       <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6">
//         <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
//         <div className="space-y-3">
//           {data.transactions?.slice(0, 10).map((transaction) => (
//             <div key={transaction._id} className="flex justify-between items-center bg-gray-800/50 rounded-xl p-4">
//               <div>
//                 <p className="font-semibold text-white">{transaction.userId?.name || 'Unknown User'}</p>
//                 <p className="text-gray-400 text-sm">{transaction.description}</p>
//                 <p className="text-gray-500 text-xs">{new Date(transaction.createdAt).toLocaleDateString()}</p>
//               </div>
//               <div className="text-right">
//                 <p className="text-emerald-400 font-bold">${transaction.amount}</p>
//                 <span className="px-2 py-1 rounded-full text-xs bg-green-600/20 text-green-300">
//                   {transaction.status}
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
