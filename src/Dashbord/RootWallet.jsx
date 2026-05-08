import {
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaSync,
  FaCopy,
  FaEye,
  FaTimes,
  FaUsers,
  FaFilter,
  FaSearch,
  FaChevronRight,
  FaChevronLeft,
  FaNetworkWired,
  FaTag,
  FaGem,
  FaRocket,
  FaChartLine,
  FaDatabase,
  FaSortAmountDown,
  FaSortAmountUp,
  FaPercentage,
  FaExchangeAlt,
  FaReceipt,
  FaHistory,
  FaCrown,
  FaMoneyBillWave,
  FaUserFriends,
  FaHandHoldingUsd,
  FaChartBar,
  FaSitemap,
  FaShoppingCart,
  FaExclamationCircle,
  FaSpinner
} from "react-icons/fa";
import { MdOutlineAccountBalanceWallet, MdOutlineRefresh } from "react-icons/md";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import { TbTrendingUp } from "react-icons/tb";
import { useState, useEffect, useMemo } from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

export default function RootWallet() {
  const [companyData, setCompanyData] = useState({
    superUserWallet: "",
    totalBalance: 0,
    lastUpdated: "",
  });
  const [transactions, setTransactions] = useState({
    transactions: [],
    summary: {
      totalBalance: 0,
      totalTransactions: 0,
      breakdown: [],
      companyWallet: "",
    },
    pagination: {
      current: 1,
      limit: 20,
      total: 0,
      pages: 1,
    },
    lastUpdated: "",
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFullWallet, setShowFullWallet] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [graphData, setGraphData] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeCard, setActiveCard] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userItemsPerPage, setUserItemsPerPage] = useState(10);
  const [showCharts, setShowCharts] = useState(true);
  const [transactionFilterTab, setTransactionFilterTab] = useState("all");

  useEffect(() => {
    fetchWalletData();
    fetchUsers();
    const interval = setInterval(() => {
      fetchWalletData();
      fetchUsers();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("superAdminToken");

      if (!token) return;

      const response = await axios.get(`${API_URL}api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const sortedUsers = (response.data.data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setUsers(sortedUsers);
        const transactionRes = await axios.get(
          `${API_URL}api/SuperAdmin/company-transactions`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (transactionRes.data.success && transactionRes.data.graph) {
          setGraphData(transactionRes.data.graph);
        }
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchWalletData = async (showLoader = false) => {
    try {
      if (showLoader) setRefreshing(true);

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("superAdminToken");

      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Authentication Error",
          text: "Please login again",
          background: "#000000",
          color: "#F3C06A",
          confirmButtonColor: "#D4AF37",
        });
        return;
      }

      const transactionRes = await axios.get(
        `${API_URL}api/SuperAdmin/company-transactions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (transactionRes.data.success) {
        const data = transactionRes.data;
        const allTransactions = data.transactions || [];

        const totalPayouts = allTransactions
          .filter((tx) => tx.type === "Parent Payout")
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

        setCompanyData({
          superUserWallet: data.companyWallet || "",
          totalBalance: data.summary?.totalEarnings || 0,
          lastUpdated: new Date().toISOString(),
        });

        setTransactions({
          transactions: allTransactions,
          summary: {
            totalBalance: data.summary?.totalEarnings || 0,
            totalTransactions: allTransactions.length,
            totalIncome: data.summary?.totalIncome || 0,
            totalPayouts: totalPayouts,
            companyWallet: data.companyWallet || "",
          },
          pagination: {
            current: 1,
            limit: 20,
            total: allTransactions.length,
            pages: Math.ceil(allTransactions.length / 20),
          },
          lastUpdated: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("API Error:", error);
      Swal.fire({
        icon: "error",
        title: "API Error",
        text: error.response?.data?.message || "Failed to fetch wallet data",
        background: "#000000",
        color: "#F3C06A",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const copyWalletAddress = (address) => {
    navigator.clipboard.writeText(address);
    Swal.fire({
      icon: "success",
      title: "Copied!",
      text: "Wallet address copied to clipboard",
      timer: 1500,
      showConfirmButton: false,
      background: "#000000",
      color: "#F3C06A",
    });
  };

  const formatWalletAddress = (address) => {
    if (!address) return "N/A";
    return showFullWallet
      ? address
      : `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "Registration":
        return <FaUsers className="text-[#D4AF37]" />;
      case "Parent Payout":
        return <FaUserFriends className="text-[#D4AF37]" />;
      case "NFT Sale":
        return <FaGem className="text-[#D4AF37]" />;
      case "Upgrade":
        return <FaRocket className="text-[#D4AF37]" />;
      default:
        return <FaWallet className="text-[#D4AF37]" />;
    }
  };

  // Calculate totals for cards
  const adminNftTotal = useMemo(() => {
    return transactions.transactions
      .filter(
        (tx) =>
          tx.type === "Other" &&
          (tx.description?.toLowerCase().includes("nft") ||
            tx.description?.toLowerCase().includes("admin nft") ||
            tx.description?.toLowerCase().includes("nft sale")),
      )
      .reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0);
  }, [transactions.transactions]);

  const missedParentBonusTotal = useMemo(() => {
    return transactions.transactions
      .filter((tx) => tx.type === "NFT Sale" && tx.companyShare < 4)
      .reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0);
  }, [transactions.transactions]);

  const nftSaleTotal = useMemo(() => {
    return transactions.transactions
      .filter((tx) => tx.type === "NFT Sale" && tx.companyShare === 4)
      .reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0);
  }, [transactions.transactions]);

  const upgradeTotal = useMemo(() => {
    return transactions.transactions
      .filter(
        (tx) =>
          tx.type === "Upgrade" ||
          tx.description?.toLowerCase().includes("package upgrade"),
      )
      .reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0);
  }, [transactions.transactions]);

  const otherTotal = useMemo(() => {
    return transactions.transactions
      .filter(
        (tx) =>
          tx.type === "Other" &&
          !tx.description?.toLowerCase().includes("nft") &&
          !tx.description?.toLowerCase().includes("admin nft") &&
          !tx.description?.toLowerCase().includes("nft sale"),
      )
      .reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0);
  }, [transactions.transactions]);

  // Filter transactions based on tab
  const getFilteredByTab = () => {
    let filtered = [...transactions.transactions];

    if (transactionFilterTab !== "all") {
      if (transactionFilterTab === "Registration") {
        filtered = filtered.filter((tx) => tx.type === "Registration");
      } else if (transactionFilterTab === "Parent Payout") {
        filtered = filtered.filter((tx) => tx.type === "Parent Payout");
      } else if (transactionFilterTab === "NFT Sale") {
        filtered = filtered.filter((tx) => tx.type === "NFT Sale");
      } else if (transactionFilterTab === "Upgrade") {
        filtered = filtered.filter((tx) => tx.type === "Upgrade");
      } else if (transactionFilterTab === "Other") {
        filtered = filtered.filter((tx) => tx.type === "Other");
      }
    }

    return filtered;
  };

  const filteredByTab = getFilteredByTab();

  const filteredTransactions = useMemo(() => {
    let filtered = [...filteredByTab];

    if (searchTerm) {
      filtered = filtered.filter(
        (tx) =>
          tx.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (sortOrder === "desc") {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    return filtered;
  }, [filteredByTab, searchTerm, sortOrder]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalUserPages = Math.ceil(users.length / userItemsPerPage);
  const currentUsers = users.slice(
    (userCurrentPage - 1) * userItemsPerPage,
    userCurrentPage * userItemsPerPage,
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate total values for cards
  const monthlyChartData = useMemo(() => {
    const months = [];
    const amounts = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.toLocaleString("en-US", { month: "short", year: "numeric" });
      const total = transactions.transactions
        .filter((tx) => {
          const txDate = new Date(tx.date);
          return txDate.getMonth() === d.getMonth() && txDate.getFullYear() === d.getFullYear();
        })
        .reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0);
      months.push(month);
      amounts.push(parseFloat(total.toFixed(2)));
    }
    return { months, amounts };
  }, [transactions.transactions]);

  const totalIncome = transactions.summary?.totalIncome || 0;
  const totalPayouts = transactions.summary?.totalPayouts || 0;
  const netProfit = totalIncome - totalPayouts - adminNftTotal - nftSaleTotal - upgradeTotal - missedParentBonusTotal;
  const totalRegistrations = transactions.transactions.filter(tx => tx.type === "Registration").reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  // Highcharts - Revenue Breakdown Chart
  const revenueBreakdownChart = {
    chart: { type: "pie", backgroundColor: "transparent", options3d: { enabled: true, alpha: 45 } },
    title: { text: "💰 Revenue Breakdown", style: { color: "#D4AF37", fontSize: "16px", fontWeight: "bold" } },
    plotOptions: {
      pie: {
        innerSize: "60%",
        allowPointSelect: true,
        dataLabels: { enabled: true, format: "{point.name}: {point.percentage:.1f}%", style: { color: "#D4AF37", fontSize: "11px" } }
      }
    },
    series: [{
      name: "Revenue",
      data: [
        { name: "Registration", y: totalRegistrations, color: "#3B82F6" },
        { name: "NFT Sales", y: nftSaleTotal, color: "#10B981" },
        { name: "Admin NFTs", y: adminNftTotal, color: "#F59E0B" },
        { name: "Missed Bonus", y: missedParentBonusTotal, color: "#EF4444" },
        { name: "Upgrades", y: upgradeTotal, color: "#8B5CF6" }
      ]
    }]
  };

  // Highcharts - Income vs Payout Chart
  const incomeVsPayoutChart = {
    chart: { type: "column", backgroundColor: "transparent", options3d: { enabled: true, alpha: 15, beta: 15 } },
    title: { text: "📊 Income vs Payout", style: { color: "#D4AF37", fontSize: "16px", fontWeight: "bold" } },
    xAxis: { categories: ["Total Income", "Total Payouts", "Net Profit"], labels: { style: { color: "#D4AF37" } } },
    yAxis: { title: { text: "Amount (USDT)", style: { color: "#D4AF37" } }, labels: { style: { color: "#D4AF37" } }, gridLineColor: "#333" },
    plotOptions: {
      column: {
        dataLabels: { enabled: true, format: "${y}", style: { color: "#D4AF37" } },
        colorByPoint: true,
        colors: ["#10B981", "#EF4444", "#D4AF37"]
      }
    },
    series: [{ name: "Amount", data: [totalIncome, totalPayouts, netProfit > 0 ? netProfit : 0] }]
  };

  // Highcharts - Monthly Trend Chart
  const monthlyTrendChart = {
    chart: { type: "spline", backgroundColor: "transparent" },
    title: { text: "📈 Monthly Revenue Trend", style: { color: "#D4AF37", fontSize: "16px", fontWeight: "bold" } },
    xAxis: { categories: monthlyChartData.months, labels: { style: { color: "#D4AF37" } } },
    yAxis: { title: { text: "Amount (USDT)", style: { color: "#D4AF37" } }, labels: { style: { color: "#D4AF37" } }, gridLineColor: "#333" },
    plotOptions: {
      spline: {
        lineWidth: 3,
        marker: { radius: 6, fillColor: "#D4AF37", lineColor: "#000", lineWidth: 2 },
        fillOpacity: 0.3
      }
    },
    series: [{ name: "Revenue", data: monthlyChartData.amounts, color: "#D4AF37", fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, "#D4AF37"], [1, "rgba(212,175,55,0)"]] } }]
  };

  // Highcharts - Transaction Type Distribution
  const transactionTypeChart = {
    chart: { type: "bar", backgroundColor: "transparent" },
    title: { text: "📋 Transaction Type Distribution", style: { color: "#D4AF37", fontSize: "16px", fontWeight: "bold" } },
    xAxis: { categories: ["Registration", "NFT Sale", "Parent Payout", "Other"], labels: { style: { color: "#D4AF37" } } },
    yAxis: { title: { text: "Count", style: { color: "#D4AF37" } }, labels: { style: { color: "#D4AF37" } }, gridLineColor: "#333" },
    plotOptions: {
      bar: {
        dataLabels: { enabled: true, format: "{y}", style: { color: "#D4AF37" } },
        colorByPoint: true,
        colors: ["#3B82F6", "#10B981", "#8B5CF6", "#6B7280"]
      }
    },
    series: [{
      name: "Count",
      data: [
        transactions.transactions.filter(tx => tx.type === "Registration").length,
        transactions.transactions.filter(tx => tx.type === "NFT Sale").length,
        transactions.transactions.filter(tx => tx.type === "Parent Payout").length,
        transactions.transactions.filter(tx => tx.type === "Other").length
      ]
    }]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 border-4 border-[#D4AF37]/10 rounded-full"></div>
            <div className="w-24 h-24 border-4 border-transparent border-t-[#D4AF37] border-r-[#F3C06A] rounded-full animate-spin absolute"></div>
            <FaCrown className="text-[#D4AF37] text-3xl animate-pulse absolute" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-black text-[#F3C06A] uppercase tracking-[0.2em] animate-pulse">
              CryptoNext
            </p>
            <p className="text-[#D4AF37]/60 text-xs font-bold uppercase tracking-widest">
              Connecting to Root Wallet...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 md:p-6 space-y-6">

      {/* ==================== HEADER ==================== */}
      <div className="border-b border-[#D4AF37]/30 pb-6 mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-semibold bg-gradient-to-r from-[#F3C06A] via-[#D4AF37] to-[#F3C06A] bg-clip-text text-transparent tracking-wide flex items-center gap-3">
              Root Wallet
            </h1>
            <p className="text-white text-sm tracking-widest  mt-1">Company Revenue & Transaction Management</p>
          </div>
          <div className="flex items-center gap-3">
            {companyData.superUserWallet && (
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-[#D4AF37]/5 rounded-xl border border-[#D4AF37]/20">
                <FaCopy className="text-[#D4AF37]/40 text-xs cursor-pointer hover:text-[#D4AF37] transition-colors"
                  onClick={() => copyWalletAddress(companyData.superUserWallet)} />
                <code className="text-[10px] text-[#D4AF37]/60 font-mono">{formatWalletAddress(companyData.superUserWallet)}</code>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== STATS CARDS (Equal Size) ==================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {/* Card 1: Total Income */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-[#D4AF37]/30 rounded-2xl p-4 hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#D4AF37]/10 rounded-xl">
              <FaMoneyBillWave className="text-lg text-[#D4AF37]" />
            </div>
            <span className="text-[8px] font-black text-[#D4AF37]/60 bg-[#D4AF37]/10 px-2 py-0.5 rounded-full">Gross</span>
          </div>
          <p className="text-[#D4AF37]/50 text-[9px] uppercase font-bold tracking-wider">Total Income</p>
          <h3 className="text-xl md:text-2xl font-black text-white mt-1">{formatCurrency(totalIncome)}</h3>
          <div className="mt-2 h-0.5 bg-[#D4AF37]/20 rounded-full overflow-hidden">
            <div className="h-full bg-[#D4AF37] rounded-full w-full"></div>
          </div>
        </div>

        {/* Card 2: Total Payouts */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-[#D4AF37]/30 rounded-2xl p-4 hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#D4AF37]/10 rounded-xl">
              <FaUserFriends className="text-lg text-[#D4AF37]" />
            </div>
            <span className="text-[8px] font-black text-[#D4AF37]/60 bg-[#D4AF37]/10 px-2 py-0.5 rounded-full">MLM</span>
          </div>
          <p className="text-[#D4AF37]/50 text-[9px] uppercase font-bold tracking-wider">Total Payouts</p>
          <h3 className="text-xl md:text-2xl font-black text-white mt-1">{formatCurrency(totalPayouts)}</h3>
          <div className="mt-2 h-0.5 bg-[#D4AF37]/20 rounded-full overflow-hidden">
            <div className="h-full bg-[#8B5CF6] rounded-full" style={{ width: totalIncome ? `${(totalPayouts / totalIncome) * 100}%` : "0%" }}></div>
          </div>
        </div>

        {/* Card 3: Net Profit */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-[#D4AF37]/30 rounded-2xl p-4 hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#D4AF37]/10 rounded-xl">
              <FaHandHoldingUsd className="text-lg text-[#D4AF37]" />
            </div>
            <span className="text-[8px] font-black text-[#D4AF37]/60 bg-[#D4AF37]/10 px-2 py-0.5 rounded-full">Actual</span>
          </div>
          <p className="text-[#D4AF37]/50 text-[9px] uppercase font-bold tracking-wider">Net Profit</p>
          <h3 className="text-xl md:text-2xl font-black text-white mt-1">{formatCurrency(netProfit > 0 ? netProfit : 0)}</h3>
          <div className="mt-2 h-0.5 bg-[#D4AF37]/20 rounded-full overflow-hidden">
            <div className="h-full bg-[#10B981] rounded-full" style={{ width: totalIncome ? `${(netProfit / totalIncome) * 100}%` : "0%" }}></div>
          </div>
        </div>

        {/* Card 4: Total Users */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-[#D4AF37]/30 rounded-2xl p-4 hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#D4AF37]/10 rounded-xl">
              <FaUsers className="text-lg text-[#D4AF37]" />
            </div>
            <span className="text-[8px] font-black text-[#D4AF37]/60 bg-[#D4AF37]/10 px-2 py-0.5 rounded-full">Network</span>
          </div>
          <p className="text-[#D4AF37]/50 text-[9px] uppercase font-bold tracking-wider">Total Users</p>
          <h3 className="text-xl md:text-2xl font-black text-white mt-1">{users.length}</h3>
          <div className="mt-2 h-0.5 bg-[#D4AF37]/20 rounded-full overflow-hidden">
            <div className="h-full bg-[#3B82F6] rounded-full w-full"></div>
          </div>
        </div>
      </div>

      {/* ==================== BREAKOUT CARDS (Small Cards) ==================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {[
          { type: "Registration", icon: FaUsers, amount: totalRegistrations, count: transactions.transactions.filter(t => t.type === "Registration").length, label: "Registrations", bar: "#3B82F6" },
          { type: "NFT Sale", icon: FaGem, amount: nftSaleTotal, count: transactions.transactions.filter(t => t.type === "NFT Sale").length, label: "NFT Sales", bar: "#10B981" },
          { type: "Admin NFT", icon: FaCrown, amount: adminNftTotal, count: transactions.transactions.filter(t => t.type === "Other" && t.description?.toLowerCase().includes("nft")).length, label: "Admin NFTs", bar: "#F59E0B" },
          { type: "Other", icon: FaReceipt, amount: otherTotal, count: transactions.transactions.filter(t => t.type === "Other" && !t.description?.toLowerCase().includes("nft")).length, label: "Misc", bar: "#6B7280" }
        ].map((card) => (
          <div
            key={card.type}
            onClick={() => setTransactionFilterTab(card.type === "Admin NFT" ? "Other" : card.type)}
            className={`bg-gradient-to-br from-gray-900 to-black border ${transactionFilterTab === (card.type === "Admin NFT" ? "Other" : card.type) ? "border-[#D4AF37] ring-1 ring-[#D4AF37]/50" : "border-[#D4AF37]/30"} rounded-2xl p-4 cursor-pointer hover:scale-[1.02] transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-[#D4AF37]/10 rounded-xl">
                <card.icon className="text-lg text-[#D4AF37]" />
              </div>
              <span className="text-[8px] font-black text-[#D4AF37]/60 bg-[#D4AF37]/10 px-2 py-0.5 rounded-full">{card.count} TX</span>
            </div>
            <p className="text-[#D4AF37]/50 text-[9px] uppercase font-bold tracking-wider">{card.label}</p>
            <h3 className="text-xl md:text-2xl font-black text-white mt-1">{formatCurrency(card.amount)}</h3>
            <div className="mt-2 h-0.5 bg-[#D4AF37]/20 rounded-full overflow-hidden">
              <div className="h-full rounded-full w-full" style={{ backgroundColor: card.bar }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== CHARTS SECTION ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all">
          <HighchartsReact highcharts={Highcharts} options={revenueBreakdownChart} />
        </div>
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all">
          <HighchartsReact highcharts={Highcharts} options={incomeVsPayoutChart} />
        </div>
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all">
          <HighchartsReact highcharts={Highcharts} options={monthlyTrendChart} />
        </div>
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all">
          <HighchartsReact highcharts={Highcharts} options={transactionTypeChart} />
        </div>
      </div>

      {/* ==================== TRANSACTION HISTORY TABLE ==================== */}
      <div className="bg-black/40 backdrop-blur-sm border border-[#D4AF37]/20 rounded-2xl shadow-2xl overflow-hidden">

        {/* Tabs for Transaction Filter */}
        <div className="flex flex-wrap items-center gap-2 bg-black/50 border-b border-[#D4AF37]/20 px-4 py-3 overflow-x-auto">
          {[
            { id: "all", label: "All", count: transactions.transactions.length },
            { id: "Registration", label: "Registration", count: transactions.transactions.filter(t => t.type === "Registration").length },
            { id: "NFT Sale", label: "NFT Sale", count: transactions.transactions.filter(t => t.type === "NFT Sale").length },
            { id: "Parent Payout", label: "Parent Payout", count: transactions.transactions.filter(t => t.type === "Parent Payout").length },
            { id: "Upgrade", label: "Upgrade", count: transactions.transactions.filter(t => t.type === "Upgrade").length },
            { id: "Other", label: "Other", count: transactions.transactions.filter(t => t.type === "Other").length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTransactionFilterTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${transactionFilterTab === tab.id
                ? "bg-[#D4AF37] text-black shadow-[0_0_8px_#D4AF37]"
                : "bg-[#D4AF37]/10 text-[#D4AF37]/70 hover:bg-[#D4AF37]/20"
                }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]/40 text-sm" />
            <input
              type="text"
              placeholder="Search by name, email or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-gray-600 text-sm"
            />
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-800 bg-black/30">
            <table className="w-full">
              <thead className="bg-[#D4AF37]/10">
                <tr>
                  {["User", "Type", "Amount", "Description", "Date", "Action"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[9px] font-black text-[#D4AF37] uppercase tracking-wider border-b border-[#D4AF37]/20">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {currentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">No transactions found</td>
                  </tr>
                ) : (
                  currentTransactions.map((tx, idx) => (
                    <tr key={tx.id || idx} className="hover:bg-[#D4AF37]/5 transition-all">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#F3C06A] to-[#D4AF37] rounded-lg flex items-center justify-center font-black text-black text-sm">
                            {tx.user?.name?.charAt(0) || "S"}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">{tx.user?.name || "System"}</p>
                            <p className="text-[9px] text-[#D4AF37]/50">{tx.user?.email || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-[#D4AF37]/10 rounded-lg">
                            {getTransactionIcon(tx.type)}
                          </div>
                          <span className="text-[9px] font-bold text-[#F3C06A] uppercase">{tx.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${tx.amount > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {tx.amount > 0 ? "+" : "-"}{formatCurrency(Math.abs(tx.amount))}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[#D4AF37]/60 text-xs max-w-xs truncate" title={tx.description}>"{tx.description?.slice(0, 50)}"</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white text-xs font-bold">{new Date(tx.date).toLocaleDateString()}</p>
                        <p className="text-[8px] text-[#D4AF37]/40">{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { setSelectedTransaction(tx); setShowModal(true); }}
                          className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] hover:text-white hover:bg-[#D4AF37] rounded-lg transition-all"
                        >
                          <FaEye className="text-sm" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <div className="flex items-center gap-2">
              <p className="text-[9px] font-black text-[#D4AF37]/40 uppercase tracking-wider">Rows:</p>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-gray-900 border border-[#D4AF37]/30 text-[#D4AF37] text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-[#D4AF37]"
              >
                {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <p className="text-[9px] font-black text-[#D4AF37]/40 uppercase tracking-wider">
                Showing {currentTransactions.length} of {filteredTransactions.length} Entries
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg text-[#D4AF37] disabled:opacity-30 transition-all"
              >
                <FaChevronLeft className="text-sm" />
              </button>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-lg">
                <span className="text-xs font-bold text-[#F3C06A]">{currentPage}</span>
                <span className="text-[9px] text-[#D4AF37]/40">/ {totalPages || 1}</span>
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg text-[#D4AF37] disabled:opacity-30 transition-all"
              >
                <FaChevronRight className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-[#D4AF37]/30 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 bg-[#D4AF37]/10 rounded-full text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all">
              <FaTimes className="text-xl" />
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20">
                {getTransactionIcon(selectedTransaction.type)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Transaction Detail</h2>
                <p className="text-[#D4AF37] font-bold text-xs mt-1">Ref ID: {selectedTransaction.id?.slice(-12)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#D4AF37]/5 p-4 rounded-xl border border-[#D4AF37]/10">
                <p className="text-[9px] font-bold text-[#D4AF37]/40 uppercase mb-1">Amount</p>
                <p className={`text-2xl font-bold ${selectedTransaction.amount > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {selectedTransaction.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(selectedTransaction.amount))}
                </p>
              </div>
              <div className="bg-[#D4AF37]/5 p-4 rounded-xl border border-[#D4AF37]/10">
                <p className="text-[9px] font-bold text-[#D4AF37]/40 uppercase mb-1">Category</p>
                <p className="text-lg font-bold text-white uppercase">{selectedTransaction.type}</p>
              </div>
            </div>
            <div className="mt-4 bg-[#D4AF37]/5 p-4 rounded-xl border border-[#D4AF37]/10">
              <p className="text-[9px] font-bold text-[#D4AF37]/40 uppercase mb-1">Description</p>
              <p className="text-[#F3C06A] font-semibold text-sm">{selectedTransaction.description}</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}