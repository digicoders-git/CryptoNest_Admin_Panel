// NFTUserTreeAnalysis.jsx
import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {
  FaSearch,
  FaUserAlt,
  FaTree,
  FaChartPie,
  FaChartLine,
  FaUsers,
  FaDollarSign,
  FaCheckCircle,
  FaTimesCircle,
  FaRegCopy,
  FaEye
} from 'react-icons/fa';

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'https://cryptonest-backend.onrender.com').replace(/\/+$/, '').replace(/\/api$/, '') + '/api/';

const NFTUserTreeAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [userData, setUserData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fetch user tree analysis
  const fetchUserTreeAnalysis = async (email) => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}nft-analytics/user-nft-tree-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ search: email })
      });

      const result = await response.json();

      if (result.success) {
        setUserData(result.user);
        setAnalysisData(result);
      } else {
        setError(result.message || 'User not found');
        setUserData(null);
        setAnalysisData(null);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    fetchUserTreeAnalysis(searchEmail);
  };

  // Copy referral code
  const copyReferralCode = () => {
    if (userData?.referralCode) {
      navigator.clipboard.writeText(userData.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Highcharts Configurations
  const levelDistributionChart = {
    chart: { type: 'column', backgroundColor: 'transparent', options3d: { enabled: true, alpha: 15, beta: 15 } },
    title: { text: '📊 Level Wise Distribution', style: { color: '#D4AF37', fontSize: '16px', fontWeight: 'bold' } },
    xAxis: {
      categories: analysisData?.summary?.levelBreakdown?.map(l => `Level ${l.level}`) || ['No Data'],
      labels: { style: { color: '#D4AF37' } }
    },
    yAxis: {
      title: { text: 'Number of Users', style: { color: '#D4AF37' } },
      labels: { style: { color: '#D4AF37' } },
      gridLineColor: '#333'
    },
    plotOptions: {
      column: {
        dataLabels: { enabled: true, format: '{y}', style: { color: '#D4AF37', fontWeight: 'bold' } },
        colorByPoint: true,
        colors: ['#D4AF37', '#F3C06A', '#FFA500', '#FF8C00', '#FF7F50']
      }
    },
    series: [{
      name: 'Users',
      data: analysisData?.summary?.levelBreakdown?.map(l => l.count) || [0]
    }]
  };

  const childrenStatusChart = {
    chart: { type: 'pie', backgroundColor: 'transparent', options3d: { enabled: true, alpha: 45 } },
    title: { text: '👥 Children Status', style: { color: '#D4AF37', fontSize: '16px', fontWeight: 'bold' } },
    subtitle: { text: `Total Children: ${analysisData?.summary?.totalChildren || 0}`, style: { color: '#888888' } },
    plotOptions: {
      pie: {
        innerSize: '60%',
        allowPointSelect: true,
        dataLabels: { enabled: true, format: '{point.name}: {point.percentage:.1f}%', style: { color: '#D4AF37' } }
      }
    },
    series: [{
      name: 'Children',
      data: [
        { name: 'Active', y: analysisData?.summary?.activeChildren || 0, color: '#22C55E' },
        { name: 'Inactive', y: analysisData?.summary?.inactiveChildren || 0, color: '#EF4444' }
      ]
    }]
  };

  const investmentChart = {
    chart: { type: 'gauge', backgroundColor: 'transparent' },
    title: { text: '💰 Total Investment', style: { color: '#D4AF37', fontSize: '16px', fontWeight: 'bold' } },
    pane: { startAngle: -150, endAngle: 150, background: { backgroundColor: '#333', borderWidth: 0 } },
    yAxis: {
      min: 0,
      max: analysisData?.summary?.totalInvestment ? analysisData.summary.totalInvestment * 2 : 10000,
      title: { text: 'USDT', style: { color: '#D4AF37' } },
      labels: { style: { color: '#D4AF37' } },
      plotBands: [{ from: 0, to: analysisData?.summary?.totalInvestment || 0, color: '#D4AF37' }]
    },
    series: [{
      name: 'Investment',
      data: [analysisData?.summary?.totalInvestment || 0],
      tooltip: { valueSuffix: ' USDT' },
      dial: { radius: '80%', backgroundColor: '#D4AF37' },
      pivot: { backgroundColor: '#D4AF37' }
    }]
  };

  const nftDistributionChart = {
    chart: { type: 'pie', backgroundColor: 'transparent', options3d: { enabled: true, alpha: 45 } },
    title: { text: '🎨 NFT Distribution', style: { color: '#D4AF37', fontSize: '16px', fontWeight: 'bold' } },
    plotOptions: {
      pie: {
        innerSize: '50%',
        allowPointSelect: true,
        dataLabels: { enabled: true, format: '{point.name}: {point.y}', style: { color: '#D4AF37' } }
      }
    },
    series: [{
      name: 'NFTs',
      data: [
        { name: 'Total NFTs', y: analysisData?.summary?.totalNFTs || 0, color: '#D4AF37' }
      ]
    }]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="p-6 lg:p-8">

        {/* Header */}
        <div className="border-b border-[#D4AF37]/30 pb-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl lg:text-3xl font-semibold bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent">
                CryptoNest User Tree Analysis
              </h1>
              <p className="text-gray-400 text-sm mt-2">Analyze user network tree, NFT distribution and investment insights</p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-[#D4AF37]/20 p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-[#D4AF37] text-sm mb-2">Email Address</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3.5 text-gray-500" />
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Enter user email to analyze tree..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pl-10 text-white focus:border-[#D4AF37] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#F3C06A] to-[#D4AF37] text-black font-bold px-8 py-3 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FaEye /> Analyze Tree
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-8 text-center">
            <div className="text-red-400 text-lg mb-2">⚠️ {error}</div>
            <p className="text-gray-400 text-sm">Please check the email address and try again.</p>
          </div>
        )}

        {/* User Profile Card */}
        {userData && analysisData && (
          <>
            <div className="bg-gradient-to-br from-gray-900 to-black border border-[#D4AF37]/30 rounded-2xl p-6 mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F3C06A] to-[#D4AF37] flex items-center justify-center text-black text-3xl font-bold">
                  {userData.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold text-white">{userData.name}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${userData.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {userData.isActive ? '🟢 Active' : '🔴 Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-400 mt-1">{userData.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="bg-gray-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
                      <span className="text-gray-400 text-xs">Referral Code:</span>
                      <span className="text-[#D4AF37] font-mono font-bold">{userData.referralCode}</span>
                      <button
                        onClick={copyReferralCode}
                        className="text-gray-500 hover:text-[#D4AF37] transition-colors"
                      >
                        <FaRegCopy />
                      </button>
                    </div>
                    {copied && <span className="text-green-400 text-xs">Copied!</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div className="bg-gray-900/40 border border-[#D4AF37]/20 rounded-2xl p-5 hover:border-[#D4AF37]/50 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-400 text-xs uppercase tracking-wider">Total Children</div>
                    <div className="text-3xl font-bold text-white mt-1">{analysisData.summary.totalChildren}</div>
                    <div className="text-[#D4AF37] text-xs mt-1">Direct + Indirect</div>
                  </div>
                  <FaTree className="text-3xl text-[#D4AF37]/50" />
                </div>
              </div>

              <div className="bg-gray-900/40 border border-[#D4AF37]/20 rounded-2xl p-5 hover:border-[#D4AF37]/50 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-400 text-xs uppercase tracking-wider">Total NFTs</div>
                    <div className="text-3xl font-bold text-white mt-1">{analysisData.summary.totalNFTs}</div>
                    <div className="text-[#D4AF37] text-xs mt-1">Owned NFTs</div>
                  </div>
                  <FaChartPie className="text-3xl text-[#D4AF37]/50" />
                </div>
              </div>

              <div className="bg-gray-900/40 border border-[#D4AF37]/20 rounded-2xl p-5 hover:border-[#D4AF37]/50 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-400 text-xs uppercase tracking-wider">Total Investment</div>
                    <div className="text-3xl font-bold text-[#D4AF37] mt-1">{analysisData.summary.totalInvestment} USDT</div>
                    <div className="text-gray-400 text-xs mt-1">Total Value</div>
                  </div>
                  <FaDollarSign className="text-3xl text-[#D4AF37]/50" />
                </div>
              </div>

              <div className="bg-gray-900/40 border border-[#D4AF37]/20 rounded-2xl p-5 hover:border-[#D4AF37]/50 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-400 text-xs uppercase tracking-wider">Active/Inactive</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-green-400 font-bold">{analysisData.summary.activeChildren}</span>
                      <span className="text-gray-500">/</span>
                      <span className="text-red-400 font-bold">{analysisData.summary.inactiveChildren}</span>
                    </div>
                    <div className="text-gray-400 text-xs mt-1">Active / Total Children</div>
                  </div>
                  <FaUsers className="text-3xl text-[#D4AF37]/50" />
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-[#D4AF37]/20">
                <HighchartsReact highcharts={Highcharts} options={levelDistributionChart} />
              </div>
              <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-[#D4AF37]/20">
                <HighchartsReact highcharts={Highcharts} options={childrenStatusChart} />
              </div>
              <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-[#D4AF37]/20">
                <HighchartsReact highcharts={Highcharts} options={investmentChart} />
              </div>
              <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-[#D4AF37]/20">
                <HighchartsReact highcharts={Highcharts} options={nftDistributionChart} />
              </div>
            </div>

            {/* Level Wise Data Table */}
            {analysisData.levelWiseData && analysisData.levelWiseData.length > 0 && (
              <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-[#D4AF37]/20 overflow-hidden">
                <div className="p-6 border-b border-[#D4AF37]/20">
                  <h3 className="text-lg font-bold text-[#D4AF37] flex items-center gap-2">
                    <FaChartLine /> Level Wise Details
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-black/50">
                      <tr className="border-b border-[#D4AF37]/20">
                        <th className="p-4 text-[#D4AF37] font-semibold">Level</th>
                        <th className="p-4 text-[#D4AF37] font-semibold">Users</th>
                        <th className="p-4 text-[#D4AF37] font-semibold">NFTs</th>
                        <th className="p-4 text-[#D4AF37] font-semibold">Investment</th>
                        <th className="p-4 text-[#D4AF37] font-semibold">Active</th>
                        <th className="p-4 text-[#D4AF37] font-semibold">Inactive</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisData.levelWiseData.map((level, idx) => (
                        <tr key={idx} className="border-b border-gray-800 hover:bg-[#D4AF37]/5 transition-colors">
                          <td className="p-4 text-white font-bold">Level {level.level}</td>
                          <td className="p-4 text-gray-300">{level.userCount || 0}</td>
                          <td className="p-4 text-[#D4AF37]">{level.totalNFTs || 0}</td>
                          <td className="p-4 text-[#D4AF37]">{level.totalInvestment || 0} USDT</td>
                          <td className="p-4">
                            <span className="text-green-400">{level.activeCount || 0}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-red-400">{level.inactiveCount || 0}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Summary Cards Footer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                <FaCheckCircle className="text-green-400 text-xl mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-400">{analysisData.summary.activeChildren}</div>
                <div className="text-xs text-gray-400">Active Children</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                <FaTimesCircle className="text-red-400 text-xl mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-400">{analysisData.summary.inactiveChildren}</div>
                <div className="text-xs text-gray-400">Inactive Children</div>
              </div>
              <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-4 text-center">
                <FaTree className="text-[#D4AF37] text-xl mx-auto mb-2" />
                <div className="text-2xl font-bold text-[#D4AF37]">{analysisData.summary.totalChildren}</div>
                <div className="text-xs text-gray-400">Total Network Size</div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!userData && !loading && !error && (
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-[#D4AF37]/20 p-12 text-center">
            <FaTree className="text-6xl text-[#D4AF37]/20 mx-auto mb-4" />
            <h3 className="text-xl text-gray-400 mb-2">No User Selected</h3>
            <p className="text-gray-500 text-sm">Enter an email address above to analyze user's NFT tree network</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-xs border-t border-gray-800 pt-6">
          <p>© 2026 CryptoNest User Tree Analysis | Powered by CryptoNext Protocol</p>
        </div>

      </div>
    </div>
  );
};

export default NFTUserTreeAnalysis;