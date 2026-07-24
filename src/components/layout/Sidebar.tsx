import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Package,
  Truck,
  FlaskConical,
  AlertTriangle,
  BarChart3,
  Users,
  UserCircle,
  LogOut,
  Leaf,
  ChevronRight,
  Shield,
  ShoppingBag,
  Building2,
  Tags,
} from "lucide-react";
import { useAuth } from "../../features/auth/auth.store";
import { canAccessRoute } from "../../features/auth/permissions";

const navItems = [
  { to: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/app/products", icon: ShoppingBag, label: "Products" },
  { to: "/app/batches", icon: Package, label: "Batch Management" },
  { to: "/app/batches/new", icon: Package, label: "New Batch" },
  { to: "/app/supply-chain", icon: Truck, label: "Supply Chain" },
  { to: "/app/inspection", icon: FlaskConical, label: "Quality Inspection" },
  { to: "/app/recall", icon: AlertTriangle, label: "Recall Management" },
  { to: "/app/reports", icon: BarChart3, label: "Reports" },
];

const adminItems = [
  { to: "/app/organizations", icon: Building2, label: "Organizations" },
  { to: "/app/categories", icon: Tags, label: "Categories" },
  { to: "/app/users", icon: Users, label: "User Management" },
  { to: "/app/profile", icon: UserCircle, label: "My Profile" },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const role = user?.role;
  const roleDisplay = role === "STAFF" && user?.organizationType
    ? `${role} — ${user.organizationType}`
    : role;

  const filteredNavItems = navItems.filter((item) => canAccessRoute(role, item.to));
  const filteredAdminItems = adminItems.filter((item) => canAccessRoute(role, item.to));

  return (
    <aside className="flex flex-col h-full" style={{ background: "linear-gradient(180deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%)" }}>
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
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
            Main Menu
          </span>
        </div>
        {filteredNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-green-100 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? "text-white" : "text-green-300"}`} style={{ width: 18, height: 18 }} />
                <span className="text-sm font-medium flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-green-300" />}
              </>
            )}
          </NavLink>
        ))}

        <div className="px-3 mt-5 mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-green-300" style={{ opacity: 0.7 }}>
            Administration
          </span>
        </div>
        {filteredAdminItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-green-100 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`flex-shrink-0 ${isActive ? "text-white" : "text-green-300"}`} style={{ width: 18, height: 18 }} />
                <span className="text-sm font-medium flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-green-300" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }}>
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20"
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
            <div className="text-xs text-green-200 truncate">{roleDisplay}</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-green-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Logout"
          >
            <LogOut style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    </aside>
  );
}
