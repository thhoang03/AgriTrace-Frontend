import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Download, FileText, Printer, TrendingUp, Package, Leaf, CheckCircle, AlertTriangle } from "lucide-react";
import { useAnalyticsOverview } from "../analytics/analytics.queries";

const BANNER_IMG = "https://images.unsplash.com/photo-1777058019293-73d54d4c4cae?w=1400&q=80";

export function ReportsPage() {
  const { data: analyticsData, isLoading, isError } = useAnalyticsOverview();

  const summaryCards = analyticsData?.data ? [
    { label: "Total Production", value: `${((analyticsData.data.totalBatches ?? 0) * 350).toLocaleString()} kg`, icon: Leaf, color: "#2E7D32", bg: "#E8F5E9" },
    { label: "Batches Created", value: (analyticsData.data.totalBatches ?? 0).toLocaleString(), icon: Package, color: "#1976D2", bg: "#E3F2FD" },
    { label: "Recall Alerts", value: (analyticsData.data.totalRecalls ?? 0).toLocaleString(), icon: AlertTriangle, color: "#E53935", bg: "#FFEBEE" },
    { label: "Active Batches", value: (analyticsData.data.activeBatches ?? 0).toLocaleString(), icon: CheckCircle, color: "#7B1FA2", bg: "#F3E5F5" },
  ] : [];

  const monthlyProduction = analyticsData?.data?.monthlyProduction ?? [];
  const inspectionData = analyticsData?.data?.inspectionResults ?? [];
  const recallTrend = analyticsData?.data?.recallTrend ?? [];
  const batchStatusData = analyticsData?.data?.batchStatus ?? [];

  if (isLoading) {
    return (
      <div className="pb-8">
        <div className="relative h-36 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BANNER_IMG})` }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(27,94,32,0.9) 0%, rgba(46,125,50,0.6) 100%)" }} />
          <div className="relative z-10 h-full flex items-center px-8 justify-between">
            <div>
              <h1 className="text-white" style={{ fontSize: 24, fontWeight: 700 }}>Analytics & Reports</h1>
              <p className="text-green-100 text-sm mt-1">Loading...</p>
            </div>
          </div>
        </div>
        <div className="px-6 mt-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 flex items-center gap-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div className="w-11 h-11 rounded-xl bg-gray-200 animate-pulse" />
                <div className="flex-1">
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
                <div className="h-48 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pb-8">
        <div className="relative h-36 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BANNER_IMG})` }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(27,94,32,0.9) 0%, rgba(46,125,50,0.6) 100%)" }} />
          <div className="relative z-10 h-full flex items-center px-8">
            <h1 className="text-white" style={{ fontSize: 24, fontWeight: 700 }}>Analytics & Reports</h1>
          </div>
        </div>
        <div className="px-6 mt-5">
          <div className="bg-white rounded-2xl p-8 text-center" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <div className="font-semibold text-gray-700 mb-2">Failed to load reports data</div>
            <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: "#2E7D32" }}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="relative h-36 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BANNER_IMG})` }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(27,94,32,0.9) 0%, rgba(46,125,50,0.6) 100%)" }} />
        <div className="relative z-10 h-full flex items-center px-8 justify-between">
          <div>
            <h1 className="text-white" style={{ fontSize: 24, fontWeight: 700 }}>Analytics & Reports</h1>
            <p className="text-green-100 text-sm mt-1">Supply chain performance insights</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/15 text-white hover:bg-white/25 transition-colors"><Printer className="w-4 h-4" /> Print</button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/15 text-white hover:bg-white/25 transition-colors"><FileText className="w-4 h-4" /> Export PDF</button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-green-800 hover:opacity-90 transition-opacity" style={{ background: "white" }}><Download className="w-4 h-4" /> Export Excel</button>
          </div>
        </div>
      </div>

      <div className="px-6 mt-5">
        {summaryCards.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {summaryCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl p-5 flex items-center gap-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                  <Icon style={{ color, width: 20, height: 20 }} />
                </div>
                <div>
                  <div className="font-bold text-gray-900" style={{ fontSize: 20 }}>{value}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 flex items-center gap-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div className="w-11 h-11 rounded-xl bg-gray-100" />
                <div className="flex-1">
                  <div className="h-6 w-20 bg-gray-100 rounded mb-1" />
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="mb-5">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Monthly Production Volume</h3>
              <p className="text-gray-400 text-xs mt-0.5">Total quantity (kg) produced per month</p>
            </div>
            {monthlyProduction.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyProduction}>
                  <defs>
                    <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={45} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: 12 }} />
                  <Area type="monotone" dataKey="quantity" name="Quantity (kg)" stroke="#2E7D32" strokeWidth={2.5} fill="url(#prodGrad)" dot={{ fill: "#2E7D32", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <div className="text-sm">No production data available</div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="mb-5">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Batch Status Distribution</h3>
              <p className="text-gray-400 text-xs mt-0.5">Current batch status breakdown</p>
            </div>
            {batchStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={batchStatusData} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: 12 }} />
                  <Bar dataKey="value" name="Batches" fill="#66BB6A" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <div className="text-sm">No status data available</div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="mb-5">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Inspection Results</h3>
              <p className="text-gray-400 text-xs mt-0.5">Pass/Fail breakdown</p>
            </div>
            {inspectionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={inspectionData} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="pass" name="Pass" fill="#2E7D32" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fail" name="Fail" fill="#E53935" radius={[4, 4, 0, 0]} />
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
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Recall Incidents</h3>
              <p className="text-gray-400 text-xs mt-0.5">Monthly recall count trend</p>
            </div>
            {recallTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={recallTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={30} domain={[0, 5]} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: 12 }} />
                  <Line type="monotone" dataKey="recalls" name="Recalls" stroke="#E53935" strokeWidth={2.5} dot={{ fill: "#E53935", r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <div className="text-sm">No recall trend data available</div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Top Performing Farms</h3>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="text-sm">No farm data available</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Top Products by Revenue</h3>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="text-sm">No product revenue data available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}