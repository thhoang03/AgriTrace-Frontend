import { useNavigate } from "react-router";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Package, Leaf, Cog, Truck, ShoppingCart, AlertTriangle,
  Plus, QrCode, FlaskConical, FileText, Bell, TrendingUp, TrendingDown,
} from "lucide-react";
import { useAuth } from "../auth/auth.store";
import { useAnalyticsOverview } from "../analytics/analytics.queries";

const BANNER_IMG = "https://images.unsplash.com/photo-1777058019293-73d54d4c4cae?w=1400&q=80";

const PIE_COLORS = ["#2E7D32", "#66BB6A", "#42A5F5", "#FFB300", "#AB47BC", "#A5D6A7"];

const quickActions = [
  { label: "Create Batch", icon: Plus, color: "#2E7D32", bg: "#E8F5E9", to: "/app/batches" },
  { label: "Generate QR", icon: QrCode, color: "#1976D2", bg: "#E3F2FD", to: "/app/batches" },
  { label: "Inspection", icon: FlaskConical, color: "#F57C00", bg: "#FFF3E0", to: "/app/inspection" },
  { label: "Reports", icon: FileText, color: "#7B1FA2", bg: "#F3E5F5", to: "/app/reports" },
];

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: analyticsData, isLoading, isError, refetch } = useAnalyticsOverview();

  const now = new Date();
  const timeGreeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  const statCards = analyticsData?.data ? [
    { label: "Total Products", value: (analyticsData.data.totalBatches ?? 0).toLocaleString(), change: "+12%", up: true, icon: Package, color: "#2E7D32", bg: "#E8F5E9" },
    { label: "Today's Harvest", value: (analyticsData.data.todayHarvest ?? 0).toLocaleString(), change: "+8%", up: true, icon: Leaf, color: "#1976D2", bg: "#E3F2FD" },
    { label: "In Processing", value: (analyticsData.data.inProcessing ?? 0).toLocaleString(), change: "-3%", up: false, icon: Cog, color: "#F57C00", bg: "#FFF3E0" },
    { label: "In Transport", value: (analyticsData.data.inTransport ?? 0).toLocaleString(), change: "+5%", up: true, icon: Truck, color: "#7B1FA2", bg: "#F3E5F5" },
    { label: "At Retail", value: (analyticsData.data.atRetail ?? 0).toLocaleString(), change: "+18%", up: true, icon: ShoppingCart, color: "#00695C", bg: "#E0F2F1" },
    { label: "Recall Alerts", value: (analyticsData.data.recallAlerts ?? 0).toLocaleString(), change: "+2", up: false, icon: AlertTriangle, color: "#E53935", bg: "#FFEBEE" },
  ] : [];

  const monthlyProduction = analyticsData?.data?.monthlyProduction ?? [];
  const batchStatusData = analyticsData?.data?.batchStatus ?? [];
  const inspectionData = analyticsData?.data?.inspectionResults ?? [];
  const recallTrend = analyticsData?.data?.recallTrend ?? [];

  if (isLoading) {
    return (
      <div className="pb-8">
        <div className="relative h-44 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BANNER_IMG})` }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(27,94,32,0.92) 0%, rgba(46,125,50,0.75) 60%, rgba(0,0,0,0.3) 100%)" }} />
          <div className="relative z-10 h-full flex items-center px-8">
            <div>
              <div className="text-green-200 text-sm mb-1">Loading...</div>
              <div className="text-white font-bold" style={{ fontSize: 26, fontWeight: 700 }}>{user?.name}</div>
            </div>
          </div>
        </div>
        <div className="px-6 -mt-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 flex flex-col gap-3" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 animate-pulse" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
              <div className="h-48 bg-gray-100 rounded" />
            </div>
            <div className="bg-white rounded-2xl p-6 animate-pulse" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
              <div className="h-48 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pb-8">
        <div className="relative h-44 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BANNER_IMG})` }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(27,94,32,0.92) 0%, rgba(46,125,50,0.75) 60%, rgba(0,0,0,0.3) 100%)" }} />
          <div className="relative z-10 h-full flex items-center px-8">
            <div>
              <h1 className="text-white" style={{ fontSize: 26, fontWeight: 700 }}>{user?.name} 👋</h1>
              <p className="text-green-100 text-sm mt-1">{user?.organization}</p>
            </div>
          </div>
        </div>
        <div className="px-6 -mt-6 relative z-10">
          <div className="bg-white rounded-2xl p-8 text-center" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <div className="font-semibold text-gray-700 mb-2">Failed to load dashboard data</div>
            <button onClick={() => refetch()} className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: "#2E7D32" }}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        {statCards.length > 0 ? (
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
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 flex flex-col gap-3" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div className="w-10 h-10 rounded-xl bg-gray-100" />
                <div className="h-8 w-12 bg-gray-100 rounded" />
                <div className="h-3 w-16 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Monthly Production</h3>
                <p className="text-gray-400 text-xs mt-0.5">Quantity (kg) vs Batches — 2024</p>
              </div>
            </div>
            {monthlyProduction.length > 0 ? (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={monthlyProduction} barSize={16} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="quantity" name="Quantity (kg)" fill="#2E7D32" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="batches" name="Batches" fill="#A5D6A7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <div className="text-sm">No production data available</div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Batch Status</h3>
              <p className="text-gray-400 text-xs mt-0.5">Distribution by stage</p>
            </div>
            {batchStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={155}>
                <PieChart>
                  <Pie data={batchStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                    {batchStatusData.map((entry, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <div className="text-sm">No status data available</div>
              </div>
            )}
            {batchStatusData.length > 0 && (
              <div className="space-y-1.5">
                {batchStatusData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-800">{(item.value ?? 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="mb-5">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Inspection Results</h3>
              <p className="text-gray-400 text-xs mt-0.5">Pass/Fail/Pending — Last 6 months</p>
            </div>
            {inspectionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={inspectionData} barSize={14} barGap={3}>
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
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <div className="text-sm">No inspection data available</div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="mb-5">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Recall Trend</h3>
              <p className="text-gray-400 text-xs mt-0.5">Monthly recall incidents — 2024</p>
            </div>
            {recallTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={recallTrend}>
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
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <div className="text-sm">No recall data available</div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Recent Activities</h3>
              <button className="text-sm font-medium" style={{ color: "#2E7D32" }}>View all</button>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="text-sm">No recent activities</div>
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
                  <p className="text-red-600 text-xs mt-1 leading-relaxed">
                    {analyticsData?.data?.recallAlerts ?? 0} active recalls requiring attention.
                  </p>
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
              <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                <div className="text-sm">No pending inspections</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}