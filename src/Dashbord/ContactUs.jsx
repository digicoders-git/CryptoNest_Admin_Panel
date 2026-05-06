import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Swal from 'sweetalert2';
import { FaClipboardList, FaUserPlus, FaCalendarWeek, FaCalendarAlt, FaChartLine, FaEdit, FaTrash, FaSearch, FaTimes, FaEye } from 'react-icons/fa';

const ContactManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    todayNew: 0,
    thisWeek: 0,
    thisMonth: 0,
    lastMonth: 0
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: ''
  });

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch all contacts
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}api/contacts`);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.success) {
        const contactData = result.data || [];
        setContacts(contactData);
        calculateStats(contactData);
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
  const calculateStats = (contactList) => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const newStats = {
      total: contactList.length,
      todayNew: contactList.filter(c => c.createdAt?.split('T')[0] === today).length,
      thisWeek: contactList.filter(c => new Date(c.createdAt) >= weekAgo).length,
      thisMonth: contactList.filter(c => new Date(c.createdAt) >= monthAgo).length,
      lastMonth: contactList.filter(c => {
        const date = new Date(c.createdAt);
        return date >= twoMonthsAgo && date < monthAgo;
      }).length
    };
    setStats(newStats);
  };

  // Create contact
  const handleCreate = async () => {
    try {
      const response = await fetch(`${API_URL}api/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({ icon: 'success', title: 'Created!', text: 'Contact created successfully', background: '#000', color: '#D4AF37', confirmButtonColor: '#D4AF37' });
        setShowModal(false);
        resetForm();
        fetchContacts();
      } else {
        throw new Error(result.message || 'Creation failed');
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, background: '#000', color: '#D4AF37', confirmButtonColor: '#D4AF37' });
    }
  };

  // Update contact
  const handleUpdate = async () => {
    try {
      const response = await fetch(`${API_URL}api/contacts/${selectedContact._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Contact updated successfully', background: '#000', color: '#D4AF37', confirmButtonColor: '#D4AF37' });
        setShowModal(false);
        resetForm();
        fetchContacts();
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, background: '#000', color: '#D4AF37', confirmButtonColor: '#D4AF37' });
    }
  };

  // Delete contact
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      icon: 'warning', title: 'Are you sure?', text: 'This contact will be permanently deleted!',
      showCancelButton: true, confirmButtonText: 'Yes, Delete', cancelButtonText: 'Cancel',
      background: '#000', color: '#D4AF37', confirmButtonColor: '#e53e3e', cancelButtonColor: '#D4AF37'
    });
    if (!confirm.isConfirmed) return;
    try {
      const response = await fetch(`${API_URL}api/contacts/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Contact deleted successfully', background: '#000', color: '#D4AF37', confirmButtonColor: '#D4AF37' });
        fetchContacts();
      } else {
        throw new Error(result.message || 'Deletion failed');
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, background: '#000', color: '#D4AF37', confirmButtonColor: '#D4AF37' });
    }
  };

  // Open edit modal
  const openEditModal = (contact) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      description: contact.description || ''
    });
    setModalType('edit');
    setShowModal(true);
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    setModalType('create');
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      description: ''
    });
    setSelectedContact(null);
  };

  // Filter contacts by search
  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone?.includes(searchTerm) ||
    contact.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchContacts();
  }, []);

  // Highcharts Configurations
  const monthlyTrendsChart = {
    chart: { type: 'column', backgroundColor: 'transparent', options3d: { enabled: true, alpha: 15, beta: 15 } },
    title: { text: '📊 Contact Trends', style: { color: '#FFD700', fontSize: '18px', fontWeight: 'bold' } },
    xAxis: {
      categories: ['Last Month', 'This Month', 'This Week', 'Today'],
      labels: { style: { color: '#FFD700', fontWeight: 'bold' } }
    },
    yAxis: {
      title: { text: 'Number of Contacts', style: { color: '#FFD700' } },
      labels: { style: { color: '#FFD700' } },
      gridLineColor: '#333'
    },
    plotOptions: {
      column: {
        dataLabels: { enabled: true, format: '{y}', style: { color: '#FFD700', fontWeight: 'bold' } }
      }
    },
    series: [{
      name: 'Contacts',
      data: [stats.lastMonth, stats.thisMonth, stats.thisWeek, stats.todayNew],
      color: '#FFD700'
    }]
  };

  const distributionChart = {
    chart: { type: 'pie', backgroundColor: 'transparent', options3d: { enabled: true, alpha: 45 } },
    title: { text: '📈 Contact Distribution (Last 30 Days)', style: { color: '#FFD700', fontSize: '18px', fontWeight: 'bold' } },
    plotOptions: {
      pie: {
        innerSize: '60%',
        allowPointSelect: true,
        dataLabels: { enabled: true, format: '{point.name}: {point.percentage:.1f}%', style: { color: '#FFD700' } }
      }
    },
    series: [{
      name: 'Contacts',
      data: [
        { name: 'This Week', y: stats.thisWeek, color: '#FFD700' },
        { name: 'Earlier This Month', y: stats.thisMonth - stats.thisWeek, color: '#FFA500' },
        { name: 'Last Month', y: stats.lastMonth, color: '#DC143C' }
      ]
    }]
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <div className="text-yellow-500 text-2xl font-semibold">Loading Contacts...</div>
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
                Contact Management
              </h1>
              <p className="text-gray-400 mt-2">Manage all contact inquiries from users</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-yellow-500 text-xs uppercase tracking-wider">Total Contacts</div>
                <div className="text-3xl font-bold mt-1 text-white">{stats.total}</div>
                <div className="text-yellow-500 text-sm mt-1">All Time</div>
              </div>
              <FaClipboardList className="text-3xl text-yellow-500/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-green-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-green-400 text-xs uppercase tracking-wider">Today</div>
                <div className="text-3xl font-bold mt-1 text-white">{stats.todayNew}</div>
                <div className="text-green-400 text-sm mt-1">New Today</div>
              </div>
              <FaUserPlus className="text-3xl text-green-400/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-blue-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-blue-400 text-xs uppercase tracking-wider">This Week</div>
                <div className="text-3xl font-bold mt-1 text-white">{stats.thisWeek}</div>
                <div className="text-blue-400 text-sm mt-1">Last 7 Days</div>
              </div>
              <FaCalendarWeek className="text-3xl text-blue-400/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-purple-400 text-xs uppercase tracking-wider">This Month</div>
                <div className="text-3xl font-bold mt-1 text-white">{stats.thisMonth}</div>
                <div className="text-purple-400 text-sm mt-1">Last 30 Days</div>
              </div>
              <FaCalendarAlt className="text-3xl text-purple-400/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/30 rounded-2xl p-5 hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-orange-400 text-xs uppercase tracking-wider">Last Month</div>
                <div className="text-3xl font-bold mt-1 text-white">{stats.lastMonth}</div>
                <div className="text-orange-400 text-sm mt-1">Previous Month</div>
              </div>
              <FaChartLine className="text-3xl text-orange-400/50" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300">
            <HighchartsReact highcharts={Highcharts} options={monthlyTrendsChart} />
          </div>
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300">
            <HighchartsReact highcharts={Highcharts} options={distributionChart} />
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="🔍 Search by name, email, phone or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pl-10 text-white focus:border-yellow-500 focus:outline-none transition-all"
            />
              <FaSearch className="absolute left-3 top-3.5 text-gray-500" />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-3.5 text-gray-500 hover:text-white"><FaTimes /></button>
            )}
          </div>
        </div>

        {/* Contacts Table */}
        <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-yellow-500/20 overflow-hidden hover:border-yellow-500/50 transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black/50">
                <tr className="border-b border-yellow-500/30">
                  <th className="p-4 text-yellow-500 font-semibold">#</th>
                  <th className="p-4 text-yellow-500 font-semibold">Name</th>
                  <th className="p-4 text-yellow-500 font-semibold">Contact Info</th>
                  <th className="p-4 text-yellow-500 font-semibold">Phone</th>
                  <th className="p-4 text-yellow-500 font-semibold">Description</th>
                  <th className="p-4 text-yellow-500 font-semibold">Date</th>
                  <th className="p-4 text-yellow-500 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-400">
                      <div className="text-4xl mb-2">📭</div>
                      No contacts found
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact, index) => (
                    <tr key={contact._id} className="border-b border-gray-800 hover:bg-yellow-500/5 transition-all duration-300 group">
                      <td className="p-4 text-gray-500 text-sm">{index + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-black font-bold">
                            {contact.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white group-hover:text-yellow-400 transition-colors">
                              {contact.name || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-300">{contact.email || 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-400 font-mono text-sm">{contact.phone || 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-400 max-w-xs truncate" title={contact.description}>
                          {contact.description || 'No description'}
                        </div>
                      </td>
                      <td className="p-4 text-gray-400 text-sm">
                        {new Date(contact.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => Swal.fire({
                              title: `<div style="color:#F3C06A;font-weight:800;">${contact.name}</div>`,
                              html: `
                                <div style="text-align:left;color:#fff;">
                                  <p style="margin:8px 0;"><span style="color:#D4AF37;font-weight:600;">📧 Email:</span> ${contact.email || 'N/A'}</p>
                                  <p style="margin:8px 0;"><span style="color:#D4AF37;font-weight:600;">📞 Phone:</span> ${contact.phone || 'N/A'}</p>
                                  <p style="margin:8px 0;"><span style="color:#D4AF37;font-weight:600;">📅 Date:</span> ${new Date(contact.createdAt).toLocaleString('en-IN')}</p>
                                  <div style="margin-top:12px;padding:12px;background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.2);border-radius:10px;">
                                    <p style="color:#D4AF37;font-weight:600;margin-bottom:6px;">💬 Message:</p>
                                    <p style="color:#ccc;line-height:1.6;">${contact.description || 'No message'}</p>
                                  </div>
                                </div>
                              `,
                              background: '#000',
                              color: '#fff',
                              confirmButtonColor: '#D4AF37',
                              confirmButtonText: 'Close',
                              width: 500,
                            })}
                            className="bg-yellow-600/20 hover:bg-yellow-600 text-yellow-400 hover:text-white p-2 rounded-lg transition-all"
                            title="View"
                          >
                            <FaEye />
                          </button>
                          <button onClick={() => openEditModal(contact)} className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white p-2 rounded-lg transition-all" title="Edit"><FaEdit /></button>
                          <button onClick={() => handleDelete(contact._id)} className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white p-2 rounded-lg transition-all" title="Delete"><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 border-t border-gray-800 bg-black/30">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Showing {filteredContacts.length} of {contacts.length} contacts</span>
              <span>Last updated: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 max-w-lg w-full mx-4 animate-scaleIn">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-yellow-500">
                  {modalType === 'create' ? '➕ Create New Contact' : '✏️ Edit Contact'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Description / Message</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter description or message..."
                    rows="4"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={modalType === 'create' ? handleCreate : handleUpdate}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white py-2.5 rounded-xl transition-all duration-300 font-semibold"
                  >
                    {modalType === 'create' ? '✨ Create Contact' : '💾 Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm border-t border-gray-800 pt-6">
          <p>© 2026 Contact Management System | Admin Dashboard</p>
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

export default ContactManagement;