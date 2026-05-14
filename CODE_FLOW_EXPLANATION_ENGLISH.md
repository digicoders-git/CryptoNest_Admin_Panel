# CryptoNest Admin Panel - Code Flow Explanation

This document provides a comprehensive walkthrough of the **CryptoNest Admin Panel** codebase, explaining how the application is structured and how data flows from the user interface to the backend APIs.

## 1. Project Overview
The CryptoNest Admin Panel is a modern web application built using:
- **React.js**: For building the user interface.
- **Vite**: As the build tool and development server.
- **Tailwind CSS**: For premium styling and responsive design.
- **React Router Dom**: For handling navigation.
- **Firebase**: For real-time cloud notifications (FCM).

---

## 2. Main Entry Point
### `src/main.jsx`
This is the starting point of the application. It imports the root component `App.jsx` and renders it into the DOM inside the `index.html` file.

### `src/App.jsx`
This file defines the **Routing Structure**. It uses `BrowserRouter` and `Routes` to map URLs to specific components.
- **`/`**: Points to the **Login** page.
- **`/Dashbord`**: Points to the **MainDashBord** layout, which contains several nested routes (Overview, Root Wallet, User Management, etc.).

---

## 3. Authentication Flow
### `src/Login.jsx`
When a user opens the app, they start here.
1. The user enters their credentials (Email/Password).
2. The component calls the `ADMIN_LOGIN` API endpoint (defined in `src/config/api.js`).
3. If successful, the backend returns an **Auth Token** and **User Data**.
4. These are stored in `localStorage` (`token`, `user`) so the user stays logged in.
5. The app then redirects the user to `/Dashbord`.

---

## 4. Dashboard Layout & Navigation
### `src/Dashbord/MainDashBord.jsx`
This is the "Shell" of the admin panel. Every page inside the dashboard (except Login) uses this layout.
- **Sidebar**: Contains the navigation menu (`NavLink`) to switch between different sections like Users, Transactions, and NFTs.
- **Header**: Shows the welcome message, a real-time clock, a notification bell, and the Logout button.
- **Content Area**: Uses the `<Outlet />` component from `react-router-dom` to render the specific page the user is currently visiting (e.g., Overview or User Management).

---

## 5. Key Features & Data Flow

### A. Dashboard Overview (`src/Dashbord/Overview.jsx`)
- **Flow**: When this component loads, it makes an API call to the `ADMIN_DASHBOARD` endpoint.
- **Display**: It shows summary cards (Total Users, Total Deposits, Active NFTs) and visual charts using data fetched from the backend.

### B. User Management (`src/Dashbord/UserManagement.jsx`)
- **Flow**: Fetches a list of all registered users from `/admin/users`.
- **Actions**: Admins can "Freeze" a user, enable/disable trading, or view specific user details. Each action triggers a `PATCH` or `GET` request to the backend.

### C. Wallet & Transactions (`src/Dashbord/RootWallet.jsx`)
- **Flow**: Displays company-wide financial metrics and transaction history.
- **Data**: Uses `/admin/company-balance` for stats and `/admin/company-transactions` for the history list.

### D. Withdrawal Management (`src/Dashbord/Withdrawal.jsx`)
- **Flow**: This page is critical for financial operations. It lists all pending withdrawal requests from users.
- **Action**: Admins can approve or reject requests, which updates the user's wallet balance on the blockchain/backend.

### E. NFT Administration (`src/Dashbord/NFTAdmin.jsx`)
- **Flow**: Manages the marketplace items. Admins can create new NFT batches, unlock them for sale, or monitor NFT transactions.

---

## 6. API Configuration (`src/config/api.js`)
This is a central file that manages all communication with the backend.
- **Base URL**: The root address of the backend server (e.g., `https://cryptonest-backend.onrender.com/api`).
- **Endpoints**: A dictionary of all available API paths.
- **Headers**: Automatically attaches the `Authorization: Bearer <token>` header to every request to ensure security.

---

## 7. Real-time Notifications
### `src/config/firebase.js`
The application uses Firebase Cloud Messaging (FCM). 
- When an admin logs in, the app generates a unique **FCM Token** and sends it to the backend.
- This allows the backend to push real-time alerts to the admin's browser for important events like "New Withdrawal Request" or "New User Registration."

---

## 8. Summary of Execution Flow
1. **User opens app** → `main.jsx` → `App.jsx` (Routes) → `Login.jsx`.
2. **Login success** → Token stored → Redirect to `MainDashBord.jsx`.
3. **Admin clicks a menu item** → URL changes → `Outlet` in `MainDashBord` renders the component (e.g., `UserManagement`).
4. **Component mounts** → Fetches data from `api.js` endpoints → Updates React state → Displays data on UI.
5. **Admin logs out** → `localStorage.clear()` → Redirect to `/`.
