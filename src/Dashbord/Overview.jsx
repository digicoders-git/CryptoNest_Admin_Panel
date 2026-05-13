// MasterDashboard.jsx
import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import 'highcharts/highcharts-more';
import HighchartsReact from 'highcharts-react-official';
import { FaUsers, FaImage, FaWallet, FaChartBar, FaShoppingCart, FaUserPlus, FaHandshake, FaPhoneAlt, FaBell, FaChartLine, FaGem, FaMoneyBillWave } from 'react-icons/fa';

const MasterDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://cryptonest-backend.onrender.com').replace(/\/+$/, '').replace(/\/api$/, '') + '/api/';

  // API se data fetch karne ka function
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('superAdminToken');
      const response = await fetch(`${baseUrl}SuperAdmin/master-dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setDashboardData(result.data);
        setLastRefresh(new Date());
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <div className="text-yellow-500 text-2xl">Loading Master Dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">⚠️ Error: {error}</div>
          <button
            onClick={fetchDashboardData}
            className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const data = dashboardData;

  // ========== HIGHCHARTS CONFIGURATIONS ==========

  // 1. Users Distribution Chart
  const userDistributionChart = {
    chart: { type: 'pie', backgroundColor: 'transparent' },
    title: { text: 'Users Distribution', style: { color: '#FFD700', fontSize: '16px' } },
    tooltip: { pointFormat: '{point.name}: <b>{point.y} users ({point.percentage:.1f}%)</b>' },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: { enabled: true, format: '{point.name}: {point.y}', style: { color: '#FFD700' } }
      }
    },
    series: [{
      name: 'Users',
      data: [
        { name: 'Active', y: data.users?.active || 0, color: '#FFD700' },
        { name: 'Inactive', y: data.users?.inactive || 0, color: '#FFA500' },
        { name: 'Frozen', y: data.users?.frozen || 0, color: '#DC143C' }
      ]
    }]
  };

  // 2. NFT Status Chart
  const nftStatusChart = {
    chart: { type: 'column', backgroundColor: 'transparent' },
    title: { text: 'NFT Inventory', style: { color: '#FFD700' } },
    xAxis: { categories: ['Total', 'Available', 'Sold'], labels: { style: { color: '#FFD700' } } },
    yAxis: { title: { text: 'Count', style: { color: '#FFD700' } }, labels: { style: { color: '#FFD700' } } },
    series: [{ name: 'NFTs', data: [data.nfts?.total || 0, data.nfts?.available || 0, data.nfts?.sold || 0], color: '#FFD700' }]
  };

  // 3. NFT Sales Chart (Pre-launch vs Trading)
  const nftSalesChart = {
    chart: { type: 'pie', backgroundColor: 'transparent' },
    title: { text: 'NFT Sales Breakdown', style: { color: '#FFD700' } },
    series: [{
      name: 'Sales',
      data: [
        { name: 'Pre-Launch Sold', y: data.nfts?.preLaunchSold || 0, color: '#FFD700' },
        { name: 'Trading Sold', y: data.nfts?.tradingSold || 0, color: '#FFA500' }
      ]
    }]
  };

  // 4. Trading Limit Gauge
  const tradingGaugeChart = {
    chart: { type: 'gauge', backgroundColor: 'transparent' },
    title: { text: 'Trading Limit Usage', style: { color: '#FFD700' } },
    pane: { startAngle: -150, endAngle: 150, background: { backgroundColor: '#333', borderWidth: 0 } },
    yAxis: {
      min: 0,
      max: 100,
      title: { text: 'Used %', style: { color: '#FFD700' } },
      labels: { style: { color: '#FFD700' } },
      plotBands: [{ from: 0, to: 100, color: '#FFD700' }]
    },
    series: [{ name: 'Usage', data: [parseFloat(data.nfts?.tradingUsedPercent) || 0], tooltip: { valueSuffix: '%' } }]
  };

  // 5. Financial Overview Chart
  const financialChart = {
    chart: { type: 'bar', backgroundColor: 'transparent' },
    title: { text: 'Financial Overview', style: { color: '#FFD700' } },
    xAxis: {
      categories: ['Company Balance', 'Today Earnings', 'Referral Paid', 'NFT Sales', 'Registration Fees'],
      labels: { style: { color: '#FFD700', fontSize: '10px' }, rotation: -45 }
    },
    yAxis: { title: { text: 'Amount (ETH)', style: { color: '#FFD700' } }, labels: { style: { color: '#FFD700' } } },
    series: [{
      name: 'Amount', data: [
        data.finance?.companyTotalBalance || 0,
        data.finance?.todayEarnings || 0,
        data.finance?.totalReferralPaid || 0,
        data.finance?.totalNFTSaleEarnings || 0,
        data.finance?.totalRegistrationFees || 0
      ], color: '#FFD700'
    }]
  };

  // 6. Withdrawal Status Chart
  const withdrawalChart = {
    chart: { type: 'pie', backgroundColor: 'transparent' },
    title: { text: 'Withdrawals Overview', style: { color: '#FFD700' } },
    series: [{
      name: 'Amount',
      data: [
        { name: 'Pending', y: data.withdrawals?.pendingAmount || 0, color: '#FFA500' },
        { name: 'Completed', y: data.withdrawals?.completedAmount || 0, color: '#00FF00' },
        { name: 'Failed', y: data.withdrawals?.failedAmount || 0, color: '#DC143C' }
      ]
    }]
  };

  // 7. Withdrawal Count Chart
  const withdrawalCountChart = {
    chart: { type: 'column', backgroundColor: 'transparent' },
    title: { text: 'Withdrawal Requests', style: { color: '#FFD700' } },
    xAxis: { categories: ['Pending', 'Completed', 'Failed'], labels: { style: { color: '#FFD700' } } },
    yAxis: { title: { text: 'Count', style: { color: '#FFD700' } }, labels: { style: { color: '#FFD700' } } },
    series: [{
      name: 'Requests', data: [
        data.withdrawals?.pendingCount || 0,
        data.withdrawals?.completedCount || 0,
        data.withdrawals?.failedCount || 0
      ], color: '#FFD700'
    }]
  };

  // 8. MLM Chart (if data exists)
  const mlmChart = {
    chart: { type: 'line', backgroundColor: 'transparent' },
    title: { text: 'MLM Level Distribution', style: { color: '#FFD700' } },
    xAxis: {
      title: { text: 'Level', style: { color: '#FFD700' } },
      labels: { style: { color: '#FFD700' } }
    },
    yAxis: { title: { text: 'Amount Paid', style: { color: '#FFD700' } }, labels: { style: { color: '#FFD700' } } },
    series: [{
      name: 'Commission Paid',
      data: data.mlm?.levelWise?.map(level => level.amount) || [0],
      color: '#FFD700'
    }]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="p-6">

        {/* ========== HEADER ========== */}
        <div className="flex justify-between items-center border-b border-yellow-500/30 pb-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent">
              Master Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Complete Platform Overview</p>
          </div>

        </div>

        {/* ========== STATS CARDS - ROW 1 ========== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {/* Users Card */}
          <div className="group bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-yellow-500 text-sm uppercase tracking-wider">Total Users</div>
                <div className="text-3xl font-bold mt-2 text-white">{data.users?.total || 0}</div>
                <div className="text-green-400 text-sm mt-2">+{data.users?.todayNew || 0} Today</div>
              </div>
              <div className="text-3xl opacity-50"><FaUsers className="text-yellow-500/50" /></div>
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <div><span className="text-yellow-500">Active:</span> {data.users?.active || 0}</div>
              <div><span className="text-gray-400">Inactive:</span> {data.users?.inactive || 0}</div>
              <div><span className="text-red-400">Frozen:</span> {data.users?.frozen || 0}</div>
            </div>
          </div>

          {/* NFTs Card */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-yellow-500 text-sm uppercase tracking-wider">Total NFTs</div>
                <div className="text-3xl font-bold mt-2 text-white">{data.nfts?.total || 0}</div>
                <div className="text-gray-400 text-sm mt-2">Collection Size</div>
              </div>
              <div className="text-3xl opacity-50"><FaImage className="text-yellow-500/50" /></div>
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <div><span className="text-green-400">Available:</span> {data.nfts?.available || 0}</div>
              <div><span className="text-yellow-500">Sold:</span> {data.nfts?.sold || 0}</div>
            </div>
          </div>

          {/* Finance Card */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-yellow-500 text-sm uppercase tracking-wider">Company Balance</div>
                <div className="text-3xl font-bold mt-2 text-white">{data.finance?.companyTotalBalance || 0} ETH</div>
                <div className="text-gray-400 text-sm mt-2 truncate">{data.finance?.companyWallet?.slice(0, 12)}...</div>
              </div>
              <div className="text-3xl opacity-50"><FaWallet className="text-yellow-500/50" /></div>
            </div>
          </div>

          {/* Contacts Card */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-yellow-500 text-sm uppercase tracking-wider">Contacts</div>
                <div className="text-3xl font-bold mt-2 text-white">{data.contacts?.total || 0}</div>
                <div className="text-green-400 text-sm mt-2">+{data.contacts?.todayNew || 0} Today</div>
              </div>
              <div className="text-3xl opacity-50"><FaPhoneAlt className="text-yellow-500/50" /></div>
            </div>
          </div>

          {/* Today Earnings Card - REMOVED */}
        </div>

        {/* ========== STATS CARDS - ROW 2 ========== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {/* Notifications Card */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-yellow-500 text-sm uppercase tracking-wider">Notifications</div>
                <div className="text-3xl font-bold mt-2 text-white">{data.notifications?.total || 0}</div>
                <div className="text-green-400 text-sm mt-2">{data.notifications?.active || 0} Active</div>
              </div>
              <div className="text-3xl opacity-50"><FaBell className="text-yellow-500/50" /></div>
            </div>
          </div>

          {/* Trading Limit Card */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-yellow-500 text-sm uppercase tracking-wider">Trading Limit</div>
                <div className="text-3xl font-bold mt-2 text-white">{data.nfts?.tradingLimit?.toLocaleString() || 0}</div>
                <div className="text-gray-400 text-sm mt-2">Total Limit</div>
              </div>
              <div className="text-3xl opacity-50"><FaChartLine className="text-yellow-500/50" /></div>
            </div>
          </div>

          {/* Remaining Card */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-yellow-500 text-sm uppercase tracking-wider">Remaining</div>
                <div className="text-3xl font-bold mt-2 text-white">{data.nfts?.tradingRemaining?.toLocaleString() || 0}</div>
                <div className="text-green-400 text-sm mt-2">Available</div>
              </div>
              <div className="text-3xl opacity-50"><FaGem className="text-yellow-500/50" /></div>
            </div>
          </div>

          {/* Withdrawal Summary Card */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300">
            <div className="flex items-center gap-2 text-yellow-500 text-sm uppercase tracking-wider mb-3"><FaMoneyBillWave /> Withdrawal Summary</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Pending:</span>
                <span className="text-orange-400 font-bold">{data.withdrawals?.pendingAmount || 0} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Completed:</span>
                <span className="text-green-400 font-bold">{data.withdrawals?.completedAmount || 0} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Failed:</span>
                <span className="text-red-400 font-bold">{data.withdrawals?.failedAmount || 0} ETH</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========== CHARTS GRID ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20">
            <HighchartsReact highcharts={Highcharts} options={userDistributionChart} />
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20">
            <HighchartsReact highcharts={Highcharts} options={nftStatusChart} />
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20">
            <HighchartsReact highcharts={Highcharts} options={nftSalesChart} />
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20">
            <HighchartsReact highcharts={Highcharts} options={tradingGaugeChart} />
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20 lg:col-span-2">
            <HighchartsReact highcharts={Highcharts} options={financialChart} />
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20">
            <HighchartsReact highcharts={Highcharts} options={withdrawalChart} />
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20">
            <HighchartsReact highcharts={Highcharts} options={withdrawalCountChart} />
          </div>

          {data.mlm?.levelWise?.length > 0 && (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20 lg:col-span-2">
              <HighchartsReact highcharts={Highcharts} options={mlmChart} />
            </div>
          )}
        </div>

        {/* ========== RECENT USERS TABLE ========== */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20 mb-8">
          <h3 className="text-yellow-500 text-xl mb-4">👤 Recent Users</h3>
          {data.users?.recentUsers?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-yellow-500/30">
                    <th className="pb-3 text-yellow-500">Name</th>
                    <th className="pb-3 text-yellow-500">Email</th>
                    <th className="pb-3 text-yellow-500">Plan</th>
                    <th className="pb-3 text-yellow-500">Balance</th>
                    <th className="pb-3 text-yellow-500">Status</th>
                    <th className="pb-3 text-yellow-500">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.recentUsers.map(user => (
                    <tr key={user._id} className="border-b border-gray-800 hover:bg-yellow-500/5 transition">
                      <td className="py-3 text-white">{user.name}</td>
                      <td className="py-3 text-gray-300">{user.email}</td>
                      <td className="py-3 capitalize text-yellow-500">{user.currentPlan}</td>
                      <td className="py-3 text-gray-300">{user.balance} ETH</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {user.isActive ? '● Active' : '● Inactive'}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">No recent users found</div>
          )}
        </div>

        {/* ========== RECENT CONTACTS TABLE ========== */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20 mb-8">
          <h3 className="text-yellow-500 text-xl mb-4">📞 Recent Contacts</h3>
          {data.contacts?.recentContacts?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-yellow-500/30">
                    <th className="pb-3 text-yellow-500">Name</th>
                    <th className="pb-3 text-yellow-500">Email</th>
                    <th className="pb-3 text-yellow-500">Phone</th>
                    <th className="pb-3 text-yellow-500">Description</th>
                    <th className="pb-3 text-yellow-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.contacts.recentContacts.map(contact => (
                    <tr key={contact._id} className="border-b border-gray-800 hover:bg-yellow-500/5 transition">
                      <td className="py-3 text-white">{contact.name}</td>
                      <td className="py-3 text-gray-300">{contact.email}</td>
                      <td className="py-3 text-gray-300">{contact.phone}</td>
                      <td className="py-3 text-gray-400 max-w-xs truncate">{contact.description}</td>
                      <td className="py-3 text-gray-400">{new Date(contact.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">No contacts found</div>
          )}
        </div>

        {/* ========== TRANSACTIONS SECTION (if data exists) ========== */}
        {data.transactions?.recentTransactions?.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20">
            <h3 className="text-yellow-500 text-xl mb-4">🔄 Recent Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-yellow-500/30">
                    <th className="pb-3 text-yellow-500">ID</th>
                    <th className="pb-3 text-yellow-500">Amount</th>
                    <th className="pb-3 text-yellow-500">Status</th>
                    <th className="pb-3 text-yellow-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.recentTransactions.map((tx, idx) => (
                    <tr key={idx} className="border-b border-gray-800">
                      <td className="py-3 text-gray-300">{tx.id || 'N/A'}</td>
                      <td className="py-3 text-yellow-500">{tx.amount || 0} ETH</td>
                      <td className="py-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                          {tx.status || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400">{tx.date ? new Date(tx.date).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm border-t border-gray-800 pt-6">
          <p>© 2026 Master Dashboard | All Rights Reserved | Powered by Web3</p>
        </div>

      </div>
    </div>
  );
};

export default MasterDashboard;