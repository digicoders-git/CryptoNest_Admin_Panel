import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { FaUsers, FaCheckCircle, FaPauseCircle, FaSnowflake, FaUserPlus, FaEdit, FaTrash, FaSync, FaSearch, FaToggleOn, FaToggleOff, FaSave, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    country: '',
    walletAddress: '',
    currentPlan: 'basic',
    balance: 0,
    canTrade: true,
    canWithdraw: true,
    isFrozen: false
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    frozen: 0,
    todayNew: 0,
    totalBalance: 0
  });

  const API_URL = (import.meta.env.VITE_API_BASE_URL || 'https://cryptonest-backend.onrender.com').replace(/\/+$/, '') + '/api/';

  // Get token
  const getToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('superAdminToken');
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${API_URL}SuperAdmin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.success) {
        const userData = result.data || [];
        setUsers(userData);
        filterUsers(userData, searchTerm, statusFilter);
        calculateStats(userData);
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

  // Search users
  const searchUsers = async () => {
    if (!searchTerm.trim()) {
      fetchUsers();
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${API_URL}SuperAdmin/users?search=${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.success) {
        const userData = result.data || [];
        setUsers(userData);
        filterUsers(userData, searchTerm, statusFilter);
        calculateStats(userData);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter users by status
  const filterUsers = (userList, search, status) => {
    let filtered = [...userList];

    if (status !== 'all') {
      if (status === 'active') {
        filtered = filtered.filter(u => u.isActive === true && u.isFrozen === false);
      } else if (status === 'inactive') {
        filtered = filtered.filter(u => u.isActive === false && u.isFrozen === false);
      } else if (status === 'frozen') {
        filtered = filtered.filter(u => u.isFrozen === true);
      }
    }

    if (search) {
      filtered = filtered.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.referralCode?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  // Calculate statistics
  const calculateStats = (userList) => {
    const newStats = {
      total: userList.length,
      active: userList.filter(u => u.isActive === true && u.isFrozen === false).length,
      inactive: userList.filter(u => u.isActive === false && u.isFrozen === false).length,
      frozen: userList.filter(u => u.isFrozen === true).length,
      todayNew: userList.filter(u => {
        const today = new Date().toISOString().split('T')[0];
        return u.createdAt?.split('T')[0] === today;
      }).length,
      totalBalance: userList.reduce((sum, u) => sum + (u.balance || 0), 0)
    };
    setStats(newStats);
  };

  // Activate user
  const handleActivate = async (id) => {
    setActionLoading(id);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}SuperAdmin/users/${id}/activate`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({ icon: 'success', title: 'Activated!', text: 'User activated successfully', background: '#000', color: '#D4AF37', confirmButtonColor: '#D4AF37' });
        fetchUsers();
      } else {
        throw new Error(result.message || 'Activation failed');
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, background: '#000', color: '#D4AF37', confirmButtonColor: '#D4AF37' });
    } finally {
      setActionLoading(null);
    }
  };

  // Deactivate user
  const handleDeactivate = async (id) => {
    setActionLoading(id);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}SuperAdmin/users/${id}/deactivate`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({ icon: 'success', title: 'Deactivated!', text: 'User deactivated successfully', background: '#000', color: '#D4AF37', confirmButtonColor: '#D4AF37' });
        fetchUsers();
      } else {
        throw new Error(result.message || 'Deactivation failed');
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, background: '#000', color: '#D4AF37', confirmButtonColor: '#D4AF37' });
    } finally {
      setActionLoading(null);
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      icon: 'warning', title: 'Are you sure?', text: 'This will permanently delete the user!',
      showCancelButton: true, confirmButtonText: 'Yes, Delete', cancelButtonText: 'Cancel',
      background: '#000', color: '#D4AF37', confirmButtonColor: '#e53e3e', cancelButtonColor: '#D4AF37'
    });
    if (!confirm.isConfirmed) return;

    setActionLoading(id);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}SuperAdmin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({ icon: 'success', title: 'Deleted!', text: 'User deleted successfully', background: '#000', color: '#D4AF37', confirmButtonColor: '#D4AF37' });
        fetchUsers();
      } else {
        throw new Error(result.message || 'Deletion failed');
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, background: '#000', color: '#D4AF37', confirmButtonColor: '#D4AF37' });
    } finally {
      setActionLoading(null);
    }
  };

  // Edit user
  const handleEdit = async (id) => {
    setActionLoading(id);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}SuperAdmin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      const result = await response.json();

      if (result.success) {
        alert('✏️ User updated successfully!');
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Open edit modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || '',
      country: user.country || '',
      walletAddress: user.walletAddress || '',
      currentPlan: user.currentPlan || 'basic',
      balance: user.balance || 0,
      canTrade: user.canTrade !== undefined ? user.canTrade : true,
      canWithdraw: user.canWithdraw !== undefined ? user.canWithdraw : true,
      isFrozen: user.isFrozen || false
    });
    setShowEditModal(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers(users, searchTerm, statusFilter);
  }, [searchTerm, statusFilter, users]);

  // Highcharts - User Distribution Chart
  const userChart = {
    chart: { type: 'pie', backgroundColor: 'transparent', options3d: { enabled: true, alpha: 45 } },
    title: { text: '👥 User Distribution', style: { color: '#FFD700', fontSize: '18px', fontWeight: 'bold' } },
    subtitle: { text: `Total Users: ${stats.total}`, style: { color: '#888888' } },
    plotOptions: {
      pie: {
        innerSize: '60%',
        allowPointSelect: true,
        dataLabels: { enabled: true, format: '{point.name}: {point.percentage:.1f}%', style: { color: '#FFD700' } }
      }
    },
    series: [{
      name: 'Users',
      data: [
        { name: 'Active', y: stats.active, color: '#FFD700' },
        { name: 'Inactive', y: stats.inactive, color: '#FFA500' },
        { name: 'Frozen', y: stats.frozen, color: '#DC143C' }
      ]
    }]
  };

  // Monthly Registrations Chart (last 6 months from table data)
  const monthlyRegistrations = (() => {
    const months = [];
    const counts = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d.toLocaleString('en-US', { month: 'short', year: '2-digit' }));
      counts.push(users.filter(u => {
        const c = new Date(u.createdAt);
        return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
      }).length);
    }
    return { months, counts };
  })();

  const registrationChart = {
    chart: { type: 'areaspline', backgroundColor: 'transparent' },
    title: { text: '📈 Monthly User Registrations', style: { color: '#FFD700', fontSize: '18px', fontWeight: 'bold' } },
    xAxis: { categories: monthlyRegistrations.months, labels: { style: { color: '#FFD700' } }, lineColor: '#333', tickColor: '#333' },
    yAxis: { title: { text: 'New Users', style: { color: '#FFD700' } }, labels: { style: { color: '#FFD700' } }, gridLineColor: '#333', allowDecimals: false },
    tooltip: { backgroundColor: '#111', style: { color: '#FFD700' }, borderColor: '#FFD700' },
    plotOptions: {
      areaspline: {
        lineWidth: 3,
        marker: { radius: 6, fillColor: '#FFD700', lineColor: '#000', lineWidth: 2 },
        fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, 'rgba(255,215,0,0.35)'], [1, 'rgba(255,215,0,0)']] }
      }
    },
    series: [{ name: 'Registrations', data: monthlyRegistrations.counts, color: '#FFD700' }],
    credits: { enabled: false }
  };

  const getStatusBadge = (user) => {
    if (user.isFrozen) {
      return { text: 'FROZEN', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '🧊' };
    }
    if (user.isActive) {
      return { text: 'ACTIVE', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: '●' };
    }
    return { text: 'INACTIVE', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: '○' };
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <div className="text-yellow-500 text-2xl font-semibold">Loading Users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="p-6 lg:p-8">

        {/* Header */}
        <div className="border-b border-yellow-500/30 pb-6 mb-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-xl lg:text-3xl font-semibold bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-gray-400 mt-2">Manage all platform users - Activate, Deactivate, Edit, Delete</p>
            </div>
            <button
              onClick={fetchUsers}
              className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2"
            >
              <FaSync /> Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-yellow-500 text-xs uppercase tracking-wider">Total Users</div>
                <div className="text-3xl font-bold mt-1 text-white">{stats.total}</div>
                <div className="text-yellow-500 text-sm mt-1">{stats.totalBalance.toFixed(2)} ETH</div>
              </div>
              <FaUsers className="text-3xl text-yellow-500/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-green-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-green-400 text-xs uppercase tracking-wider">Active</div>
                <div className="text-3xl font-bold mt-1 text-white">{stats.active}</div>
                <div className="text-green-400 text-sm mt-1">Online</div>
              </div>
              <FaCheckCircle className="text-3xl text-green-400/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-orange-400 text-xs uppercase tracking-wider">Inactive</div>
                <div className="text-3xl font-bold mt-1 text-white">{stats.inactive}</div>
                <div className="text-orange-400 text-sm mt-1">Offline</div>
              </div>
              <FaPauseCircle className="text-3xl text-orange-400/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-red-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-red-400 text-xs uppercase tracking-wider">Frozen</div>
                <div className="text-3xl font-bold mt-1 text-white">{stats.frozen}</div>
                <div className="text-red-400 text-sm mt-1">Restricted</div>
              </div>
              <FaSnowflake className="text-3xl text-red-400/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-yellow-500 text-xs uppercase tracking-wider">New Today</div>
                <div className="text-3xl font-bold mt-1 text-white">{stats.todayNew}</div>
                <div className="text-yellow-500 text-sm mt-1">Today</div>
              </div>
              <FaUserPlus className="text-3xl text-yellow-500/50" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20">
            <HighchartsReact highcharts={Highcharts} options={userChart} />
          </div>
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20">
            <HighchartsReact highcharts={Highcharts} options={registrationChart} />
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email or referral code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 pl-10 text-white focus:border-yellow-500 focus:outline-none transition-all"
              />
              <FaSearch className="absolute left-3 top-3.5 text-gray-500" />
            </div>
          </div>

          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All', count: stats.total },
              { value: 'active', label: 'Active', count: stats.active },
              { value: 'inactive', label: 'Inactive', count: stats.inactive },
              { value: 'frozen', label: 'Frozen', count: stats.frozen }
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${statusFilter === filter.value
                  ? 'bg-yellow-500 text-black shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>

          <button
            onClick={searchUsers}
            className="bg-yellow-500/20 hover:bg-yellow-500 text-yellow-500 hover:text-black px-6 py-2.5 rounded-xl transition-all duration-300 font-medium"
          >
            Search
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-yellow-500/20 overflow-hidden hover:border-yellow-500/50 transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1400px]">
              <thead className="bg-black/50">
                <tr className="border-b border-yellow-500/30">
                  {['#', 'Name', 'Email', 'Mobile', 'Referral Code', 'Wallet Address', 'Password', 'Level', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="p-4 text-yellow-500 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="p-8 text-center text-gray-400">
                      <FaUsers className="text-4xl mx-auto mb-2 opacity-30" />
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => {
                    const status = getStatusBadge(user);
                    return (
                      <tr key={user._id} className="border-b border-gray-800 hover:bg-yellow-500/5 transition-all duration-300 group">
                        <td className="p-4 text-gray-500 text-sm">{index + 1}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-white group-hover:text-yellow-400 transition-colors whitespace-nowrap">{user.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300 text-sm">{user.email || 'N/A'}</td>
                        <td className="p-4 text-gray-400 text-sm">{user.mobile || '—'}</td>
                        <td className="p-4">
                          <span className="text-xs font-mono text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">{user.referralCode || 'N/A'}</span>
                        </td>
                        <td className="p-4">
                          <code className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-1 rounded max-w-[480px] block truncate">{user.walletAddress || '—'}</code>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-mono text-gray-300 bg-gray-800 px-2 py-1 rounded">{user.password || '—'}</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-yellow-400 font-bold">{user.level || 1}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${status.color}`}>
                            {status.text === 'ACTIVE' ? <FaCheckCircle /> : status.text === 'FROZEN' ? <FaSnowflake /> : <FaPauseCircle />} {status.text}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400 text-sm whitespace-nowrap">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button onClick={() => openEditModal(user)} className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white p-2 rounded-lg transition-all" title="Edit">
                              <FaEdit />
                            </button>
                            {!user.isActive && !user.isFrozen && (
                              <button onClick={() => handleActivate(user._id)} disabled={actionLoading === user._id} className="bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white p-2 rounded-lg transition-all" title="Activate">
                                <FaToggleOn />
                              </button>
                            )}
                            {user.isActive && !user.isFrozen && (
                              <button onClick={() => handleDeactivate(user._id)} disabled={actionLoading === user._id} className="bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white p-2 rounded-lg transition-all" title="Deactivate">
                                <FaToggleOff />
                              </button>
                            )}
                            <button onClick={() => handleDelete(user._id)} disabled={actionLoading === user._id} className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white p-2 rounded-lg transition-all" title="Delete">
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 border-t border-gray-800 bg-black/30">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Showing {filteredUsers.length} of {users.length} users</span>
              <span>Total Balance: {stats.totalBalance.toFixed(2)} ETH</span>
            </div>
          </div>
        </div>

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-scaleIn">
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-black/50 p-2 -mt-2 rounded-lg">
                <h2 className="text-2xl font-bold text-yellow-500 flex items-center gap-2"><FaEdit /> Edit User</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white text-2xl">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Email</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Mobile</label>
                    <input
                      type="text"
                      value={editFormData.mobile}
                      onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Country</label>
                    <input
                      type="text"
                      value={editFormData.country}
                      onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-400 text-sm mb-1">Wallet Address</label>
                    <input
                      type="text"
                      value={editFormData.walletAddress}
                      onChange={(e) => setEditFormData({ ...editFormData, walletAddress: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono text-sm focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Current Plan</label>
                    <select
                      value={editFormData.currentPlan}
                      onChange={(e) => setEditFormData({ ...editFormData, currentPlan: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                    >
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Balance (ETH)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.balance}
                      onChange={(e) => setEditFormData({ ...editFormData, balance: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFormData.canTrade}
                        onChange={(e) => setEditFormData({ ...editFormData, canTrade: e.target.checked })}
                        className="w-4 h-4 accent-yellow-500"
                      />
                      <span className="text-gray-400 text-sm">Can Trade</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFormData.canWithdraw}
                        onChange={(e) => setEditFormData({ ...editFormData, canWithdraw: e.target.checked })}
                        className="w-4 h-4 accent-yellow-500"
                      />
                      <span className="text-gray-400 text-sm">Can Withdraw</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFormData.isFrozen}
                        onChange={(e) => setEditFormData({ ...editFormData, isFrozen: e.target.checked })}
                        className="w-4 h-4 accent-red-500"
                      />
                      <span className="text-red-400 text-sm">Frozen</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEdit(selectedUser._id)}
                    disabled={actionLoading === selectedUser._id}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white py-2.5 rounded-xl transition-all font-semibold"
                  >
                    {actionLoading === selectedUser._id ? 'Saving...' : <span className="flex items-center gap-2 justify-center"><FaSave /> Save Changes</span>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm border-t border-gray-800 pt-6">
          <p>© 2026 User Management System | SuperAdmin Dashboard</p>
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

export default UserManagement;