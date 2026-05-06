import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUsers,
  FaWallet,
  FaMoneyBillWave,
  FaUserFriends,
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaTable,
  FaCubes,
  FaBoxOpen,
  FaNetworkWired,
  FaPercentage,
  FaArrowUp,
  FaArrowDown,
  FaCalendar,
  FaFilter,
  FaSearch,
  FaDownload,
  FaSync,
  FaLayerGroup,
  FaTree,
  FaSitemap,
  FaCoins,
  FaGem,
  FaCrown,
  FaRocket,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Treemap,
} from "recharts";
import Swal from "sweetalert2";
const API_URL = import.meta.env.VITE_API_URL;
export default function MLMAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    userGrowth: [],
    revenue: {},
    mlm: {},
    nft: {},
    packages: {},
    transactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");
  const [activeTab, setActiveTab] = useState("overview");
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("superAdminToken");

      if (!token) {
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Authentication Required",
          text: "Please login to access Analytics Dashboard",
          confirmButtonColor: "#3b82f6",
          confirmButtonText: "OK",
          allowOutsideClick: false,
          allowEscapeKey: false
        });
        return;
      }

      // Fetch main data from SuperAdmin API (same as RootWallet)
      const transactionsRes = await axios.get(
        `${API_URL}api/SuperAdmin/company-transactions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      // console.log("API_URL:", API_URL);

      // Fetch users data (same as RootWallet)
      let usersData = [];
      try {
        const usersRes = await axios.get(`${API_URL}api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (usersRes.data.success) {
          usersData = usersRes.data.data || [];
        }
      } catch (userError) {
        console.log("Users API not available" + userError);
        usersData = [];
      }

      if (transactionsRes.data.success) {
        const data = transactionsRes.data;
        const allTransactions = data.transactions || [];
        const summary = data.summary || {};
        const graphData = data.graph || {};

        // Calculate metrics using same logic as RootWallet
        const totalUsers = usersData.length || graphData.stats?.totalUsers || 0;
        const activeUsers =
          usersData.filter((u) => u.isActive).length ||
          graphData.stats?.activeUsers ||
          0;
        const totalRevenue = calculateTotalRevenue(allTransactions);
        const mlmDistribution = analyzeMLMDistribution(allTransactions);
        const nftStats = analyzeNFTStatistics(allTransactions);
        const userGrowth = analyzeUserGrowth(usersData);
        const packageDistribution = analyzePackageDistribution(usersData);

        setAnalyticsData({
          overview: {
            totalUsers,
            activeUsers,
            totalRevenue: summary.totalEarnings || totalRevenue.total,
            activeRate:
              totalUsers > 0
                ? ((activeUsers / totalUsers) * 100).toFixed(1)
                : 0,
            avgRegistration:
              totalUsers > 0
                ? (totalRevenue.registration / totalUsers).toFixed(2)
                : 0,
            companyWallet: data.companyWallet || "",
          },
          userGrowth,
          revenue: {
            ...totalRevenue,
            totalEarnings: summary.totalEarnings || 0,
            totalIncome: summary.totalIncome || 0,
            totalPayouts: summary.totalPayouts || totalRevenue.parentPayouts,
          },
          mlm: mlmDistribution,
          nft: nftStats,
          packages: packageDistribution,
          transactions: allTransactions,
          graphData: graphData,
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalyticsData({
        overview: {
          totalUsers: 0,
          activeUsers: 0,
          totalRevenue: 0,
          activeRate: 0,
          avgRegistration: 0,
          companyWallet: "",
        },
        userGrowth: [],
        revenue: {
          registration: 0,
          nftSales: 0,
          packageUpgrades: 0,
          withdrawals: 0,
          deposits: 0,
          upgrades: 0,
          other: 0,
          total: 0,
          parentPayouts: 0,
          companyEarnings: 0,
          totalEarnings: 0,
          totalIncome: 0,
          totalPayouts: 0,
        },
        mlm: {
          levelDistribution: [],
          totalReferrals: 0,
          activeReferrals: 0,
          totalEarnings: 0,
          avgPerReferral: 0,
        },
        nft: {
          totalSales: 0,
          totalVolume: 0,
          avgSalePrice: 0,
          profitDistribution: { user: 0, company: 0, parent: 0 },
        },
        packages: {
          plans: [],
          totalUpgrades: 0,
          mostPopular: { users: 0 },
        },
        transactions: [],
        graphData: {
          stats: { totalUsers: 0, activeUsers: 0, rootUsers: 0 },
          nodes: [],
          edges: [],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalRevenue = (transactions) => {
    const revenue = {
      registration: 0,
      nftSales: 0,
      packageUpgrades: 0,
      withdrawals: 0,
      deposits: 0,
      upgrades: 0,
      other: 0,
      total: 0,
      parentPayouts: 0,
      companyEarnings: 0,
    };

    transactions.forEach((tx) => {
      const amount = Math.abs(tx.amount);
      const txType = tx.type || "";

      // Use exact same categorization as RootWallet
      if (txType === "Registration") {
        revenue.registration += amount;
        revenue.total += amount;
      } else if (txType === "NFT Sale") {
        revenue.nftSales += amount;
        revenue.total += amount;
      } else if (
        txType === "Upgrade" ||
        tx.description?.toLowerCase().includes("upgrade")
      ) {
        revenue.upgrades += amount;
        revenue.total += amount;
      } else if (txType === "Parent Payout") {
        revenue.parentPayouts += amount;
        // Don't add to total as these are outgoing
      } else {
        revenue.other += amount;
        revenue.total += amount;
      }
    });

    revenue.companyEarnings = revenue.total - revenue.parentPayouts;
    return revenue;
  };

  const analyzeMLMDistribution = (transactions) => {
    const levelDistribution = Array(10)
      .fill(0)
      .map((_, i) => ({
        level: i + 1,
        count: 0,
        amount: 0,
      }));

    const parentPayouts = transactions.filter(
      (tx) => tx.type === "Parent Payout",
    );

    parentPayouts.forEach((payout) => {
      // Extract level from description or calculate
      const description = payout.description || "";
      const levelMatch = description.match(/level[:\s]*(\d+)/i);
      const level = levelMatch ? parseInt(levelMatch[1]) : 1;

      if (level >= 1 && level <= 10) {
        levelDistribution[level - 1].count++;
        levelDistribution[level - 1].amount += Math.abs(payout.amount);
      }
    });

    const totalReferrals = parentPayouts.length;
    const activeReferrals = parentPayouts.filter(
      (p) => p.status === "completed",
    ).length;
    const totalEarnings = parentPayouts.reduce(
      (sum, p) => sum + Math.abs(p.amount),
      0,
    );

    return {
      levelDistribution,
      totalReferrals,
      activeReferrals,
      totalEarnings,
      avgPerReferral: totalEarnings / (totalReferrals || 1),
    };
  };

  const analyzeNFTStatistics = (transactions) => {
    const nftTransactions = transactions.filter(
      (tx) => tx.type === "NFT Sale" || tx.description?.includes("NFT"),
    );

    const nftStats = {
      totalSales: nftTransactions.length,
      totalVolume: nftTransactions.reduce(
        (sum, tx) => sum + Math.abs(tx.amount),
        0,
      ),
      avgSalePrice: 0,
      profitDistribution: {
        user: 0,
        company: 0,
        parent: 0,
      },
    };

    if (nftStats.totalSales > 0) {
      nftStats.avgSalePrice = nftStats.totalVolume / nftStats.totalSales;

      // Calculate distribution (40-40-20 split)
      nftStats.profitDistribution.company = nftStats.totalVolume * 0.4;
      nftStats.profitDistribution.user = nftStats.totalVolume * 0.4;
      nftStats.profitDistribution.parent = nftStats.totalVolume * 0.2;
    }

    return nftStats;
  };

  const analyzeUserGrowth = (users) => {
    if (!users || users.length === 0) {
      // Return default data if no users
      const growth = [];
      const now = new Date();
      const days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 90;

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        growth.push({
          date: dateStr,
          registrations: 0,
          activations: 0,
        });
      }
      return growth;
    }

    const growth = [];
    const now = new Date();
    const days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 90;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayUsers = users.filter((u) => {
        const userDate = new Date(u.createdAt || u.joinedDate || Date.now())
          .toISOString()
          .split("T")[0];
        return userDate === dateStr;
      });

      growth.push({
        date: dateStr,
        registrations: dayUsers.length,
        activations: dayUsers.filter((u) => u.isActive || u.status === "Active")
          .length,
      });
    }

    return growth;
  };

  const analyzePackageDistribution = (users) => {
    if (!users || users.length === 0) {
      const plans = [
        "basic",
        "plan25",
        "plan50",
        "plan100",
        "plan250",
        "plan500",
      ];
      const distribution = plans.map((plan) => ({
        name: plan,
        users: 0,
        revenue: 0,
      }));

      return {
        plans: distribution,
        totalUpgrades: 0,
        mostPopular: { name: "basic", users: 0 },
      };
    }

    const plans = [
      "basic",
      "plan25",
      "plan50",
      "plan100",
      "plan250",
      "plan500",
    ];
    const distribution = plans.map((plan) => ({
      name: plan,
      users: users.filter(
        (u) => u.currentPlan === plan || u.packageType === plan,
      ).length,
      revenue: 0, // Would need transaction data per user
    }));

    return {
      plans: distribution,
      totalUpgrades: distribution.reduce((sum, p) => sum + p.users, 0),
      mostPopular: distribution.reduce(
        (max, p) => (p.users > max.users ? p : max),
        { name: "basic", users: 0 },
      ),
    };
  };

  // Chart data preparation
  const prepareRevenueChartData = () => {
    const data = [
      { name: "Registrations", value: analyticsData.revenue.registration || 0 },
      { name: "NFT Sales", value: analyticsData.revenue.nftSales || 0 },
      {
        name: "Package Upgrades",
        value: analyticsData.revenue.packageUpgrades || 0,
      },
      { name: "Upgrades", value: analyticsData.revenue.upgrades || 0 },
      { name: "Deposits", value: analyticsData.revenue.deposits || 0 },
      { name: "Admin NFT Sales", value: analyticsData.revenue.other || 0 },
    ];
    // Filter out zero values for cleaner chart
    return data.filter((item) => item.value > 0);
  };

  const prepareMLMLevelChartData = () =>
    analyticsData.mlm.levelDistribution || [];

  const prepareGrowthChartData = () => analyticsData.userGrowth || [];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <FaChartLine className="text-3xl text-blue-500 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-xl font-semibold text-gray-700 dark:text-gray-300">
            Loading MLM Analytics Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-8xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 rounded-2xl shadow-lg">
                <FaChartLine className="text-3xl text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                MY Business Intelligence Dashboard
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-3 text-lg max-w-3xl">
              Comprehensive analytics and insights for your Multi-Level
              Marketing ecosystem
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
            </select>

            <button
              onClick={fetchAnalyticsData}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              <FaSync />
              Refresh
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-2">
          <div className="flex flex-wrap gap-2">
            {["overview", "revenue", "mlm", "nft", "users", "transactions"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {tab === "overview" && <FaChartBar />}
                  {tab === "revenue" && <FaMoneyBillWave />}
                  {tab === "mlm" && <FaNetworkWired />}
                  {tab === "nft" && <FaCubes />}
                  {tab === "users" && <FaUsers />}
                  {tab === "transactions" && <FaTable />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">
                      Total Users
                    </p>
                    <h3 className="text-3xl font-bold mt-2">
                      {analyticsData.overview.totalUsers || 0}
                    </h3>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-full bg-blue-400/30 rounded-full h-2">
                        <div
                          className="h-2 bg-white rounded-full"
                          style={{
                            width: `${analyticsData.overview.activeRate || 0}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm">
                        {analyticsData.overview.activeRate || 0}% active
                      </span>
                    </div>
                  </div>
                  <FaUsers className="text-4xl text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">
                      Total Revenue
                    </p>
                    <h3 className="text-3xl font-bold mt-2">
                      ${(analyticsData.revenue.total || 0).toLocaleString()}
                    </h3>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span>
                        📈 $
                        {analyticsData.revenue.companyEarnings?.toFixed(2) || 0}{" "}
                        profit
                      </span>
                      <span>
                        💰 $
                        {analyticsData.revenue.parentPayouts?.toFixed(2) || 0}{" "}
                        paid out
                      </span>
                    </div>
                  </div>
                  <FaMoneyBillWave className="text-4xl text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">
                      MLM Network
                    </p>
                    <h3 className="text-3xl font-bold mt-2">
                      {analyticsData.mlm.totalReferrals || 0}
                    </h3>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-sm">
                        ${(analyticsData.mlm.totalEarnings || 0).toFixed(2)}{" "}
                        earnings
                      </span>
                      <span className="text-sm">•</span>
                      <span className="text-sm">
                        {analyticsData.mlm.activeReferrals || 0} active
                      </span>
                    </div>
                  </div>
                  <FaNetworkWired className="text-4xl text-purple-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-6 rounded-2xl text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm font-medium">
                      Admin NFT Sales
                    </p>
                    <h3 className="text-3xl font-bold mt-2">
                      ${(analyticsData.revenue.other || 0).toLocaleString()}
                    </h3>
                    <div className="mt-3">
                      <p className="text-sm">Revenue from admin NFT sales</p>
                    </div>
                  </div>
                  <FaGem className="text-4xl text-pink-200" />
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <FaChartPie className="text-blue-500" />
                  Revenue Distribution
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareRevenueChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareRevenueChartData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [
                          `$${value.toLocaleString()}`,
                          "Revenue",
                        ]}
                        contentStyle={{
                          background: "#1f2937",
                          border: "none",
                          borderRadius: "10px",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* User Growth */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <FaChartLine className="text-green-500" />
                  User Growth Trend
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={prepareGrowthChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#6b7280" }}
                        stroke="#6b7280"
                      />
                      <YAxis tick={{ fill: "#6b7280" }} stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          background: "#1f2937",
                          border: "none",
                          borderRadius: "10px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="registrations"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                        name="New Registrations"
                      />
                      <Area
                        type="monotone"
                        dataKey="activations"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.2}
                        name="Activations"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* MLM Levels Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <FaLayerGroup className="text-purple-500" />
                MLM Level Distribution
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareMLMLevelChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="level"
                      tick={{ fill: "#6b7280" }}
                      stroke="#6b7280"
                      label={{
                        value: "MLM Level",
                        position: "insideBottom",
                        offset: -5,
                        fill: "#6b7280",
                      }}
                    />
                    <YAxis
                      tick={{ fill: "#6b7280" }}
                      stroke="#6b7280"
                      label={{
                        value: "Amount ($)",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#6b7280",
                      }}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `$${value.toFixed(2)}`,
                        "Earnings",
                      ]}
                      contentStyle={{
                        background: "#1f2937",
                        border: "none",
                        borderRadius: "10px",
                      }}
                    />
                    <Bar
                      dataKey="amount"
                      fill="#8b5cf6"
                      name="Earnings per Level"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === "revenue" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Breakdown */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 lg:col-span-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Revenue Streams
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      name: "Registrations",
                      value: analyticsData.revenue.registration || 0,
                      color: "bg-blue-500",
                      icon: FaUserFriends,
                    },
                    {
                      name: "NFT Sales",
                      value: analyticsData.revenue.nftSales || 0,
                      color: "bg-purple-500",
                      icon: FaCubes,
                    },
                    {
                      name: "Package Upgrades",
                      value: analyticsData.revenue.packageUpgrades || 0,
                      color: "bg-green-500",
                      icon: FaBoxOpen,
                    },
                    {
                      name: "Upgrades",
                      value: analyticsData.revenue.upgrades || 0,
                      color: "bg-yellow-500",
                      icon: FaArrowUp,
                    },
                    {
                      name: "Deposits",
                      value: analyticsData.revenue.deposits || 0,
                      color: "bg-indigo-500",
                      icon: FaWallet,
                    },
                    {
                      name: "Admin NFT Sales",
                      value: analyticsData.revenue.other || 0,
                      color: "bg-pink-500",
                      icon: FaGem,
                    },
                  ]
                    .filter((stream) => stream.value > 0)
                    .map((stream, idx) => {
                      const percentage =
                        analyticsData.revenue.total > 0
                          ? (
                              (stream.value / analyticsData.revenue.total) *
                              100
                            ).toFixed(1)
                          : 0;
                      const Icon = stream.icon;

                      return (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 ${stream.color} rounded-lg`}>
                                <Icon className="text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {stream.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  ${stream.value.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white">
                              {percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${stream.color}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Profit Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Profit Split
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      label: "Company Earnings",
                      value: analyticsData.revenue.companyEarnings || 0,
                      color: "text-green-500",
                    },
                    {
                      label: "Parent Payouts",
                      value: analyticsData.revenue.parentPayouts || 0,
                      color: "text-blue-500",
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="text-center">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {item.label}
                      </p>
                      <p className={`text-2xl font-bold ${item.color}`}>
                        ${item.value.toLocaleString()}
                      </p>
                      {analyticsData.revenue.total > 0 && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          {(
                            (item.value / analyticsData.revenue.total) *
                            100
                          ).toFixed(1)}
                          % of revenue
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MLM Network Tab */}
        {activeTab === "mlm" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* MLM Statistics */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  MLM Statistics
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      label: "Total Referrals",
                      value: analyticsData.mlm.totalReferrals || 0,
                      icon: FaUserFriends,
                    },
                    {
                      label: "Active Referrals",
                      value: analyticsData.mlm.activeReferrals || 0,
                      icon: FaUserFriends,
                    },
                    {
                      label: "Total Earnings",
                      value: `$${(analyticsData.mlm.totalEarnings || 0).toFixed(2)}`,
                      icon: FaCoins,
                    },
                    {
                      label: "Avg per Referral",
                      value: `$${(analyticsData.mlm.avgPerReferral || 0).toFixed(2)}`,
                      icon: FaPercentage,
                    },
                  ].map((stat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <stat.icon className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">
                          {stat.label}
                        </span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Level Distribution Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 lg:col-span-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Commission by Level
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareMLMLevelChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="level"
                        tick={{ fill: "#6b7280" }}
                        stroke="#6b7280"
                      />
                      <YAxis tick={{ fill: "#6b7280" }} stroke="#6b7280" />
                      <Tooltip
                        formatter={(value) => [`$${value}`, "Earnings"]}
                        contentStyle={{
                          background: "#1f2937",
                          border: "none",
                          borderRadius: "10px",
                        }}
                      />
                      <Bar
                        dataKey="amount"
                        fill="#8b5cf6"
                        name="Commission"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NFT Tab */}
        {activeTab === "nft" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* NFT Statistics */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  NFT Marketplace Stats
                </h3>
                <div className="space-y-6">
                  {[
                    {
                      label: "Total NFT Sales",
                      value: analyticsData.nft.totalSales || 0,
                      subtext: "transactions",
                    },
                    {
                      label: "Total Volume",
                      value: `$${(analyticsData.nft.totalVolume || 0).toLocaleString()}`,
                      subtext: "in sales",
                    },
                    {
                      label: "Average Sale Price",
                      value: `$${(analyticsData.nft.avgSalePrice || 0).toFixed(2)}`,
                      subtext: "per NFT",
                    },
                  ].map((stat, idx) => (
                    <div
                      key={idx}
                      className="text-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl"
                    >
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {stat.label}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {stat.subtext}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profit Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  NFT Profit Distribution
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Company (40%)",
                            value:
                              analyticsData.nft.profitDistribution?.company ||
                              0,
                          },
                          {
                            name: "User (40%)",
                            value:
                              analyticsData.nft.profitDistribution?.user || 0,
                          },
                          {
                            name: "Parent (20%)",
                            value:
                              analyticsData.nft.profitDistribution?.parent || 0,
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#10b981" />
                        <Cell fill="#8b5cf6" />
                      </Pie>
                      <Tooltip
                        formatter={(value) => [
                          `$${value.toFixed(2)}`,
                          "Amount",
                        ]}
                        contentStyle={{
                          background: "#1f2937",
                          border: "none",
                          borderRadius: "10px",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                User Demographics
              </h3>

              {/* User Growth Timeline */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Registration Timeline
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prepareGrowthChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#6b7280" }}
                        stroke="#6b7280"
                      />
                      <YAxis tick={{ fill: "#6b7280" }} stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          background: "#1f2937",
                          border: "none",
                          borderRadius: "10px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="registrations"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        name="New Users"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* User Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-white text-center">
                  <p className="text-2xl font-bold">
                    {analyticsData.overview.totalUsers || 0}
                  </p>
                  <p className="text-sm opacity-90">Total Users</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-xl text-white text-center">
                  <p className="text-2xl font-bold">
                    {analyticsData.overview.activeUsers || 0}
                  </p>
                  <p className="text-sm opacity-90">Active Users</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-xl text-white text-center">
                  <p className="text-2xl font-bold">
                    {analyticsData.overview.activeRate || 0}%
                  </p>
                  <p className="text-sm opacity-90">Activation Rate</p>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 rounded-xl text-white text-center">
                  <p className="text-2xl font-bold">
                    ${analyticsData.overview.avgRegistration || 0}
                  </p>
                  <p className="text-sm opacity-90">Avg. Registration Value</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        {activeTab === "transactions" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <FaTable />
                Recent Transactions
              </h3>
              <button
                onClick={() => setShowAllTransactions(!showAllTransactions)}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
              >
                {showAllTransactions ? "Show Less" : "View All"}
                {showAllTransactions ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {analyticsData.transactions
                    .slice(
                      0,
                      showAllTransactions
                        ? analyticsData.transactions.length
                        : 20,
                    )
                    .map((tx, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              tx.type === "Registration"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : tx.type === "NFT Sale"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                  : tx.type === "Parent Payout"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {tx.user?.name || "System"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`font-bold ${
                              tx.amount > 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            ${Math.abs(tx.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Transaction Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Showing{" "}
                  {showAllTransactions
                    ? analyticsData.transactions.length
                    : Math.min(20, analyticsData.transactions.length)}{" "}
                  of {analyticsData.transactions.length} transactions
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Total Value: $
                  {analyticsData.transactions
                    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Summary Footer */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">
                MLM Performance Summary
              </h3>
              <p className="text-gray-300">
                {timeRange === "week"
                  ? "Last 7 Days"
                  : timeRange === "month"
                    ? "Last 30 Days"
                    : "Last 90 Days"}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {analyticsData.overview.totalUsers || 0}
                </p>
                <p className="text-sm text-gray-300">Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  ${(analyticsData.revenue.total || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-300">Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {analyticsData.mlm.totalReferrals || 0}
                </p>
                <p className="text-sm text-gray-300">Referrals</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {analyticsData.nft.totalSales || 0}
                </p>
                <p className="text-sm text-gray-300">NFT Sales</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
