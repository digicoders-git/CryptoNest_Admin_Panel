# 🎯 Admin Panel UI - API Integration Guide

## 📊 **UI Pages aur Unke APIs**

---

## 1️⃣ **Overview/Dashboard Page**

### APIs Needed:

```javascript
// GET Dashboard Stats
GET /api/admin/dashboard

Response: {
  totalUsers: 100,
  activeUsers: 80,
  totalNFTs: 250,
  totalTransactions: 500,
  totalEarnings: 5000,
  todayIncome: 120,
  weekIncome: 840,
  monthIncome: 3600
}
```

### Frontend Integration:

```javascript
// Dashboard.jsx
import axios from "axios";

const fetchDashboardStats = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    "https://api.gtnworld.live/api/admin/dashboard",
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  setStats(response.data.data);
};
```

---

## 2️⃣ **User Management Page**

### APIs Needed:

```javascript
// 1. Get All Users
GET /api/auth/Getuser  ✅ (Already Working)

// 2. Delete User
DELETE /api/auth/delete/:userId  ✅ (Already Working)

// 3. Freeze/Unfreeze User
PATCH /api/admin/users/:userId/freeze

Request: { isFrozen: true }

// 4. Control Trading
PATCH /api/admin/users/:userId/trading

Request: { canTrade: false }

// 5. Control Withdrawal
PATCH /api/admin/users/:userId/withdrawal

Request: { canWithdraw: false }
```

### Frontend Integration:

```javascript
// UserManagement.jsx - Already has getUsers and deleteUser ✅

// Add these functions:

const freezeUser = async (userId, isFrozen) => {
  const token = localStorage.getItem("token");
  await axios.patch(
    `https://api.gtnworld.live/api/admin/users/${userId}/freeze`,
    { isFrozen },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  fetchUsers(); // Refresh list
};

const toggleTrading = async (userId, canTrade) => {
  const token = localStorage.getItem("token");
  await axios.patch(
    `https://api.gtnworld.live/api/admin/users/${userId}/trading`,
    { canTrade },
    { headers: { Authorization: `Bearer ${token}` } },
  );
};

const toggleWithdrawal = async (userId, canWithdraw) => {
  const token = localStorage.getItem("token");
  await axios.patch(
    `https://api.gtnworld.live/api/admin/users/${userId}/withdrawal`,
    { canWithdraw },
    { headers: { Authorization: `Bearer ${token}` } },
  );
};
```

---

## 3️⃣ **Multi-Parent Control Page**

### APIs Needed:

```javascript
// 1. Get All Users with Parents
GET /api/user/mlm-tree

Response: {
  tree: {
    user: { name, referralCode },
    directReferrals: [
      { name, email, isActive, teamMembers: [] }
    ]
  }
}

// 2. Get User's Team
GET /api/user/team

Response: {
  teamMembers: [
    { name, email, isActive, createdAt }
  ]
}
```

### Frontend Integration:

```javascript
// MultiParentControl.jsx

const fetchUsersWithParents = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    "https://api.gtnworld.live/api/user/mlm-tree",
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  setUsers(response.data.tree.directReferrals);
};
```

---

## 4️⃣ **Root Wallet Page**

### APIs Needed:

```javascript
// 1. Get Wallet Balance
GET /api/wallet/balance

Response: {
  balance: 10,
  totalEarnings: 5,
  isActive: true
}

// 2. Get Transactions
GET /api/user/transactions

Response: {
  transactions: [
    {
      type: 'activation',
      amount: 10,
      status: 'completed',
      description: 'Account activation',
      createdAt: '2024-01-15'
    }
  ]
}
```

### Frontend Integration:

```javascript
// RootWallet.jsx

