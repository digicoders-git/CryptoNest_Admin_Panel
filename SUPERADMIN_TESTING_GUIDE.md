# SuperAdmin API Testing Guide

## 🚀 Quick Start Testing

### 1. Access the SuperAdmin Test Suite

```
Navigate to: http://localhost:3000/Dashbord/superadmin-test
```

### 2. Test All APIs at Once

- Click "Test All APIs" button
- Wait for all tests to complete
- Review results in the dashboard

### 3. Individual API Testing

- Click the "Play" button on any API card
- View detailed results in real-time
- Click "View Details" for comprehensive information

## 📋 Complete API Test Checklist

### Critical APIs (Must Work)

- [ ] **Server Health Check** - `/test`
  - Expected: `{ message: "Server is running", status: "ok" }`
  - Critical: Yes
  - Timeout: 5 seconds

- [ ] **SuperAdmin Login** - `/api/SuperAdmin/login`
  - Test Data: `{ email: "admin@example.com", password: "admin123" }`
  - Expected: `{ message: "Login successful", token: "...", user: {...} }`
  - Critical: Yes
  - Stores: `adminToken` in localStorage

- [ ] **Company Balance** - `/api/SuperAdmin/company-balance`
  - Expected: `{ success: true, data: { totalBalance: number, superUserWallet: "0x..." } }`
  - Critical: Yes
  - Requires: Valid admin token

- [ ] **Company Transactions** - `/api/SuperAdmin/company-transactions`
  - Expected: `{ success: true, transactions: [...], summary: {...}, graph: {...} }`
  - Critical: Yes
  - Requires: Valid admin token

- [ ] **All Users** - `/api/auth/Getuser`
  - Expected: `{ success: true, data: [...] }`
  - Critical: Yes
  - Requires: Valid admin token

### Optional APIs (Nice to Have)

- [ ] **NFT Initialize** - `/api/nft/initialize`
  - Expected: `{ message: "NFT system initialized", totalNFTs: 500, totalBatches: 125 }`
  - Critical: No
  - Action: Creates 500 NFTs in 125 batches

- [ ] **NFT Marketplace** - `/api/nft/marketplace`
  - Expected: `{ nfts: [...], currentBatch: number, phase: "string" }`
  - Critical: No
  - Requires: NFT system initialized

- [ ] **NFT Statistics** - `/api/admin-settings/nft/stats`
  - Expected: `{ success: true, data: { overview: {...}, batchDistribution: [...] } }`
  - Critical: No
  - Requires: Valid admin token

- [ ] **Admin Users Panel** - `/api/admin-settings/users`
  - Expected: `{ success: true, data: { users: [...], pagination: {...} } }`
  - Critical: No
  - Requires: Valid admin token

## 🔧 Manual Testing Steps

### Step 1: Server Connection

```bash
# Test direct server connection
curl https://api.gtnworld.live/test

# Expected Response:
{
  "message": "MLM NFT Backend API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### Step 2: SuperAdmin Registration (If Needed)

```bash
# Register new SuperAdmin
curl -X POST https://api.gtnworld.live/api/SuperAdmin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin",
    "email": "admin@example.com",
    "mobile": "1234567890",
    "cryptoWalletAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "password": "admin123"
  }'

# Expected Response:
{
  "message": "SuperAdmin registered successfully",
  "userId": "...",
  "referralCode": "COMPANY_ROOT",
  "companyWallet": "0x..."
}
```

### Step 3: SuperAdmin Login

```bash
# Login as SuperAdmin
curl -X POST https://api.gtnworld.live/api/SuperAdmin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Expected Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Super Admin",
    "email": "admin@example.com",
    "role": "superadmin",
    "companyBalance": 0
  }
}
```

### Step 4: Test Protected Endpoints

```bash
# Get company balance (replace TOKEN with actual token)
curl -X GET https://api.gtnworld.live/api/SuperAdmin/company-balance \
  -H "Authorization: Bearer TOKEN"

# Get company transactions
curl -X GET https://api.gtnworld.live/api/SuperAdmin/company-transactions \
  -H "Authorization: Bearer TOKEN"

# Get all users
curl -X GET https://api.gtnworld.live/api/auth/Getuser \
  -H "Authorization: Bearer TOKEN"
