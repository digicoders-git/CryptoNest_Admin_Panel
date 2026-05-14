# CryptoNest Admin Panel - Code Flow Explanation (हिंदी में)

## 📋 Table of Contents
1. [Application Architecture](#application-architecture)
2. [Entry Point](#entry-point)
3. [Authentication Flow](#authentication-flow)
4. [Dashboard Flow](#dashboard-flow)
5. [API Integration](#api-integration)
6. [Firebase Notifications](#firebase-notifications)
7. [Component Structure](#component-structure)

---

## 🏗️ Application Architecture

यह एक **React + Vite** based Admin Panel है जो CryptoNest blockchain platform को manage करता है।

### Tech Stack:
- **Frontend**: React 19.2.0 + Vite 7.2.4
- **Routing**: React Router DOM 7.9.6
- **Styling**: Tailwind CSS 4.1.18
- **Charts**: Highcharts + Recharts
- **Notifications**: Firebase Cloud Messaging (FCM)
- **UI Components**: React Icons, SweetAlert2
- **Data Export**: ExcelJS, jsPDF

---

## 🚀 Entry Point

### File: `src/main.jsx`
```javascript
// Application को root element में render करता है
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
```

**Flow:**
1. `index.html` में `<div id="root"></div>` है
2. `main.jsx` इसे target करके `App` component को render करता है
3. `App.jsx` routing setup करता है

---

## 🔐 Authentication Flow

### File: `src/Login.jsx`

#### Step-by-Step Process:

```
1. User Login Page Load
   ↓
2. User Email & Password Enter करता है
   ↓
3. Form Submit होता है (handleLogin function)
   ↓
4. API Call: POST /api/SuperAdmin/login
   ↓
5. Backend से Response मिलता है
   ↓
6. अगर Success:
   - Token को localStorage में save करो
   - User data को localStorage में save करो
   - FCM Token generate करो
   - Dashboard पर redirect करो
   ↓
7. अगर Error:
   - Error message दिखाओ
   - Login page पर रहो
```

### Key Code:
```javascript
const handleLogin = async (e) => {
  e.preventDefault();
  
  // API call
  const response = await fetch(`${API_URL}/api/SuperAdmin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Token save करो
    localStorage.setItem("token", data.token);
    localStorage.setItem("superAdminToken", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    
    // FCM Token generate करो
    generateAndSaveFCMToken(data.token);
    
    // Dashboard पर जाओ
    navigate("/Dashbord");
  }
};
```

---

## 📊 Dashboard Flow

### File: `src/Dashbord/MainDashBord.jsx`

यह main layout component है जो sidebar, header, और content area को manage करता है।

#### Structure:
```
MainDashBord
├── Sidebar (Navigation Menu)
│   ├── Logo
│   ├── Menu Items (13 items)
│   └── Logout Button
├── Header
│   ├── Hamburger Menu (Mobile)
│   ├── Welcome Message
│   ├── Clock
│   └── Notification Bell
└── Main Content Area
    └── <Outlet /> (Dynamic Content)
```

#### Menu Items:
```javascript
const MENU = [
  ["Dashboard", "/Dashbord", FaBorderAll],
  ["Transactions", "/Dashbord/root-wallet", FaListAlt],
  ["Users", "/Dashbord/user-management", FaUsersCog],
  ["Contact Us", "/Dashbord/contact-us", FaHeadset],
  ["Transfer Funds", "/Dashbord/withdrawal", FaFileInvoiceDollar],
  ["Network Hierarchy", "/Dashbord/mlm-hierarchy", FaProjectDiagram],
  ["Marketplace", "/Dashbord/marketplace", FaStore],
  ["CryptoNest Admin", "/Dashbord/nft-admin", FaShieldAlt],
  ["Notifications", "/Dashbord/notifications", FaBell],
  ["CryptoNest Tree", "/Dashbord/nft-tree-analysis", FaSitemap],
  ["User Marketplace", "/Dashbord/user-marketplace-nfts", FaStoreAlt],
  ["Profile", "/Dashbord/profile", FaUserCircle],
];
```

### Key Features:

#### 1. **Responsive Design**
```javascript
// Mobile detection
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 1024);
  check();
  window.addEventListener("resize", check);
}, []);
```

#### 2. **Real-time Clock**
```javascript
useEffect(() => {
  const timer = setInterval(() => setDateTime(new Date()), 1000);
  return () => clearInterval(timer);
}, []);
```

#### 3. **Dark Mode Toggle**
```javascript
useEffect(() => {
  document.documentElement.classList.toggle("dark", darkMode);
}, [darkMode]);
```

#### 4. **Logout Functionality**
```javascript
const handleLogout = () => {
  localStorage.clear();
  navigate("/");
};
```

---

## 📈 Overview Dashboard Flow

### File: `src/Dashbord/Overview.jsx`

यह Master Dashboard है जो सभी statistics दिखाता है।

#### Data Fetching Flow:
```
Component Mount
   ↓
fetchDashboardData() Call
   ↓
API: GET /api/SuperAdmin/master-dashboard
   ↓
Token के साथ Request भेजो
   ↓
Response मिले
   ↓
Data को State में Store करो
   ↓
Charts Render करो
   ↓
Auto Refresh (हर 30 seconds)
```

### Key Code:
```javascript
const fetchDashboardData = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${baseUrl}SuperAdmin/master-dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const result = await response.json();
    
    if (result.success) {
      setDashboardData(result.data);
    }
  } catch (err) {
    setError(err.message);
  }
};

// Auto refresh हर 30 seconds
useEffect(() => {
  fetchDashboardData();
  const interval = setInterval(fetchDashboardData, 30000);
  return () => clearInterval(interval);
}, []);
```

### Dashboard Sections:

#### 1. **Stats Cards** (4 columns)
```
┌─────────────────────────────────────────────────────┐
│ Total Users │ Total NFTs │ Company Balance │ Contacts │
│    1,234    │    5,678   │   100.5 ETH     │   456    │
└─────────────────────────────────────────────────────┘
```

#### 2. **Charts** (8 different charts)
- Users Distribution (Pie Chart)
- NFT Inventory (Column Chart)
- NFT Sales Breakdown (Pie Chart)
- Trading Limit Usage (Gauge Chart)
- Financial Overview (Bar Chart)
- Withdrawals Overview (Pie Chart)
- Withdrawal Requests (Column Chart)
- MLM Level Distribution (Line Chart)

#### 3. **Tables**
- Recent Users Table
- Recent Contacts Table
- Recent Transactions Table

---

## 🔌 API Integration

### File: `src/config/api.js`

#### API Configuration:
```javascript
const API_CONFIG = {
  BASE_URL: rawUrl.replace(/\/$/, '').replace(/\/api$/, '') + '/api',
  VERSION: ""
};
```

#### API Endpoints Structure:
```javascript
export const API_ENDPOINTS = {
  // Authentication
  USER_REGISTER: "/auth/register",
  USER_LOGIN: "/auth/login",
  
  // SuperAdmin
  ADMIN_LOGIN: "/auth/login",
  ADMIN_CHANGE_PASSWORD: "/SuperAdmin/change-password",
  
  // User Management
  USER_PROFILE: "/user/profile",
  USER_DASHBOARD: "/user/dashboard",
  
  // Wallet
  ACTIVATE_WALLET: "/wallet/activate",
  GET_BALANCE: "/wallet/balance",
  
  // NFT System
  NFT_INITIALIZE: "/nft/initialize",
  NFT_MARKETPLACE: "/nft/marketplace",
  
  // Admin Management
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USERS: "/admin/users",
  
  // MLM System
  MLM_STATS: "/mlm/stats",
  MLM_EARNINGS: "/mlm/earnings"
};
```

#### Helper Functions:
```javascript
// API URL build करो
export const buildApiUrl = (endpoint) => {
  const base = API_CONFIG.BASE_URL.replace(/\/$/, '');
  return `${base}${endpoint}`;
};

// Token get करो
export const getAuthToken = () => {
  return (
    localStorage.getItem("superAdminToken") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token")
  );
};

// Headers with Auth
export const getDefaultHeaders = (includeAuth = true) => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json"
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return headers;
};
```

---

## 🔔 Firebase Notifications

### File: `src/config/firebase.js`

#### FCM Token Generation Flow:
```
User Login
   ↓
