import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Package,
  Truck,
  FlaskConical,
  AlertTriangle,
  BarChart3,
  LineChart,
  Users,
  UserCircle,
  LogOut,
  Leaf,
  ChevronRight,
  Shield,
  ShoppingBag,
  Building2,
  Tags,
  Bell,
  Clock,
} from "lucide-react";
import { useAuth } from "../../features/auth/auth.store";
import { canAccessRoute } from "../../features/auth/permissions";
import { useLanguage } from "../../contexts/LanguageContext";

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/app/dashboard", icon: LayoutDashboard, labelVi: "Trang quan sát", labelEn: "Dashboard" },
    { to: "/app/batches", icon: Package, labelVi: "Quản lý lô hàng", labelEn: "Batch Management" },
    { to: "/app/supply-chain", icon: Truck, labelVi: "Chuỗi cung ứng", labelEn: "Supply Chain" },
    { to: "/app/event-requests", icon: Clock, labelVi: "Yêu cầu sự kiện", labelEn: "Event Requests" },
    { to: "/app/inspection", icon: FlaskConical, labelVi: "Kiểm định chất lượng", labelEn: "Quality Inspection" },
    { to: "/app/recall", icon: AlertTriangle, labelVi: "Quản lý thu hồi", labelEn: "Recall Management" },
    { to: "/app/reports", icon: BarChart3, labelVi: "Báo cáo thống kê", labelEn: "Reports" },
    { to: "/app/analytics", icon: LineChart, labelVi: "Phân tích dữ liệu", labelEn: "Analytics" },
    { to: "/app/notifications", icon: Bell, labelVi: "Thông báo hệ thống", labelEn: "Notifications" },
  ];

  const adminItems = [
    { to: "/app/products", icon: ShoppingBag, labelVi: "Sản phẩm", labelEn: "Products" },
    { to: "/app/categories", icon: Tags, labelVi: "Danh mục", labelEn: "Categories" },
    { to: "/app/organizations", icon: Building2, labelVi: "Tổ chức & Đơn vị", labelEn: "Organizations" },
    { to: "/app/users", icon: Users, labelVi: "Người dùng", labelEn: "Users" },
    { to: "/app/profile", icon: UserCircle, labelVi: "Hồ sơ cá nhân", labelEn: "My Profile" },
  ];

  const role = user?.role;
  const roleDisplay = user?.organizationType
    ? `${role} - ${user.organizationType}`
    : role;

  const filteredNavItems = navItems.filter((item) => canAccessRoute(role, item.to, user?.organizationType));
  const filteredAdminItems = adminItems.filter((item) => canAccessRoute(role, item.to, user?.organizationType));
  const encodedName = encodeURIComponent(user?.name);
  const apiUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&rounded=true&size=128`;

  return (
    <aside className="flex flex-col h-full" style={{ background: "linear-gradient(180deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%)" }}>
      <div
        className="flex items-center gap-3 px-6 py-5 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => navigate("/")}
        title={lang === "vi" ? "Về trang chủ" : "Go to Homepage"}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-white font-bold tracking-tight" style={{ fontSize: "15px", lineHeight: 1.2 }}>AgriTrace</div>
          <div className="text-green-200 text-xs" style={{ opacity: 0.8 }}>Vietnam</div>
        </div>
        <div className="ml-auto">
          <Shield className="w-4 h-4 text-green-300" />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        <div className="px-3 mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-green-300" style={{ opacity: 0.7 }}>
            {lang === "vi" ? "Menu chính" : "Main Menu"}
          </span>
        </div>
        {filteredNavItems.map(({ to, icon: Icon, labelVi, labelEn }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive
                ? "bg-white/15 text-white"
                : "text-green-100 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? "text-white" : "text-green-300"}`} style={{ width: 18, height: 18 }} />
                <span className="text-sm font-medium flex-1">{lang === "vi" ? labelVi : labelEn}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-green-300" />}
              </>
            )}
          </NavLink>
        ))}

        <div className="px-3 mt-5 mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-green-300" style={{ opacity: 0.7 }}>
            {lang === "vi" ? "Quản trị hệ thống" : "Administration"}
          </span>
        </div>
        {filteredAdminItems.map(({ to, icon: Icon, labelVi, labelEn }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive
                ? "bg-white/15 text-white"
                : "text-green-100 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`flex-shrink-0 ${isActive ? "text-white" : "text-green-300"}`} style={{ width: 18, height: 18 }} />
                <span className="text-sm font-medium flex-1">{lang === "vi" ? labelVi : labelEn}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-green-300" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }}>
          <img
            src={apiUrl}
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20"
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
            <div className="text-xs text-green-200 truncate">
              {roleDisplay}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-green-300 hover:text-white hover:bg-white/10 transition-colors"
            title={lang === "vi" ? "Đăng xuất" : "Sign Out"}
          >
            <LogOut style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    </aside>
  );
}
