import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, Bell, ChevronDown, Menu, X, Settings, LogOut, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface TopBarProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export function TopBar({ onToggleSidebar, sidebarOpen }: TopBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUser, setShowUser] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const notifications = [
    { id: 1, text: "Recall alert: BTH-2024-006 (Durian)", type: "recall", time: "1h ago" },
    { id: 2, text: "Inspection passed: BTH-2024-001", type: "pass", time: "2h ago" },
    { id: 3, text: "New batch created: BTH-2024-008", type: "info", time: "3h ago" },
  ];

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 relative z-30" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden">
        {sidebarOpen ? <X className="w-5 h-5 text-gray-500" /> : <Menu className="w-5 h-5 text-gray-500" />}
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search batches, farms, products..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-400 focus:ring-2"
          style={{ background: "#F8FAF8", fontSize: 13 }}
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
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
                <span className="font-semibold text-gray-800">Notifications</span>
                <span className="text-xs text-white px-2 py-0.5 rounded-full" style={{ background: "#E53935" }}>3 new</span>
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
                <button className="text-sm font-medium" style={{ color: "#2E7D32" }}>View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="relative">
          <button
            onClick={() => { setShowUser(!showUser); setShowNotif(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <img src={user?.avatar} alt={user?.name} className="w-7 h-7 rounded-full object-cover" />
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-gray-800">{user?.name}</div>
              <div className="text-xs text-gray-400">{user?.role}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {showUser && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="font-semibold text-gray-800">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
              <button
                onClick={() => { navigate("/app/profile"); setShowUser(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <User className="w-4 h-4" /> My Profile
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Settings className="w-4 h-4" /> Settings
              </button>
              <div className="border-t border-gray-100" />
              <button
                onClick={() => { logout(); navigate("/login"); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
