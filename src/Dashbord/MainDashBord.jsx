
import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { onForegroundMessage, generateAndSaveFCMToken } from "../config/firebase";
import {
  FaBorderAll,
  FaListAlt,
  FaFileInvoiceDollar,
  FaProjectDiagram,
  FaUsersCog,
  FaHeadset,
  FaShieldAlt,
  FaSitemap,
  FaHistory,
  FaStoreAlt,
  FaStore,
  FaBell,
  FaKey,
  FaUserCircle,
  FaSignOutAlt,
  FaTimes,
  FaUser,
} from "react-icons/fa";

import { GiHamburgerMenu } from "react-icons/gi";

/* ── ACTIVE / INACTIVE MENU STYLE ── */
const menuClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
   ${isActive
    ? "bg-[#D4AF37]/20 text-[#F3C06A] border border-[#D4AF37]/30 shadow-lg shadow-[#D4AF37]/10"
    : "text-[#F3C06A] hover:bg-[#D4AF37]/5 border border-transparent"
  }`;

/* ── MENU ITEMS ── */
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
  // ["CryptoNest Transactions", "/Dashbord/nft-transactions", FaHistory],

  ["User Marketplace", "/Dashbord/user-marketplace-nfts", FaStoreAlt],
  // ["Change Password", "/Dashbord/change-password", FaKey],
  ["Profile", "/Dashbord/profile", FaUserCircle],
];

export default function MainDashBord() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // ✅ Automatically request notification permission and save token
  useEffect(() => {
    const setupNotifications = async () => {
      const authToken = localStorage.getItem("token");
      if (authToken) {
        await generateAndSaveFCMToken(authToken);
      }
    };
    setupNotifications();
  }, []);

  // ✅ Foreground FCM Notification listener
  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload?.notification?.title || '🔔 New Notification';
      const body = payload?.notification?.body || '';

      // Use SweetAlert for a premium look in the dashboard instead of system popups
      Swal.fire({
        title: title,
        text: body,
        icon: 'info',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        background: '#1a1a2e',
        color: '#F3C06A',
        iconColor: '#D4AF37',
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
          // Play a subtle notification sound if needed
        }
      });
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  /* SCREEN CHECK */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* REAL TIME CLOCK */
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/Dashbord") return "Dashboard";
    if (path.includes("root-wallet")) return "Transactions";
    if (path.includes("withdrawal")) return "Payout Requests";
    if (path.includes("mlm-hierarchy")) return "Network Hierarchy";
    if (path.includes("user-management")) return "Users";
    if (path.includes("contact-us")) return "Contact Us";
    if (path.includes("nft-admin")) return "CryptoNest Admin";
    if (path.includes("nft-tree-analysis")) return "CryptoNest Tree";
    if (path.includes("nft-transactions")) return "NFT Transactions";
    if (path.includes("user-marketplace-nfts")) return "User Marketplace";
    if (path.includes("marketplace")) return "Marketplace";
    if (path.includes("notifications")) return "Notifications";
    if (path.includes("change-password")) return "Change Password";
    if (path.includes("profile")) return "Profile";
    if (path.includes("analytics")) return "Analytics";
    if (path.includes("system-settings")) return "Settings";
    return "Dashboard";
  };

  return (
    <div className="h-screen flex bg-black overflow-hidden">

      {/* ── MOBILE OVERLAY ── */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ════════════════════════════════
              SIDEBAR
      ════════════════════════════════ */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col
          bg-black border-r border-[#D4AF37]/20
          transition-[width,transform] duration-300 ease-in-out
          ${isMobile
            ? sidebarOpen
              ? "w-[338px] translate-x-0 shadow-2xl shadow-[#D4AF37]/10"
              : "-translate-x-full w-[338px]"
            : "w-[306px]"
          }`}
      >
        {/* ── LOGO ── */}
        <div className="h-[70px] flex items-center justify-between px-4 border-b border-[#D4AF37]/20 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/image.png" alt="CryptoNext" className="h-10 w-auto object-contain" />
            <div className="min-w-0">
              <p className="text-[#F3C06A] font-bold text-base leading-tight truncate uppercase tracking-tight">CryptoNext</p>
              <p className="text-[#D4AF37]/60 text-xs font-medium tracking-widest uppercase truncate">CryptoAdmin</p>
            </div>
          </div>
          {/* Close btn on mobile */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-[#D4AF37] hover:text-[#F3C06A] p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <FaTimes size={14} />
            </button>
          )}
        </div>

        {/* ── NAV MENU ── */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {/* Section Label */}


          {MENU.map(([label, path, Icon]) => (
            <NavLink
              key={label}
              to={path}
              end={path === "/Dashbord"}
              className={menuClass}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              {/* Icon Box */}
              <div className="shrink-0 flex items-center justify-center rounded-lg w-8 h-8
                   border border-[#D4AF37]/10 group-hover:border-[#D4AF37]/30 transition-all duration-200">
                <Icon size={15} />
              </div>
              {/* Label */}
              <span className="text-base font-semibold tracking-wide truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ── LOGOUT ── */}
        <div className="p-3 border-t border-[#D4AF37]/20 shrink-0">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
              bg-black border border-red-500/20 text-red-500
              hover:bg-red-500 hover:text-white
              transition-all duration-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]`}
          >
            <FaSignOutAlt size={13} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════
              MAIN CONTENT AREA
      ════════════════════════════════ */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300
          ${!isMobile && "ml-[306px]"}`}
      >

        {/* ── HEADER ── */}
        <header className="h-[70px] shrink-0 flex items-center justify-between px-4 md:px-6
          bg-black/95 backdrop-blur-xl
          border-b border-[#D4AF37]/20
          shadow-lg shadow-black/40">

          {/* LEFT — Hamburger + Page Title */}
          <div className="flex items-center gap-3 min-w-0">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-9 h-9 shrink-0 bg-black hover:bg-[#D4AF37]/10
                  border border-[#D4AF37]/20 rounded-lg
                  flex items-center justify-center text-[#D4AF37]
                  hover:text-[#F3C06A] transition-colors duration-200"
              >
                <GiHamburgerMenu size={16} />
              </button>
            )}

            {/* Welcome Message */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-[#D4AF37] to-[#F3C06A] shrink-0" />
              <div className="min-w-0">

                <h1 className="text-sm md:text-lg font-black truncate leading-tight">
                  <span className="text-[#D4AF37]/80 font-semibold">Welcome, </span>
                  <span className="bg-gradient-to-r from-[#F3C06A] via-[#D4AF37] to-[#F3C06A] bg-clip-text text-transparent">
                    {user?.name || "Super Admin"}
                  </span>
                  <span className="ml-1">👑</span>
                </h1>
              </div>
            </div>
          </div>

          {/* RIGHT — Clock + Search + User */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button
              onClick={() => navigate("/Dashbord/withdrawal")}
              className="relative w-9 h-9 rounded-xl bg-black border border-[#D4AF37]/20
              flex items-center justify-center text-[#D4AF37]
              hover:text-[#F3C06A] hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10
              transition-all duration-200">
              <FaBell size={14} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D4AF37] ring-2 ring-black" />
            </button>


            {/* CLOCK */}
            <div className="hidden sm:flex flex-col items-end bg-black/40 border border-[#D4AF37]/20 px-3 py-1.5 rounded-xl">
              <p className="text-xs font-bold text-[#D4AF37] leading-tight">
                {dateTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
              </p>
              <p className="text-sm font-black text-[#F3C06A] leading-tight tabular-nums">
                {dateTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </p>
            </div>

            {/* NOTIFICATION BELL */}

            {/* USER INFO & AVATAR */}

          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 overflow-auto p-3 md:p-5
          bg-black">

          {/* Subtle grid background */}
          <div className="relative min-h-full">
            {/* Content Card */}
            <div>
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* ── GLOBAL STYLES ── */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        /* Subtle animated gold glow */
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(212, 175, 55, 0.2); }
          50%       { box-shadow: 0 0 16px rgba(243, 192, 106, 0.2); }
        }
      `}</style>
    </div>
  );
}
