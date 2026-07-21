import { useNavigate } from "react-router";
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Package, Leaf, Cog, Truck, ShoppingCart, AlertTriangle,
  Plus, QrCode, FlaskConical, FileText, Bell, TrendingUp, TrendingDown,
} from "lucide-react";
import { useAuth } from "../auth/auth.hooks";
import { useAnalyticsOverview } from "../analytics/analytics.queries";
import { monthlyProduction, batchStatusData, inspectionData, recallTrend, recentActivities } from "../../mocks/data";

const BANNER_IMG = "https://images.unsplash.com/photo-1777058019293-73d54d4c4cae?w=1400&q=80";

const PIE_COLORS = ["#2E7D32", "#66BB6A", "#42A5F5", "#FFB300", "#AB47BC", "#A5D6A7"];

// Mock data fallback
const mockStatCards = [
  { label: "Total Products", value: "48,291", change: "+12%", up: true, icon: Package, color: "#2E7D32", bg: "#E8F5E9" },
  { label: "Today's Harvest", value: "148", change: "+8%", up: true, icon: Leaf, color: "#1976D2", bg: "#E3F2FD" },
  { label: "In Processing", value: "234", change: "-3%", up: false, icon: Cog, color: "#F57C00", bg: "#FFF3E0" },
  { label: "In Transport", value: "89", change: "+5%", up: true, icon: Truck, color: "#7B1FA2", bg: "#F3E5F5" },
  { label: "At Retail", value: "1,203", change: "+18%", up: true, icon: ShoppingCart, color: "#00695C", bg: "#E0F2F1" },
  { label: "Recall Alerts", value: "3", change: "+2", up: false, icon: AlertTriangle, color: "#E53935", bg: "#FFEBEE" },
];