const fetchWalletData = async () => {
  const token = localStorage.getItem("token");

  // Get balance
  const balanceRes = await axios.get(
    "https://api.gtnworld.live/api/wallet/balance",
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  // Get transactions
  const txRes = await axios.get(
    "https://api.gtnworld.live/api/user/transactions",
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  setBalance(balanceRes.data.balance);
  setTransactions(txRes.data.transactions);
};
```

---

## 5️⃣ **Registration Report Page**

### APIs Needed:

```javascript
// Get User Dashboard Stats
GET /api/user/dashboard

Response: {
  stats: {
    balance: 10,
    totalEarnings: 5,
    teamSize: 3,
    activeTeamMembers: 2,
    totalTransactions: 10,
    recentTransactions: [],
    nftCount: 2
  }
}
```

### Frontend Integration:

```javascript
// RegistrationReport.jsx

const fetchRegistrationData = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    "https://api.gtnworld.live/api/user/dashboard",
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  setReportData(response.data.stats);
};
```

---

## 6️⃣ **Analytics Page**

### APIs Needed:

```javascript
// Get MLM Earnings
GET /api/user/mlm-earnings

Response: {
  earnings: [
    { level: 1, amount: 5, count: 5 },
    { level: 2, amount: 3, count: 3 }
  ],
  stats: {
    totalReferrals: 5,
    activeReferrals: 4,
    totalEarnings: 9,
    missedEarnings: 2
  }
}
```

### Frontend Integration:

```javascript
// Analytics.jsx

const fetchAnalytics = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    "https://api.gtnworld.live/api/user/mlm-earnings",
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  setEarnings(response.data.earnings);
  setStats(response.data.stats);
};
```

---

## 7️⃣ **Security Control Page**

### APIs Needed:

```javascript
// Get All Users (for monitoring)
GET /api/auth/Getuser  ✅ (Already Working)

// Freeze User
PATCH /api/admin/users/:userId/freeze
```

---

## 8️⃣ **System Settings Page**

### APIs Needed:

```javascript
// Get Current Package
GET /api/package/current

Response: {
  currentPlan: 'basic',
  planLimits: {
    dailyLimit: 100,
    totalLimit: 1000
  }
}

// Get All Plans
GET /api/package/plans

Response: {
  plans: {
    basic: { amount: 10, dailyLimit: 100 },
    plan25: { amount: 25, dailyLimit: 250 }
  }
}
```

---

## 📝 **Complete API Mapping Table**

| UI Page                 | API Endpoint                          | Method | Status | Purpose            |
| ----------------------- | ------------------------------------- | ------ | ------ | ------------------ |
| **Dashboard**           | `/api/admin/dashboard`                | GET    | ❌     | Stats overview     |
| **User Management**     | `/api/auth/Getuser`                   | GET    | ✅     | Get all users      |
| **User Management**     | `/api/auth/delete/:userId`            | DELETE | ✅     | Delete user        |
| **User Management**     | `/api/admin/users/:userId/freeze`     | PATCH  | ❌     | Freeze user        |
| **User Management**     | `/api/admin/users/:userId/trading`    | PATCH  | ❌     | Control trading    |
| **User Management**     | `/api/admin/users/:userId/withdrawal` | PATCH  | ❌     | Control withdrawal |
| **Multi-Parent**        | `/api/user/mlm-tree`                  | GET    | ✅     | Get MLM tree       |
| **Multi-Parent**        | `/api/user/team`                      | GET    | ✅     | Get team members   |
| **Root Wallet**         | `/api/wallet/balance`                 | GET    | ✅     | Get balance        |
| **Root Wallet**         | `/api/user/transactions`              | GET    | ✅     | Get transactions   |
| **Registration Report** | `/api/user/dashboard`                 | GET    | ✅     | Dashboard stats    |
| **Analytics**           | `/api/user/mlm-earnings`              | GET    | ✅     | MLM earnings       |
| **Security**            | `/api/auth/Getuser`                   | GET    | ✅     | Monitor users      |
| **Settings**            | `/api/package/current`                | GET    | ✅     | Current package    |
| **Settings**            | `/api/package/plans`                  | GET    | ✅     | All plans          |

---

## 🔧 **Backend APIs to Create**

### Priority 1 (High):

```javascript
1. GET /api/admin/dashboard - Dashboard stats
2. PATCH /api/admin/users/:userId/freeze - Freeze user
3. PATCH /api/admin/users/:userId/trading - Control trading
4. PATCH /api/admin/users/:userId/withdrawal - Control withdrawal
```

### Priority 2 (Medium):

```javascript
5. GET /api/admin/nfts - All NFTs list
6. POST /api/admin/nft-batch - Create NFT batch
7. PATCH /api/admin/nft-batch/:batchId/unlock - Unlock batch
```

### Priority 3 (Low):

```javascript
8. GET /api/admin/users - Enhanced user list with filters
```

---

## 💻 **Frontend Code Updates**

### 1. Update UserManagement.jsx

```javascript
// Add these buttons in the table:

