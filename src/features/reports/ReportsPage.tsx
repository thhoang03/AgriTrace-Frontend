import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Download, FileText, Printer, TrendingUp, Package, Leaf, CheckCircle, AlertTriangle,
  X, Calendar, FileDown, Clock, User, HardDrive, RefreshCw,
} from "lucide-react";
import { useAnalyticsOverview, useBatchDistribution } from "../analytics/analytics.queries";
import { useReports, useGenerateReport } from "./reports.queries";
import type { ReportType, ReportFormat, GenerateReportRequest } from "./reports.types";

const BANNER_IMG = "https://images.unsplash.com/photo-1777058019293-73d54d4c4cae?w=1400&q=80";

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: "OVERVIEW", label: "Overview Report" },
  { value: "BATCH", label: "Batch Summary" },
  { value: "INSPECTION", label: "Inspection Log" },
  { value: "RECALL", label: "Recall Report" },
  { value: "ANALYTICS", label: "Analytics Report" },
];

const REPORT_FORMATS: { value: ReportFormat; label: string }[] = [
  { value: "PDF", label: "PDF" },
  { value: "EXCEL", label: "Excel" },
  { value: "CSV", label: "CSV" },
];

const TYPE_LABELS: Record<string, string> = {
  OVERVIEW: "Overview",
  BATCH: "Batch Summary",
  INSPECTION: "Inspection Log",
  RECALL: "Recall Report",
  ANALYTICS: "Analytics",
};

