import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Search, Bell, ChevronDown, Menu, X, LogOut, User, Home, Globe, AlertTriangle, FlaskConical, Package, ShieldAlert, BadgeCheck, Inbox } from "lucide-react";
import { useAuth } from "../../features/auth/auth.store";
import { useLanguage } from "../../contexts/LanguageContext";
import { useNotifications, useUnreadNotificationCount, useMarkNotificationRead } from "../../features/notifications/notifications.queries";
import { formatRelativeTime, parseLocalizedText, notificationTypeRoute } from "../../features/notifications/notifications.utils";

const NOTIF_ICON: Record<string, { icon: React.ElementType; className: string }> = {
  RECALL: { icon: AlertTriangle, className: "text-destructive bg-destructive/10" },
  INSPECTION: { icon: FlaskConical, className: "text-blue-600 bg-blue-500/10 dark:text-blue-400" },
  BATCH: { icon: Package, className: "text-primary bg-primary/10" },
  SYSTEM: { icon: ShieldAlert, className: "text-purple-600 bg-purple-500/10 dark:text-purple-400" },
  CERTIFICATE: { icon: BadgeCheck, className: "text-teal-600 bg-teal-500/10 dark:text-teal-400" },
};
const DEFAULT_NOTIF_ICON = { icon: Bell, className: "text-muted-foreground bg-muted" };

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

  const { data: unreadData } = useUnreadNotificationCount();
  const { data: notifData } = useNotifications({ page: 1, pageSize: 6 });
  const markReadMutation = useMarkNotificationRead();
  const unreadCount = unreadData?.data?.unreadCount ?? 0;
  const recentNotifications = notifData?.data?.items ?? [];

  const handleNotifClick = (n: (typeof recentNotifications)[number]) => {
    if (!n.isRead) markReadMutation.mutate(n.notificationId);
    setShowNotif(false);
    navigate(notificationTypeRoute((n as any).type));
  };

  const roleDisplay = user?.role === "STAFF" && user.organizationType
    ? `${user.role} — ${user.organizationType}`
    : user?.role;

  const emailDisplay = user?.email;
  const encodedName = encodeURIComponent(user?.name);
  const apiUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&rounded=true&size=128`;

  return (
    <header className="h-16 bg-card border-b border-border flex items-center px-6 gap-4 relative z-30 shadow-sm transition-colors">
      <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-muted transition-colors lg:hidden">
        {sidebarOpen ? <X className="w-5 h-5 text-muted-foreground" /> : <Menu className="w-5 h-5 text-muted-foreground" />}
      </button>

      {/* Breadcrumbs */}
      <nav className="hidden md:flex items-center gap-2">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center gap-2">
            {index > 0 && <span className="text-muted-foreground/50">/</span>}
            <button
              onClick={() => navigate(crumb.path)}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary ${
                index === breadcrumbs.length - 1 ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {crumb.icon && <crumb.icon className="w-4 h-4" />}
              {crumb.label}
            </button>
          </div>
        ))}
      </nav>

      {/* Search Input */}
      <div className="flex-1 max-w-md relative ml-auto md:ml-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder={lang === "vi" ? "Nhập Mã Lô để tra cứu..." : "Enter Batch ID to trace... "}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
          className="w-full pl-9 pr-10 py-2 rounded-xl border border-border bg-input-background text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          style={{ fontSize: 13 }}
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
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border hover:border-primary hover:bg-primary/10 text-xs font-bold text-foreground transition-all cursor-pointer"
          title={lang === "vi" ? "Switch to English" : "Đổi sang Tiếng Việt"}
        >
          <Globe className="w-3.5 h-3.5 text-primary" />
          <span>{lang === "vi" ? "VN Tiếng Việt" : "EN English"}</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowUser(false); }}
            className="relative p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center leading-none ring-2 ring-card">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-card rounded-2xl shadow-xl border border-border overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="font-semibold text-foreground">{lang === "vi" ? "Thông báo" : "Notifications"}</span>
                {unreadCount > 0 && (
                  <span className="text-xs text-destructive-foreground bg-destructive px-2 py-0.5 rounded-full">
                    {unreadCount} {lang === "vi" ? "mới" : "new"}
                  </span>
                )}
              </div>
              {recentNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Inbox className="w-8 h-8 mb-2 text-muted-foreground/50" />
                  <p className="text-sm">{lang === "vi" ? "Không có thông báo" : "No notifications"}</p>
                </div>
              ) : (
                recentNotifications.map((n: any) => {
                  const cfg = NOTIF_ICON[(n.type ?? "").toUpperCase()] ?? DEFAULT_NOTIF_ICON;
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={n.notificationId}
                      onClick={() => handleNotifClick(n)}
                      className={`w-full flex items-start gap-3 px-4 py-3 border-b border-border hover:bg-muted/60 cursor-pointer text-left transition-colors ${!n.isRead ? "bg-primary/5" : ""}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.className}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground font-medium truncate">{parseLocalizedText(n.title, lang) || (lang === "vi" ? "Thông báo hệ thống" : "System notification")}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{parseLocalizedText(n.message, lang)}</p>
                        <p className="text-[11px] text-muted-foreground/70 mt-0.5">{formatRelativeTime(n.createdAt, lang)}</p>
                      </div>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                    </button>
                  );
                })
              )}
              <div className="px-4 py-2 text-center">
                <button
                  onClick={() => { setShowNotif(false); navigate("/app/notifications"); }}
                  className="text-sm font-medium text-primary hover:underline transition-colors"
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-muted transition-colors"
          >
            <img src={apiUrl} alt={user?.name} className="w-7 h-7 rounded-full object-cover" />
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-foreground">{user?.name}</div>
              <div className="text-xs text-muted-foreground">{roleDisplay}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {showUser && (
            <div className="absolute right-0 top-12 w-56 bg-card rounded-2xl shadow-xl border border-border overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-border">
                <div className="font-semibold text-foreground">{user?.name}</div>
                <div className="text-xs text-muted-foreground">{emailDisplay}</div>
              </div>
              <button
                onClick={() => { navigate("/app/profile"); setShowUser(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/60"
              >
                <User className="w-4 h-4" /> {lang === "vi" ? "Hồ Sơ Cá Nhân" : "My Profile"}
              </button>
              <div className="border-t border-border" />
              <button
                onClick={() => { logout(); navigate("/login"); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10"
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
