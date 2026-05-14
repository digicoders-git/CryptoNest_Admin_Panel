# Root Wallet - Transaction API Details

## 📌 API Endpoint Used

### Main API Endpoint:
```
GET /api/SuperAdmin/company-transactions
```

**Base URL:** 
```
${API_URL}SuperAdmin/company-transactions
```

**Full URL Example:**
```
http://localhost:5000/api/SuperAdmin/company-transactions
```

---

## 🔐 Authentication

**Header Required:**
```javascript
Authorization: Bearer ${token}
```

**Token Source:**
```javascript
const token = localStorage.getItem("token") || localStorage.getItem("superAdminToken");
```

---

## 📊 API Response Structure

### Success Response:
```json
{
  "success": true,
  "data": {
    "companyWallet": "0x1234567890abcdef...",
    "summary": {
      "totalEarnings": 50000,
      "totalIncome": 100000,
      "totalPayouts": 50000
    },
    "transactions": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "type": "Registration",
        "amount": 100,
        "date": "2024-01-15T10:30:00Z",
        "user": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "description": "User registration fee",
        "companyShare": 4
      },
      {
        "_id": "507f1f77bcf86cd799439012",
        "type": "Admin NFT Sold",
        "amount": 500,
        "date": "2024-01-15T11:45:00Z",
        "user": {
          "name": "Admin",
          "email": "admin@example.com"
        },
        "description": "Admin NFT sold to user",
        "companyShare": 4
      },
      {
        "_id": "507f1f77bcf86cd799439013",
        "type": "NFT Sale",
        "amount": 250,
        "date": "2024-01-15T12:00:00Z",
        "user": {
          "name": "Jane Smith",
          "email": "jane@example.com"
        },
        "description": "NFT marketplace sale",
        "companyShare": 4
      },
      {
        "_id": "507f1f77bcf86cd799439014",
        "type": "Parent Payout",
        "amount": -50,
        "date": "2024-01-15T13:15:00Z",
        "user": {
          "name": "Parent User",
          "email": "parent@example.com"
        },
        "description": "MLM parent bonus payout",
        "companyShare": 0
      }
    ],
    "graph": {
      "labels": ["Jan", "Feb", "Mar"],
      "data": [10000, 15000, 12000]
    }
  }
}
```

---

## 🔄 API Call Implementation

### In RootWallet.jsx:

```javascript
const fetchWalletData = async (showLoader = false) => {
  try {
    if (showLoader) setRefreshing(true);

    const token = localStorage.getItem("token") || localStorage.getItem("superAdminToken");

    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Authentication Error",
        text: "Please login again",
        background: "#000000",
        color: "#F3C06A",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    // API Call
    const transactionRes = await axios.get(
      `${API_URL}SuperAdmin/company-transactions`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (transactionRes.data.success) {
      const data = transactionRes.data;
      const allTransactions = data.transactions || [];

      // Calculate total payouts
      const totalPayouts = allTransactions
        .filter((tx) => tx.type === "Parent Payout")
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

      // Set company data
      setCompanyData({
        superUserWallet: data.companyWallet || "",
        totalBalance: data.summary?.totalEarnings || 0,
        lastUpdated: new Date().toISOString(),
      });

      // Set transactions
      setTransactions({
        transactions: allTransactions,
        summary: {
          totalBalance: data.summary?.totalEarnings || 0,
          totalTransactions: allTransactions.length,
          totalIncome: data.summary?.totalIncome || 0,
          totalPayouts: totalPayouts,
          companyWallet: data.companyWallet || "",
        },
        pagination: {
          current: 1,
          limit: 20,
          total: allTransactions.length,
          pages: Math.ceil(allTransactions.length / 20),
        },
        lastUpdated: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("API Error:", error);
    Swal.fire({
      icon: "error",
      title: "API Error",
      text: error.response?.data?.message || "Failed to fetch wallet data",
      background: "#000000",
      color: "#F3C06A",
      confirmButtonColor: "#D4AF37",
    });
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};
```

---

## 📋 Transaction Types

