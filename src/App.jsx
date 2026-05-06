import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainDashBord from "./Dashbord/MainDashBord";
import Login from "./Login";
import Overview from "./Dashbord/Overview";
import RootWallet from "./Dashbord/RootWallet";
import UserManagement from "./Dashbord/UserManagement";
import MLMAnalysisReport from "./Dashbord/Analytics";
import AdminSettingsDashboard from "./Dashbord/SystemSettings";
import MLMHierarchy from "./Dashbord/MLMHierarchy";
import ContactUs from "./Dashbord/ContactUs";
import NFTAdmin from "./Dashbord/NFTAdmin";
import ChangePassword from "./Dashbord/ChangePassword";
import NFTTreeAnalysis from "./Dashbord/NFTTreeAnalysis";
import Withdrawal from "./Dashbord/Withdrawal";
import ScrollToTop from "./Dashbord/ScrollToTop";
import NFTTransactions from "./Dashbord/NFTTransactions";
import UserMarketplaceNFTs from "./Dashbord/UserMarketplaceNFTs";
import Marketplace from "./Dashbord/Marketplace";
import NotificationManagement from "./Dashbord/NotificationManagement";
import Profile from "./Dashbord/Profile";
// import APITesting from "./Dashbord/APITesting";

export default function App() {
  return (
    <BrowserRouter>
    <ScrollToTop/>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Dashbord" element={<MainDashBord />}>
          <Route index element={<Overview />} />
          <Route path="root-wallet" element={<RootWallet />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="system-settings" element={<AdminSettingsDashboard />} />
          <Route path="analytics" element={<MLMAnalysisReport />} />
          <Route path="mlm-hierarchy" element={<MLMHierarchy />} />
          <Route path="contact-us" element={<ContactUs />} />
          <Route path="nft-admin" element={<NFTAdmin />} />
          <Route path="nft-tree-analysis" element={<NFTTreeAnalysis />} />
          <Route path="nft-transactions" element={<NFTTransactions />} />
          <Route path="user-marketplace-nfts" element={<UserMarketplaceNFTs />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="notifications" element={<NotificationManagement />} />
          <Route path="withdrawal" element={<Withdrawal />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="profile" element={<Profile />} />
          {/* <Route path="api-testing" element={<APITesting />} /> */}

          <Route path="*" element={<Navigate to="/Dashbord" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