const quickActions = [
  { label: "Create Batch", icon: Plus, color: "#2E7D32", bg: "#E8F5E9", to: "/app/batches" },
  { label: "Generate QR", icon: QrCode, color: "#1976D2", bg: "#E3F2FD", to: "/app/batches" },
  { label: "Inspection", icon: FlaskConical, color: "#F57C00", bg: "#FFF3E0", to: "/app/inspection" },
  { label: "Reports", icon: FileText, color: "#7B1FA2", bg: "#F3E5F5", to: "/app/reports" },
];

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: analyticsData } = useAnalyticsOverview();

  const now = new Date();
  const timeGreeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  // Use analytics data if available, otherwise fallback to mock data
  const statCards = analyticsData?.data ? [
    { label: "Total Products", value: analyticsData.data.totalProducts.toLocaleString(), change: "+12%", up: true, icon: Package, color: "#2E7D32", bg: "#E8F5E9" },
    { label: "Today's Harvest", value: analyticsData.data.todayHarvest.toLocaleString(), change: "+8%", up: true, icon: Leaf, color: "#1976D2", bg: "#E3F2FD" },
    { label: "In Processing", value: analyticsData.data.inProcessing.toLocaleString(), change: "-3%", up: false, icon: Cog, color: "#F57C00", bg: "#FFF3E0" },
    { label: "In Transport", value: analyticsData.data.inTransport.toLocaleString(), change: "+5%", up: true, icon: Truck, color: "#7B1FA2", bg: "#F3E5F5" },
    { label: "At Retail", value: analyticsData.data.atRetail.toLocaleString(), change: "+18%", up: true, icon: ShoppingCart, color: "#00695C", bg: "#E0F2F1" },
    { label: "Recall Alerts", value: analyticsData.data.recallAlerts.toLocaleString(), change: "+2", up: false, icon: AlertTriangle, color: "#E53935", bg: "#FFEBEE" },
  ] : mockStatCards;

  const chartData = analyticsData?.data ? {
    monthlyProduction: analyticsData.data.monthlyProduction,
    batchStatusData: analyticsData.data.batchStatus,
    inspectionData: analyticsData.data.inspectionResults,
    recallTrend: analyticsData.data.recallTrend,
  } : {
    monthlyProduction,
    batchStatusData,
    inspectionData,
    recallTrend,
  };

  return (
    <div className="pb-8">
      <div className="relative h-44 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BANNER_IMG})` }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(27,94,32,0.92) 0%, rgba(46,125,50,0.75) 60%, rgba(0,0,0,0.3) 100%)" }} />
        <div className="relative z-10 h-full flex items-center px-8">
          <div>
            <p className="text-green-200 text-sm mb-1">{timeGreeting}</p>
            <h1 className="text-white" style={{ fontSize: 26, fontWeight: 700 }}>
              {user?.name} 👋
            </h1>
            <p className="text-green-100 text-sm mt-1">{user?.organization}</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-3">
            <div className="text-right text-green-100 text-sm">
              <div>Today</div>
              <div className="text-white font-semibold">{now.toLocaleDateString("en-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {statCards.map(({ label, value, change, up, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon style={{ color, width: 18, height: 18 }} />
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${up ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                  {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {change}
                </div>
              </div>
              <div>
                <div className="font-bold text-gray-900" style={{ fontSize: 22 }}>{value}</div>
                <div className="text-gray-500" style={{ fontSize: 12 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Monthly Production</h3>
                <p className="text-gray-400 text-xs mt-0.5">Quantity (kg) vs Batches — 2024</p>
              </div>
              <div className="flex gap-2">
                {["Q1", "Q2", "Q3", "Q4", "All"].map((q, i) => (
                  <button key={q} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${i === 4 ? "text-white" : "text-gray-500 hover:bg-gray-100"}`} style={i === 4 ? { background: "#2E7D32" } : {}}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={chartData.monthlyProduction} barSize={16} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: 12 }}
                  cursor={{ fill: "rgba(46,125,50,0.05)" }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="quantity" name="Quantity (kg)" fill="#2E7D32" radius={[4, 4, 0, 0]} />
                <Bar dataKey="batches" name="Batches" fill="#A5D6A7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Batch Status</h3>
              <p className="text-gray-400 text-xs mt-0.5">Distribution by stage</p>
            </div>
            <ResponsiveContainer width="100%" height={155}>
              <PieChart>
                <Pie data={chartData.batchStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                  {chartData.batchStatusData.map((entry, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5">
              {chartData.batchStatusData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-800">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="mb-5">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Inspection Results</h3>
              <p className="text-gray-400 text-xs mt-0.5">Pass/Fail/Pending — Last 6 months</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData.inspectionData} barSize={14} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={35} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="pass" name="Pass" fill="#2E7D32" radius={[3, 3, 0, 0]} stackId="a" />
                <Bar dataKey="fail" name="Fail" fill="#E53935" radius={[0, 0, 0, 0]} stackId="a" />
                <Bar dataKey="pending" name="Pending" fill="#FFB300" radius={[3, 3, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="mb-5">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Recall Trend</h3>
              <p className="text-gray-400 text-xs mt-0.5">Monthly recall incidents — 2024</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData.recallTrend}>
                <defs>
                  <linearGradient id="recallGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E53935" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#E53935" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: 12 }} />
                <Area type="monotone" dataKey="recalls" name="Recalls" stroke="#E53935" strokeWidth={2.5} fill="url(#recallGrad)" dot={{ fill: "#E53935", r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Recent Activities</h3>
              <button className="text-sm font-medium" style={{ color: "#2E7D32" }}>View all</button>
            </div>
            <div className="space-y-1">
              {recentActivities.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="text-xl flex-shrink-0 mt-0.5">{a.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{a.user}</span>{" "}
                      <span className="text-gray-500">{a.action}</span>{" "}
                      <span className="font-medium" style={{ color: "#2E7D32" }}>{a.target}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h3 className="font-semibold text-gray-900 mb-4" style={{ fontSize: 15 }}>Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map(({ label, icon: Icon, color, bg, to }) => (
                  <button
                    key={label}
                    onClick={() => navigate(to)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl hover:opacity-80 transition-opacity"
                    style={{ background: bg }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white">
                      <Icon style={{ color, width: 18, height: 18 }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)", border: "1px solid #FFCDD2" }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#E53935" }}>
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-red-800 text-sm">Active Recall Alert</div>
                  <p className="text-red-600 text-xs mt-1 leading-relaxed">BTH-2024-006 Durian Monthong — Pesticide residue exceeds limit. 12 companies affected.</p>
                  <button
                    onClick={() => navigate("/app/recall")}
                    className="mt-3 text-xs font-semibold text-white px-3 py-1.5 rounded-lg"
                    style={{ background: "#E53935" }}
                  >
                    View Recalls
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4" style={{ color: "#FFB300" }} />
                <span className="font-semibold text-gray-900 text-sm">Pending Inspections</span>
              </div>
              {["BTH-2024-003 — Coffee", "BTH-2024-005 — Bitter Melon", "BTH-2024-007 — Black Pepper"].map((item) => (
                <div key={item} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">{item}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#FFF3E0", color: "#F57C00" }}>Pending</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