```

## 🐛 Troubleshooting Common Issues

### Issue 1: Server Not Responding

**Symptoms**: All APIs fail with "Backend server not responding"
**Solutions**:

1. Check if backend server is running on port 5000
2. Verify CORS settings in backend
3. Check firewall/antivirus blocking connections
4. Ensure correct base URL in environment variables

### Issue 2: Authentication Failures

**Symptoms**: 401 Unauthorized errors
**Solutions**:

1. Verify SuperAdmin account exists
2. Check login credentials
3. Ensure token is being stored correctly
4. Check token expiration

### Issue 3: NFT System Not Working

**Symptoms**: NFT APIs return errors
**Solutions**:

1. Run NFT initialization first
2. Check database connection
3. Verify NFT smart contract deployment
4. Check blockchain connection

### Issue 4: Database Connection Issues

**Symptoms**: User/transaction APIs fail
**Solutions**:

1. Check MongoDB connection
2. Verify database credentials
3. Ensure database is running
4. Check network connectivity

## 📊 Expected Test Results

### All Green (Perfect Scenario)

```
✅ Server Health Check - 50ms
✅ SuperAdmin Login - 200ms
✅ Company Balance - 150ms
✅ Company Transactions - 300ms
✅ All Users - 250ms
✅ NFT Initialize - 500ms
✅ NFT Marketplace - 180ms
✅ NFT Statistics - 220ms
✅ Admin Users Panel - 190ms

Overall Status: All APIs Working (9/9)
Critical APIs: All Working (5/5)
Average Response Time: 227ms
```

### Partial Success (Acceptable)

```
✅ Server Health Check - 45ms
✅ SuperAdmin Login - 180ms
✅ Company Balance - 160ms
✅ Company Transactions - 280ms
✅ All Users - 240ms
❌ NFT Initialize - Failed (NFT system not deployed)
❌ NFT Marketplace - Failed (Depends on NFT system)
❌ NFT Statistics - Failed (No NFT data)
✅ Admin Users Panel - 200ms

Overall Status: Critical APIs Working (5/5)
Optional APIs: Some Failed (1/4)
System Status: Production Ready ✅
```

### Critical Failure (Needs Attention)

```
✅ Server Health Check - 60ms
❌ SuperAdmin Login - Failed (Invalid credentials)
❌ Company Balance - Failed (Authentication required)
❌ Company Transactions - Failed (Authentication required)
❌ All Users - Failed (Authentication required)
❌ NFT Initialize - Failed (Authentication required)
❌ NFT Marketplace - Failed (Authentication required)
❌ NFT Statistics - Failed (Authentication required)
❌ Admin Users Panel - Failed (Authentication required)

Overall Status: Critical Failure ❌
Action Required: Fix authentication system
```

## 🔄 Automated Testing

### Continuous Testing

The dashboard automatically runs tests every 30 seconds when the SuperAdmin test page is open.

### Test Scheduling

```javascript
// Auto-test every 30 seconds
setInterval(() => {
  testAllAPIs();
}, 30000);
```

### Test Results Storage

```javascript
// Results stored in localStorage
localStorage.setItem("superadmin-test-results", JSON.stringify(results));
```

## 📈 Performance Benchmarks

### Response Time Targets

- **Server Health**: < 100ms
- **Authentication**: < 300ms
- **Data Retrieval**: < 500ms
- **Complex Operations**: < 1000ms

### Success Rate Targets

- **Critical APIs**: 99.9% uptime
- **Optional APIs**: 95% uptime
- **Overall System**: 99% availability

## 🚨 Alert Thresholds

### Critical Alerts

- Any critical API fails
- Response time > 5 seconds
- Authentication system down
- Database connection lost

### Warning Alerts

- Response time > 1 second
- Optional API failures
- High error rates (>5%)
- Memory/CPU usage high

## 📝 Test Report Generation

### Export Test Results

1. Click "Export Results" button
2. Download JSON file with complete test data
3. Share with development team if issues found

### Test Report Format

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "testSuite": "SuperAdmin API Tests",
  "totalTests": 9,
  "passed": 7,
  "failed": 2,
  "criticalPassed": 5,
  "criticalFailed": 0,
  "averageResponseTime": 245,
  "results": {
    "Server Health Check": {
      "status": "success",
      "responseTime": 45,
      "data": {...},
      "error": null
    }
  }
}
```

---

**Happy Testing! 🎉**

For any issues or questions, check the console logs or contact the development team.
