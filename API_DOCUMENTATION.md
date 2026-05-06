# 🚀 MLM Admin Panel - Complete API Documentation

## 📌 Base URL

```
https://api.gtnworld.live/api
```

## 🔐 Authentication

All admin routes require JWT token in header:

```javascript
Headers: {
  "Authorization": "Bearer <your_jwt_token>",
  "Content-Type": "application/json"
}
```

---

## 1️⃣ **Authentication APIs**

### 🔹 Admin Login

```http
POST /auth/admin/login
```

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "admin_id",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Response (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

## 2️⃣ **User Management APIs** ✅ (Already Implemented)

### 🔹 Get All Users

```http
GET /auth/Getuser
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id_123",
      "name": "John Doe",
      "email": "john@example.com",
      "mobile": "1234567890",
      "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "referralCode": "REF123",
      "balance": 150.5,
      "level": 2,
      "currentPlan": "Premium",
      "isActive": true,
      "isFrozen": false,
      "totalEarnings": 500,
      "totalInvestment": 100,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 🔹 Delete User

```http
DELETE /auth/delete/:userId
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Response (404 Not Found):**

```json
{
  "success": false,
  "message": "User not found"
}
```

### 🔹 Freeze/Unfreeze User

```http
PUT /auth/freeze/:userId
```

**Request Body:**

```json
{
  "isFrozen": true
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User frozen successfully",
  "data": {
    "_id": "user_id",
    "isFrozen": true
  }
}
```

---

## 3️⃣ **Dashboard Overview APIs**

### 🔹 Get Dashboard Stats

```http
GET /dashboard/stats
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "totalUsers": 1234,
    "activeUsers": 987,
    "orphanUsers": 45,
    "totalRegistrations": 1234,
    "totalCollected": 12340,
    "parentsPayout": 4567,
    "adminWallet": 7773,
    "todayIncome": 120,
    "weekIncome": 840,
    "monthIncome": 3600,
    "avgParentsPerUser": 3.2,
    "orphanPercentage": 3.6,
    "activeUserRate": 79.9
  }
}
```

---

## 4️⃣ **Root Wallet APIs**

### 🔹 Get Wallet Balance

```http
GET /wallet/balance
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "currentBalance": 7773,
    "totalCollected": 12340,
    "totalPaidToParents": 4567,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

### 🔹 Get Wallet Transactions

```http
GET /wallet/transactions
```

**Query Parameters:**

```
?page=1&limit=10&sortBy=date&order=desc
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "_id": "tx_id_123",
        "userId": "U001",
        "userName": "John Doe",
        "registrationAmount": 10,
        "parentsPaid": 3,
        "adminShare": 7,
        "walletBalanceAfter": 7773,
        "dateTime": "2024-01-15T10:30:45Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalTransactions": 100
    }
  }
}
```

---

## 5️⃣ **Multi-Parent Control APIs**

### 🔹 Get All Users with Parents

```http
GET /parents/users
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "userId": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "parents": [
        {
          "parentId": "parent_1",
          "parentName": "Parent A",
          "status": "Active"
        },
        {
          "parentId": "parent_2",
          "parentName": "Parent B",
          "status": "Active"
        }
      ],
      "parentCount": 2,
      "isOrphan": false,
      "maxParentsAllowed": 9
    }
  ]
}
```

### 🔹 Add Parent to User

```http
POST /parents/add
```

**Request Body:**

```json
{
  "userId": "user_123",
  "parentId": "parent_456"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Parent added successfully",
  "data": {
    "userId": "user_123",
    "parentCount": 3,
    "newParent": {
      "parentId": "parent_456",
      "parentName": "Parent C"
    }
  }
}
```

**Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "Maximum parents limit reached (9)"
}
```

### 🔹 Remove Parent from User

```http
DELETE /parents/remove
```

**Request Body:**

```json
{
  "userId": "user_123",
  "parentId": "parent_456"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Parent removed successfully"
}
```

### 🔹 Get User's Parent Details

```http
GET /parents/user/:userId
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "name": "John Doe",
    "parents": [
      {
        "parentId": "parent_1",
        "parentName": "Parent A",
        "parentEmail": "parentA@example.com",
        "earnedFromThisUser": 1,
        "status": "Active",
        "addedDate": "2024-01-10T10:00:00Z"
      }
    ],
    "parentCount": 3,
    "isOrphan": false
  }
}
```

---

## 6️⃣ **Registration Report APIs**

### 🔹 Get Registration Distribution

```http
GET /reports/registration
```

**Query Parameters:**

```
?startDate=2024-01-01&endDate=2024-01-31&page=1&limit=20
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRegistrations": 1234,
      "totalCollected": 12340,
      "totalParentsPayout": 4567,
      "totalAdminShare": 7773
    },
    "reports": [
      {
        "userId": "user_123",
        "userName": "John Doe",
        "email": "john@example.com",
        "registrationAmount": 10,
        "parentsCount": 3,
        "parentsPayout": 3,
        "adminShare": 7,
        "registrationDate": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 62,
      "totalRecords": 1234
    }
  }
}
```

### 🔹 Export Registration Report (CSV)

```http
GET /reports/registration/export
```

**Query Parameters:**

