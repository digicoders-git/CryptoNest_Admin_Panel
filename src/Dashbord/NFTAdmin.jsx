import React, { useState, useEffect } from "react";
import {
  FaCubes,
  FaPlay,
  FaEye,
  FaRocket,
  FaChartLine,
  FaSyncAlt,
  FaStore,
  FaMicrochip,
  FaStream,
  FaShieldAlt,
  FaExchangeAlt,
  FaFire,
  FaDollarSign,
  FaUsers,
  FaBoxes,
  FaPercentage
} from "react-icons/fa";
import Swal from "sweetalert2";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const API_URL = import.meta.env.VITE_API_URL;

export default function NFTAdmin() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nftStatus, setNftStatus] = useState(null);
  const [marketplace, setMarketplace] = useState(null);
  const [nftTransactions, setNftTransactions] = useState([]);

  const apiCall = async (endpoint, method = "GET", body = null) => {
    try {
      const response = await fetch(`${API_URL}api/nft${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : null,
      });

      const text = await response.text();

      if (!response.ok) {
        console.error("API Raw Response:", text);
        throw new Error(`HTTP ${response.status}`);
      }

      return JSON.parse(text);
    } catch (error) {
      console.error("API Error:", error.message);
      return { error: error.message };
    }
  };

  const initializeNFTSystem = async () => {
    Swal.fire({
      title: "Initialize System?",
      text: "This will generate 500 CryptoNest in 125 batches. Are you sure?",
      icon: "warning",
      showCancelButton: true,
      background: "#000",
      color: "#D4AF37",
      confirmButtonColor: "#D4AF37",
      cancelButtonColor: "#334155",
      confirmButtonText: "Yes, Initialize",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        const res = await apiCall("/initialize", "POST");
        setLoading(false);
        if (res.message) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: res.message,
            background: "#000",
            color: "#D4AF37",
            confirmButtonColor: "#D4AF37",
          });
          fetchNFTStatus();
          fetchMarketplace();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: res.error || "System initialization failed",
            background: "#000",
            color: "#D4AF37",
            confirmButtonColor: "#D4AF37",
          });
        }
      }
    });
  };

  const fetchNFTStatus = async () => {
    setRefreshing(true);
    const result = await apiCall("/status");
    setNftStatus(result);
    setRefreshing(false);
  };

  const fetchMarketplace = async () => {
    setRefreshing(true);
    const result = await apiCall("/marketplace");
    setMarketplace(result);
    setRefreshing(false);
  };

  const fetchNFTTransactions = async () => {
    const token = localStorage.getItem("token") || localStorage.getItem("superAdminToken");
    try {
      const res = await fetch(`${API_URL}api/SuperAdmin/company-transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const nftTxs = (data.transactions || []).filter(tx =>
          tx.type === "NFT Sale" || tx.type === "Pre-Launch NFT Purchase"
        );
        setNftTransactions(nftTxs);
      }
    } catch (e) {
      console.error("NFT tx fetch error:", e);
    }
  };

  useEffect(() => {
    fetchNFTStatus();
    fetchMarketplace();
    fetchNFTTransactions();
  }, []);

  // ========== HIGHCHARTS CONFIGURATIONS ==========

  // NFT Distribution Chart (500 Total NFTs)
  const nftDistributionChart = {
    chart: { type: 'pie', backgroundColor: 'transparent', options3d: { enabled: true, alpha: 45 } },
    title: { text: '🎨 NFT Asset Distribution', style: { color: '#D4AF37', fontSize: '16px', fontWeight: 'bold' } },
    subtitle: { text: 'Total Supply: 500 NFTs', style: { color: '#888888' } },
    plotOptions: {
      pie: {
        innerSize: '60%',
        allowPointSelect: true,
        dataLabels: { enabled: true, format: '{point.name}: {point.percentage:.1f}%', style: { color: '#D4AF37' } },
        showInLegend: true
      }
    },
    legend: { itemStyle: { color: '#D4AF37' } },
    series: [{
      name: 'NFTs',
      data: [
        { name: 'Available', y: nftStatus?.preLaunch?.availableNFTs || 500, color: '#D4AF37' },
        { name: 'Sold', y: 500 - (nftStatus?.preLaunch?.availableNFTs || 500), color: '#FFA500' }
      ]
    }]
  };

  // Batch Progress Chart
  const batchProgressChart = {
    chart: { type: 'gauge', backgroundColor: 'transparent' },
    title: { text: '📦 Batch Generation Progress', style: { color: '#D4AF37', fontSize: '16px', fontWeight: 'bold' } },
    pane: { startAngle: -150, endAngle: 150, background: { backgroundColor: '#333', borderWidth: 0 } },
    yAxis: {
      min: 0,
      max: 125,
      title: { text: 'Batches', style: { color: '#D4AF37' } },
      labels: { style: { color: '#D4AF37' } },
      plotBands: [{ from: 0, to: 125, color: '#D4AF37' }]
    },
    series: [{
      name: 'Progress',
      data: [marketplace?.currentBatch || 1],
      tooltip: { valueSuffix: ' batches' },
      dial: { radius: '80%', backgroundColor: '#D4AF37' },
      pivot: { backgroundColor: '#D4AF37' }
    }]
  };

  // Asset Price Chart
  const priceChart = {
    chart: { type: 'column', backgroundColor: 'transparent', options3d: { enabled: true, alpha: 15 } },
    title: { text: '💰 Asset Pricing', style: { color: '#D4AF37', fontSize: '16px', fontWeight: 'bold' } },
    xAxis: { categories: ['Current Price'], labels: { style: { color: '#D4AF37' } } },
    yAxis: { title: { text: 'Price (USD)', style: { color: '#D4AF37' } }, labels: { style: { color: '#D4AF37' } } },
    plotOptions: {
      column: {
        dataLabels: { enabled: true, format: '${y}', style: { color: '#D4AF37', fontWeight: 'bold' } }
      }
    },
    series: [{
      name: 'Price',
      data: [nftStatus?.preLaunch?.pricePerNFT || 10],
      color: '#D4AF37'
    }]
  };

  // System Phase Timeline
  const phaseChart = {
    chart: { type: 'bar', backgroundColor: 'transparent' },
    title: { text: '⏱️ System Phase Timeline', style: { color: '#D4AF37', fontSize: '16px', fontWeight: 'bold' } },
    xAxis: { categories: ['Pre-Launch', 'Trading', 'Burning'], labels: { style: { color: '#D4AF37' } } },
    yAxis: { title: { text: 'Status', style: { color: '#D4AF37' } }, labels: { enabled: false } },
    plotOptions: {
      bar: {
        dataLabels: { enabled: true, format: '{point.name}', style: { color: '#fff' } }
      }
    },
    series: [{
      name: 'Phase',
      data: [
        { y: 1, name: '🟢 Active', color: '#D4AF37' },
        { y: 0.5, name: '⚪ Pending', color: '#444' },
        { y: 0.5, name: '⚪ Pending', color: '#444' }
      ]
    }]
  };

  // Weekly NFT Sales - Dynamic
  const weeklyLabels = [];
  const weeklyAmounts = [];
  for (let i = 3; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - (i + 1) * 7);
    const end = new Date();
    end.setDate(end.getDate() - i * 7);
    weeklyLabels.push(`Week ${4 - i}`);
    const total = nftTransactions
      .filter(tx => {
        const d = new Date(tx.date);
        return d >= start && d < end;
      })
      .reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0);
    weeklyAmounts.push(parseFloat(total.toFixed(2)));
  }

  // Performance Metrics Chart
  const performanceChart = {
    chart: { type: 'spline', backgroundColor: 'transparent' },
    title: { text: '📈 System Performance', style: { color: '#D4AF37', fontSize: '16px', fontWeight: 'bold' } },
    xAxis: { categories: weeklyLabels, labels: { style: { color: '#D4AF37' } } },
    yAxis: { title: { text: 'Revenue (USDT)', style: { color: '#D4AF37' } }, labels: { style: { color: '#D4AF37' } } },
    series: [{
      name: 'NFT Sales Revenue',
      data: weeklyAmounts,
      color: '#D4AF37',
      lineWidth: 3,
      marker: { radius: 6, fillColor: '#D4AF37', lineColor: '#000', lineWidth: 2 }
    }]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="p-6 lg:p-8 space-y-8">

        {/* ========== HEADER ========== */}
        <div className="border-b border-[#D4AF37]/30 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-xl lg:text-2xl font-semibold bg-gradient-to-r from-[#F3C06A] via-[#D4AF37] to-[#F3C06A] bg-clip-text text-transparent">
                CryptoNest Asset Control
              </h1>
              <p className="text-[#D4AF37]/60 text-sm mt-2">Global CryptoNest Asset Distribution & Management Protocol</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></div>
                <span className="text-[10px] uppercase tracking-widest text-[#D4AF37]">Network Live</span>
              </div>
              <button
                onClick={() => {
                  fetchNFTStatus();
                  fetchMarketplace();
                }}
                className="bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] p-2.5 rounded-xl transition-all duration-300"
              >
                <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* ========== ACTION CARDS ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Initialize System Card */}
          <div className="group bg-gradient-to-br from-gray-900 to-black border border-[#D4AF37]/30 rounded-2xl p-6 hover:border-[#D4AF37]/60 hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20">
                <FaRocket className="text-2xl text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-lg text-white font-semibold">Genesis Initialization</h3>
                <p className="text-xs text-[#D4AF37]/50 uppercase tracking-wider">Deploy Core CryptoNestAssets</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Creates <span className="text-[#D4AF37] font-bold">500 unique NFT assets</span> distributed across
              <span className="text-[#D4AF37] font-bold"> 125 strategic batches</span> (4 assets per batch) and registers them in the immutable database.
            </p>
            <button
              onClick={initializeNFTSystem}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#F3C06A] to-[#D4AF37] text-black font-bold uppercase text-sm tracking-wider rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FaPlay className={loading ? "animate-pulse" : ""} />
              {loading ? "Generating Assets..." : "Initialize System"}
            </button>
          </div>

          {/* System Stats Preview Card */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-[#D4AF37]/30 rounded-2xl p-6">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="text-center p-3 bg-[#D4AF37]/5 rounded-xl">
                <FaBoxes className="text-2xl text-[#D4AF37] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{nftStatus?.preLaunch?.availableNFTs || 500}</div>
                <div className="text-xs text-gray-500">Available CryptoNest</div>
              </div>
              <div className="text-center p-3 bg-[#D4AF37]/5 rounded-xl">
                <FaDollarSign className="text-2xl text-[#D4AF37] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">${nftStatus?.preLaunch?.pricePerNFT || 10}</div>
                <div className="text-xs text-gray-500">Price Per CryptoNest</div>
              </div>
              <div className="text-center p-3 bg-[#D4AF37]/5 rounded-xl">
                <FaUsers className="text-2xl text-[#D4AF37] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{nftStatus?.preLaunch?.maxPerUser || 2}</div>
                <div className="text-xs text-gray-500">Max Per User</div>
              </div>
              <div className="text-center p-3 bg-[#D4AF37]/5 rounded-xl">
                <FaPercentage className="text-2xl text-[#D4AF37] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{marketplace?.currentBatch ? Math.round((marketplace.currentBatch / 125) * 100) : 0}%</div>
                <div className="text-xs text-gray-500">Total Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== CHARTS GRID ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-[#D4AF37]/20">
            <HighchartsReact highcharts={Highcharts} options={nftDistributionChart} />
          </div>
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-[#D4AF37]/20">
            <HighchartsReact highcharts={Highcharts} options={batchProgressChart} />
          </div>
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-[#D4AF37]/20">
            <HighchartsReact highcharts={Highcharts} options={priceChart} />
          </div>
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-[#D4AF37]/20">
            <HighchartsReact highcharts={Highcharts} options={phaseChart} />
          </div>
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-[#D4AF37]/20 lg:col-span-2">
            <HighchartsReact highcharts={Highcharts} options={performanceChart} />
          </div>
        </div>

        {/* ========== SYSTEM STATUS SECTION ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* NFT System Status */}
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-[#D4AF37]/20">
            <div className="flex items-center gap-3 mb-6">
              <FaMicrochip className="text-[#D4AF37] text-xl" />
              <h3 className="text-lg text-white font-semibold">System Metrics</h3>
            </div>

            {!nftStatus ? (
              <div className="py-16 text-center text-gray-500">
                <FaMicrochip className="text-5xl mx-auto mb-3 opacity-30" />
                <p className="text-sm uppercase tracking-wider">No Status Data Available</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/50 border border-[#D4AF37]/20 rounded-xl p-4 text-center">
                    <p className="text-xs text-[#D4AF37]/60 uppercase tracking-wider mb-1">Current Phase</p>
                    <p className="text-xl text-white font-bold capitalize">{nftStatus.currentPhase || "Idle"}</p>
                  </div>
                  <div className="bg-black/50 border border-[#D4AF37]/20 rounded-xl p-4 text-center">
                    <p className="text-xs text-[#D4AF37]/60 uppercase tracking-wider mb-1">Available Assets</p>
                    <p className="text-xl text-emerald-400 font-bold">{nftStatus.preLaunch?.availableNFTs || 0}</p>
                  </div>
                  <div className="bg-black/50 border border-[#D4AF37]/20 rounded-xl p-4 text-center">
                    <p className="text-xs text-[#D4AF37]/60 uppercase tracking-wider mb-1">Sold Assets</p>
                    <p className="text-xl text-[#F3C06A] font-bold">{500 - (nftStatus.preLaunch?.availableNFTs || 500)}</p>
                  </div>
                  <div className="bg-black/50 border border-[#D4AF37]/20 rounded-xl p-4 text-center">
                    <p className="text-xs text-[#D4AF37]/60 uppercase tracking-wider mb-1">Price Per Unit</p>
                    <p className="text-xl text-[#F3C06A] font-bold">${nftStatus.preLaunch?.pricePerNFT || 10}</p>
                  </div>
                </div>

                <div className="bg-black/50 border border-white/10 rounded-xl p-4">
                  <h4 className="text-xs text-[#D4AF37] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FaStream /> Protocol Constraints
                  </h4>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Max Per User</span>
                    <span className="text-sm text-white font-semibold">{nftStatus.preLaunch?.maxPerUser || 2} Units</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">Batch Density</span>
                    <span className="text-sm text-white font-semibold">4 Units / Batch</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">Total Batches</span>
                    <span className="text-sm text-white font-semibold">125 Batches</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Marketplace Metrics */}
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-[#D4AF37]/20">
            <div className="flex items-center gap-3 mb-6">
              <FaStore className="text-[#D4AF37] text-xl" />
              <h3 className="text-lg text-white font-semibold">Marketplace Feed</h3>
            </div>

            {!marketplace ? (
              <div className="py-16 text-center text-gray-500">
                <FaExchangeAlt className="text-5xl mx-auto mb-3 opacity-30" />
                <p className="text-sm uppercase tracking-wider">Marketplace Feed Offline</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/30 rounded-xl p-5 text-center">
                    <p className="text-xs text-[#D4AF37] uppercase tracking-wider mb-1">Active Batch</p>
                    <p className="text-3xl text-white font-bold">#{marketplace.currentBatch || 1}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl p-5 text-center">
                    <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">Batch Progress</p>
                    <p className="text-3xl text-white font-bold">{marketplace.batchProgress || "0/4"}</p>
                  </div>
                </div>

                <div className="relative pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#D4AF37] uppercase tracking-wider">Global Saturation</span>
                    <span className="text-sm text-white font-bold">{marketplace?.currentBatch ? Math.round((marketplace.currentBatch / 125) * 100) : 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#F3C06A] to-[#D4AF37] rounded-full transition-all duration-700"
                      style={{ width: `${(marketplace.currentBatch / 125) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[9px] text-gray-600 uppercase">Genesis</span>
                    <span className="text-[9px] text-gray-600 uppercase">Saturation (125 Batches)</span>
                  </div>
                </div>

                <div className="bg-black/50 rounded-xl p-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Remaining CryptoNest</span>
                    <span className="text-sm text-emerald-400 font-bold">{nftStatus?.preLaunch?.availableNFTs || 500}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">Total Revenue (Potential)</span>
                    <span className="text-sm text-[#D4AF37] font-bold">${(500 - (nftStatus?.preLaunch?.availableNFTs || 500)) * (nftStatus?.preLaunch?.pricePerNFT || 10)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========== PROTOCOL ARCHITECTURE ========== */}
        <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-[#D4AF37]/20">
          <h3 className="text-xl text-[#F3C06A] uppercase tracking-wider mb-6 flex items-center gap-3">
            <FaShieldAlt className="text-[#D4AF37]" /> CryptoNest System Architecture
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Pre-Launch Protocol",
                icon: FaRocket,
                desc: "Initial asset generation of 500 NFTs in controlled batches. Optimized entry pricing at $10 with per-user limits.",
                color: "text-blue-400",
                status: "Active"
              },
              {
                title: "Trading Engine",
                icon: FaExchangeAlt,
                desc: "Sophisticated revenue sharing where every $20 trade unlocks hold-status and enables immediate sell-side liquidity.",
                color: "text-amber-400",
                status: "Ready"
              },
              {
                title: "Hyper-Deflationary",
                icon: FaFire,
                desc: "Final stage burning protocol. Convert internal assets to blockchain tokens upon full network saturation.",
                color: "text-rose-500",
                status: "Pending"
              }
            ].map(p => (
              <div key={p.title} className="bg-black/50 border border-white/10 rounded-xl p-5 hover:border-[#D4AF37]/40 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center mb-4 border border-[#D4AF37]/20">
                  <p.icon className={`text-xl ${p.color}`} />
                </div>
                <h4 className="text-sm text-white font-semibold uppercase tracking-wider mb-2">{p.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{p.desc}</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${p.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' :
                  p.status === 'Ready' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ========== FOOTER ========== */}
        <div className="text-center text-gray-500 text-xs border-t border-gray-800 pt-6">
          <p>© 2026 CryptoNest Asset Control System | Powered by CryptoNext Protocol</p>
        </div>

      </div>
    </div>
  );
}