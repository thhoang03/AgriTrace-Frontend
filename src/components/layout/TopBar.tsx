import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Search, Bell, ChevronDown, Menu, X, Settings, LogOut, User, Home, Globe } from "lucide-react";
import { useAuth } from "../../features/auth/auth.store";
import { useLanguage } from "../../contexts/LanguageContext";

interface TopBarProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}



export function TopBar({ onToggleSidebar, sidebarOpen }: TopBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang } = useLanguage();
  const [showUser, setShowUser] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    if (q.includes("/trace/")) {
      const code = q.split("/trace/").pop()!;
      navigate(`/trace/${code}`);
    } else {
      navigate(`/trace/${q}`);
    }
    setSearchQuery("");
  };

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: Array<{ label: string; path: string; icon?: any }> = [
      { label: lang === "vi" ? "Dashboard" : "Dashboard", path: "/app/dashboard", icon: Home }
    ];

    if (pathSegments.length > 0 && pathSegments[0] === "app") {
      if (pathSegments.length > 1) {
        const pageName = pathSegments[1];
        const pageLabelsVi: Record<string, string> = {
          "dashboard": "Dashboard",
          "batches": "Quản lý Lô Hàng",
          "supply-chain": "Chuỗi Cung Ứng",
          "inspection": "Kiểm Định Chất Lượng",
          "recall": "Quản Lý Thu Hồi",
          "reports": "Báo Cáo Thống Kê",
          "users": "Quản Lý Người Dùng",
          "profile": "Hồ Sơ Cá Nhân",
          "analytics": "Phân Tích Dữ Liệu",
          "notifications": "Thông Báo",
          "products": "Sản Phẩm",
          "categories": "Danh Mục",
          "organizations": "Tổ Chức & Đơn Vị",
        };

        const pageLabelsEn: Record<string, string> = {
          "dashboard": "Dashboard",
          "batches": "Batch Management",
          "supply-chain": "Supply Chain",
          "inspection": "Quality Inspection",
          "recall": "Recall Management",
          "reports": "Reports",
          "users": "User Management",
          "profile": "My Profile",
          "analytics": "Analytics",
          "notifications": "Notifications",
          "products": "Products",
          "categories": "Categories",
          "organizations": "Organizations",
        };

        const currentMap = lang === "vi" ? pageLabelsVi : pageLabelsEn;
        breadcrumbs.push({
          label: currentMap[pageName] || pageName.charAt(0).toUpperCase() + pageName.slice(1),
          path: location.pathname,
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const notifications = [
    { id: 1, text: lang === "vi" ? "Cảnh báo thu hồi: BTH-2024-006 (Sầu riêng)" : "Recall alert: BTH-2024-006 (Durian)", type: "recall", time: lang === "vi" ? "1 giờ trước" : "1h ago" },
    { id: 2, text: lang === "vi" ? "Kiểm định đạt chuẩn: BTH-2024-001" : "Inspection passed: BTH-2024-001", type: "pass", time: lang === "vi" ? "2 giờ trước" : "2h ago" },
    { id: 3, text: lang === "vi" ? "Lô hàng mới khởi tạo: BTH-2024-008" : "New batch created: BTH-2024-008", type: "info", time: lang === "vi" ? "3 giờ trước" : "3h ago" },
  ];

  const roleDisplay = user?.role === "STAFF" && user.organizationType
    ? `${user.role} — ${user.organizationType}`
    : user?.role;

  const emailDisplay = user?.email;
  const encodedName = encodeURIComponent(user?.name);
  const apiUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&rounded=true&size=128`;

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 relative z-30" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden">
        {sidebarOpen ? <X className="w-5 h-5 text-gray-500" /> : <Menu className="w-5 h-5 text-gray-500" />}
      </button>

      {/* Breadcrumbs */}
      <nav className="hidden md:flex items-center gap-2">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center gap-2">
            {index > 0 && <span className="text-gray-300">/</span>}
            <button
              onClick={() => navigate(crumb.path)}
              className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-green-600"
              style={{ color: index === breadcrumbs.length - 1 ? "#2E7D32" : "#6B7280" }}
            >
              {crumb.icon && <crumb.icon className="w-4 h-4" />}
              {crumb.label}
            </button>
          </div>
        ))}
      </nav>

      {/* Search Input */}
      <div className="flex-1 max-w-md relative ml-auto md:ml-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder={lang === "vi" ? "Nhập Mã Lô để tra cứu... (Enter)" : "Enter Batch ID to trace... (Enter)"}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
          className="w-full pl-9 pr-10 py-2 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
          style={{ background: "#F8FAF8", fontSize: 13 }}
        />
        {searchQuery && (
          <button
            onClick={handleSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-0.5 rounded-lg text-white transition-colors"
            style={{ background: "#2E7D32", fontSize: 11 }}
          >
            {lang === "vi" ? "Tìm" : "Go"}
          </button>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Language Switcher Button */}
        <button
          onClick={() => setLang(lang === "vi" ? "en" : "vi")}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50/50 text-xs font-bold text-gray-700 transition-all cursor-pointer"
          title={lang === "vi" ? "Switch to English" : "Đổi sang Tiếng Việt"}
        >
          <Globe className="w-3.5 h-3.5 text-green-700" />
          <span>{lang === "vi" ? "VN Tiếng Việt" : "EN English"}</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowUser(false); }}
            className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </button>
          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-gray-800">{lang === "vi" ? "Thông báo" : "Notifications"}</span>
                <span className="text-xs text-white px-2 py-0.5 rounded-full" style={{ background: "#E53935" }}>
                  {lang === "vi" ? "3 mới" : "3 new"}
                </span>
              </div>
              {notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "recall" ? "bg-red-500" : n.type === "pass" ? "bg-green-500" : "bg-blue-500"}`} />
                  <div>
                    <p className="text-sm text-gray-700">{n.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
              <div className="px-4 py-2 text-center">
                <button
                  onClick={() => { setShowNotif(false); navigate("/app/notifications"); }}
                  className="text-sm font-medium hover:underline transition-colors"
                  style={{ color: "#2E7D32" }}
                >
                  {lang === "vi" ? "Xem tất cả thông báo" : "View all notifications"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowUser(!showUser); setShowNotif(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <img src={apiUrl} alt={user?.name} className="w-7 h-7 rounded-full object-cover" />
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-gray-800">{user?.name}</div>
              <div className="text-xs text-gray-400">{roleDisplay}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {showUser && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="font-semibold text-gray-800">{user?.name}</div>
                <div className="text-xs text-gray-500">{emailDisplay}</div>
              </div>
              <button
                onClick={() => { navigate("/app/profile"); setShowUser(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <User className="w-4 h-4" /> {lang === "vi" ? "Hồ Sơ Cá Nhân" : "My Profile"}
              </button>
              <button
                onClick={() => { navigate("/app/profile"); setShowUser(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Settings className="w-4 h-4" /> {lang === "vi" ? "Cài Đặt Hệ Thống" : "Settings"}
              </button>
              <div className="border-t border-gray-100" />
              <button
                onClick={() => { logout(); navigate("/login"); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" /> {lang === "vi" ? "Đăng Xuất" : "Sign Out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
