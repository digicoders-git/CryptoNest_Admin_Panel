import { useState, useEffect } from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
  FaBell, FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff,
  FaSync, FaBullhorn, FaInfoCircle, FaExclamationTriangle,
  FaCheckCircle, FaUser, FaChartPie, FaChartLine, FaClock,
  FaSignal, FaBroadcastTower, FaSpinner, FaTimes
} from "react-icons/fa";
import Swal from "sweetalert2";

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'https://cryptonest-backend.onrender.com').replace(/\/+$/, '').replace(/\/api$/, '') + '/api/';

// Rich Text Editor Configuration
const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['clean']
  ],
};

const QUILL_FORMATS = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
  'color', 'background',
  'script',
  'list', 'bullet', 'indent',
  'align',
  'link', 'image', 'video'
];

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: "🎷 Official Notification 🎷",
    message: "",
    type: "announcement",
    priority: 1,
  });

  useEffect(() => {
    fetchAllNotifications();
  }, []);

  const getAuthToken = () => localStorage.getItem("token") || localStorage.getItem("superAdminToken");

  const fetchAllNotifications = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${API_URL}notifications/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        setNotifications(result.data);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Sync Failed",
        text: "Failed to retrieve system transmissions.",
        background: "#1a1a2e",
        color: "#D4AF37",
        confirmButtonColor: "#D4AF37"
      });
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async () => {
    if (!formData.message.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Input Required",
        text: "Broadcast message cannot be empty.",
        background: "#1a1a2e",
        color: "#D4AF37",
        confirmButtonColor: "#D4AF37"
      });
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}notifications/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Broadcast Initialized",
          text: "Notification deployed to the network.",
          timer: 2000,
          background: "#1a1a2e",
          color: "#D4AF37",
          confirmButtonColor: "#D4AF37"
        });
        setShowModal(false);
        resetForm();
        fetchAllNotifications();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Deployment Failed",
        text: error.message,
        background: "#1a1a2e",
        color: "#D4AF37"
      });
    }
  };

  const updateNotification = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}notifications/update/${currentNotification._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Transmission Updated",
          text: "Notification parameters synchronized.",
          timer: 2000,
          background: "#1a1a2e",
          color: "#D4AF37",
          confirmButtonColor: "#D4AF37"
        });
        setShowModal(false);
        setEditMode(false);
        resetForm();
        fetchAllNotifications();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Update Failed", text: error.message, background: "#1a1a2e", color: "#D4AF37" });
    }
  };

  const deleteNotification = async (id) => {
    const confirm = await Swal.fire({
      title: "Terminate Broadcast?",
      text: "This transmission will be permanently erased from the network.",
      icon: "warning",
      showCancelButton: true,
      background: "#1a1a2e",
      color: "#D4AF37",
      confirmButtonColor: "#D4AF37",
      cancelButtonColor: "#334155",
      confirmButtonText: "Yes, Terminate",
    });

    if (confirm.isConfirmed) {
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}notifications/delete/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();

        if (result.success) {
          Swal.fire({ icon: "success", title: "Terminated", text: "Notification successfully erased.", timer: 2000, background: "#1a1a2e", color: "#D4AF37" });
          fetchAllNotifications();
        }
      } catch (error) {
        Swal.fire({ icon: "error", title: "Operation Failed", text: "Failed to erase transmission.", background: "#1a1a2e", color: "#D4AF37" });
      }
    }
  };

  const toggleNotification = async (id) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}notifications/toggle/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Status Toggled",
          text: result.message,
          timer: 1500,
          showConfirmButton: false,
          background: "#1a1a2e",
          color: "#D4AF37"
        });
        fetchAllNotifications();
      } else {
        throw new Error(result.message || "Failed to toggle notification status.");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Toggle Failed",
        text: error.message || "Failed to toggle notification.",
        background: "#1a1a2e",
        color: "#D4AF37"
      });
    }
  };

  const openEditModal = (notification) => {
    setEditMode(true);
    setCurrentNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "🎷 Official Notification 🎷",
      message: "",
      type: "announcement",
      priority: 1,
    });
    setCurrentNotification(null);
    setEditMode(false);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'announcement': return <FaBullhorn className="text-purple-400" />;
      case 'info': return <FaInfoCircle className="text-blue-400" />;
      case 'warning': return <FaExclamationTriangle className="text-amber-400" />;
      case 'success': return <FaCheckCircle className="text-emerald-400" />;
      default: return <FaBell className="text-[#D4AF37]" />;
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      announcement: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    };
    return colors[type] || colors.announcement;
  };

  // Calculate statistics for charts
  const getStats = () => {
    const total = notifications.length;
    const active = notifications.filter(n => n.isActive).length;
    const inactive = total - active;
    const byType = {
      announcement: notifications.filter(n => n.type === 'announcement').length,
      info: notifications.filter(n => n.type === 'info').length,
      warning: notifications.filter(n => n.type === 'warning').length,
      success: notifications.filter(n => n.type === 'success').length,
    };
    return { total, active, inactive, byType };
  };

  const stats = getStats();

  // Highcharts - Status Distribution Chart
  const statusChart = {
    chart: { type: 'pie', backgroundColor: 'transparent', options3d: { enabled: true, alpha: 45 } },
    title: { text: '📊 Notification Status', style: { color: '#D4AF37', fontSize: '14px', fontWeight: 'bold' } },
    plotOptions: {
      pie: {
        innerSize: '60%',
        allowPointSelect: true,
        dataLabels: { enabled: true, format: '{point.name}: {point.percentage:.1f}%', style: { color: '#D4AF37', fontSize: '10px' } }
      }
    },
    series: [{
      name: 'Status',
      data: [
        { name: 'Active', y: stats.active, color: '#22C55E' },
        { name: 'Inactive', y: stats.inactive, color: '#EF4444' }
      ]
    }]
  };

  // Highcharts - Type Distribution Chart
  const typeChart = {
    chart: { type: 'column', backgroundColor: 'transparent', options3d: { enabled: true, alpha: 15, beta: 15 } },
    title: { text: '📋 Notification Types', style: { color: '#D4AF37', fontSize: '14px', fontWeight: 'bold' } },
    xAxis: {
      categories: ['Announcement', 'Info', 'Warning', 'Success'],
      labels: { style: { color: '#D4AF37', rotation: -45 } }
    },
    yAxis: {
      title: { text: 'Count', style: { color: '#D4AF37' } },
      labels: { style: { color: '#D4AF37' } },
      gridLineColor: '#333'
    },
    plotOptions: {
      column: {
        dataLabels: { enabled: true, format: '{y}', style: { color: '#D4AF37' } },
        colorByPoint: true,
        colors: ['#8B5CF6', '#3B82F6', '#F59E0B', '#10B981']
      }
    },
    series: [{
      name: 'Notifications',
      data: [stats.byType.announcement, stats.byType.info, stats.byType.warning, stats.byType.success]
    }]
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 border-4 border-yellow-500/10 rounded-full"></div>
            <div className="w-24 h-24 border-4 border-transparent border-t-yellow-500 border-r-yellow-600 rounded-full animate-spin absolute"></div>
            <FaBell className="text-yellow-500 text-3xl animate-pulse absolute" />
          </div>
          <p className="text-xl font-bold text-yellow-500 tracking-wider animate-pulse uppercase">Syncing Broadcasts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="p-6 lg:p-8">

        {/* Header */}
        <div className="border-b border-yellow-500/30 pb-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-xl lg:text-3xl font-semibold bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent flex items-center gap-3">
                Notification Management
              </h1>
              <p className="text-gray-400 text-sm mt-2">Manage network-wide announcements & telemetry alerts</p>
            </div>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg"
            >
              <FaPlus /> Deploy Broadcast
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="group bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-yellow-500 text-xs uppercase tracking-wider">Total Transmissions</div>
                <div className="text-3xl font-bold mt-1 text-white">{stats.total}</div>
                <div className="text-gray-400 text-xs mt-1">All Time</div>
              </div>
              <FaBell className="text-3xl text-yellow-500/50" />
            </div>
            <div className="mt-3 h-1 bg-yellow-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-gray-900 to-black border border-green-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-green-400 text-xs uppercase tracking-wider">Active Signals</div>
                <div className="text-3xl font-bold mt-1 text-white">{stats.active}</div>
                <div className="text-green-400 text-xs mt-1">{stats.total ? `${((stats.active / stats.total) * 100).toFixed(1)}%` : '0%'} Active</div>
              </div>
              <FaSignal className="text-3xl text-green-500/50" />
            </div>
            <div className="mt-3 h-1 bg-green-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: stats.total ? `${(stats.active / stats.total) * 100}%` : '0%' }}></div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-gray-900 to-black border border-red-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-red-400 text-xs uppercase tracking-wider">Inactive Signals</div>
                <div className="text-3xl font-bold mt-1 text-white">{stats.inactive}</div>
                <div className="text-red-400 text-xs mt-1">Dormant</div>
              </div>
              <FaBell className="text-3xl text-red-500/50" />
            </div>
            <div className="mt-3 h-1 bg-red-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: stats.total ? `${(stats.inactive / stats.total) * 100}%` : '0%' }}></div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-purple-400 text-xs uppercase tracking-wider">Announcements</div>
                <div className="text-3xl font-bold mt-1 text-white">{stats.byType.announcement}</div>
                <div className="text-purple-400 text-xs mt-1">Broadcasts</div>
              </div>
              <FaBullhorn className="text-3xl text-purple-500/50" />
            </div>
            <div className="mt-3 h-1 bg-purple-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: stats.total ? `${(stats.byType.announcement / stats.total) * 100}%` : '0%' }}></div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {notifications.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300">
              <HighchartsReact highcharts={Highcharts} options={statusChart} />
            </div>
            <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300">
              <HighchartsReact highcharts={Highcharts} options={typeChart} />
            </div>
          </div>
        )}

        {/* Notification Feed */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-yellow-500/20 p-16 text-center">
              <FaBullhorn className="text-6xl text-yellow-500/20 mx-auto mb-4" />
              <h3 className="text-xl text-yellow-500 font-semibold">Silent Network</h3>
              <p className="text-gray-500 text-sm mt-1">No active transmissions detected on the global frequency.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className="group bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl p-6 hover:border-yellow-500/40 hover:scale-[1.01] transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                  <div className="flex-1 space-y-4">
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="p-2.5 bg-gray-800/50 rounded-xl">
                        {getTypeIcon(notification.type)}
                      </div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors">
                        {notification.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 ml-auto lg:ml-0">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                        <span className="px-3 py-1 bg-gray-800/50 border border-gray-700 text-gray-400 rounded-lg text-[10px] font-bold">
                          P{notification.priority}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${notification.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"}`}>
                          {notification.isActive ? "● Live" : "○ Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* Message */}
                    <div 
                      className="text-gray-400 text-sm leading-relaxed quill-content" 
                      dangerouslySetInnerHTML={{ __html: notification.message }}
                    />

                    {/* Footer Meta */}
                    <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-800 text-[10px] text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <FaClock className="text-yellow-500/40" />
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                      {notification.createdBy && (
                        <div className="flex items-center gap-1.5">
                          <FaUser className="text-yellow-500/40" />
                          Admin: {notification.createdBy.name || notification.createdBy.email}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleNotification(notification._id)}
                      className={`p-3 rounded-xl transition-all hover:scale-105 active:scale-95 ${notification.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-gray-800/50 text-gray-500 border border-gray-700"
                        }`}
                      title={notification.isActive ? "Deactivate" : "Activate"}
                    >
                      {notification.isActive ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                    </button>
                    <button
                      onClick={() => openEditModal(notification)}
                      className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 hover:scale-105 transition-all"
                      title="Edit"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="p-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 hover:scale-105 transition-all"
                      title="Delete"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
              <div className="sticky top-0 bg-black/50 p-5 border-b border-yellow-500/20 flex justify-between items-center">
                <h2 className="text-xl font-bold text-yellow-500">
                  {editMode ? "Modify Configuration" : "New Transmission"}
                </h2>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-white">
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Broadcast Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                  />
                </div>
                <div className="quill-dark">
                  <label className="block text-gray-400 text-xs mb-1">Message</label>
                  <ReactQuill 
                    theme="snow"
                    value={formData.message}
                    onChange={(content) => setFormData({ ...formData, message: content })}
                    modules={QUILL_MODULES}
                    formats={QUILL_FORMATS}
                    className="bg-gray-800 text-white rounded-xl border border-gray-700 focus-within:border-yellow-500 overflow-hidden"
                    placeholder="Enter broadcast content..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Signal Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                    >
                      <option value="announcement">📢 Announcement</option>
                      <option value="info">ℹ️ Information</option>
                      <option value="warning">⚠️ Priority Alert</option>
                      <option value="success">✅ Success Signal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Priority (1-10)</label>
                    <input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      min="1"
                      max="10"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-800 flex gap-3 justify-end">
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={editMode ? updateNotification : createNotification}
                  className="px-8 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-xl transition-all"
                >
                  {editMode ? "Sync Changes" : "Deploy Broadcast"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-xs border-t border-gray-800 pt-6">
          <p>© 2026 Notification Management System | Global Broadcast Network</p>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        /* Quill Dark Mode Overrides */
        .quill-dark .ql-toolbar {
          background-color: #1f2937;
          border-color: #374151;
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
        }
        .quill-dark .ql-toolbar .ql-stroke {
          stroke: #d1d5db;
        }
        .quill-dark .ql-toolbar .ql-fill {
          fill: #d1d5db;
        }
        .quill-dark .ql-toolbar .ql-picker {
          color: #d1d5db;
        }
        .quill-dark .ql-container {
          border-color: #374151;
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          min-height: 400px;
          font-size: 0.875rem;
        }
        .quill-dark .ql-editor {
          min-height: 400px;
        }
        /* Feed Content Styling */
        .quill-content h1, .quill-content h2, .quill-content h3 {
          color: #f3f4f6;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          font-weight: 600;
        }
        .quill-content a {
          color: #eab308;
          text-decoration: underline;
        }
        .quill-content p {
          margin-bottom: 0.5em;
        }
        .quill-content ul {
          list-style-type: disc;
          padding-left: 1.5em;
          margin-bottom: 0.5em;
        }
        .quill-content ol {
          list-style-type: decimal;
          padding-left: 1.5em;
          margin-bottom: 0.5em;
        }
      `}</style>
    </div>
  );
}