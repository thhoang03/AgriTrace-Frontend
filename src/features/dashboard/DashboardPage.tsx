import { useNavigate } from "react-router";
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Package, Leaf, Cog, Truck, ShoppingCart, AlertTriangle,
  Plus, QrCode, FlaskConical, FileText, Bell, TrendingUp, TrendingDown, RefreshCw,
} from "lucide-react";
import { useAuth } from "../auth/auth.store";
import { useAnalyticsOverview, useBatchDistribution } from "../analytics/analytics.queries";
import { useRecentActivities } from "./dashboard.queries";
import { useLanguage } from "../../contexts/LanguageContext";

const BANNER_IMG = "https://images.unsplash.com/photo-1777058019293-73d54d4c4cae?w=1400&q=80";

const PIE_COLORS = ["#2E7D32", "#66BB6A", "#42A5F5", "#FFB300", "#AB47BC", "#A5D6A7"];

function formatRelativeTime(dateStr: string, lang: string = "en"): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return lang === "vi" ? "Vừa xong" : "Just now";
  if (diffMin < 60) return lang === "vi" ? `${diffMin} phút trước` : `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return lang === "vi" ? `${diffHr} giờ trước` : `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return lang === "vi" ? `${diffDay} ngày trước` : `${diffDay}d ago`;
  return date.toLocaleDateString(lang === "vi" ? "vi-VN" : "en-VN", { day: "numeric", month: "short" });
}

