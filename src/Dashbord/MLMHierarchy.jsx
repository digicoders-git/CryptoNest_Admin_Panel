// MLMHierarchyDashboard.jsx
import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {
  FaTree,
  FaUsers,
  FaUserPlus,
  FaChartLine,
  FaSearch,
  FaUserCircle,
  FaCrown,
  FaLayerGroup,
  FaRegCopy,
  FaCheckCircle,
  FaSpinner,
  FaChevronRight,
  FaChevronDown,
  FaUser,
  FaLink,
  FaEnvira
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MLMHierarchyDashboard = () => {
  const [hierarchy, setHierarchy] = useState([]);
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [treeLoading, setTreeLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    rootUsers: 0,
    usersWithChildren: 0,
    maxDepth: 0
  });
  const [copied, setCopied] = useState(false);

  // Fetch full hierarchy
  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}api/mlm/hierarchy`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();

      if (result.success) {
        const hierarchyData = result.data.hierarchy || result.data || [];
        setHierarchy(hierarchyData);
        calculateStats(hierarchyData);
        // Auto expand root nodes
        const rootIds = new Set(hierarchyData.filter(u => u.isRootUser).map(u => u.id));
        setExpandedNodes(rootIds);
      } else {
        throw new Error(result.message || 'Failed to fetch hierarchy');
      }
    } catch (err) {
      console.error('Hierarchy fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user tree by ID
  const fetchUserTree = async (userId) => {
    if (!userId) return;

    setTreeLoading(true);
    try {
      const response = await fetch(`${API_URL}api/mlm/user-tree/${userId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();

      if (result.success) {
        setTreeData(result.data);
        // Expand to show children
        if (result.data?.children) {
          const newExpanded = new Set(expandedNodes);
          newExpanded.add(userId);
          setExpandedNodes(newExpanded);
        }
      } else {
        throw new Error(result.message || 'Failed to fetch user tree');
      }
    } catch (err) {
      console.error('User tree fetch error:', err);
      setError(err.message);
    } finally {
      setTreeLoading(false);
    }
  };

  // Calculate statistics from hierarchy
  const calculateStats = (data) => {
    const total = data.length;
    const active = data.filter(u => u.isActive).length;
    const root = data.filter(u => u.isRootUser).length;
    const withChildren = data.filter(u => u.childrenCount > 0).length;

    // Calculate max depth
    const calculateDepth = (users, depth = 1) => {
      let maxDepth = depth;
      users.forEach(user => {
        if (user.children && user.children.length) {
          maxDepth = Math.max(maxDepth, calculateDepth(user.children, depth + 1));
        }
      });
      return maxDepth;
    };

    const maxDepth = calculateDepth(data);

    setStats({
      totalUsers: total,
      activeUsers: active,
      rootUsers: root,
      usersWithChildren: withChildren,
      maxDepth: maxDepth
    });
  };

  // Handle search
  const handleSearch = () => {
    if (searchId.trim()) {
      fetchUserTree(searchId);
      setSelectedUser(searchId);
    }
  };

  // Toggle node expansion
  const toggleNode = (nodeId, e) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Copy referral code
  const copyReferralCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render hierarchy tree recursively - IMPROVED VISUAL HIERARCHY
  const renderHierarchyTree = (nodes, level = 0) => {
    return nodes.map((node, index) => {
      const isLastChild = index === nodes.length - 1;
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expandedNodes.has(node.id);

      return (
        <div key={node.id} className="relative">
          {/* Tree line connector - for visual hierarchy */}
          <div className="relative">
            {/* Vertical line for tree structure */}
            {level > 0 && (
              <div
                className="absolute left-[-20px] top-0 bottom-0 w-px bg-yellow-500/30"
                style={{
                  height: '100%',
                  left: `${level * 24 - 20}px`
                }}
              />
            )}

            {/* Horizontal connector line */}
            {level > 0 && (
              <div
                className="absolute w-5 h-px bg-yellow-500/30 top-1/2"
                style={{ left: `${level * 24 - 20}px` }}
              />
            )}

            {/* Node Item */}
            <div
              className={`relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer mb-2 ml-${level * 6} ${selectedUser === node.id ? 'bg-yellow-500/20 border border-yellow-500/50' : 'hover:bg-gray-800/50'
                }`}
              style={{ marginLeft: `${level * 24}px` }}
              onClick={() => {
                setSelectedUser(node.id);
                fetchUserTree(node.id);
              }}
            >
              {/* Expand/Collapse Button */}
              {hasChildren && (
                <button
                  onClick={(e) => toggleNode(node.id, e)}
                  className="w-6 h-6 flex items-center justify-center bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors z-10"
                >
                  {isExpanded ? <FaChevronDown className="text-yellow-500 text-xs" /> : <FaChevronRight className="text-yellow-500 text-xs" />}
                </button>
              )}
              {!hasChildren && <div className="w-6"></div>}

              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-black ${node.isRootUser ? 'bg-gradient-to-br from-yellow-500 to-amber-600' : 'bg-gradient-to-br from-gray-600 to-gray-700'
                }`}>
                {node.name?.charAt(0).toUpperCase() || 'U'}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white">{node.name}</span>
                  {node.isRootUser && <FaCrown className="text-yellow-500 text-xs" />}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${node.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                    {node.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 truncate">{node.email}</div>
              </div>

              {/* Stats */}
              <div className="flex gap-3 text-center">
                <div className="min-w-[50px]">
                  <div className="text-yellow-500 font-semibold">{node.childrenCount || 0}</div>
                  <div className="text-[10px] text-gray-500">Direct</div>
                </div>
                <div className="min-w-[60px]">
                  <div className="text-yellow-500 font-semibold">{node.totalDownline || 0}</div>
                  <div className="text-[10px] text-gray-500">Downline</div>
                </div>
              </div>

              {/* Balance */}
              <div className="text-right min-w-[80px]">
                <div className="text-yellow-500 font-semibold">{node.balance || 0} ETH</div>
                <div className="text-[10px] text-gray-500">Balance</div>
              </div>

              {/* Referral Code */}
              <div className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded-lg">
                <code className="text-xs text-yellow-500">{node.referralCode}</code>
                <button
                  onClick={(e) => { e.stopPropagation(); copyReferralCode(node.referralCode); }}
                  className="text-gray-500 hover:text-yellow-500 transition-colors"
                >
                  <FaRegCopy size={12} />
                </button>
              </div>
            </div>

            {/* Children - INDENTED PROPERLY */}
            {hasChildren && isExpanded && (
              <div className="relative">
                {renderHierarchyTree(node.children, level + 1)}
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  // Render single user tree with proper hierarchy
  const renderUserTreeWithLines = (user, level = 0, isLast = true) => {
    if (!user) return null;

    const hasChildren = user.children && user.children.length > 0;

    return (
      <div key={user.id || user._id} className="relative">
        {/* Vertical connector line */}
        {level > 0 && (
          <div
            className="absolute border-l-2 border-yellow-500/30"
            style={{
              left: '-12px',
              top: '-16px',
              bottom: hasChildren ? 'auto' : '16px',
              height: 'calc(100% + 16px)'
            }}
          />
        )}

        {/* Horizontal connector */}
        {level > 0 && (
          <div
            className="absolute border-t-2 border-yellow-500/30 w-3"
            style={{ left: '-12px', top: '24px' }}
          />
        )}

        {/* Node */}
        <div className={`relative mb-3 ${level > 0 ? 'ml-6' : ''}`}>
          <div className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${selectedUser === (user.id || user._id) ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-gray-800/30'
            }`}>
            {/* Level Indicator Badge */}
            <div className="w-7 h-7 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold text-xs">
              {level}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-black font-bold">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white">{user.name}</span>
                {level === 0 && <FaCrown className="text-yellow-500 text-xs" />}
                <span className={`text-xs px-2 py-0.5 rounded-full ${user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="text-xs text-gray-500">{user.email}</div>
              {user.referralCode && (
                <div className="flex items-center gap-1 mt-1">
                  <code className="text-[10px] text-yellow-500">{user.referralCode}</code>
                  <button
                    onClick={() => copyReferralCode(user.referralCode)}
                    className="text-gray-500 hover:text-yellow-500"
                  >
                    <FaRegCopy size={10} />
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-center">
              <div>
                <div className={`font-semibold ${user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </div>
                <div className="text-[10px] text-gray-500">Status</div>
              </div>
              <div>
                <div className="text-yellow-500 font-semibold">{user.balance || 0} ETH</div>
                <div className="text-[10px] text-gray-500">Balance</div>
              </div>
              {user.childrenCount !== undefined && (
                <div>
                  <div className="text-yellow-500 font-semibold">{user.childrenCount || 0}</div>
                  <div className="text-[10px] text-gray-500">Children</div>
                </div>
              )}
            </div>
          </div>

          {/* Children Section */}
          {hasChildren && (
            <div className="relative ml-8 pl-4 border-l-2 border-yellow-500/30 mt-2">
              {user.children.map((child, idx) => (
                <div key={child.id || child._id}>
                  {renderUserTreeWithLines(child, level + 1, idx === user.children.length - 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Highcharts - Level Distribution Chart
  const levelDistributionChart = {
    chart: { type: 'column', backgroundColor: 'transparent', options3d: { enabled: true, alpha: 15, beta: 15 } },
    title: { text: '📊 Network Level Distribution', style: { color: '#D4AF37', fontSize: '16px', fontWeight: 'bold' } },
    xAxis: {
      categories: Array.from({ length: stats.maxDepth }, (_, i) => `Level ${i + 1}`),
      labels: { style: { color: '#D4AF37' } }
    },
    yAxis: {
      title: { text: 'Number of Users', style: { color: '#D4AF37' } },
      labels: { style: { color: '#D4AF37' } },
      gridLineColor: '#333'
    },
    plotOptions: {
      column: {
        dataLabels: { enabled: true, format: '{y}', style: { color: '#D4AF37' } },
        colorByPoint: true,
        colors: ['#D4AF37', '#F3C06A', '#FFA500', '#FF8C00', '#FF7F50', '#FF6347']
      }
    },
    series: [{
      name: 'Users',
      data: (() => {
        const levelCounts = new Array(stats.maxDepth).fill(0);
        const countLevels = (users, level = 0) => {
          users.forEach(user => {
            if (levelCounts[level]) levelCounts[level]++;
            else levelCounts[level] = 1;
            if (user.children && user.children.length) {
              countLevels(user.children, level + 1);
            }
          });
        };
        countLevels(hierarchy);
        return levelCounts;
      })()
    }]
  };

  // Network Stats Chart
  const networkChart = {
    chart: { type: 'pie', backgroundColor: 'transparent', options3d: { enabled: true, alpha: 45 } },
    title: { text: '🌐 Network Composition', style: { color: '#D4AF37', fontSize: '16px', fontWeight: 'bold' } },
    plotOptions: {
      pie: {
        innerSize: '60%',
        allowPointSelect: true,
        dataLabels: { enabled: true, format: '{point.name}: {point.percentage:.1f}%', style: { color: '#D4AF37' } }
      }
    },
    series: [{
      name: 'Network',
      data: [
        { name: 'Root Users', y: stats.rootUsers, color: '#D4AF37' },
        { name: 'Users with Children', y: stats.usersWithChildren, color: '#F3C06A' },
        { name: 'Leaf Users', y: stats.totalUsers - stats.usersWithChildren, color: '#FFA500' }
      ]
    }]
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-yellow-500 mx-auto mb-4" />
          <div className="text-yellow-500 text-xl font-semibold">Loading MLM Hierarchy...</div>
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
              <h1 className="text-2xl lg:text-3xl font-semibold bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent flex items-center gap-3">
                CryptoNext Hierarchy
              </h1>
              <p className="text-gray-400 text-sm mt-2">Complete multi-level marketing network visualization with parent-child tree view</p>
            </div>
            <button
              onClick={fetchHierarchy}
              className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-yellow-500 text-xs uppercase tracking-wider">Total Users</div>
                <div className="text-3xl font-bold mt-1 text-white">{stats.totalUsers}</div>
                <div className="text-green-400 text-xs mt-1">In Network</div>
              </div>
              <FaUsers className="text-2xl text-yellow-500/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-green-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-green-400 text-xs uppercase tracking-wider">Active Users</div>
                <div className="text-3xl font-bold mt-1 text-white">{stats.activeUsers}</div>
                <div className="text-green-400 text-xs mt-1">{((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% Active</div>
              </div>
              <FaCheckCircle className="text-2xl text-green-500/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-yellow-500 text-xs uppercase tracking-wider">Root Users</div>
                <div className="text-3xl font-bold mt-1 text-white">{stats.rootUsers}</div>
                <div className="text-yellow-500 text-xs mt-1">Top Level</div>
              </div>
              <FaCrown className="text-2xl text-yellow-500/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-blue-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-blue-400 text-xs uppercase tracking-wider">With Downline</div>
                <div className="text-3xl font-bold mt-1 text-white">{stats.usersWithChildren}</div>
                <div className="text-blue-400 text-xs mt-1">Have Referrals</div>
              </div>
              <FaUserPlus className="text-2xl text-blue-500/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-purple-400 text-xs uppercase tracking-wider">Max Depth</div>
                <div className="text-3xl font-bold mt-1 text-white">{stats.maxDepth}</div>
                <div className="text-purple-400 text-xs mt-1">Levels Deep</div>
              </div>
              <FaLayerGroup className="text-2xl text-purple-500/50" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20">
            <HighchartsReact highcharts={Highcharts} options={levelDistributionChart} />
          </div>
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20">
            <HighchartsReact highcharts={Highcharts} options={networkChart} />
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-yellow-500/20 p-6 mb-8">
          <h3 className="text-yellow-500 text-lg font-semibold mb-4 flex items-center gap-2">
            <FaSearch /> Search User Tree
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter User ID to view complete tree..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 focus:outline-none transition-all"
            />
            <button
              onClick={handleSearch}
              disabled={treeLoading}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 justify-center"
            >
              {treeLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
              View Tree
            </button>
          </div>
        </div>

        {/* Main Content - Full Width with Proper Tree Layout */}
        <div className="grid grid-cols-1 gap-6">

          {/* Full Hierarchy Tree Section */}
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-yellow-500/20 overflow-hidden">
            <div className="p-4 border-b border-yellow-500/20 bg-black/30">
              <h3 className="text-yellow-500 font-semibold flex items-center gap-2">
                <FaTree /> Full Hierarchy Tree (Parent → Child View)
              </h3>
              <p className="text-gray-500 text-xs mt-1">Click on any user to view their complete tree. Use arrow buttons to expand/collapse branches.</p>
            </div>
            <div className="p-4 max-h-[600px] overflow-y-auto">
              {hierarchy.length > 0 ? (
                <div className="tree-container">
                  {renderHierarchyTree(hierarchy)}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">No hierarchy data available</div>
              )}
            </div>
          </div>

          {/* User Tree View Section - Improved Visual Layout */}
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-yellow-500/20 overflow-hidden">
            <div className="p-4 border-b border-yellow-500/20 bg-black/30">
              <h3 className="text-yellow-500 font-semibold flex items-center gap-2">
                <FaUserCircle /> User Tree View (Parent → Child Layout)
              </h3>
              <p className="text-gray-500 text-xs mt-1">
                {selectedUser ? `Showing complete tree for selected user` : 'Select a user from the hierarchy above or search by ID'}
              </p>
            </div>
            <div className="p-4 max-h-[600px] overflow-y-auto">
              {treeLoading ? (
                <div className="flex items-center justify-center py-12">
                  <FaSpinner className="animate-spin text-yellow-500 text-3xl" />
                </div>
              ) : treeData ? (
                <div className="tree-view-container">
                  {/* Parent/Upline Section - Shown Above */}
                  {treeData.parent && (
                    <div className="mb-6">
                      <div className="text-green-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FaLink /> ⬆️ UPLINE (PARENT)
                      </div>
                      <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-600/30 flex items-center justify-center text-green-400">
                            <FaUser />
                          </div>
                          <div>
                            <div className="font-semibold text-white">{treeData.parent.name}</div>
                            <div className="text-xs text-gray-500">{treeData.parent.email}</div>
                            <div className="text-xs text-green-400 mt-1">Parent / Referrer</div>
                          </div>
                          <div className="ml-auto">
                            <code className="text-xs text-yellow-500">{treeData.parent.referralCode}</code>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Current User - Center */}
                  <div className="mb-6">
                    <div className="text-yellow-500 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FaCrown /> 👤 CURRENT USER
                    </div>
                    <div className="bg-gradient-to-r from-yellow-500/20 to-transparent border-2 border-yellow-500/50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-lg">
                          {treeData.user?.name?.charAt(0).toUpperCase() || treeData.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-xl text-white">{treeData.user?.name || treeData.name}</div>
                          <div className="text-sm text-yellow-500">{treeData.user?.email || treeData.email}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs text-gray-400">Ref: {treeData.user?.referralCode || treeData.referralCode}</code>
                            <button
                              onClick={() => copyReferralCode(treeData.user?.referralCode || treeData.referralCode)}
                              className="text-gray-500 hover:text-yellow-500"
                            >
                              <FaRegCopy size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-semibold ${treeData.user?.isActive || treeData.isActive ? 'text-green-400' : 'text-red-400'}`}>
                            {treeData.user?.isActive || treeData.isActive ? 'Active' : 'Inactive'}
                          </div>
                          <div className="text-yellow-500 text-sm">{treeData.user?.balance || treeData.balance || 0} ETH</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Children/Downline Section - Shown Below with Tree Lines */}
                  {(treeData.children || treeData.downline) && (treeData.children?.length > 0 || treeData.downline?.length > 0) && (
                    <div>
                      <div className="text-blue-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FaEnvira /> ⬇️ DOWNLINE (CHILDREN)
                      </div>
                      <div className="tree-children-container ml-2">
                        {(treeData.children || treeData.downline || []).map((child, idx) => (
                          <div key={child.id || child._id} className="relative">
                            {renderUserTreeWithLines(child, 1, idx === (treeData.children || treeData.downline).length - 1)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!treeData.children || treeData.children.length === 0) && !treeData.parent && (
                    <div className="text-center py-12 text-gray-500">
                      <FaTree className="text-4xl mx-auto mb-3 opacity-30" />
                      No tree data available for this user
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FaTree className="text-4xl mx-auto mb-3 opacity-30" />
                  <p>Select a user from the hierarchy above</p>
                  <p className="text-xs mt-2">or search by User ID to view their complete tree</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Copy Success Toast */}
        {copied && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeIn z-50">
            Referral code copied!
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-xs border-t border-gray-800 pt-6">
          <p>© 2026  CryptoNext Hierarchy  | Complete Parent-Child Network Visualization</p>
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
        
        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #D4AF37;
          border-radius: 10px;
        }
        
        /* Tree connector styles */
        .tree-container {
          position: relative;
        }
        .tree-view-container {
          position: relative;
        }
        .tree-children-container {
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default MLMHierarchyDashboard;