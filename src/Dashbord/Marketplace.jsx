// NFTMarketplaceDashboard.jsx
import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {
  FaStore,
  FaTags,
  FaDollarSign,
  FaChartPie,
  FaChartLine,
  FaSpinner,
  FaSearch,
  FaUser,
  FaBoxOpen,
  FaLayerGroup,
  FaClock,
  FaEye,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaGem,
  FaFire,
  FaHourglassHalf
} from 'react-icons/fa';

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'https://cryptonest-backend.onrender.com').replace(/\/+$/, '') + '/api/';

const NFTMarketplaceDashboard = () => {
  const [marketplaceData, setMarketplaceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Fetch marketplace NFTs
  const fetchMarketplaceNFTs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}nft/marketplace`);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.nfts) {
        setMarketplaceData(result);
      } else {
        throw new Error(result.message || 'Failed to fetch marketplace data');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceNFTs();
  }, []);

  // Filter NFTs by search
  const filteredNFTs = marketplaceData?.nfts?.filter(nft =>
    nft.nftId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nft.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nft.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Pagination
  const totalPages = Math.ceil(filteredNFTs.length / itemsPerPage);
  const paginatedNFTs = filteredNFTs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate statistics
  const stats = {
    total: marketplaceData?.summary?.total || 0,
    trading: marketplaceData?.nfts?.filter(n => n.phase === 'trading').length || 0,
    preLaunch: marketplaceData?.nfts?.filter(n => n.phase === 'pre-launch').length || 0,
    totalValue: marketplaceData?.nfts?.reduce((sum, n) => sum + (n.sellPrice || 0), 0) || 0
  };

  // Highcharts - Phase Distribution Chart
  const phaseChart = {
    chart: { type: 'pie', backgroundColor: 'transparent', options3d: { enabled: true, alpha: 45 } },
    title: { text: '📊 NFT Phase Distribution', style: { color: '#D4AF37', fontSize: '16px', fontWeight: 'bold' } },
    subtitle: { text: `Total NFTs: ${stats.total}`, style: { color: '#888888' } },
    plotOptions: {
      pie: {
        innerSize: '60%',
        allowPointSelect: true,
        dataLabels: { enabled: true, format: '{point.name}: {point.percentage:.1f}%', style: { color: '#D4AF37' } }
      }
    },
    series: [{
      name: 'NFTs',
      data: [
        { name: 'Trading', y: stats.trading, color: '#4ECDC4' },
        { name: 'Pre-Launch', y: stats.preLaunch, color: '#FF6B6B' }
      ]
    }]
  };

  // Price Distribution Chart
  const priceChart = {
    chart: { type: 'column', backgroundColor: 'transparent', options3d: { enabled: true, alpha: 15, beta: 15 } },
    title: { text: '💰 Price Distribution', style: { color: '#D4AF37', fontSize: '16px', fontWeight: 'bold' } },
    xAxis: { categories: ['$20 Listings'], labels: { style: { color: '#D4AF37' } } },
    yAxis: { title: { text: 'Number of NFTs', style: { color: '#D4AF37' } }, labels: { style: { color: '#D4AF37' } }, gridLineColor: '#333' },
    plotOptions: {
      column: {
        dataLabels: { enabled: true, format: '{y}', style: { color: '#D4AF37' } },
        colorByPoint: true,
        colors: ['#D4AF37']
      }
    },
    series: [{ name: 'NFTs', data: [stats.total] }]
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-yellow-500 mx-auto mb-4" />
          <div className="text-yellow-500 text-xl font-semibold">Loading Marketplace...</div>
          <p className="text-gray-500 mt-2">Fetching available NFTs</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <div className="text-red-500 text-xl mb-4">Error: {error}</div>
          <button
            onClick={fetchMarketplaceNFTs}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-xl transition-all"
          >
            Try Again
          </button>
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
                NFT Marketplace
              </h1>
              <p className="text-gray-400 text-sm mt-2">Browse and purchase NFTs listed on marketplace</p>
            </div>
            <button
              onClick={fetchMarketplaceNFTs}
              className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="group bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-yellow-500 text-xs uppercase tracking-wider">Total Listings</div>
                <div className="text-3xl font-bold mt-1 text-white">{stats.total}</div>
                <div className="text-gray-400 text-xs mt-1">Available NFTs</div>
              </div>
              <FaBoxOpen className="text-3xl text-yellow-500/50" />
            </div>
            <div className="mt-3 h-1 bg-yellow-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-gray-900 to-black border border-teal-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-teal-400 text-xs uppercase tracking-wider">Trading Phase</div>
                <div className="text-3xl font-bold mt-1 text-white">{stats.trading}</div>
                <div className="text-teal-400 text-xs mt-1">Active Trading</div>
              </div>
              <FaTags className="text-3xl text-teal-500/50" />
            </div>
            <div className="mt-3 h-1 bg-teal-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: stats.total ? `${(stats.trading / stats.total) * 100}%` : '0%' }}></div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-gray-900 to-black border border-orange-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-orange-400 text-xs uppercase tracking-wider">Pre-Launch</div>
                <div className="text-3xl font-bold mt-1 text-white">{stats.preLaunch}</div>
                <div className="text-orange-400 text-xs mt-1">Coming Soon</div>
              </div>
              <FaClock className="text-3xl text-orange-500/50" />
            </div>
            <div className="mt-3 h-1 bg-orange-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: stats.total ? `${(stats.preLaunch / stats.total) * 100}%` : '0%' }}></div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-gray-900 to-black border border-green-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-green-400 text-xs uppercase tracking-wider">Total Value</div>
                <div className="text-3xl font-bold mt-1 text-white">${stats.totalValue}</div>
                <div className="text-green-400 text-xs mt-1">Market Cap</div>
              </div>
              <FaDollarSign className="text-3xl text-green-500/50" />
            </div>
            <div className="mt-3 h-1 bg-green-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300">
            <HighchartsReact highcharts={Highcharts} options={phaseChart} />
          </div>
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300">
            <HighchartsReact highcharts={Highcharts} options={priceChart} />
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by NFT ID or seller name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pl-10 text-white focus:border-yellow-500 focus:outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* NFT Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-6">
          {paginatedNFTs.map((nft, idx) => (
            <div
              key={nft._id}
              onClick={() => setSelectedNFT(nft)}
              className="group bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-5 hover:scale-105 hover:border-yellow-500 transition-all duration-300 cursor-pointer"
            >
              {/* NFT Icon */}
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaGem className="text-2xl text-[#D4AF37]" />
                </div>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${nft.phase === 'trading'
                    ? 'bg-teal-500/20 text-teal-400'
                    : 'bg-orange-500/20 text-orange-400'
                  }`}>
                  {nft.phase === 'trading'
                    ? <><FaFire className="text-[10px]" /> Trading</>
                    : <><FaHourglassHalf className="text-[10px]" /> Pre-Launch</>}
                </span>
              </div>

              {/* NFT Details */}
              <div className="mb-3">
                <h3 className="text-white font-semibold text-sm truncate" title={nft.displayName}>
                  {nft.displayName?.slice(0, 40)}...
                </h3>
                <code className="text-xs text-yellow-500 font-mono block mt-1">{nft.nftId?.slice(-20)}</code>
              </div>

              {/* Seller Info */}
              <div className="flex items-center gap-2 mb-3 text-xs">
                <FaUser className="text-gray-500" />
                <span className="text-gray-400">Seller: <span className="text-yellow-500">{nft.seller?.name || 'Unknown'}</span></span>
              </div>

              {/* Batch Info */}
              <div className="flex items-center gap-2 mb-3 text-xs">
                <FaLayerGroup className="text-gray-500" />
                <span className="text-gray-400">Batch #{nft.batchId} / Pos {nft.batchPosition}</span>
              </div>

              {/* Price and Date */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-800">
                <div>
                  <div className="text-yellow-500 font-bold text-lg">${nft.sellPrice}</div>
                  <div className="text-gray-500 text-xs">Buy Price</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500 text-xs">Listed</div>
                  <div className="text-gray-400 text-xs">{formatDate(nft.createdAt)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {paginatedNFTs.length === 0 && (
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-yellow-500/20 p-12 text-center mb-6">
            <FaStore className="text-6xl text-yellow-500/20 mx-auto mb-4" />
            <h3 className="text-xl text-gray-400 mb-2">No NFTs Found</h3>
            <p className="text-gray-500 text-sm">Try searching with a different keyword</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <FaChevronLeft />
            </button>
            <span className="text-gray-400 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <FaChevronRight />
            </button>
          </div>
        )}

        {/* NFT Details Modal */}
        {selectedNFT && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn p-4">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 max-w-lg w-full mx-auto animate-scaleIn">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-yellow-500">NFT Details</h2>
                <button
                  onClick={() => setSelectedNFT(null)}
                  className="text-gray-400 hover:text-white text-2xl transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-gray-400 text-xs mb-1">NFT ID</div>
                  <code className="text-white font-mono text-sm break-all">{selectedNFT.nftId}</code>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-gray-400 text-xs mb-1">Display Name</div>
                  <div className="text-white text-sm">{selectedNFT.displayName}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 rounded-xl p-3">
                    <div className="text-gray-400 text-xs">Seller</div>
                    <div className="text-yellow-500 font-semibold">{selectedNFT.seller?.name}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-3">
                    <div className="text-gray-400 text-xs">Phase</div>
                    <div className={`font-semibold ${selectedNFT.phase === 'trading' ? 'text-teal-400' : 'text-orange-400'}`}>
                      {selectedNFT.phase}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-3">
                    <div className="text-gray-400 text-xs">Buy Price</div>
                    <div className="text-yellow-500 font-bold text-lg">${selectedNFT.buyPrice}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-3">
                    <div className="text-gray-400 text-xs">Sell Price</div>
                    <div className="text-yellow-500 font-bold text-lg">${selectedNFT.sellPrice}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-3">
                    <div className="text-gray-400 text-xs">Batch ID</div>
                    <div className="text-white">{selectedNFT.batchId}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-3">
                    <div className="text-gray-400 text-xs">Position</div>
                    <div className="text-white">{selectedNFT.batchPosition}</div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-3">
                  <div className="text-gray-400 text-xs">Listed On</div>
                  <div className="text-white">{formatDate(selectedNFT.createdAt)}</div>
                </div>

                <button
                  onClick={() => setSelectedNFT(null)}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-xl transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-xs border-t border-gray-800 pt-6">
          <p>© 2026 NFT Marketplace | {stats.total} NFTs Available | Powered by CryptoNest Protocol</p>
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

export default NFTMarketplaceDashboard;