// quickActions are defined inside the component to support i18n

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { data: analyticsData, isLoading: overviewLoading, isError: overviewError, refetch: refetchOverview } = useAnalyticsOverview();
  const { data: distData, isLoading: distLoading } = useBatchDistribution();

  const { data: rawActivities } = useRecentActivities();
  const activities = rawActivities ?? [];

  const now = new Date();
  const timeGreeting = lang === "vi"
    ? (now.getHours() < 12 ? "Chào buổi sáng" : now.getHours() < 17 ? "Chào buổi chiều" : "Chào buổi tối")
    : (now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening");

  const quickActions = [
    { label: lang === "vi" ? "Tạo Lô Hàng" : "Create Batch", icon: Plus, color: "#2E7D32", bg: "#E8F5E9", to: "/app/batches" },
    { label: lang === "vi" ? "Tạo Mã QR" : "Generate QR", icon: QrCode, color: "#1976D2", bg: "#E3F2FD", to: "/app/batches" },
    { label: lang === "vi" ? "Kiểm Định" : "Inspection", icon: FlaskConical, color: "#F57C00", bg: "#FFF3E0", to: "/app/inspection" },
    { label: lang === "vi" ? "Báo Cáo" : "Reports", icon: FileText, color: "#7B1FA2", bg: "#F3E5F5", to: "/app/reports" },
  ];

  const overview = analyticsData?.data;

  const batchDistribution = distData?.data?.items ?? [];
  const pieData = batchDistribution.length > 0
    ? batchDistribution.map((item) => ({
        name: item.statusName,
        value: item.count,
      }))
    : (overview?.batchStatus ?? []).map((item) => ({
        name: item.statusName,
        value: item.count,
      }));

  const statCards = overview ? [
    { label: lang === "vi" ? "Tổng Lô Hàng" : "Total Batches", value: overview.totalBatches.toLocaleString(), change: "+12%", up: true, icon: Package, color: "#2E7D32", bg: "#E8F5E9" },
    { label: lang === "vi" ? "Lô Đang Hoạt Động" : "Active Batches", value: overview.activeBatches.toLocaleString(), change: "+8%", up: true, icon: Leaf, color: "#1976D2", bg: "#E3F2FD" },
    { label: lang === "vi" ? "Tổ Chức" : "Organizations", value: overview.totalOrganizations.toLocaleString(), change: "+5%", up: true, icon: Cog, color: "#F57C00", bg: "#FFF3E0" },
    { label: lang === "vi" ? "Tổng Sự Kiện" : "Total Events", value: overview.totalEvents.toLocaleString(), change: "+15%", up: true, icon: Truck, color: "#7B1FA2", bg: "#F3E5F5" },
    { label: lang === "vi" ? "Lệnh Thu Hồi" : "Total Recalls", value: overview.totalRecalls.toLocaleString(), change: "+1", up: false, icon: ShoppingCart, color: "#00695C", bg: "#E0F2F1" },
    { label: lang === "vi" ? "Lô Bị Thu Hồi" : "Recalled Batches", value: overview.recalledBatches.toLocaleString(), change: overview.recalledBatches > 0 ? "+2" : "0", up: false, icon: AlertTriangle, color: "#E53935", bg: "#FFEBEE" },
  ] : [];

  const isLoading = overviewLoading || distLoading;

  if (isLoading) {
    return (
      <div className="pb-8">
        <div className="relative h-44 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BANNER_IMG})` }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(27,94,32,0.92) 0%, rgba(46,125,50,0.75) 60%, rgba(0,0,0,0.3) 100%)" }} />
          <div className="relative z-10 h-full flex items-center px-8">
            <div>
              <div className="text-green-200 text-sm mb-1">{lang === "vi" ? "Đang tải..." : "Loading..."}</div>
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

  if (overviewError) {
    return (
      <div className="pb-8">
        <div className="relative h-44 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BANNER_IMG})` }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(27,94,32,0.92) 0%, rgba(46,125,50,0.75) 60%, rgba(0,0,0,0.3) 100%)" }} />
          <div className="relative z-10 h-full flex items-center px-8">
            <div>
              <h1 className="text-white" style={{ fontSize: 26, fontWeight: 700 }}>{user?.name}</h1>
              <p className="text-green-100 text-sm mt-1">{user?.organization}</p>
            </div>
          </div>
        </div>
        <div className="px-6 -mt-6 relative z-10">
          <div className="bg-white rounded-2xl p-8 text-center" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <div className="font-semibold text-gray-700 mb-2">{lang === "vi" ? "Không thể tải dữ liệu dashboard" : "Failed to load dashboard data"}</div>
            <button onClick={() => refetchOverview()} className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: "#2E7D32" }}>
              {lang === "vi" ? "Thử lại" : "Retry"}
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
              {user?.name}
            </h1>
            <p className="text-green-100 text-sm mt-1">{user?.organization}</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-4">
            <button
              onClick={() => refetchOverview()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-white/15 hover:bg-white/25 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> {lang === "vi" ? "Làm mới" : "Refresh"}
            </button>
            <div className="text-right text-green-100 text-sm">
              <div>{lang === "vi" ? "Hôm nay" : "Today"}</div>
              <div className="text-white font-semibold">{now.toLocaleDateString(lang === "vi" ? "vi-VN" : "en-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
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
                <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>{lang === "vi" ? "Sản Xuất Hàng Tháng" : "Monthly Production"}</h3>
                <p className="text-gray-400 text-xs mt-0.5">{lang === "vi" ? "Số lượng (kg) so với lô hàng" : "Quantity (kg) vs Batches"}</p>
              </div>
            </div>
            {overview?.monthlyProduction && overview.monthlyProduction.length > 0 ? (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={overview.monthlyProduction} barSize={16} barGap={4}>
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
                <div className="text-sm">{lang === "vi" ? "Chưa có dữ liệu sản xuất" : "No production data available"}</div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>{lang === "vi" ? "Trạng Thái Lô Hàng" : "Batch Status"}</h3>
              <p className="text-gray-400 text-xs mt-0.5">{lang === "vi" ? "Phân bổ theo giai đoạn" : "Distribution by stage"}</p>
            </div>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={155}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                      {pieData.map((_: any, index: number) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {pieData.map((item: any, i: number) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-xs text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-800">{(item.value ?? 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <div className="text-sm">{lang === "vi" ? "Chưa có dữ liệu trạng thái" : "No status data available"}</div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="mb-5">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>{lang === "vi" ? "Kết Quả Kiểm Định" : "Inspection Results"}</h3>
              <p className="text-gray-400 text-xs mt-0.5">{lang === "vi" ? "Đạt/Không đạt/Chờ" : "Pass/Fail/Pending"}</p>
            </div>
            {overview?.inspectionResults && overview.inspectionResults.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={overview.inspectionResults} barSize={14} barGap={3}>
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
                <div className="text-sm">{lang === "vi" ? "Chưa có dữ liệu kiểm định" : "No inspection data available"}</div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="mb-5">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>{lang === "vi" ? "Xu Hướng Thu Hồi" : "Recall Trend"}</h3>
              <p className="text-gray-400 text-xs mt-0.5">{lang === "vi" ? "Số vụ thu hồi hàng tháng" : "Monthly recall incidents"}</p>
            </div>
            {overview?.recallTrend && overview.recallTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={overview.recallTrend}>
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
                <div className="text-sm">{lang === "vi" ? "Chưa có dữ liệu thu hồi" : "No recall data available"}</div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>{lang === "vi" ? "Hoạt Động Gần Đây" : "Recent Activities"}</h3>
              <button className="text-sm font-medium" style={{ color: "#2E7D32" }}>{lang === "vi" ? "Xem tất cả" : "View all"}</button>
            </div>
            {activities.length > 0 ? (
              <div className="space-y-1">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-b-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activity.type === "recall_issued" ? "bg-red-50" :
                      activity.type === "inspection_completed" ? "bg-orange-50" :
                      activity.type === "batch_created" ? "bg-green-50" :
                      "bg-blue-50"
                    }`}>
                      {activity.type === "recall_issued" ? <AlertTriangle className="w-4 h-4 text-red-500" /> :
                       activity.type === "inspection_completed" ? <FlaskConical className="w-4 h-4 text-orange-500" /> :
                       activity.type === "batch_created" ? <Package className="w-4 h-4 text-green-600" /> :
                       <RefreshCw className="w-4 h-4 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{activity.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatRelativeTime(activity.timestamp, lang)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Package className="w-8 h-8 mb-2 opacity-50" />
                <div className="text-sm">{lang === "vi" ? "Chưa có hoạt động nào" : "No recent activities"}</div>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h3 className="font-semibold text-gray-900 mb-4" style={{ fontSize: 15 }}>{lang === "vi" ? "Thao Tác Nhanh" : "Quick Actions"}</h3>
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

            {overview && overview.totalRecalls > 0 && (
              <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)", border: "1px solid #FFCDD2" }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#E53935" }}>
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-red-800 text-sm">{lang === "vi" ? "Cảnh Báo Thu Hồi Đang Hoạt Động" : "Active Recall Alert"}</div>
                    <p className="text-red-600 text-xs mt-1 leading-relaxed">
                      {lang === "vi" ? `${overview.totalRecalls} lệnh thu hồi cần xử lý.` : `${overview.totalRecalls} active recalls requiring attention.`}
                    </p>
                    <button
                      onClick={() => navigate("/app/recall")}
                      className="mt-3 text-xs font-semibold text-white px-3 py-1.5 rounded-lg"
                      style={{ background: "#E53935" }}
                    >
                      {lang === "vi" ? "Xem Thu Hồi" : "View Recalls"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4" style={{ color: "#FFB300" }} />
                <span className="font-semibold text-gray-900 text-sm">{lang === "vi" ? "Kiểm Định Đang Chờ" : "Pending Inspections"}</span>
              </div>
              <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                <div className="text-sm">{lang === "vi" ? "Không có kiểm định đang chờ" : "No pending inspections"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