generateAndSaveFCMToken() Call
   ↓
Notification Permission Request
   ↓
अगर Permission Granted:
   - FCM Token Generate करो
   - Backend को भेजो (POST /api/SuperAdmin/fcm-token)
   - localStorage में save करो
   ↓
अगर Permission Denied:
   - Warning दिखाओ
   - Continue करो (बिना notifications के)
```

### Key Code:
```javascript
export const generateAndSaveFCMToken = async (authToken) => {
  try {
    // Permission request करो
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('⚠️ Notification permission denied');
      return null;
    }
    
    // FCM Token generate करो
    const fcmToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    });
    
    // Backend को भेजो
    await fetch(`${API_URL}SuperAdmin/fcm-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ fcmToken })
    });
    
    // localStorage में save करो
    localStorage.setItem('fcmToken', fcmToken);
    
    return fcmToken;
  } catch (error) {
    console.error('❌ FCM Token error:', error.message);
    return null;
  }
};
```

#### Foreground Notifications:
```javascript
export const onForegroundMessage = (callback) => {
  return onMessage(messaging, (payload) => {
    console.log('🔔 Foreground notification:', payload);
    callback(payload);
  });
};
```

#### MainDashBoard में Implementation:
```javascript
// Foreground FCM Notification listener
useEffect(() => {
  const unsubscribe = onForegroundMessage((payload) => {
    const title = payload?.notification?.title || '🔔 New Notification';
    const body = payload?.notification?.body || '';
    
    // SweetAlert से notification दिखाओ
    Swal.fire({
      title: title,
      text: body,
      icon: 'info',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 5000
    });
  });
  
  return () => unsubscribe && unsubscribe();
}, []);
```

---

## 🗂️ Component Structure

### Directory Layout:
```
src/
├── main.jsx                    # Entry point
├── App.jsx                     # Routing setup
├── Login.jsx                   # Login page
├── index.css                   # Global styles
├── App.css                     # App styles
├── config/
│   ├── api.js                  # API configuration
│   └── firebase.js             # Firebase setup
├── assets/
│   └── react.svg
└── Dashbord/                   # Dashboard components
    ├── MainDashBord.jsx        # Main layout
    ├── Overview.jsx            # Master dashboard
    ├── RootWallet.jsx          # Transactions
    ├── UserManagement.jsx      # User management
    ├── MLMHierarchy.jsx        # MLM tree
    ├── NFTAdmin.jsx            # NFT management
    ├── Marketplace.jsx         # Marketplace
    ├── Withdrawal.jsx          # Payout requests
    ├── NotificationManagement.jsx
    ├── Profile.jsx
    ├── ChangePassword.jsx
    ├── ContactUs.jsx
    ├── Analytics.jsx
    ├── SystemSettings.jsx
    ├── NFTTreeAnalysis.jsx
    ├── NFTTransactions.jsx
    ├── UserMarketplaceNFTs.jsx
    └── ScrollToTop.jsx
```

---

## 🔄 Complete User Journey

### 1. **Application Start**
```
Browser → index.html
   ↓
main.jsx (React render)
   ↓
App.jsx (Routing)
   ↓
Login Page (if not authenticated)
```

### 2. **Login Process**
```
User enters email & password
   ↓
handleLogin() function
   ↓
API: POST /api/SuperAdmin/login
   ↓
Token received
   ↓
localStorage में save
   ↓
FCM Token generate
   ↓
Dashboard redirect
```

### 3. **Dashboard Access**
```
MainDashBord component load
   ↓
Sidebar + Header render
   ↓
User selects menu item
   ↓
React Router navigates
   ↓
Corresponding component render (via <Outlet />)
```

### 4. **Data Display**
```
Component mount
   ↓
useEffect में API call
   ↓
Token के साथ request
   ↓
Data receive
   ↓
State update
   ↓
Component re-render
   ↓
UI update
```

### 5. **Notifications**
```
Backend से notification भेजा जाता है
   ↓
Firebase Cloud Messaging
   ↓
Browser में receive
   ↓
Foreground: SweetAlert से दिखाओ
   ↓
Background: System notification
```

### 6. **Logout**
```
User logout button click
   ↓
handleLogout() function
   ↓
localStorage.clear()
   ↓
Login page redirect
```

---

## 📦 Dependencies Overview

### Core Dependencies:
```json
{
  "react": "^19.2.0",              // UI library
  "react-dom": "^19.2.0",          // DOM rendering
  "react-router-dom": "^7.9.6",    // Routing
  "tailwindcss": "^4.1.18",        // Styling
  "firebase": "^12.12.1",          // Notifications
  "highcharts": "^12.6.0",         // Charts
  "recharts": "^3.6.0",            // Alternative charts
  "sweetalert2": "^11.26.17",      // Alerts
  "axios": "^1.13.2",              // HTTP client
  "exceljs": "^4.4.0",             // Excel export
  "jspdf": "^2.5.2"                // PDF export
}
```

---

## 🎯 Key Features

### 1. **Responsive Design**
- Mobile-first approach
- Sidebar collapse on mobile
- Hamburger menu

### 2. **Real-time Updates**
- Auto-refresh every 30 seconds
- Live clock
- Notification system

### 3. **Data Visualization**
- 8 different chart types
- Interactive tables
- Statistics cards

### 4. **Security**
- Token-based authentication
- Authorization headers
- Secure logout

### 5. **User Experience**
- Dark mode toggle
- Smooth animations
- Loading states
- Error handling

---

## 🚨 Error Handling

### Login Errors:
```javascript
try {
  // API call
} catch (err) {
  Swal.fire({
    icon: "error",
    title: "Login Failed",
    text: err.message || "Network error"
  });
}
```

### Dashboard Errors:
```javascript
if (error) {
  return (
    <div className="error-container">
      <p>⚠️ Error: {error}</p>
      <button onClick={fetchDashboardData}>Try Again</button>
    </div>
  );
}
```

---

## 📝 Environment Variables (.env)

```env
# Backend API
VITE_API_BASE_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/
VITE_API_VERSION=api

# Firebase Configuration
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_VAPID_KEY=...
```

---

## 🎨 Styling System

### Color Scheme:
```
Primary Gold: #D4AF37
Secondary Gold: #F3C06A
Background: #000000 (Black)
Text: #FFFFFF (White)
Accent: #1a1a1a (Dark Gray)
```

### Tailwind Classes Used:
```
- bg-black, bg-gradient-to-r
- text-[#D4AF37], text-[#F3C06A]
- border-[#D4AF37]/20
- rounded-xl, rounded-2xl
- shadow-lg, shadow-2xl
- hover:, focus:, transition-all
```

---

## 🔗 API Flow Example

### Master Dashboard API Call:
```javascript
// Request
GET /api/SuperAdmin/master-dashboard
Headers: {
  Authorization: "Bearer <token>",
  Content-Type: "application/json"
}

// Response
{
  success: true,
  data: {
    users: { total, active, inactive, frozen, todayNew },
    nfts: { total, available, sold, preLaunchSold, tradingSold },
    finance: { companyTotalBalance, todayEarnings, totalReferralPaid },
    withdrawals: { pendingAmount, completedAmount, failedAmount },
    contacts: { total, todayNew, recentContacts },
    notifications: { total, active },
    mlm: { levelWise: [...] },
    transactions: { recentTransactions: [...] }
  }
}
```

---

## 🎓 Summary

यह CryptoNest Admin Panel एक complete blockchain management system है जो:

1. **Authentication** - Secure login with token management
2. **Dashboard** - Real-time statistics और charts
3. **Navigation** - Responsive sidebar with 13 menu items
4. **Notifications** - Firebase FCM integration
5. **Data Management** - User, NFT, Wallet, MLM management
6. **Responsive Design** - Mobile-friendly interface
7. **Error Handling** - Comprehensive error management
8. **Real-time Updates** - Auto-refresh और live notifications

सभी components React hooks (useState, useEffect) का use करते हैं और Tailwind CSS से styled हैं।

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Production Ready ✅
