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
  ChevronLeft,
  Shield,
  ShoppingBag,
  Building2,
  Tags,
  Bell,
  Clock,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../../features/auth/auth.store";
import { canAccessRoute } from "../../features/auth/permissions";
import { useLanguage } from "../../contexts/LanguageContext";

import { useApprovedExtraEvents, useEventRequests } from "../../features/event-requests/event-requests.queries";
import { useRecalls } from "../../features/recall/recalls.queries";
import { useInspections } from "../../features/inspection/inspection.queries";
import { useOrganizationsList } from "../../features/organizations/organizations.queries";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const approvedExtraEvents = useApprovedExtraEvents();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/app/dashboard", icon: LayoutDashboard, labelVi: "Trang quan sát", labelEn: "Dashboard" },
    { to: "/app/batches", icon: Package, labelVi: "Quản lý lô hàng", labelEn: "Batch Management" },
    { to: "/app/supply-chain", icon: Truck, labelVi: "Chuỗi cung ứng", labelEn: "Supply Chain" },
    { to: "/app/event-requests", icon: Clock, labelVi: "Yêu cầu sự kiện", labelEn: "Event Requests", badgeKey: "eventRequests" },
    { to: "/app/inspection", icon: FlaskConical, labelVi: "Kiểm định chất lượng", labelEn: "Quality Inspection", badgeKey: "inspection" },
    { to: "/app/recall", icon: AlertTriangle, labelVi: "Quản lý thu hồi", labelEn: "Recall Management", badgeKey: "recall" },
    { to: "/app/reports", icon: BarChart3, labelVi: "Báo cáo thống kê", labelEn: "Reports" },
    { to: "/app/analytics", icon: LineChart, labelVi: "Phân tích dữ liệu", labelEn: "Analytics" },
    { to: "/app/notifications", icon: Bell, labelVi: "Thông báo hệ thống", labelEn: "Notifications" },
  ];

  const adminItems = [
    { to: "/app/products", icon: ShoppingBag, labelVi: "Sản phẩm", labelEn: "Products" },
    { to: "/app/categories", icon: Tags, labelVi: "Danh mục", labelEn: "Categories" },
    { to: "/app/organizations", icon: Building2, labelVi: "Tổ chức & Đơn vị", labelEn: "Organizations" },
    { to: "/app/organization-approvals", icon: UserCheck, labelVi: "Duyệt tổ chức", labelEn: "Org Approvals", badgeKey: "orgApprovals" },
    { to: "/app/users", icon: Users, labelVi: "Người dùng", labelEn: "Users" },
    { to: "/app/profile", icon: UserCircle, labelVi: "Hồ sơ cá nhân", labelEn: "My Profile" },
  ];

  const role = user?.role;
  const roleDisplay = user?.organizationType
    ? `${role} - ${user.organizationType}`
    : role;

  const filteredNavItems = navItems.filter((item) => canAccessRoute(role, item.to, user?.organizationType, approvedExtraEvents));
  const filteredAdminItems = adminItems.filter((item) => canAccessRoute(role, item.to, user?.organizationType, approvedExtraEvents));

  // Real pending-count badges — only fetched for sections the current role can actually see.
  const canSeeEventRequests = filteredNavItems.some((i) => i.to === "/app/event-requests");
  const canSeeRecall = filteredNavItems.some((i) => i.to === "/app/recall");
  const canSeeInspection = filteredNavItems.some((i) => i.to === "/app/inspection");
  const canSeeOrgApprovals = filteredAdminItems.some((i) => i.to === "/app/organization-approvals");

  const { data: eventRequestsData } = useEventRequests();
  const { data: recallsRes } = useRecalls({ page: 1, pageSize: 50 }, { enabled: canSeeRecall });
  const { data: inspectionsRes } = useInspections(undefined, { enabled: canSeeInspection });
  const { data: orgApprovalsRes } = useOrganizationsList(
    { status: "PENDING", page: 1, pageSize: 1 },
    { enabled: canSeeOrgApprovals }
  );

  const eventRequestsPendingCount = canSeeEventRequests
    ? (eventRequestsData?.items ?? []).filter((r: any) => r.status === 0 || r.status === "Pending").length
    : 0;
  const recallPendingCount = (recallsRes?.data ?? []).filter(
    (r: any) => r.status === 1 || r.status === 2 || r.statusName === "PENDING" || r.statusName === "PROCESSING" || r.statusName === "ACTIVE"
  ).length;
  const inspectionPendingCount = (inspectionsRes?.data ?? []).filter((i: any) => i.status === "Pending").length;
  const orgApprovalsPendingCount = orgApprovalsRes?.data?.totalCount ?? 0;

  const badges: Record<string, number> = {
    eventRequests: eventRequestsPendingCount,
    recall: recallPendingCount,
    inspection: inspectionPendingCount,
    orgApprovals: orgApprovalsPendingCount,
  };

  const encodedName = encodeURIComponent(user?.name);
  const apiUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&rounded=true&size=128`;

  const renderNavLink = (
    { to, icon: Icon, labelVi, labelEn, badgeKey }: (typeof navItems)[number] & { badgeKey?: string }
  ) => {
    const label = lang === "vi" ? labelVi : labelEn;
    const badgeCount = badgeKey ? badges[badgeKey] ?? 0 : 0;
    return (
      <NavLink
        key={to}
        to={to}
        title={collapsed ? label : undefined}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${collapsed ? "justify-center" : ""} ${
            isActive ? "bg-white/15 text-white" : "text-green-100 hover:bg-white/10 hover:text-white"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className="relative flex-shrink-0 flex items-center justify-center">
              <Icon className={isActive ? "text-white" : "text-green-300"} style={{ width: 18, height: 18 }} />
              {collapsed && badgeCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-[3px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none ring-2 ring-[#1B5E20]">
                  {badgeCount > 9 ? "9+" : badgeCount}
                </span>
              )}
            </span>
            {!collapsed && (
              <>
                <span className="text-sm font-medium flex-1 truncate">{label}</span>
                {badgeCount > 0 ? (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center leading-none flex-shrink-0">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                ) : (
                  isActive && <ChevronRight className="w-3.5 h-3.5 text-green-300 flex-shrink-0" />
                )}
              </>
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <aside className="relative flex flex-col h-full bg-[linear-gradient(180deg,#1B5E20_0%,#2E7D32_60%,#388E3C_100%)] dark:bg-[linear-gradient(180deg,#042f21_0%,#064E3B_60%,#065f46_100%)] transition-colors">
      {/* Collapse / expand handle (desktop only) — kept fully inside the sidebar's own box
          so it never overlaps page-level hero banners that live outside this subtree. */}
      <button
        onClick={onToggleCollapse}
        title={collapsed ? (lang === "vi" ? "Mở rộng thanh bên" : "Expand sidebar") : (lang === "vi" ? "Thu gọn thanh bên" : "Collapse sidebar")}
        className="hidden lg:flex absolute right-2 top-[72px] z-10 w-6 h-6 rounded-full items-center justify-center bg-white/10 hover:bg-white/20 text-green-200 hover:text-white transition-colors cursor-pointer"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div
        className={`flex items-center gap-3 py-5 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors ${
          collapsed ? "justify-center px-2" : "px-6"
        }`}
        onClick={() => navigate("/")}
        title={lang === "vi" ? "Về trang chủ" : "Go to Homepage"}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
          <Leaf className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0">
              <div className="text-white font-bold tracking-tight" style={{ fontSize: "15px", lineHeight: 1.2 }}>AgriTrace</div>
              <div className="text-green-200 text-xs" style={{ opacity: 0.8 }}>Vietnam</div>
            </div>
            <div className="ml-auto">
              <Shield className="w-4 h-4 text-green-300" />
            </div>
          </>
        )}
      </div>

      <nav className="sidebar-scroll flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-0.5">
        {!collapsed && (
          <div className="px-3 mb-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-green-300" style={{ opacity: 0.7 }}>
              {lang === "vi" ? "Menu chính" : "Main Menu"}
            </span>
          </div>
        )}
        {filteredNavItems.map(renderNavLink)}

        {collapsed ? (
          <div className="my-3 mx-2 border-t border-white/10" />
        ) : (
          <div className="px-3 mt-5 mb-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-green-300" style={{ opacity: 0.7 }}>
              {lang === "vi" ? "Quản trị hệ thống" : "Administration"}
            </span>
          </div>
        )}
        {filteredAdminItems.map(renderNavLink)}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className={`flex items-center gap-3 p-2 rounded-xl ${collapsed ? "flex-col gap-2" : "p-3"}`} style={{ background: "rgba(255,255,255,0.08)" }}>
          <img
            src={apiUrl}
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20 flex-shrink-0"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
              <div className="text-xs text-green-200 truncate">
                {roleDisplay}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-green-300 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer"
            title={lang === "vi" ? "Đăng xuất" : "Sign Out"}
          >
            <LogOut style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    </aside>
  );
}
