// NFTTransactionsDashboard.jsx
import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {
  FaWallet,
  FaShoppingCart,
  FaDollarSign,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaUser,
  FaCalendarAlt,
  FaExchangeAlt,
  FaChartPie,
  FaChartLine,
  FaSpinner,
  FaExternalLinkAlt,
  FaCopy,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const NFTTransactionsDashboard = () => {
  const [transactions, setTransactions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userTransactions, setUserTransactions] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [copied, setCopied] = useState(false);

  // Fetch all transactions
  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}api/nft-transactions/all`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();

      if (result.success) {
        setTransactions(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch');
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user transactions
  const fetchUserTransactions = async (query) => {
    if (!query.trim()) return;

    setUserLoading(true);
    try {
      const response = await fetch(`${API_URL}api/nft-transactions/user/${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();

      if (result.success) {
        setUserTransactions(result.data);
      } else {
        setUserTransactions(null);
      }
    } catch (err) {
      console.error('User fetch error:', err);
      setUserTransactions(null);
    } finally {
      setUserLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  // Filter transactions based on tab
  const getFilteredSales = () => {
    if (!transactions?.sales) return [];
    if (selectedTab === 'all') return transactions.sales;
    if (selectedTab === 'completed') return transactions.sales.filter(t => t.status === 'completed');
    if (selectedTab === 'failed') return transactions.sales.filter(t => t.status === 'failed');
    return transactions.sales;
  };

  // Highcharts - Sales vs Purchases
  const salesVsPurchasesChart = {
    chart: { type: 'column', backgroundColor: 'transparent', options3d: { enabled: true, alpha: 15, beta: 15 } },
    title: { text: '💰 Sales vs Purchases', style: { color: '#D4AF37', fontSize: '18px', fontWeight: 'bold' } },
    xAxis: { categories: ['Transactions', 'Amount (USDT)'], labels: { style: { color: '#D4AF37' } } },
    yAxis: { title: { text: 'Count / Amount', style: { color: '#D4AF37' } }, labels: { style: { color: '#D4AF37' } } },
    plotOptions: {
      column: {
        dataLabels: { enabled: true, format: '{y}', style: { color: '#D4AF37' } }
      }
    },
    series: [
      { name: 'Sales', data: [transactions?.summary?.totalSales || 0, transactions?.summary?.totalSalesAmount || 0], color: '#FF6B6B' },
      { name: 'Purchases', data: [transactions?.summary?.totalPurchases || 0, transactions?.summary?.totalPurchasesAmount || 0], color: '#4ECDC4' }
    ]
  };

  // Status Distribution Chart
  const statusChart = {
    chart: { type: 'pie', backgroundColor: 'transparent', options3d: { enabled: true, alpha: 45 } },
    title: { text: '📊 Transaction Status Distribution', style: { color: '#D4AF37', fontSize: '18px', fontWeight: 'bold' } },
    plotOptions: {
      pie: {
        innerSize: '60%',
        allowPointSelect: true,
        dataLabels: { enabled: true, format: '{point.name}: {point.percentage:.1f}%', style: { color: '#D4AF37' } }
      }
    },
    series: [{
      name: 'Status',
      data: [
        { name: 'Completed Sales', y: transactions?.summary?.completedSales || 0, color: '#4ECDC4' },
        { name: 'Failed Sales', y: (transactions?.summary?.totalSales || 0) - (transactions?.summary?.completedSales || 0), color: '#FF6B6B' },
        { name: 'Completed Purchases', y: transactions?.summary?.completedPurchases || 0, color: '#45B7D1' }
      ]
    }]
  };

  // Monthly Trend Chart (Dynamic)
  const monthlyTrendChart = {
    chart: { type: 'areaspline', backgroundColor: 'transparent' },
    title: { text: '📈 Monthly Transaction Trend', style: { color: '#D4AF37', fontSize: '18px', fontWeight: 'bold' } },
    xAxis: {
      categories: (() => {
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          months.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
        }
        return months;
      })(),
      labels: { style: { color: '#D4AF37' } }
    },
    yAxis: { title: { text: 'Amount (USDT)', style: { color: '#D4AF37' } }, labels: { style: { color: '#D4AF37' } } },
    plotOptions: {
      areaspline: {
        fillOpacity: 0.3,
        marker: { radius: 6, fillColor: '#D4AF37', lineColor: '#000', lineWidth: 2 }
      }
    },
    series: [
      {
        name: 'Sales Revenue',
        data: (() => {
          const monthly = new Array(6).fill(0);
          (transactions?.sales || []).forEach(tx => {
            const monthDiff = new Date().getMonth() - new Date(tx.date).getMonth() +
              (new Date().getFullYear() - new Date(tx.date).getFullYear()) * 12;
            if (monthDiff >= 0 && monthDiff < 6) monthly[5 - monthDiff] += tx.amount || 0;
          });
          return monthly;
        })(),
        color: '#FF6B6B',
        fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, '#FF6B6B'], [1, 'rgba(255,107,107,0)']] }
      },
      {
        name: 'Purchase Volume',
        data: (() => {
          const monthly = new Array(6).fill(0);
          (transactions?.purchases || []).forEach(tx => {
            const monthDiff = new Date().getMonth() - new Date(tx.date).getMonth() +
              (new Date().getFullYear() - new Date(tx.date).getFullYear()) * 12;
            if (monthDiff >= 0 && monthDiff < 6) monthly[5 - monthDiff] += tx.amount || 0;
          });
          return monthly;
        })(),
        color: '#4ECDC4',
        fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, '#4ECDC4'], [1, 'rgba(78,205,196,0)']] }
      }
    ]
  };

  // Unique: Transaction Flow Sankey-style Bar Chart
  const transactionFlowChart = {
    chart: { type: 'bar', backgroundColor: 'transparent', options3d: { enabled: true, alpha: 10 } },
    title: { text: '🔄 Transaction Flow Analysis', style: { color: '#D4AF37', fontSize: '18px', fontWeight: 'bold' } },
    xAxis: { categories: ['Total Value', 'Net Flow'], labels: { style: { color: '#D4AF37' } } },
    yAxis: { title: { text: 'USDT Amount', style: { color: '#D4AF37' } }, labels: { style: { color: '#D4AF37' } } },
    plotOptions: {
      bar: {
        dataLabels: { enabled: true, format: '{y} USDT', style: { color: '#D4AF37' } }
      }
    },
    series: [
      { name: 'Sales Outflow', data: [transactions?.summary?.totalSalesAmount || 0, (transactions?.summary?.totalSalesAmount || 0) - (transactions?.summary?.totalPurchasesAmount || 0)], color: '#FF6B6B' },
      { name: 'Purchase Inflow', data: [transactions?.summary?.totalPurchasesAmount || 0, 0], color: '#4ECDC4' }
    ]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-yellow-500 mx-auto mb-4" />
          <div className="text-yellow-500 text-xl font-semibold">Loading Transactions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="p-6 lg:p-8">

        {/* Header */}
        <div className="border-b border-yellow-500/30 pb-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl lg:text-3xl font-semibold bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent flex items-center gap-3">
                CryptoNest Transactions
              </h1>
              <p className="text-gray-400 text-sm mt-2">Complete transaction history - Sales, Purchases & Analytics</p>
            </div>
            <button
              onClick={fetchAllTransactions}
              className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-yellow-500 text-xs uppercase tracking-wider">Total Sales</div>
                <div className="text-xl font-semibold mt-1 text-white">{transactions?.summary?.totalSales || 0}</div>
                <div className="text-green-400 text-xs mt-1">{transactions?.summary?.totalSalesAmount || 0} USDT</div>
              </div>
              <FaArrowUp className="text-2xl text-green-500/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-blue-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-blue-400 text-xs uppercase tracking-wider">Total Purchases</div>
                <div className="text-3xl font-bold mt-1 text-white">{transactions?.summary?.totalPurchases || 0}</div>
                <div className="text-blue-400 text-xs mt-1">{transactions?.summary?.totalPurchasesAmount || 0} USDT</div>
              </div>
              <FaArrowDown className="text-2xl text-blue-500/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-green-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-green-400 text-xs uppercase tracking-wider">Completed</div>
                <div className="text-3xl font-bold mt-1 text-white">{transactions?.summary?.completedSales || 0}</div>
                <div className="text-green-400 text-xs mt-1">Successful Sales</div>
              </div>
              <FaCheckCircle className="text-2xl text-green-500/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-red-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-red-400 text-xs uppercase tracking-wider">Net Volume</div>
                <div className="text-3xl font-bold mt-1 text-white">
                  {(transactions?.summary?.totalSalesAmount || 0) - (transactions?.summary?.totalPurchasesAmount || 0)} USDT
                </div>
                <div className="text-red-400 text-xs mt-1">Sales - Purchases</div>
              </div>
              <FaWallet className="text-2xl text-red-500/50" />
            </div>
          </div>
        </div>

        {/* Charts Grid - Unique Diagrams */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20">
            <HighchartsReact highcharts={Highcharts} options={salesVsPurchasesChart} />
          </div>
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20">
            <HighchartsReact highcharts={Highcharts} options={statusChart} />
          </div>
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20">
            <HighchartsReact highcharts={Highcharts} options={monthlyTrendChart} />
          </div>
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20">
            <HighchartsReact highcharts={Highcharts} options={transactionFlowChart} />
          </div>
        </div>

        {/* User Search Section */}
        <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-yellow-500/20 p-6 mb-8">
          <h3 className="text-yellow-500 text-lg font-semibold mb-4 flex items-center gap-2">
            <FaUser /> Search User Transactions
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email or wallet address..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchUserTransactions(userSearch)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 focus:outline-none transition-all"
              />
            </div>
            <button
              onClick={() => fetchUserTransactions(userSearch)}
              disabled={userLoading}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 justify-center"
            >
              {userLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
              Search
            </button>
          </div>
        </div>

        {/* User Transactions Result */}
        {userTransactions && (
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-yellow-500/20 p-6 mb-8">
            <h3 className="text-yellow-500 text-lg font-semibold mb-4 flex items-center gap-2">
              <FaUser /> User: {userTransactions.user?.name || userSearch}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-800/50 rounded-xl p-3">
                <div className="text-gray-400 text-xs">Email</div>
                <div className="text-white text-sm">{userTransactions.user?.email || 'N/A'}</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-3">
                <div className="text-gray-400 text-xs">Wallet</div>
                <div className="text-white text-sm font-mono truncate">{userTransactions.user?.walletAddress || 'N/A'}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
                <div className="text-green-400 text-2xl font-bold">{userTransactions.stats?.totalSales || 0}</div>
                <div className="text-gray-400 text-xs">Sales Made</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-center">
                <div className="text-blue-400 text-2xl font-bold">{userTransactions.stats?.totalPurchases || 0}</div>
                <div className="text-gray-400 text-xs">Purchases Made</div>
              </div>
            </div>
          </div>
        )}

        {/* ===== MAIN TABS ===== */}
        <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-yellow-500/20 overflow-hidden">

          {/* Tab Header */}
          <div className="flex border-b border-yellow-500/20">
            <button
              onClick={() => setSelectedTab('sales')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold text-sm transition-all duration-300 ${selectedTab === 'sales' || selectedTab === 'all' || selectedTab === 'completed' || selectedTab === 'failed'
                ? selectedTab === 'purchases'
                  ? 'text-gray-400 hover:text-yellow-500'
                  : 'bg-yellow-500/10 text-yellow-500 border-b-2 border-yellow-500'
                : 'text-gray-400 hover:text-yellow-500'
                } ${selectedTab !== 'purchases' ? 'bg-yellow-500/10 text-yellow-500 border-b-2 border-yellow-500' : 'hover:bg-gray-800/50'}`}
            >
              <FaDollarSign /> NFT Sales Transactions
              <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full">
                {transactions?.sales?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setSelectedTab('purchases')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold text-sm transition-all duration-300 ${selectedTab === 'purchases'
                ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-blue-400'
                }`}
            >
              <FaShoppingCart /> NFT Purchase Transactions
              <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">
                {transactions?.purchases?.length || 0}
              </span>
            </button>
          </div>

          {/* Sub Filter Tabs — sirf Sales ke liye */}
          {selectedTab !== 'purchases' && (
            <div className="flex gap-2 p-4 border-b border-yellow-500/10">
              {[
                { id: 'all', label: 'All', count: transactions?.sales?.length },
                { id: 'completed', label: 'Completed', count: transactions?.sales?.filter(t => t.status === 'completed').length },
                { id: 'failed', label: 'Failed', count: transactions?.sales?.filter(t => t.status === 'failed').length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${selectedTab === tab.id
                    ? 'bg-yellow-500 text-black shadow-lg'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          )}

          {/* Sales Table */}
          {selectedTab !== 'purchases' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/50">
                  <tr className="border-b border-yellow-500/30">
                    <th className="p-4 text-yellow-500 font-semibold">Transaction ID</th>
                    <th className="p-4 text-yellow-500 font-semibold">Seller</th>
                    <th className="p-4 text-yellow-500 font-semibold">Amount</th>
                    <th className="p-4 text-yellow-500 font-semibold">Status</th>
                    <th className="p-4 text-yellow-500 font-semibold">Date</th>
                    <th className="p-4 text-yellow-500 font-semibold">Tx Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredSales().map((sale, idx) => (
                    <tr key={sale.transactionId || idx} className="border-b border-gray-800 hover:bg-yellow-500/5 transition-all duration-300">
                      <td className="p-4 text-gray-300 font-mono text-xs">{sale.transactionId?.slice(-12)}</td>
                      <td className="p-4">
                        <div className="font-semibold text-white">{sale.seller?.name}</div>
                        <div className="text-xs text-gray-500">{sale.seller?.email}</div>
                      </td>
                      <td className="p-4"><div className="text-yellow-500 font-bold">${sale.amount}</div></td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${sale.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                          {sale.status === 'completed' ? <FaCheckCircle size={10} /> : <FaTimesCircle size={10} />}
                          {sale.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-sm">{new Date(sale.date).toLocaleDateString()}</td>
                      <td className="p-4">
                        {sale.txHash ? (
                          <button onClick={() => copyToClipboard(sale.txHash)} className="text-gray-500 hover:text-yellow-500 transition-colors flex items-center gap-1">
                            <code className="text-xs">{sale.txHash?.slice(0, 10)}...</code>
                            <FaCopy size={12} />
                          </button>
                        ) : (
                          <span className="text-gray-600 text-xs">No hash</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {getFilteredSales().length === 0 && (
                    <tr><td colSpan="6" className="p-8 text-center text-gray-500">No transactions found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Purchases Table */}
          {selectedTab === 'purchases' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/50">
                  <tr className="border-b border-yellow-500/30">
                    <th className="p-4 text-yellow-500 font-semibold">Transaction ID</th>
                    <th className="p-4 text-yellow-500 font-semibold">Buyer</th>
                    <th className="p-4 text-yellow-500 font-semibold">Amount</th>
                    <th className="p-4 text-yellow-500 font-semibold">Status</th>
                    <th className="p-4 text-yellow-500 font-semibold">Date</th>
                    <th className="p-4 text-yellow-500 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions?.purchases?.map((purchase, idx) => (
                    <tr key={purchase.transactionId || idx} className="border-b border-gray-800 hover:bg-blue-500/5 transition-all duration-300">
                      <td className="p-4 text-gray-300 font-mono text-xs">{purchase.transactionId?.slice(-12)}</td>
                      <td className="p-4">
                        <div className="font-semibold text-white">{purchase.buyer?.name}</div>
                        <div className="text-xs text-gray-500">{purchase.buyer?.email}</div>
                      </td>
                      <td className="p-4"><div className="text-yellow-500 font-bold">${purchase.amount}</div></td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 inline-flex items-center gap-1">
                          <FaCheckCircle size={10} /> {purchase.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-sm">{new Date(purchase.date).toLocaleDateString()}</td>
                      <td className="p-4 text-gray-400 text-xs max-w-xs">{purchase.description}</td>
                    </tr>
                  ))}
                  {(!transactions?.purchases || transactions.purchases.length === 0) && (
                    <tr><td colSpan="6" className="p-8 text-center text-gray-500">No purchases found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/30 rounded-xl p-3 text-center">
            <div className="text-gray-400 text-xs">Total Sales Amount</div>
            <div className="text-yellow-500 font-bold text-lg">${transactions?.summary?.totalSalesAmount || 0}</div>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-3 text-center">
            <div className="text-gray-400 text-xs">Total Purchases Amount</div>
            <div className="text-yellow-500 font-bold text-lg">${transactions?.summary?.totalPurchasesAmount || 0}</div>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-3 text-center">
            <div className="text-gray-400 text-xs">Net Volume</div>
            <div className={`font-bold text-lg ${(transactions?.summary?.totalSalesAmount || 0) - (transactions?.summary?.totalPurchasesAmount || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${(transactions?.summary?.totalSalesAmount || 0) - (transactions?.summary?.totalPurchasesAmount || 0)}
            </div>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-3 text-center">
            <div className="text-gray-400 text-xs">Success Rate</div>
            <div className="text-green-400 font-bold text-lg">
              {((transactions?.summary?.completedSales || 0) / (transactions?.summary?.totalSales || 1) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Copy Success Toast */}
        {copied && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeIn z-50">
            Transaction hash copied!
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-xs border-t border-gray-800 pt-6">
          <p>© 2026 CryptoNest Transactions Dashboard | Complete Analytics</p>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NFTTransactionsDashboard;