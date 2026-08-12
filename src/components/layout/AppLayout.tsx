import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useAuth } from "../../features/auth/auth.store";

import { useApprovedExtraEvents } from "../../features/event-requests/event-requests.queries";

export function AppLayout() {
  const { isLoggedIn, user, canAccessRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("agritrace_sidebar_collapsed") === "1");
  const approvedExtraEvents = useApprovedExtraEvents();

  useEffect(() => {
    localStorage.setItem("agritrace_sidebar_collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (user?.role && !canAccessRoute(user.role, location.pathname, user?.organizationType, approvedExtraEvents)) {
      navigate("/app/profile");
    }
  }, [isLoggedIn, navigate, user?.role, location.pathname, canAccessRoute, approvedExtraEvents]);

  if (!isLoggedIn) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background transition-colors">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-300 lg:static lg:translate-x-0 lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${collapsed ? "lg:w-20" : "lg:w-64"}
        `}
      >
        <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
