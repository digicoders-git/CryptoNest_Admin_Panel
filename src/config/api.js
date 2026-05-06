// API Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "https://api.gtnworld.live",
  VERSION: import.meta.env.VITE_API_VERSION || "api",
};

// Complete API Endpoints - Based on Backend Flow Documentation
export const API_ENDPOINTS = {
  // 🔐 Authentication APIs
  USER_REGISTER: "/auth/register",
  USER_LOGIN: "/auth/login",
  GET_ALL_USERS: "/auth/Getuser",
  DELETE_USER: "/auth/delete", // DELETE /auth/delete/:id

  // 🏢 SuperAdmin APIs
  ADMIN_REGISTER: "/SuperAdmin/register",
  ADMIN_LOGIN: "/auth/login",
  ADMIN_CHANGE_PASSWORD: "/SuperAdmin/change-password",
  COMPANY_BALANCE: "/admin/company-balance",
  COMPANY_TRANSACTIONS: "/admin/company-transactions",
  DEMO_ADD_BALANCE: "/admin/demo-add-balance",

  // 👤 User Management APIs
  USER_PROFILE: "/user/profile",
  USER_DASHBOARD: "/user/dashboard",
  USER_TRANSACTIONS: "/user/transactions",
  MLM_TREE: "/user/mlm-tree",
  MLM_EARNINGS: "/user/mlm-earnings",
  USER_TEAM: "/user/team",

  // 💰 Wallet Operations APIs
  ACTIVATE_WALLET: "/wallet/activate",
  GET_BALANCE: "/wallet/balance",
  WALLET_TRANSACTIONS: "/wallet/transactions",
  WITHDRAW_FUNDS: "/wallet/withdraw",

  // 🎨 NFT System APIs
  NFT_INITIALIZE: "/nft/initialize",
  NFT_STATUS: "/nft/status",
  NFT_MARKETPLACE: "/nft/marketplace",
  BUY_PRELAUNCH_NFT: "/nft/buy-prelaunch",
  BUY_TRADING_NFT: "/nft/buy-trading",
  SELL_NFT: "/nft/sell", // DELETE /nft/sell/:id
  MY_NFTS: "/nft/my-nfts",
  STAKE_NFT: "/nft/stake",
  BURN_NFT: "/nft/burn",
  LAUNCH_BLOCKCHAIN: "/nft/launch-blockchain",

  // 📦 Package Management APIs
  PACKAGE_PLANS: "/package/plans",
  PACKAGE_UPGRADE: "/package/upgrade",
  PACKAGE_CURRENT: "/package/current",

  // ⚙️ Admin Management APIs
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USERS: "/admin/users",
  ADMIN_FREEZE_USER: "/admin/users", // PATCH /admin/users/:id/freeze
  ADMIN_TRADING_CONTROL: "/admin/users", // PATCH /admin/users/:id/trading
  ADMIN_WITHDRAWAL_CONTROL: "/admin/users", // PATCH /admin/users/:id/withdrawal
  ADMIN_NFTS: "/admin/nfts",
  ADMIN_USER_NFTS: "/admin/user", // GET /admin/user/:id/nfts
  ADMIN_CREATE_BATCH: "/admin/nft-batch",
  ADMIN_UNLOCK_BATCH: "/admin/nft-batch", // PATCH /admin/nft-batch/:id/unlock
  ADMIN_MLM_STATS: "/admin/mlm-stats",

  // 🔄 MLM System APIs
  MLM_STATS: "/mlm/stats",
  MLM_EARNINGS: "/mlm/earnings",

  // 🔧 System Utils
  SERVER_TEST: "/test",
};

// Build complete API URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}${endpoint}`;
};

// Get auth token with fallback
export const getAuthToken = () => {
  return (
    localStorage.getItem("superAdminToken") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
};

// Default headers with better error handling
export const getDefaultHeaders = (includeAuth = true) => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No authentication token found");
    }
  }

  return headers;
};

export default API_CONFIG;