const FORMAT_ICONS: Record<string, string> = {
  PDF: "PDF",
  EXCEL: "XLS",
  CSV: "CSV",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("en-VN", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function ReportsPage() {
  const { data: analyticsData, isLoading: overviewLoading, isError: overviewError } = useAnalyticsOverview();
  const { data: distData } = useBatchDistribution();
  const { data: reportsData, isLoading: reportsLoading, refetch: refetchReports } = useReports();
  const generateMutation = useGenerateReport();

  const [showGenerate, setShowGenerate] = useState(false);
  const [genType, setGenType] = useState<ReportType>("OVERVIEW");
  const [genFormat, setGenFormat] = useState<ReportFormat>("PDF");
  const [genDateFrom, setGenDateFrom] = useState("");
  const [genDateTo, setGenDateTo] = useState("");

  const overview = analyticsData?.data;
  const reports = reportsData?.data ?? [];

  const batchDistribution = distData?.data?.items ?? [];

  const summaryCards = overview ? [
    { label: "Total Production", value: `${(overview.totalBatches * 350).toLocaleString()} kg`, icon: Leaf, color: "#2E7D32", bg: "#E8F5E9" },
    { label: "Batches Created", value: overview.totalBatches.toLocaleString(), icon: Package, color: "#1976D2", bg: "#E3F2FD" },
    { label: "Recall Alerts", value: overview.totalRecalls.toLocaleString(), icon: AlertTriangle, color: "#E53935", bg: "#FFEBEE" },
    { label: "Active Batches", value: overview.activeBatches.toLocaleString(), icon: CheckCircle, color: "#7B1FA2", bg: "#F3E5F5" },
  ] : [];

  const handleGenerate = async () => {
    const payload: GenerateReportRequest = {
      type: genType,
      format: genFormat,
    };
    if (genDateFrom) payload.dateFrom = genDateFrom;
    if (genDateTo) payload.dateTo = genDateTo;

    try {
      await generateMutation.mutateAsync(payload);
      setShowGenerate(false);
      setGenDateFrom("");
      setGenDateTo("");
      refetchReports();
    } catch {
      // error handled by the mutation state
    }
  };

  if (overviewLoading || reportsLoading) {
    return (
      <div className="pb-8">
        <div className="relative h-36 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BANNER_IMG})` }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(27,94,32,0.9) 0%, rgba(46,125,50,0.6) 100%)" }} />
          <div className="relative z-10 h-full flex items-center px-8">
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

  if (overviewError) {
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
            <button
              onClick={() => setShowGenerate(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-green-800 hover:opacity-90 transition-opacity"
              style={{ background: "white" }}
            >
              <FileDown className="w-4 h-4" /> Generate Report
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 mt-5">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="mb-5">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Monthly Production Volume</h3>
              <p className="text-gray-400 text-xs mt-0.5">Total quantity produced per month</p>
            </div>
            {overview?.monthlyProduction && overview.monthlyProduction.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={overview.monthlyProduction}>
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
                  <Area type="monotone" dataKey="quantity" name="Quantity" stroke="#2E7D32" strokeWidth={2.5} fill="url(#prodGrad)" dot={{ fill: "#2E7D32", r: 3 }} />
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
            {batchDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={batchDistribution.map((item: any) => ({ name: item.statusName, value: item.count }))} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: 12 }} />
                  <Bar dataKey="value" name="Batches" fill="#66BB6A" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : overview?.batchStatus && overview.batchStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={overview.batchStatus.map((item) => ({ name: item.statusName, value: item.count }))} layout="vertical" barSize={18}>
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
            {overview?.inspectionResults && overview.inspectionResults.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={overview.inspectionResults} barSize={16}>
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
            {overview?.recallTrend && overview.recallTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={overview.recallTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={30} />
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

        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Generated Reports</h3>
              <p className="text-gray-400 text-xs mt-0.5">Recently generated reports and exports</p>
            </div>
            <button
              onClick={() => refetchReports()}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              style={{ color: "#2E7D32" }}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
          {reports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Report</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Format</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Generated</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">By</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#E8F5E9" }}>
                            <FileText className="w-4 h-4" style={{ color: "#2E7D32" }} />
                          </div>
                          <span className="text-sm font-medium text-gray-800">{TYPE_LABELS[report.type] ?? report.type}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-gray-500">{TYPE_LABELS[report.type] ?? report.type}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
                          {FORMAT_ICONS[report.format] ?? report.format}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(report.generatedAt)}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <User className="w-3 h-3" />
                          {report.generatedBy || "-"}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <HardDrive className="w-3 h-3" />
                          {formatFileSize(report.size)}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {report.url ? (
                          <a
                            href={report.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            style={{ color: "#2E7D32", background: "#E8F5E9" }}
                          >
                            <Download className="w-3 h-3" /> Download
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FileText className="w-10 h-10 mb-3 opacity-50" />
              <div className="text-sm font-medium text-gray-500 mb-1">No reports generated yet</div>
              <p className="text-xs text-gray-400 mb-4">Generate your first report to see it here</p>
              <button
                onClick={() => setShowGenerate(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity"
                style={{ background: "#2E7D32" }}
              >
                <FileDown className="w-4 h-4" /> Generate Report
              </button>
            </div>
          )}
        </div>
      </div>

      {showGenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-gray-900" style={{ fontSize: 16 }}>Generate Report</h3>
                <p className="text-gray-400 text-xs mt-0.5">Configure and generate a new report</p>
              </div>
              <button onClick={() => setShowGenerate(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Report Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {REPORT_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setGenType(value)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                        genType === value
                          ? "border-green-600 text-green-700 bg-green-50"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Format</label>
                <div className="flex gap-2">
                  {REPORT_FORMATS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setGenFormat(value)}
                      className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                        genFormat === value
                          ? "border-green-600 text-green-700 bg-green-50"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date From</label>
                  <input
                    type="date"
                    value={genDateFrom}
                    onChange={(e) => setGenDateFrom(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date To</label>
                  <input
                    type="date"
                    value={genDateTo}
                    onChange={(e) => setGenDateTo(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>
            </div>

            {generateMutation.isError && (
              <div className="mt-4 p-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
                Failed to generate report. Please try again.
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowGenerate(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-50 transition-opacity"
                style={{ background: "#2E7D32" }}
              >
                {generateMutation.isPending ? (
                  <>Generating...</>
                ) : (
                  <><FileDown className="w-4 h-4" /> Generate</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