<button
  onClick={() => freezeUser(user._id, !user.isFrozen)}
  className={`p-2 rounded-lg transition ${
    user.isFrozen ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
  }`}
>
  {user.isFrozen ? <FaUnlock /> : <FaLock />}
</button>

<button
  onClick={() => toggleTrading(user._id, !user.canTrade)}
  className={`p-2 rounded-lg transition ${
    user.canTrade ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
  }`}
>
  <FaExchangeAlt />
</button>
```

### 2. Update Dashboard.jsx

```javascript
useEffect(() => {
  fetchDashboardStats();
}, []);

const fetchDashboardStats = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      "https://api.gtnworld.live/api/admin/dashboard",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    setStats(response.data.data);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
  }
};
```

### 3. Update RootWallet.jsx

```javascript
useEffect(() => {
  fetchWalletData();
}, []);

const fetchWalletData = async () => {
  try {
    const token = localStorage.getItem("token");

    const [balanceRes, txRes] = await Promise.all([
      axios.get("https://api.gtnworld.live/api/wallet/balance", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get("https://api.gtnworld.live/api/user/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    setBalance(balanceRes.data.balance);
    setTransactions(txRes.data.transactions);
  } catch (error) {
    console.error("Error fetching wallet data:", error);
  }
};
```

### 4. Update MultiParentControl.jsx

```javascript
useEffect(() => {
  fetchMLMTree();
}, []);

const fetchMLMTree = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      "https://api.gtnworld.live/api/user/mlm-tree",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    setUsers(response.data.tree.directReferrals);
  } catch (error) {
    console.error("Error fetching MLM tree:", error);
  }
};
```

### 5. Update Analytics.jsx

```javascript
useEffect(() => {
  fetchAnalytics();
}, []);

const fetchAnalytics = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      "https://api.gtnworld.live/api/user/mlm-earnings",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    setEarnings(response.data.earnings);
    setChartData(formatChartData(response.data.earnings));
  } catch (error) {
    console.error("Error fetching analytics:", error);
  }
};
```

---

## 🎯 **Summary**

### ✅ **Already Working APIs (10):**

1. GET /api/auth/Getuser
2. DELETE /api/auth/delete/:userId
3. GET /api/user/mlm-tree
4. GET /api/user/team
5. GET /api/wallet/balance
6. GET /api/user/transactions
7. GET /api/user/dashboard
8. GET /api/user/mlm-earnings
9. GET /api/package/current
10. GET /api/package/plans

### ❌ **Need to Create (4):**

1. GET /api/admin/dashboard
2. PATCH /api/admin/users/:userId/freeze
3. PATCH /api/admin/users/:userId/trading
4. PATCH /api/admin/users/:userId/withdrawal

---

## 📞 **Next Steps:**

1. ✅ Frontend already has: UserManagement (Get, Delete)
2. ❌ Backend create karo: 4 admin APIs
3. ✅ Frontend update karo: Add freeze, trading, withdrawal buttons
4. ✅ Connect remaining pages: Dashboard, Wallet, Analytics

**Total APIs Needed for UI: 14**  
**Already Available: 10**  
**Need to Create: 4**

Backend developer ko ye 4 APIs banane ko bolo! 🚀