### 1. **Registration**
- **Description:** User registration fees
- **Amount:** Positive (income)
- **Icon:** FaUsers
- **Color:** Blue (#3B82F6)

### 2. **Admin NFT Sold**
- **Description:** Admin NFTs sold to users
- **Amount:** Positive (income)
- **Icon:** FaCrown
- **Color:** Amber (#F59E0B)

### 3. **NFT Sale**
- **Description:** NFT marketplace sales
- **Amount:** Positive (income)
- **Icon:** FaGem
- **Color:** Green (#10B981)

### 4. **Parent Payout**
- **Description:** MLM parent bonus payouts
- **Amount:** Negative (expense)
- **Icon:** FaUserFriends
- **Color:** Purple (#8B5CF6)

### 5. **Upgrade**
- **Description:** Package upgrade fees
- **Amount:** Positive (income)
- **Icon:** FaRocket
- **Color:** Indigo

### 6. **Other**
- **Description:** Miscellaneous transactions
- **Amount:** Variable
- **Icon:** FaWallet
- **Color:** Gray

---

## 🔄 Auto-Refresh Mechanism

```javascript
useEffect(() => {
  fetchWalletData();
  fetchUsers();
  
  // Auto-refresh every 30 seconds
  const interval = setInterval(() => {
    fetchWalletData();
    fetchUsers();
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

**Refresh Interval:** 30 seconds (30000 ms)

---

## 📊 Data Processing

### Total Income Calculation:
```javascript
const totalIncome = transactions.summary?.totalIncome || 0;
```

### Total Payouts Calculation:
```javascript
const totalPayouts = allTransactions
  .filter((tx) => tx.type === "Parent Payout")
  .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
```

### Admin NFT Total:
```javascript
const adminNftTotal = transactions.transactions
  .filter((tx) => tx.type === "Admin NFT Sold")
  .reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0);
```

### NFT Sale Total:
```javascript
const nftSaleTotal = transactions.transactions
  .filter((tx) => tx.type === "NFT Sale" && tx.companyShare === 4)
  .reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0);
```

### Net Profit Calculation:
```javascript
const netProfit = totalIncome - totalPayouts - adminNftTotal - nftSaleTotal - upgradeTotal - missedParentBonusTotal;
```

---

## 🎯 Cards Displayed

| Card # | Name | Data Source | Calculation |
|--------|------|-------------|-------------|
| 1 | Total Income | `summary.totalIncome` | Direct |
| 2 | Registrations | Filter by type | Sum of Registration amounts |
| 3 | Total Payouts | Filter by type | Sum of Parent Payout amounts |
| 4 | Registration Profit | Calculated | Registrations - Payouts |
| 5 | Total Users | `fetchUsers()` API | User count |
| 6 | Admin NFT Sold | Filter by type | Sum of Admin NFT Sold amounts |
| 7 | NFT Sale | Filter by type | Sum of NFT Sale amounts |
| 8 | Net Profit | Calculated | Income - All Expenses |
| 9 | Total NFT Profit | Calculated | Admin NFT Sold + NFT Sale |

---

## 🔍 Filtering & Search

### Transaction Tabs:
```javascript
const transactionFilterTab = "all" | "Registration" | "NFT Sale" | "Parent Payout" | "Upgrade" | "Other"
```

### Search Functionality:
```javascript
filteredTransactions = filteredTransactions.filter(
  (tx) =>
    tx.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.description?.toLowerCase().includes(searchTerm.toLowerCase())
);
```

### Sorting:
```javascript
if (sortOrder === "desc") {
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
} else {
  filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
}
```

---

## 📈 Charts Generated

### 1. Revenue Breakdown (Pie Chart)
- Registration
- NFT Sales
- Admin NFTs
- Missed Bonus
- Upgrades

### 2. Income vs Payout (Column Chart)
- Total Income
- Total Payouts
- Net Profit

### 3. Monthly Revenue Trend (Spline Chart)
- Last 6 months data
- Revenue trend visualization

### 4. Transaction Type Distribution (Bar Chart)
- Registration count
- NFT Sale count
- Parent Payout count
- Other count

---

## 🛠️ Error Handling

```javascript
try {
  // API call
} catch (error) {
  console.error("API Error:", error);
  Swal.fire({
    icon: "error",
    title: "API Error",
    text: error.response?.data?.message || "Failed to fetch wallet data",
    background: "#000000",
    color: "#F3C06A",
    confirmButtonColor: "#D4AF37",
  });
}
```

---

## 📱 Pagination

```javascript
const itemsPerPage = 10; // Default
const currentPage = 1; // Default
const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
const currentTransactions = filteredTransactions.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
```

**Available Options:** 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500

---

## 🔗 Related APIs

### Secondary API - Fetch Users:
```
GET /api/admin/users
```

**Used for:**
- Total user count
- User list display
- Graph data

---

## 📝 Summary

**API Endpoint:** `GET /api/SuperAdmin/company-transactions`

**Purpose:** Fetch all company transactions and financial summary

**Frequency:** Auto-refresh every 30 seconds

**Data Returned:**
- Company wallet address
- Financial summary (income, payouts, earnings)
- Complete transaction history
- Graph data for charts

**Used In:** Root Wallet Dashboard (Transactions Page)

---

**Last Updated:** 2024
**Status:** Active ✅
