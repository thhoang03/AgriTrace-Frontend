import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Download, FileText, Printer, TrendingUp, Package, Leaf, CheckCircle } from "lucide-react";
import { monthlyProduction, inspectionData, recallTrend } from "../data/mockData";

const BANNER_IMG = "https://images.unsplash.com/photo-1777058019293-73d54d4c4cae?w=1400&q=80";

const topFarms = [
  { name: "Binh Thuan Dragon Fruit Farm", batches: 42, quantity: "18,400 kg", rating: 4.9 },
  { name: "Mekong Delta Rice Cooperative", batches: 38, quantity: "152,000 kg", rating: 4.8 },
  { name: "Dak Lak Highland Coffee Estate", batches: 29, quantity: "23,200 kg", rating: 4.7 },
  { name: "Hung Yen Longan Cooperative", batches: 24, quantity: "28,800 kg", rating: 4.8 },
  { name: "Da Lat Vegetable Farm", batches: 31, quantity: "18,600 kg", rating: 4.6 },
];

const topProducts = [
  { product: "Jasmine Rice", batches: 156, revenue: "₫4.2B", growth: "+18%" },
  { product: "Dragon Fruit", batches: 98, revenue: "₫2.8B", growth: "+12%" },
  { product: "Robusta Coffee", batches: 67, revenue: "₫3.1B", growth: "+22%" },
  { product: "Longan Fruit", batches: 54, revenue: "₫1.6B", growth: "+8%" },
  { product: "Black Pepper", batches: 43, revenue: "₫2.4B", growth: "+15%" },
];

const processingTimeData = [
  { stage: "Harvest→Process", avgDays: 1.2 },
  { stage: "Process→Pack", avgDays: 0.8 },
  { stage: "Pack→Transport", avgDays: 0.5 },
  { stage: "Transport→Dist.", avgDays: 1.4 },
  { stage: "Dist.→Retail", avgDays: 0.9 },
];

export function ReportsPage() {
  return (
    <div className="pb-8">
      {/* Banner */}
      <div className="relative h-36 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BANNER_IMG})` }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(27,94,32,0.9) 0%, rgba(46,125,50,0.6) 100%)" }} />
        <div className="relative z-10 h-full flex items-center px-8 justify-between">
          <div>
            <h1 className="text-white" style={{ fontSize: 24, fontWeight: 700 }}>Analytics & Reports</h1>
            <p className="text-green-100 text-sm mt-1">Supply chain performance insights — FY 2024</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/15 text-white hover:bg-white/25 transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/15 text-white hover:bg-white/25 transition-colors">
              <FileText className="w-4 h-4" /> Export PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-green-800 hover:opacity-90 transition-opacity" style={{ background: "white" }}>
              <Download className="w-4 h-4" /> Export Excel
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 mt-5">
        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Production", value: "284,910 kg", icon: Leaf, color: "#2E7D32", bg: "#E8F5E9" },
            { label: "Batches Created", value: "753", icon: Package, color: "#1976D2", bg: "#E3F2FD" },
            { label: "Inspection Rate", value: "98.2%", icon: CheckCircle, color: "#7B1FA2", bg: "#F3E5F5" },
            { label: "YoY Growth", value: "+24.7%", icon: TrendingUp, color: "#00695C", bg: "#E0F2F1" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
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

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* Production */}
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="mb-5">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Monthly Production Volume</h3>
              <p className="text-gray-400 text-xs mt-0.5">Total quantity (kg) produced per month</p>
            </div>
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
          </div>

          {/* Processing Time */}
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="mb-5">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Average Processing Time</h3>
              <p className="text-gray-400 text-xs mt-0.5">Days per supply chain stage</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={processingTimeData} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: 12 }} />
                <Bar dataKey="avgDays" name="Avg Days" fill="#66BB6A" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* Inspection */}
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="mb-5">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Inspection Results</h3>
              <p className="text-gray-400 text-xs mt-0.5">Pass/Fail breakdown — 2024</p>
            </div>
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
          </div>

          {/* Recall trend */}
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="mb-5">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Recall Incidents</h3>
              <p className="text-gray-400 text-xs mt-0.5">Monthly recall count trend — 2024</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={recallTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={30} domain={[0, 5]} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: 12 }} />
                <Line type="monotone" dataKey="recalls" name="Recalls" stroke="#E53935" strokeWidth={2.5} dot={{ fill: "#E53935", r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tables row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top Farms */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Top Performing Farms</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {topFarms.map((farm, i) => (
                <div key={farm.name} className="flex items-center gap-4 px-6 py-3.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: i === 0 ? "#FFB300" : i === 1 ? "#9CA3AF" : i === 2 ? "#CD7F32" : "#2E7D32" }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{farm.name}</div>
                    <div className="text-xs text-gray-400">{farm.batches} batches · {farm.quantity}</div>
                  </div>
                  <div className="text-sm font-semibold" style={{ color: "#2E7D32" }}>★ {farm.rating}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Top Products by Revenue</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {topProducts.map(({ product, batches, revenue, growth }) => (
                <div key={product} className="flex items-center gap-4 px-6 py-3.5">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{product}</div>
                    <div className="text-xs text-gray-400">{batches} batches</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{revenue}</div>
                  <div className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#E8F5E9", color: "#2E7D32" }}>{growth}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
