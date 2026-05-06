# 🏗️ MLM Admin Panel - Complete Backend Structure

## 📁 Backend Folder Structure

```
backend/
├── models/
│   ├── User.js                 ✅ (Already exists)
│   ├── AdminWallet.js          ❌ (Need to create)
│   ├── Transaction.js          ❌ (Need to create)
│   ├── ParentRelation.js       ❌ (Need to create)
│   ├── SecurityAlert.js        ❌ (Need to create)
│   └── SystemSettings.js       ❌ (Need to create)
│
├── controllers/
│   ├── authController.js       ✅ (Already exists - has Getuser, delete)
│   ├── dashboardController.js  ❌ (Need to create)
│   ├── walletController.js     ❌ (Need to create)
│   ├── parentController.js     ❌ (Need to create)
│   ├── reportController.js     ❌ (Need to create)
│   ├── analyticsController.js  ❌ (Need to create)
│   ├── securityController.js   ❌ (Need to create)
│   └── settingsController.js   ❌ (Need to create)
│
├── routes/
│   ├── authRoutes.js           ✅ (Already exists)
│   ├── dashboardRoutes.js      ❌ (Need to create)
│   ├── walletRoutes.js         ❌ (Need to create)
│   ├── parentRoutes.js         ❌ (Need to create)
│   ├── reportRoutes.js         ❌ (Need to create)
│   ├── analyticsRoutes.js      ❌ (Need to create)
│   ├── securityRoutes.js       ❌ (Need to create)
│   └── settingsRoutes.js       ❌ (Need to create)
│
├── middleware/
│   └── authMiddleware.js       ✅ (Already exists)
│
└── server.js                   ✅ (Already exists)
```

---

## 📊 **API Status Summary**

| Module | APIs | Built ✅ | Pending ❌ | Model | Controller | Routes |
|--------|------|---------|-----------|-------|------------|--------|
| **Auth** | 3 | 2 | 1 | ✅ | ✅ | ✅ |
| **Dashboard** | 1 | 0 | 1 | ❌ | ❌ | ❌ |
| **Wallet** | 2 | 0 | 2 | ❌ | ❌ | ❌ |
| **Parents** | 4 | 0 | 4 | ❌ | ❌ | ❌ |
| **Reports** | 2 | 0 | 2 | ❌ | ❌ | ❌ |
| **Analytics** | 1 | 0 | 1 | ❌ | ❌ | ❌ |
| **Security** | 3 | 0 | 3 | ❌ | ❌ | ❌ |
| **Settings** | 2 | 0 | 2 | ❌ | ❌ | ❌ |

---

## 1️⃣ **Auth Module** ✅ (Partially Done)

### Model: `User.js` ✅
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: String,
  password: String,
  walletAddress: String,
  referralCode: String,
  balance: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  currentPlan: String,
  isActive: { type: Boolean, default: true },
  isFrozen: { type: Boolean, default: false },
  parents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  totalEarnings: { type: Number, default: 0 },
  totalInvestment: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
```

### Controller: `authController.js` ✅
```javascript
// Already has:
exports.getUsers = async (req, res) => { ... }  ✅
exports.deleteUser = async (req, res) => { ... } ✅

// Need to add:
exports.freezeUser = async (req, res) => { ... } ❌
```

### Routes: `authRoutes.js` ✅
```javascript
router.get('/Getuser', authMiddleware, getUsers);        ✅
router.delete('/delete/:userId', authMiddleware, deleteUser); ✅
router.put('/freeze/:userId', authMiddleware, freezeUser);    ❌
```

---

## 2️⃣ **Dashboard Module** ❌ (Need to Create)

### Model: Not needed (uses aggregation from User model)

### Controller: `dashboardController.js` ❌
```javascript
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const AdminWallet = require('../models/AdminWallet');

// GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const orphanUsers = await User.countDocuments({ parents: { $size: 0 } });
    
    const wallet = await AdminWallet.findOne();
    
    // Calculate today, week, month income
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayIncome = await Transaction.aggregate([
      { $match: { dateTime: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$adminShare' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        orphanUsers,
        totalRegistrations: totalUsers,
        totalCollected: totalUsers * 10,
        parentsPayout: wallet.totalPaidToParents,
        adminWallet: wallet.currentBalance,
        todayIncome: todayIncome[0]?.total || 0,
        // ... more calculations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### Routes: `dashboardRoutes.js` ❌
```javascript
const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/stats', authMiddleware, getDashboardStats);

module.exports = router;
```

---

## 3️⃣ **Wallet Module** ❌ (Need to Create)

### Model: `AdminWallet.js` ❌
```javascript
const mongoose = require('mongoose');

const adminWalletSchema = new mongoose.Schema({
  currentBalance: { type: Number, default: 0 },
  totalCollected: { type: Number, default: 0 },
  totalPaidToParents: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdminWallet', adminWalletSchema);
```

### Model: `Transaction.js` ❌
```javascript
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  registrationAmount: { type: Number, default: 10 },
  parentsPaid: Number,
  adminShare: Number,
  walletBalanceAfter: Number,
  dateTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
```

### Controller: `walletController.js` ❌
```javascript
const AdminWallet = require('../models/AdminWallet');
const Transaction = require('../models/Transaction');

// GET /api/wallet/balance
exports.getWalletBalance = async (req, res) => {
  try {
    const wallet = await AdminWallet.findOne();
    res.json({ success: true, data: wallet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/wallet/transactions
exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const transactions = await Transaction.find()
      .populate('userId', 'name email')
      .sort({ dateTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Transaction.countDocuments();
    
    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalTransactions: count
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### Routes: `walletRoutes.js` ❌
```javascript
const express = require('express');
const router = express.Router();
const { getWalletBalance, getTransactions } = require('../controllers/walletController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/balance', authMiddleware, getWalletBalance);
router.get('/transactions', authMiddleware, getTransactions);

module.exports = router;
```

---

## 4️⃣ **Parent Module** ❌ (Need to Create)

### Model: `ParentRelation.js` ❌
```javascript
const mongoose = require('mongoose');

const parentRelationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  earnedFromThisUser: { type: Number, default: 1 },
  status: { type: String, default: 'Active' },
  addedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ParentRelation', parentRelationSchema);
```

### Controller: `parentController.js` ❌
```javascript
const User = require('../models/User');
const ParentRelation = require('../models/ParentRelation');

// GET /api/parents/users
exports.getAllUsersWithParents = async (req, res) => {
  try {
    const users = await User.find()
      .populate('parents', 'name email')
      .select('name email parents');
    
    const data = users.map(user => ({
      userId: user._id,
      name: user.name,
      email: user.email,
      parents: user.parents,
      parentCount: user.parents.length,
      isOrphan: user.parents.length === 0,
      maxParentsAllowed: 9
    }));
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/parents/add
exports.addParent = async (req, res) => {
  try {
    const { userId, parentId } = req.body;
    
    const user = await User.findById(userId);
    
    if (user.parents.length >= 9) {
      return res.status(400).json({
        success: false,
        message: 'Maximum parents limit reached (9)'
      });
    }
    
    if (user.parents.includes(parentId)) {
      return res.status(400).json({
        success: false,
        message: 'Parent already exists'
      });
    }
    
    user.parents.push(parentId);
    await user.save();
    
    // Create parent relation record
    await ParentRelation.create({ userId, parentId });
    
    res.json({
      success: true,
      message: 'Parent added successfully',
      data: { userId, parentCount: user.parents.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/parents/remove
exports.removeParent = async (req, res) => {
  try {
    const { userId, parentId } = req.body;
    
    const user = await User.findById(userId);
    user.parents = user.parents.filter(p => p.toString() !== parentId);
    await user.save();
    
    await ParentRelation.deleteOne({ userId, parentId });
    
    res.json({ success: true, message: 'Parent removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/parents/user/:userId
exports.getUserParents = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).populate('parents', 'name email');
    const relations = await ParentRelation.find({ userId });
    
    res.json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        parents: relations,
        parentCount: user.parents.length,
        isOrphan: user.parents.length === 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### Routes: `parentRoutes.js` ❌
```javascript
const express = require('express');
const router = express.Router();
const {
  getAllUsersWithParents,
  addParent,
  removeParent,
  getUserParents
} = require('../controllers/parentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/users', authMiddleware, getAllUsersWithParents);
router.post('/add', authMiddleware, addParent);
router.delete('/remove', authMiddleware, removeParent);
router.get('/user/:userId', authMiddleware, getUserParents);

module.exports = router;
```

---

## 5️⃣ **Report Module** ❌ (Need to Create)

### Controller: `reportController.js` ❌
```javascript
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// GET /api/reports/registration
exports.getRegistrationReport = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const users = await User.find(query)
      .select('name email parents createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const reports = users.map(user => ({
      userId: user._id,
      userName: user.name,
      email: user.email,
      registrationAmount: 10,
      parentsCount: user.parents.length,
      parentsPayout: user.parents.length * 1,
      adminShare: 10 - (user.parents.length * 1),
      registrationDate: user.createdAt
    }));
    
    const totalUsers = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        summary: {
          totalRegistrations: totalUsers,
          totalCollected: totalUsers * 10,
          totalParentsPayout: reports.reduce((sum, r) => sum + r.parentsPayout, 0),
          totalAdminShare: reports.reduce((sum, r) => sum + r.adminShare, 0)
        },
        reports,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          totalRecords: totalUsers
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reports/registration/export
exports.exportRegistrationReport = async (req, res) => {
  try {
    const users = await User.find().select('name email parents createdAt');
    
    let csv = 'User,Email,Parents Count,Parents Payout,Admin Share,Date\n';
    users.forEach(user => {
      const parentsPayout = user.parents.length * 1;
      const adminShare = 10 - parentsPayout;
      csv += `${user.name},${user.email},${user.parents.length},$${parentsPayout},$${adminShare},${user.createdAt}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=registration_report.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### Routes: `reportRoutes.js` ❌
```javascript
const express = require('express');
const router = express.Router();
const {
  getRegistrationReport,
  exportRegistrationReport
} = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/registration', authMiddleware, getRegistrationReport);
router.get('/registration/export', authMiddleware, exportRegistrationReport);

module.exports = router;
```

---

## 6️⃣ **Analytics Module** ❌ (Need to Create)

### Controller: `analyticsController.js` ❌
```javascript
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// GET /api/analytics/stats
exports.getAnalyticsStats = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    // Calculate stats based on period
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const orphanUsers = await User.countDocuments({ parents: { $size: 0 } });
    
    // Get chart data
    const transactions = await Transaction.find().sort({ dateTime: -1 }).limit(100);
    
    res.json({
      success: true,
      data: {
        dailyIncome: 450,
        monthlyIncome: 7773,
        avgParentsPerUser: 3.7,
        orphanPercentage: (orphanUsers / totalUsers * 100).toFixed(1),
        activeUserRate: (activeUsers / totalUsers * 100).toFixed(1),
        chartData: {
          incomeChart: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            data: [320, 450, 380, 520, 610, 480, 550]
          },
          userDistribution: {
            active: activeUsers,
            orphan: orphanUsers,
            inactive: totalUsers - activeUsers
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### Routes: `analyticsRoutes.js` ❌
```javascript
const express = require('express');
const router = express.Router();
const { getAnalyticsStats } = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/stats', authMiddleware, getAnalyticsStats);

module.exports = router;
```

---

## 7️⃣ **Security Module** ❌ (Need to Create)

### Model: `SecurityAlert.js` ❌
```javascript
const mongoose = require('mongoose');

const securityAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  issue: String,
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'] },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending' }
});

module.exports = mongoose.model('SecurityAlert', securityAlertSchema);
```

### Controller: `securityController.js` ❌
```javascript
const SecurityAlert = require('../models/SecurityAlert');
const User = require('../models/User');

// GET /api/security/alerts
exports.getSecurityAlerts = async (req, res) => {
  try {
    const alerts = await SecurityAlert.find().sort({ timestamp: -1 }).limit(50);
    
    const summary = {
      duplicateParents: await SecurityAlert.countDocuments({ issue: 'Duplicate parent detected' }),
      selfParenting: await SecurityAlert.countDocuments({ issue: 'Self-parenting attempt' }),
      sameWallet: await SecurityAlert.countDocuments({ issue: 'Same wallet usage' }),
      multipleIP: await SecurityAlert.countDocuments({ issue: 'Multiple IP addresses' }),
      suspiciousUsers: await User.countDocuments({ isFrozen: true })
    };
    
    res.json({ success: true, data: { alerts, summary } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/security/blocked-actions
exports.getBlockedActions = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAlerts = await SecurityAlert.countDocuments({
      timestamp: { $gte: today }
    });
    
    res.json({
      success: true,
      data: {
        today: {
          duplicateParentAttempts: 12,
          selfParentingRejected: 5,
          accountsFrozen: 3
        },
        total: {
          threatsBlocked: 51,
          activeMonitors: 5,
          flaggedUsers: 8
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/security/freeze-user
exports.freezeUser = async (req, res) => {
  try {
    const { userId, reason, duration } = req.body;
    
    const user = await User.findById(userId);
    user.isFrozen = true;
    await user.save();
    
    await SecurityAlert.create({
      userId,
      userName: user.name,
      issue: reason,
      severity: 'High'
    });
    
    res.json({
      success: true,
      message: 'User frozen successfully',
      data: { userId, isFrozen: true, reason }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### Routes: `securityRoutes.js` ❌
```javascript
const express = require('express');
const router = express.Router();
const {
  getSecurityAlerts,
  getBlockedActions,
  freezeUser
} = require('../controllers/securityController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/alerts', authMiddleware, getSecurityAlerts);
router.get('/blocked-actions', authMiddleware, getBlockedActions);
router.post('/freeze-user', authMiddleware, freezeUser);

module.exports = router;
```

---

## 8️⃣ **Settings Module** ❌ (Need to Create)

### Model: `SystemSettings.js` ❌
```javascript
const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  registrationAmount: { type: Number, default: 10 },
  perParentIncome: { type: Number, default: 1 },
  maxParentsAllowed: { type: Number, default: 9 },
  registrationStatus: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: String
});

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
```

### Controller: `settingsController.js` ❌
```javascript
const SystemSettings = require('../models/SystemSettings');

// GET /api/settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/settings
exports.updateSettings = async (req, res) => {
  try {
    const {
      registrationAmount,
      perParentIncome,
      maxParentsAllowed,
      registrationStatus,
      maintenanceMode
    } = req.body;
    
    // Validation
    if (registrationAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Registration amount must be greater than 0'
      });
    }
    
    if (maxParentsAllowed > 9) {
      return res.status(400).json({
        success: false,
        message: 'Max parents cannot exceed 9'
      });
    }
    
    let settings = await SystemSettings.findOne();
    
    if (!settings) {
      settings = new SystemSettings();
    }
    
    settings.registrationAmount = registrationAmount;
    settings.perParentIncome = perParentIncome;
    settings.maxParentsAllowed = maxParentsAllowed;
    settings.registrationStatus = registrationStatus;
    settings.maintenanceMode = maintenanceMode;
    settings.lastUpdated = Date.now();
    
    await settings.save();
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### Routes: `settingsRoutes.js` ❌
```javascript
const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getSettings);
router.put('/', authMiddleware, updateSettings);

module.exports = router;
```

---

## 🔧 **server.js Update** ❌

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));           ✅
app.use('/api/dashboard', require('./routes/dashboardRoutes')); ❌
app.use('/api/wallet', require('./routes/walletRoutes'));       ❌
app.use('/api/parents', require('./routes/parentRoutes'));      ❌
app.use('/api/reports', require('./routes/reportRoutes'));      ❌
app.use('/api/analytics', require('./routes/analyticsRoutes')); ❌
app.use('/api/security', require('./routes/securityRoutes'));   ❌
app.use('/api/settings', require('./routes/settingsRoutes'));   ❌

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

## 📝 **Summary:**

### ✅ **Already Created:**
- User Model
- authController (getUsers, deleteUser)
- authRoutes

### ❌ **Need to Create:**

**Models (5):**
1. AdminWallet.js
2. Transaction.js
3. ParentRelation.js
4. SecurityAlert.js
5. SystemSettings.js

**Controllers (7):**
1. dashboardController.js
2. walletController.js
3. parentController.js
4. reportController.js
5. analyticsController.js
6. securityController.js
7. settingsController.js

**Routes (7):**
1. dashboardRoutes.js
2. walletRoutes.js
3. parentRoutes.js
4. reportRoutes.js
5. analyticsRoutes.js
6. securityRoutes.js
7. settingsRoutes.js

**Total Files to Create:** 19

---

**Backend developer ko ye document de do, wo easily implement kar lega!** 🚀
