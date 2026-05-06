import React, { useState, useEffect } from 'react';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaPlay,
  FaSync,
  FaDatabase,
  FaServer,
  FaExclamationTriangle,
  FaInfoCircle,
  FaUser,
  FaWallet,
  FaCubes,
  FaNetworkWired,
  FaShieldAlt,
  FaCog
} from 'react-icons/fa';
import { buildApiUrl, getDefaultHeaders, API_ENDPOINTS } from '../config/api';
import Swal from 'sweetalert2';

export default function APITesting() {
  const [apiStatus, setApiStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Complete API list from backend flow documentation
  const API_CATEGORIES = {
    auth: {
      name: 'Authentication',
      icon: FaShieldAlt,
      color: 'blue',
      apis: [
        { key: 'USER_REGISTER', name: 'User Register', method: 'POST', requiresAuth: false },
        { key: 'USER_LOGIN', name: 'User Login', method: 'POST', requiresAuth: false },
        { key: 'GET_ALL_USERS', name: 'Get All Users', method: 'GET', requiresAuth: true },
        { key: 'DELETE_USER', name: 'Delete User', method: 'DELETE', requiresAuth: true }
      ]
    },
    admin: {
      name: 'Super Admin',
      icon: FaUser,
      color: 'purple',
      apis: [
        { key: 'ADMIN_LOGIN', name: 'Admin Login', method: 'POST', requiresAuth: false },
        { key: 'COMPANY_BALANCE', name: 'Company Balance', method: 'GET', requiresAuth: true },
        { key: 'COMPANY_TRANSACTIONS', name: 'Company Transactions', method: 'GET', requiresAuth: true },
        { key: 'DEMO_ADD_BALANCE', name: 'Demo Add Balance', method: 'POST', requiresAuth: true }
      ]
    },
    user: {
      name: 'User Management',
      icon: FaUser,
      color: 'emerald',
      apis: [
        { key: 'USER_PROFILE', name: 'User Profile', method: 'GET', requiresAuth: true },
        { key: 'USER_DASHBOARD', name: 'User Dashboard', method: 'GET', requiresAuth: true },
        { key: 'USER_TRANSACTIONS', name: 'User Transactions', method: 'GET', requiresAuth: true },
        { key: 'MLM_TREE', name: 'MLM Tree', method: 'GET', requiresAuth: true },
        { key: 'MLM_EARNINGS', name: 'MLM Earnings', method: 'GET', requiresAuth: true },
        { key: 'USER_TEAM', name: 'User Team', method: 'GET', requiresAuth: true }
      ]
    },
    wallet: {
      name: 'Wallet Operations',
      icon: FaWallet,
      color: 'amber',
      apis: [
        { key: 'ACTIVATE_WALLET', name: 'Activate Wallet', method: 'POST', requiresAuth: true },
        { key: 'GET_BALANCE', name: 'Get Balance', method: 'GET', requiresAuth: true },
        { key: 'WALLET_TRANSACTIONS', name: 'Wallet Transactions', method: 'GET', requiresAuth: true },
        { key: 'WITHDRAW_FUNDS', name: 'Withdraw Funds', method: 'POST', requiresAuth: true }
      ]
    },
    nft: {
      name: 'NFT System',
      icon: FaCubes,
      color: 'indigo',
      apis: [
        { key: 'NFT_INITIALIZE', name: 'Initialize NFT System', method: 'POST', requiresAuth: true },
        { key: 'NFT_STATUS', name: 'NFT Status', method: 'GET', requiresAuth: true },
        { key: 'NFT_MARKETPLACE', name: 'NFT Marketplace', method: 'GET', requiresAuth: true },
        { key: 'BUY_PRELAUNCH_NFT', name: 'Buy Pre-launch NFT', method: 'POST', requiresAuth: true },
        { key: 'BUY_TRADING_NFT', name: 'Buy Trading NFT', method: 'POST', requiresAuth: true },
        { key: 'SELL_NFT', name: 'Sell NFT', method: 'DELETE', requiresAuth: true },
        { key: 'MY_NFTS', name: 'My NFTs', method: 'GET', requiresAuth: true },
        { key: 'STAKE_NFT', name: 'Stake NFT', method: 'POST', requiresAuth: true },
        { key: 'BURN_NFT', name: 'Burn NFT', method: 'POST', requiresAuth: true },
        { key: 'LAUNCH_BLOCKCHAIN', name: 'Launch Blockchain', method: 'POST', requiresAuth: true }
      ]
    },
    package: {
      name: 'Package Management',
      icon: FaCog,
      color: 'pink',
      apis: [
        { key: 'PACKAGE_PLANS', name: 'Package Plans', method: 'GET', requiresAuth: true },
        { key: 'PACKAGE_UPGRADE', name: 'Package Upgrade', method: 'POST', requiresAuth: true },
        { key: 'PACKAGE_CURRENT', name: 'Current Package', method: 'GET', requiresAuth: true }
      ]
    },
    adminMgmt: {
      name: 'Admin Management',
      icon: FaNetworkWired,
      color: 'red',
      apis: [
        { key: 'ADMIN_DASHBOARD', name: 'Admin Dashboard', method: 'GET', requiresAuth: true },
        { key: 'ADMIN_USERS', name: 'Admin Users', method: 'GET', requiresAuth: true },
        { key: 'ADMIN_NFTS', name: 'Admin NFTs', method: 'GET', requiresAuth: true },
        { key: 'ADMIN_CREATE_BATCH', name: 'Create NFT Batch', method: 'POST', requiresAuth: true },
        { key: 'ADMIN_MLM_STATS', name: 'MLM Statistics', method: 'GET', requiresAuth: true }
      ]
    },
    mlm: {
      name: 'MLM System',
      icon: FaNetworkWired,
      color: 'teal',
      apis: [
        { key: 'MLM_STATS', name: 'MLM Stats', method: 'GET', requiresAuth: true },
        { key: 'MLM_EARNINGS', name: 'MLM Earnings', method: 'GET', requiresAuth: true }
      ]
    },
    system: {
      name: 'System Utils',
      icon: FaServer,
      color: 'gray',
      apis: [
        { key: 'SERVER_TEST', name: 'Server Test', method: 'GET', requiresAuth: false }
      ]
    }
  };

  const testAPI = async (apiKey, apiConfig) => {
    try {
      const url = buildApiUrl(API_ENDPOINTS[apiKey]);
      const headers = getDefaultHeaders(apiConfig.requiresAuth);

      let response;
      switch (apiConfig.method) {
        case 'GET':
          response = await fetch(url, { method: 'GET', headers });
          break;
        case 'POST':
          response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({}) // Empty body for testing
          });
          break;
        case 'DELETE':
          response = await fetch(url + '/test-id', { method: 'DELETE', headers });
          break;
        default:
          response = await fetch(url, { method: 'GET', headers });
      }

      const data = await response.json();

      return {
        success: response.ok,
        status: response.status,
        message: data.message || `${response.status} ${response.statusText}`,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        message: error.message,
        data: null
      };
    }
  };

  const testAllAPIs = async () => {
    setLoading(true);
    const results = {};

    // Get all APIs from all categories
    const allAPIs = Object.values(API_CATEGORIES).flatMap(category =>
      category.apis.map(api => ({ ...api, category: category.name }))
    );

    for (const api of allAPIs) {
      setApiStatus(prev => ({
        ...prev,
        [api.key]: { status: 'testing', message: 'Testing...', category: api.category }
      }));

      const result = await testAPI(api.key, api);

      setApiStatus(prev => ({
        ...prev,
        [api.key]: {
          ...result,
          category: api.category,
          method: api.method,
          requiresAuth: api.requiresAuth,
          name: api.name
        }
      }));

      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setLoading(false);

    // Show summary
    const totalAPIs = allAPIs.length;
    const workingAPIs = Object.values(results).filter(r => r.success).length;

    Swal.fire({
      title: 'API Testing Complete',
      html: `
        <div class="text-left">
          <p><strong>Total APIs:</strong> ${totalAPIs}</p>
          <p><strong>Working:</strong> ${workingAPIs}</p>
          <p><strong>Failed:</strong> ${totalAPIs - workingAPIs}</p>
          <p><strong>Success Rate:</strong> ${((workingAPIs / totalAPIs) * 100).toFixed(1)}%</p>
        </div>
      `,
      icon: workingAPIs > totalAPIs / 2 ? 'success' : 'warning',
      confirmButtonColor: '#3b82f6'
    });
  };

  const getStatusIcon = (status) => {
    if (status === 'testing') return <FaSpinner className="animate-spin text-blue-500" />;
    if (status?.success) return <FaCheckCircle className="text-emerald-500" />;
    return <FaTimesCircle className="text-red-500" />;
  };

  const getStatusColor = (status) => {
    if (status === 'testing') return 'border-blue-200 bg-blue-50';
    if (status?.success) return 'border-emerald-200 bg-emerald-50';
    return 'border-red-200 bg-red-50';
  };

  const filteredCategories = selectedCategory === 'all'
    ? Object.entries(API_CATEGORIES)
    : Object.entries(API_CATEGORIES).filter(([key]) => key === selectedCategory);

  const getOverallStats = () => {
    const allStatuses = Object.values(apiStatus);
    const total = allStatuses.length;
    const working = allStatuses.filter(s => s.success).length;
    const testing = allStatuses.filter(s => s.status === 'testing').length;
    const failed = total - working - testing;

    return { total, working, testing, failed };
  };

  const stats = getOverallStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              API Testing Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Complete backend API integration testing based on your flow documentation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="all">All Categories</option>
              {Object.entries(API_CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>{category.name}</option>
              ))}
            </select>
            <button
              onClick={testAllAPIs}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaPlay />}
              {loading ? 'Testing...' : 'Test All APIs'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total APIs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <FaDatabase className="text-2xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Working</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.working}</p>
            </div>
            <FaCheckCircle className="text-2xl text-emerald-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <FaTimesCircle className="text-2xl text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.total > 0 ? ((stats.working / stats.total) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <FaInfoCircle className="text-2xl text-blue-500" />
          </div>
        </div>
      </div>

      {/* API Categories */}
      {filteredCategories.map(([categoryKey, category]) => {
        const Icon = category.icon;
        return (
          <div key={categoryKey} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className={`p-6 border-b border-gray-200 dark:border-gray-700 bg-${category.color}-50 dark:bg-${category.color}-900/20`}>
              <div className="flex items-center gap-3">
                <Icon className={`text-2xl text-${category.color}-600`} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category.apis.length} APIs in this category
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {category.apis.map((api) => {
                  const status = apiStatus[api.key];
                  return (
                    <div
                      key={api.key}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${getStatusColor(status)}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(status)}
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {api.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {api.method} {API_ENDPOINTS[api.key]}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            api.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                            api.method === 'POST' ? 'bg-emerald-100 text-emerald-800' :
                            api.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {api.method}
                          </span>
                          {api.requiresAuth && (
                            <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                              AUTH
                            </span>
                          )}
                        </div>
                      </div>

                      {status && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Status:</span>
                            <span className={`font-medium ${
                              status.success ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              {status.status === 'testing' ? 'Testing...' :
                               status.success ? `Success (${status.status})` :
                               `Failed (${status.status})`}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Message:</span>
                            <p className="text-gray-900 dark:text-white mt-1 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">
                              {status.message}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {/* Implementation Guide */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <FaInfoCircle className="text-2xl text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Implementation Status
            </h3>
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p>• <strong>Frontend:</strong> 100% Ready - All components integrated</p>
              <p>• <strong>API Endpoints:</strong> All {Object.values(API_CATEGORIES).reduce((sum, cat) => sum + cat.apis.length, 0)} endpoints configured</p>
              <p>• <strong>Backend Status:</strong> {stats.working > 0 ? `${stats.working} APIs working` : 'Needs implementation'}</p>
              <p>• <strong>Next Step:</strong> Backend developer needs to implement the failing APIs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