```
?format=csv&startDate=2024-01-01&endDate=2024-01-31
```

**Response (200 OK):**

```
Content-Type: text/csv
Content-Disposition: attachment; filename="registration_report.csv"

User,Email,Parents Count,Parents Payout,Admin Share,Date
John Doe,john@example.com,3,$3,$7,2024-01-15
```

---

## 7️⃣ **Analytics APIs**

### 🔹 Get Analytics Data

```http
GET /analytics/stats
```

**Query Parameters:**

```
?period=week (options: day, week, month, year)
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "dailyIncome": 450,
    "monthlyIncome": 7773,
    "avgParentsPerUser": 3.7,
    "orphanPercentage": 3.6,
    "activeUserRate": 79.9,
    "chartData": {
      "incomeChart": {
        "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "data": [320, 450, 380, 520, 610, 480, 550]
      },
      "userDistribution": {
        "active": 987,
        "orphan": 45,
        "inactive": 202
      },
      "monthlyRevenue": {
        "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        "data": [3000, 4500, 3800, 5200, 6100, 7773]
      }
    },
    "walletGrowth": [
      { "month": "January", "amount": 3000, "growth": "+15%" },
      { "month": "February", "amount": 4500, "growth": "+50%" }
    ]
  }
}
```

---

## 8️⃣ **Security Control APIs**

### 🔹 Get Security Alerts

```http
GET /security/alerts
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "_id": "alert_123",
        "userId": "user_123",
        "userName": "User X",
        "issue": "Duplicate parent detected",
        "severity": "High",
        "timestamp": "2024-01-15T10:30:00Z",
        "status": "Pending"
      }
    ],
    "summary": {
      "duplicateParents": 12,
      "selfParenting": 5,
      "sameWallet": 8,
      "multipleIP": 23,
      "suspiciousUsers": 3
    }
  }
}
```

### 🔹 Get Blocked Actions

```http
GET /security/blocked-actions
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "today": {
      "duplicateParentAttempts": 12,
      "selfParentingRejected": 5,
      "accountsFrozen": 3
    },
    "total": {
      "threatsBlocked": 51,
      "activeMonitors": 5,
      "flaggedUsers": 8
    }
  }
}
```

### 🔹 Freeze Suspicious User

```http
POST /security/freeze-user
```

**Request Body:**

```json
{
  "userId": "user_123",
  "reason": "Multiple IP addresses detected",
  "duration": "permanent"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User frozen successfully",
  "data": {
    "userId": "user_123",
    "isFrozen": true,
    "reason": "Multiple IP addresses detected"
  }
}
```

---

## 9️⃣ **System Settings APIs**

### 🔹 Get Current Settings

```http
GET /settings
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "registrationAmount": 10,
    "perParentIncome": 1,
    "maxParentsAllowed": 9,
    "registrationStatus": true,
    "maintenanceMode": false,
    "lastUpdated": "2024-01-15T10:30:00Z",
    "updatedBy": "admin_id"
  }
}
```

### 🔹 Update System Settings

```http
PUT /settings
```

**Request Body:**

```json
{
  "registrationAmount": 10,
  "perParentIncome": 1,
  "maxParentsAllowed": 9,
  "registrationStatus": true,
  "maintenanceMode": false
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "registrationAmount": 10,
    "perParentIncome": 1,
    "maxParentsAllowed": 9,
    "registrationStatus": true,
    "maintenanceMode": false
  }
}
```

**Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "Invalid settings values",
  "errors": [
    "registrationAmount must be greater than 0",
    "maxParentsAllowed cannot exceed 9"
  ]
}
```

---

## 🔟 **Additional Utility APIs**

### 🔹 Search Users

```http
GET /users/search
```

**Query Parameters:**

```
?q=john&field=name (fields: name, email, mobile, referralCode)
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "userId": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "mobile": "1234567890"
    }
  ]
}
```

### 🔹 Get System Health

```http
GET /system/health
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": "99.9%",
    "database": "connected",
    "lastBackup": "2024-01-15T00:00:00Z"
  }
}
```

---

## ⚠️ **Error Responses**

### Common Error Codes:

**400 Bad Request:**

```json
{
  "success": false,
  "message": "Invalid request data",
  "errors": ["Field 'email' is required"]
}
```

**401 Unauthorized:**

```json
{
  "success": false,
  "message": "Authentication required"
}
```

**403 Forbidden:**

```json
{
  "success": false,
  "message": "Admin access required"
}
```

**404 Not Found:**

```json
{
  "success": false,
  "message": "Resource not found"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details..."
}
```

---

## 📝 **Notes:**

1. **Token Expiry:** JWT tokens expire after 24 hours
2. **Rate Limiting:** 100 requests per minute per IP
3. **Pagination:** Default limit is 20, max is 100
4. **Date Format:** ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
5. **Currency:** All amounts in USD ($)

---

## 🔧 **Testing with Postman:**

1. Import this collection
2. Set environment variable: `BASE_URL = https://api.gtnworld.live/api`
3. After login, set `TOKEN` variable
4. All requests will auto-include token

---

**Created by:** Vivek Chaurasiya  
**Last Updated:** January 2024  
**Version:** 1.0
