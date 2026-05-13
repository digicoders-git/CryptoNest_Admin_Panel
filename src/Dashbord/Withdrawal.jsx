// WithdrawalManagement.jsx
import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { FaChartPie, FaCoins, FaChartLine, FaSync, FaCheckCircle, FaClock, FaTimesCircle, FaInbox, FaCheck, FaTimes, FaHourglassHalf } from 'react-icons/fa';

const WithdrawalManagement = () => {
  const [allWithdrawals, setAllWithdrawals] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [txHash, setTxHash] = useState('');
  const [modalType, setModalType] = useState(null); // 'approve' or 'reject'
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    totalAmount: 0,
    pendingAmount: 0,
    completedAmount: 0,
    failedAmount: 0
  });
  const [dailyData, setDailyData] = useState([]);

  const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://cryptonest-backend.onrender.com').replace(/\/+$/, '').replace(/\/api$/, '') + '/api/';

  // Get token
  const getToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('superAdminToken');
  };

  // Fetch withdrawals - sirf ek baar saara data fetch karo
  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${baseUrl}admin/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.success) {
        const data = result.data || [];
        setAllWithdrawals(data);
        setWithdrawals(data);
        calculateStats(data);
        calculateDailyTrends(data);
      } else {
        throw new Error(result.message || 'Failed to fetch');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (data) => {
    const newStats = {
      total: data.length,
      pending: data.filter(w => w.status === 'pending').length,
      completed: data.filter(w => w.status === 'completed').length,
      failed: data.filter(w => w.status === 'failed').length,
      totalAmount: 0,
      pendingAmount: 0,
      completedAmount: 0,
      failedAmount: 0
    };

    data.forEach(w => {
      const amount = Number(w.amount) || 0;
      newStats.totalAmount += amount;
      if (w.status === 'pending') newStats.pendingAmount += amount;
      if (w.status === 'completed') newStats.completedAmount += amount;
      if (w.status === 'failed') newStats.failedAmount += amount;
    });

    setStats(newStats);
  };

  // Calculate daily trends for chart
  const calculateDailyTrends = (data) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayAmount = data
        .filter(w => w.createdAt?.split('T')[0] === dateStr && w.status === 'completed')
        .reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
      last7Days.push(dayAmount);
    }
    setDailyData(last7Days);
  };

  // Approve withdrawal
  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const token = getToken();
      const response = await fetch(`${baseUrl}admin/withdrawals/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ txHash: txHash || undefined })
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Withdrawal approved successfully!');
        setShowModal(false);
        setTxHash('');
        setModalType(null);
        fetchWithdrawals();
      } else {
        throw new Error(result.message || 'Approval failed');
      }
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Reject withdrawal
  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      const token = getToken();
      const response = await fetch(`${baseUrl}admin/withdrawals/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: rejectReason || 'No reason provided' })
      });

      const result = await response.json();

      if (result.success) {
        alert('Withdrawal rejected successfully!');
        setShowModal(false);
        setRejectReason('');
        setModalType(null);
        fetchWithdrawals();
      } else {
        throw new Error(result.message || 'Rejection failed');
      }
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // Filter frontend pe karo - no API call
  useEffect(() => {
    if (selectedStatus === 'all') {
      setWithdrawals(allWithdrawals);
    } else {
      setWithdrawals(allWithdrawals.filter(w => w.status === selectedStatus));
    }
  }, [selectedStatus, allWithdrawals]);

  // Highcharts Configurations - All Dynamic
  const statusChart = {
    chart: { type: 'pie', backgroundColor: 'transparent', options3d: { enabled: true, alpha: 45 } },
    title: { text: 'Withdrawal Status Distribution', style: { color: '#FFD700', fontSize: '18px', fontWeight: 'bold' } },
    subtitle: { text: `Total: ${stats.total} requests`, style: { color: '#888888', fontSize: '12px' } },
    plotOptions: {
      pie: {
        innerSize: '60%',
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: { enabled: true, format: '{point.name}: {point.percentage:.1f}%', style: { color: '#FFD700', fontWeight: 'bold' } },
        showInLegend: true
      }
    },
    legend: { itemStyle: { color: '#FFD700' } },
    series: [{
      name: 'Withdrawals',
      data: [
        { name: 'Pending', y: stats.pending, color: '#FFA500' },
        { name: 'Completed', y: stats.completed, color: '#FFD700' },
        { name: 'Failed', y: stats.failed, color: '#DC143C' }
      ]
    }]
  };

  const amountChart = {
    chart: { type: 'column', backgroundColor: 'transparent', options3d: { enabled: true, alpha: 15, beta: 15 } },
    title: { text: 'Withdrawal Amount (USDT)', style: { color: '#FFD700', fontSize: '18px', fontWeight: 'bold' } },
    xAxis: { categories: ['Pending', 'Completed', 'Failed'], labels: { style: { color: '#FFD700', fontWeight: 'bold' } } },
    yAxis: {
      title: { text: 'Amount (USDT)', style: { color: '#FFD700' } },
      labels: { style: { color: '#FFD700' } },
      gridLineColor: '#333333'
    },
    plotOptions: {
      column: {
        dataLabels: { enabled: true, format: '{y} USDT', style: { color: '#FFD700', fontWeight: 'bold' } }
      }
    },
    series: [{
      name: 'Amount',
      data: [
        { y: stats.pendingAmount, color: '#FFA500' },
        { y: stats.completedAmount, color: '#FFD700' },
        { y: stats.failedAmount, color: '#DC143C' }
      ]
    }]
  };

  const trendChart = {
    chart: { type: 'spline', backgroundColor: 'transparent' },
    title: { text: 'Withdrawal Trends (Last 7 Days)', style: { color: '#FFD700', fontSize: '18px', fontWeight: 'bold' } },
    xAxis: {
      categories: (() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        }
        return days;
      })(),
      labels: { style: { color: '#FFD700' } }
    },
    yAxis: {
      title: { text: 'Amount (USDT)', style: { color: '#FFD700' } },
      labels: { style: { color: '#FFD700' } },
      gridLineColor: '#333333'
    },
    tooltip: { pointFormat: '<b>{point.y} USDT</b>' },
    plotOptions: {
      spline: {
        lineWidth: 3,
        marker: { radius: 6, fillColor: '#FFD700', lineColor: '#000', lineWidth: 2 }
      }
    },
    series: [{
      name: 'Completed Withdrawals',
      data: dailyData,
      color: '#FFD700',
      fillOpacity: 0.3,
      lineColor: '#FFD700'
    }]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'completed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaHourglassHalf className="inline" />;
      case 'completed': return <FaCheckCircle className="inline" />;
      case 'failed': return <FaTimesCircle className="inline" />;
      default: return <FaChartPie className="inline" />;
    }
  };

  if (loading && withdrawals.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <div className="text-yellow-500 text-2xl font-semibold">Loading Withdrawals...</div>
          <p className="text-gray-500 mt-2">Fetching withdrawal data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="p-6 lg:p-8">

        {/* Header */}
        <div className="border-b border-yellow-500/30 pb-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl lg:text-3xl font-semibold bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent">
                Withdrawal Management
              </h1>
              <p className="text-gray-400 mt-2">Manage and monitor all withdrawal requests</p>

            </div>
            <button
              onClick={() => fetchWithdrawals()}
              className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 p-3 rounded-xl transition-all duration-300 flex items-center gap-2"
            >
              <FaSync /> Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards - Golden Yellow Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Card */}
          <div className="group bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 hover:scale-105 hover:border-yellow-500 transition-all duration-300 cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-yellow-500 text-sm uppercase tracking-wider font-semibold">Total Withdrawals</div>
                <div className="text-4xl font-bold mt-2 text-white">{stats.total}</div>
                <div className="text-yellow-500 text-sm mt-1 font-medium">{stats.totalAmount.toFixed(2)} USDT</div>
              </div>
              <div className="text-4xl opacity-50 group-hover:opacity-100 transition-all duration-300"><FaChartPie className="text-yellow-500" /></div>
            </div>
            <div className="mt-3 h-1 bg-yellow-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Pending Card */}
          <div className="group bg-gradient-to-br from-gray-900 to-black border border-orange-500/30 rounded-2xl p-6 hover:scale-105 hover:border-orange-500 transition-all duration-300 cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-orange-400 text-sm uppercase tracking-wider font-semibold">Pending</div>
                <div className="text-4xl font-bold mt-2 text-white">{stats.pending}</div>
                <div className="text-orange-400 text-sm mt-1 font-medium">{stats.pendingAmount.toFixed(2)} USDT</div>
              </div>
              <div className="text-4xl opacity-50 group-hover:opacity-100 transition-all duration-300"><FaClock className="text-orange-400" /></div>
            </div>
            <div className="mt-3 h-1 bg-orange-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: stats.total ? `${(stats.pending / stats.total) * 100}%` : '0%' }}></div>
            </div>
          </div>

          {/* Completed Card */}
          <div className="group bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 hover:scale-105 hover:border-yellow-500 transition-all duration-300 cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-yellow-400 text-sm uppercase tracking-wider font-semibold">Completed</div>
                <div className="text-4xl font-bold mt-2 text-white">{stats.completed}</div>
                <div className="text-yellow-400 text-sm mt-1 font-medium">{stats.completedAmount.toFixed(2)} USDT</div>
              </div>
              <div className="text-4xl opacity-50 group-hover:opacity-100 transition-all duration-300"><FaCheckCircle className="text-yellow-400" /></div>
            </div>
            <div className="mt-3 h-1 bg-yellow-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: stats.total ? `${(stats.completed / stats.total) * 100}%` : '0%' }}></div>
            </div>
          </div>

          {/* Failed Card */}
          <div className="group bg-gradient-to-br from-gray-900 to-black border border-red-500/30 rounded-2xl p-6 hover:scale-105 hover:border-red-500 transition-all duration-300 cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-red-400 text-sm uppercase tracking-wider font-semibold">Failed</div>
                <div className="text-4xl font-bold mt-2 text-white">{stats.failed}</div>
                <div className="text-red-400 text-sm mt-1 font-medium">{stats.failedAmount.toFixed(2)} USDT</div>
              </div>
              <div className="text-4xl opacity-50 group-hover:opacity-100 transition-all duration-300"><FaTimesCircle className="text-red-400" /></div>
            </div>
            <div className="mt-3 h-1 bg-red-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: stats.total ? `${(stats.failed / stats.total) * 100}%` : '0%' }}></div>
            </div>
          </div>
        </div>

        {/* Charts Grid - All Dynamic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300">
            <HighchartsReact highcharts={Highcharts} options={statusChart} />
          </div>
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300">
            <HighchartsReact highcharts={Highcharts} options={amountChart} />
          </div>
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300 lg:col-span-2">
            <HighchartsReact highcharts={Highcharts} options={trendChart} />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { value: 'all', label: 'All', count: stats.total, color: 'yellow' },
            { value: 'pending', label: 'Pending', count: stats.pending, color: 'orange' },
            { value: 'completed', label: 'Completed', count: stats.completed, color: 'yellow' },
            { value: 'failed', label: 'Failed', count: stats.failed, color: 'red' }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${selectedStatus === tab.value
                ? `bg-${tab.color}-500 text-black shadow-lg scale-105`
                : `bg-gray-800 text-${tab.color}-400 hover:bg-gray-700 border border-${tab.color}-500/30`
                }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${selectedStatus === tab.value ? 'bg-black/30' : 'bg-gray-700'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Withdrawals Table */}
        <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-yellow-500/20 overflow-hidden hover:border-yellow-500/50 transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black/50">
                <tr className="border-b border-yellow-500/30">
                  <th className="p-4 text-yellow-500 font-semibold">ID</th>
                  <th className="p-4 text-yellow-500 font-semibold">User</th>
                  <th className="p-4 text-yellow-500 font-semibold">Amount</th>
                  <th className="p-4 text-yellow-500 font-semibold">Wallet Address</th>
                  <th className="p-4 text-yellow-500 font-semibold">Status</th>
                  <th className="p-4 text-yellow-500 font-semibold">Requested On</th>
                  <th className="p-4 text-yellow-500 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-400">
                      <div className="text-4xl mb-2"><FaInbox className="text-gray-400 mx-auto" /></div>
                      No withdrawals found
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((withdrawal) => (
                    <tr key={withdrawal._id} className="border-b border-gray-800 hover:bg-yellow-500/5 transition-all duration-300 group">
                      <td className="p-4 text-gray-300 font-mono text-sm">
                        {withdrawal._id?.slice(-8)}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-white group-hover:text-yellow-400 transition-colors">
                          {withdrawal.userId?.name || withdrawal.user?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">{withdrawal.userId?.email || withdrawal.user?.email || 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-yellow-500 font-bold text-lg">{withdrawal.amount} USDT</div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-400 text-sm font-mono truncate max-w-[320px]" title={withdrawal.walletAddress}>
                          {withdrawal.walletAddress?.slice(0, 10)}...{withdrawal.walletAddress?.slice(-8)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${getStatusColor(withdrawal.status)}`}>
                          {getStatusIcon(withdrawal.status)} {withdrawal.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-sm">
                        {new Date(withdrawal.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        {withdrawal.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal);
                                setModalType('approve');
                                setShowModal(true);
                                setTxHash('');
                              }}
                              disabled={actionLoading === withdrawal._id}
                              className="bg-yellow-600/20 hover:bg-yellow-600 text-yellow-400 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-all duration-300 flex items-center gap-1"
                            >
                              {actionLoading === withdrawal._id ? <FaHourglassHalf /> : <FaCheck />} Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal);
                                setModalType('reject');
                                setShowModal(true);
                                setRejectReason('');
                              }}
                              disabled={actionLoading === withdrawal._id}
                              className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-all duration-300 flex items-center gap-1"
                            >
                              {actionLoading === withdrawal._id ? <FaHourglassHalf /> : <FaTimes />} Reject
                            </button>
                          </div>
                        )}
                        {withdrawal.status !== 'pending' && (
                          <span className="text-gray-600 text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Approve/Reject */}
        {showModal && selectedWithdrawal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 max-w-md w-full mx-4 transform animate-scaleIn shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-yellow-500 flex items-center gap-2">
                  {modalType === 'approve' ? <><FaCheckCircle className="text-yellow-400" /> Approve Withdrawal</> : <><FaTimesCircle className="text-red-400" /> Reject Withdrawal</>}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white text-2xl transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-yellow-500 font-bold text-xl">{selectedWithdrawal.amount} USDT</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-400">User:</span>
                    <span className="text-white">{selectedWithdrawal.userId?.name || selectedWithdrawal.user?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Wallet:</span>
                    <span className="text-white text-sm font-mono truncate max-w-[200px]">{selectedWithdrawal.walletAddress}</span>
                  </div>
                </div>

                {modalType === 'approve' ? (
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">Transaction Hash (Optional)</label>
                    <input
                      type="text"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none transition-colors"
                    />
                    <p className="text-gray-500 text-xs mt-1">Leave empty if not available</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">Rejection Reason</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Why are you rejecting this withdrawal?"
                      rows="3"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (modalType === 'approve') {
                        handleApprove(selectedWithdrawal._id);
                      } else {
                        handleReject(selectedWithdrawal._id);
                      }
                    }}
                    className={`flex-1 py-2.5 rounded-xl transition-all duration-300 font-semibold ${modalType === 'approve'
                      ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                      : 'bg-red-600 hover:bg-red-500 text-white'
                      }`}
                  >
                    Confirm {modalType === 'approve' ? 'Approve' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm border-t border-gray-800 pt-6">
          <p>© 2026 Withdrawal Management System | Secure Admin Dashboard</p>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WithdrawalManagement;