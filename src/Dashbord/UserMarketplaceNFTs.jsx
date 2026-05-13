import { useState } from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {
  FaSearch,
  FaUser,
  FaGem,
  FaShoppingCart,
  FaCalendarAlt,
  FaDollarSign,
  FaLayerGroup,
  FaChartLine,
  FaShieldAlt,
  FaSyncAlt,
  FaClock,
  FaChartPie,
  FaBoxOpen,
  FaTag,
  FaWallet,
  FaEnvelope,
  FaIdCard,
  FaStar,
  FaFire,
  FaSpinner
} from "react-icons/fa";
import Swal from "sweetalert2";

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'https://cryptonest-backend.onrender.com').replace(/\/+$/, '') + '/api/';

export default function UserMarketplaceNFTs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  const searchUserNFTs = async () => {
    if (!searchQuery.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Input Required",
        text: "Please provide a valid Agent Email.",
        background: "#1a1a2e",
        color: "#D4AF37",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}nft-transactions/marketplace/${searchQuery.trim()}`
      );
      const result = await response.json();

      if (result.success) {
        setUserData(result.data);
        if (result.data.count === 0) {
          Swal.fire({
            icon: "info",
            title: "Zero Inventory",
            text: `${result.data.user.name} has no active NFT listings.`,
            background: "#1a1a2e",
            color: "#D4AF37",
            confirmButtonColor: "#D4AF37",
          });
        }
      } else {
        throw new Error(result.message || "Identity not recognized");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Search Failed",
        text: error.message || "System could not locate requested assets.",
        background: "#1a1a2e",
        color: "#D4AF37",
        confirmButtonColor: "#D4AF37",
      });
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Calculate NFT statistics for charts
  const getNFTStats = () => {
    if (!userData?.marketplaceNFTs) return { total: 0, gen1: 0, gen2: 0, totalValue: 0 };

    const nfts = userData.marketplaceNFTs;
    const total = nfts.length;
    const gen2 = nfts.filter(n => n.generation === 2).length;
    const gen1 = nfts.filter(n => n.generation === 1).length;
    const totalValue = nfts.reduce((sum, n) => sum + (n.sellPrice || 0), 0);

    return { total, gen1, gen2, totalValue };
  };

  const nftStats = getNFTStats();

  // Highcharts - Generation Distribution Chart
  const generationChart = {
    chart: { type: 'pie', backgroundColor: 'transparent', options3d: { enabled: true, alpha: 45 } },
    title: { text: '📊 NFT Generation Distribution', style: { color: '#D4AF37', fontSize: '14px', fontWeight: 'bold' } },
    plotOptions: {
      pie: {
        innerSize: '60%',
        allowPointSelect: true,
        dataLabels: { enabled: true, format: '{point.name}: {point.percentage:.1f}%', style: { color: '#D4AF37', fontSize: '10px' } }
      }
    },
    series: [{
      name: 'NFTs',
      data: [
        { name: 'Generation 2', y: nftStats.gen2, color: '#4ECDC4' },
        { name: 'Generation 1', y: nftStats.gen1, color: '#FF6B6B' }
      ]
    }]
  };

  // Price Distribution Chart
  const priceDistributionChart = {
    chart: { type: 'column', backgroundColor: 'transparent', options3d: { enabled: true, alpha: 15 } },
    title: { text: '💰 Price Distribution', style: { color: '#D4AF37', fontSize: '14px', fontWeight: 'bold' } },
    xAxis: { categories: ['$20 Listings'], labels: { style: { color: '#D4AF37' } } },
    yAxis: { title: { text: 'Number of NFTs', style: { color: '#D4AF37' } }, labels: { style: { color: '#D4AF37' } }, gridLineColor: '#333' },
    plotOptions: {
      column: {
        dataLabels: { enabled: true, format: '{y}', style: { color: '#D4AF37' } },
        colorByPoint: true,
        colors: ['#D4AF37']
      }
    },
    series: [{ name: 'NFTs', data: [nftStats.total] }]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="p-6 lg:p-8">

        {/* Header */}
        <div className="border-b border-yellow-500/30 pb-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-xl lg:text-3xl font-semibold bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent flex items-center gap-3">
                User Marketplace Assets
              </h1>
              <p className="text-gray-400 text-sm mt-2">Audit individual user inventory & market listings</p>
            </div>
          </div>
        </div>

        {/* Search Terminal */}
        <div className="bg-gray-900/40 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden group hover:border-yellow-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          <div className="flex flex-col md:flex-row gap-4 relative z-10">
            <div className="flex-1 relative group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500/40 group-focus-within:text-yellow-500 transition-colors" />
              <input
                type="email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchUserNFTs()}
                placeholder="Enter agent email (e.g., user@example.com)"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-600"
              />
            </div>
            <button
              onClick={searchUserNFTs}
              disabled={loading}
              className="px-8 py-3.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold uppercase text-sm tracking-wider rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaUser />}
              {loading ? "Scanning..." : "Audit Assets"}
            </button>
          </div>
        </div>

        {/* Results Workspace */}
        {userData && (
          <div className="space-y-8 animate-fadeIn">

            {/* Agent Identity Card */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center text-black text-2xl font-bold shadow-lg">
                  {userData.user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl text-white font-semibold">{userData.user.name}</h2>
                  <p className="text-yellow-500/60 text-sm mt-1 flex items-center gap-2">
                    <FaEnvelope className="text-xs" /> {userData.user.email}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-2 font-mono flex items-center gap-2">
                    <FaWallet className="text-xs" /> {userData.user.walletAddress?.slice(0, 15)}...
                  </p>
                </div>
              </div>
              <div className="text-center bg-black/40 px-6 py-3 rounded-xl border border-gray-700">
                <p className="text-3xl font-bold text-yellow-500">{userData.count}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Marketplace Listings</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/40 rounded-xl p-4 text-center border border-yellow-500/20">
                <FaBoxOpen className="text-yellow-500 text-xl mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{nftStats.total}</div>
                <div className="text-xs text-gray-500">Total NFTs</div>
              </div>
              <div className="bg-gray-800/40 rounded-xl p-4 text-center border border-teal-500/20">
                <FaFire className="text-teal-400 text-xl mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{nftStats.gen2}</div>
                <div className="text-xs text-gray-500">Gen 2 NFTs</div>
              </div>
              <div className="bg-gray-800/40 rounded-xl p-4 text-center border border-orange-500/20">
                <FaStar className="text-orange-400 text-xl mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{nftStats.gen1}</div>
                <div className="text-xs text-gray-500">Gen 1 NFTs</div>
              </div>
              <div className="bg-gray-800/40 rounded-xl p-4 text-center border border-green-500/20">
                <FaDollarSign className="text-green-400 text-xl mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-500">${nftStats.totalValue}</div>
                <div className="text-xs text-gray-500">Total Value</div>
              </div>
            </div>

            {/* Charts Section */}
            {userData.marketplaceNFTs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/20">
                  <HighchartsReact highcharts={Highcharts} options={generationChart} />
                </div>
                <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/20">
                  <HighchartsReact highcharts={Highcharts} options={priceDistributionChart} />
                </div>
              </div>
            )}

            {/* NFT Grid Interface */}
            {userData.marketplaceNFTs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userData.marketplaceNFTs.map((nft) => (
                  <div
                    key={nft._id}
                    className="group bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl overflow-hidden hover:border-yellow-500/50 hover:scale-[1.02] transition-all duration-300 shadow-xl"
                  >
                    {/* NFT Header */}
                    <div className="bg-gradient-to-br from-gray-800/50 to-black p-5 border-b border-gray-700 relative overflow-hidden">
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-500 text-[10px] font-bold tracking-wider uppercase">
                          Gen {nft.generation}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                          <FaGem className="text-2xl text-yellow-500/50 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-sm truncate max-w-[180px]">
                            {nft.nftId?.slice(-25)}
                          </h3>
                          <p className="text-[9px] text-gray-500 font-mono mt-0.5">ID: {nft._id?.slice(-8)}</p>
                        </div>
                      </div>
                    </div>

                    {/* NFT Body */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 flex items-center gap-1">
                          <FaLayerGroup className="text-yellow-500/60 text-xs" /> Batch
                        </span>
                        <span className="text-xs font-semibold text-white">#{nft.batchId} • Pos {nft.batchPosition}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-800/30 rounded-lg text-center">
                          <p className="text-[9px] uppercase tracking-wider text-gray-500 mb-1">Buy Price</p>
                          <p className="text-base font-bold text-yellow-500">${nft.buyPrice}</p>
                        </div>
                        <div className="p-3 bg-yellow-500/5 rounded-lg text-center border border-yellow-500/20">
                          <p className="text-[9px] uppercase tracking-wider text-yellow-500/60 mb-1">Sell Price</p>
                          <p className="text-base font-bold text-white">${nft.sellPrice}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500">Phase</span>
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${nft.phase === 'trading'
                          ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                          : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          }`}>
                          {nft.phase === 'trading' ? '🔥 Trading' : '⏳ Pre-Launch'}
                        </span>
                      </div>

                      {nft.buyDate && (
                        <div className="pt-3 mt-1 border-t border-gray-800 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[9px] text-gray-500">
                            <FaClock className="text-yellow-500/40 text-[10px]" />
                            {formatDate(nft.buyDate)}
                          </div>
                          {nft.profit !== 0 && (
                            <div className={`text-xs font-bold ${nft.profit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {nft.profit > 0 ? '+' : ''}{nft.profit} USDT
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-yellow-500/20 p-16 text-center shadow-2xl flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-yellow-500/5 rounded-full flex items-center justify-center">
                  <FaShieldAlt className="text-4xl text-yellow-500/20" />
                </div>
                <div>
                  <h3 className="text-xl text-white font-semibold">Inventory Clear</h3>
                  <p className="text-yellow-500/50 text-sm mt-1">This agent currently holds zero active marketplace listings.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty Search State */}
        {!userData && !loading && (
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-yellow-500/20 p-16 text-center shadow-2xl flex flex-col items-center gap-4">
            <FaSearch className="text-6xl text-yellow-500/20" />
            <div>
              <h3 className="text-xl text-yellow-500 font-semibold">Asset Auditor</h3>
              <p className="text-gray-500 text-sm mt-1">Enter an agent email address to audit their marketplace inventory</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-xs border-t border-gray-800 pt-6">
          <p>© 2026 User Marketplace Assets | NFT Inventory Auditor</p>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}