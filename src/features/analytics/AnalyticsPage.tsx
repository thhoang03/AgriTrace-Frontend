import { useState, type FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { Search, RefreshCw, Clock3, Package, Building2, Activity, AlertTriangle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAnalyticsOverview, useBatchDistribution, useProcessingTime, useTraceback } from "./analytics.queries";
import { useLanguage } from "../../contexts/LanguageContext";

const COLORS = ["#2E7D32", "#66BB6A", "#42A5F5", "#FFB300", "#AB47BC", "#E53935"];
const cardClass = "rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]";

function LoadingCard() {
  return <div className={`${cardClass} h-56 animate-pulse bg-gray-100`} aria-label="Loading analytics" />;
}

export function AnalyticsPage() {
  const { lang } = useLanguage();
  const [batchId, setBatchId] = useState("");
  const [tracebackId, setTracebackId] = useState("");
  const overview = useAnalyticsOverview();
  const distribution = useBatchDistribution();
  const processing = useProcessingTime();
  const traceback = useTraceback(tracebackId);
  const overviewData = overview.data?.data;
  const distributionData = distribution.data?.data as any;
  const processingData = processing.data?.data as any;
  const statusItems = distributionData?.items ?? distributionData?.byStatus ?? [];
  const stages = processingData?.byEventType ?? processingData?.byStage ?? [];

  const searchTraceback = (event: FormEvent) => {
    event.preventDefault();
    setTracebackId(batchId.trim());
  };

  return (
    <div className="space-y-6 p-6 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-green-700">{lang === "vi" ? "Phân tích thông minh" : "Business intelligence"}</p>
          <h1 className="text-2xl font-bold text-gray-900">{lang === "vi" ? "Bảng phân tích dữ liệu" : "Analytics dashboard"}</h1>
          <p className="mt-1 text-sm text-gray-500">{lang === "vi" ? "Theo dõi phân bổ lô hàng, hiệu suất xử lý và khả năng truy xuất nguồn gốc." : "Monitor batch distribution, processing performance, and traceability."}</p>
        </div>
        <button onClick={() => { void overview.refetch(); void distribution.refetch(); void processing.refetch(); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
          <RefreshCw className="h-4 w-4" /> {lang === "vi" ? "Làm mới dữ liệu" : "Refresh data"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {([
          [lang === "vi" ? "Tổng số lô hàng" : "Total batches", overviewData?.totalBatches ?? 0, Package, "text-green-700", "bg-green-50"],
          [lang === "vi" ? "Tổ chức / Đơn vị" : "Organizations", overviewData?.totalOrganizations ?? 0, Building2, "text-blue-700", "bg-blue-50"],
          [lang === "vi" ? "Sự kiện đã ghi nhận" : "Recorded events", overviewData?.totalEvents ?? 0, Activity, "text-purple-700", "bg-purple-50"],
          [lang === "vi" ? "Cảnh báo thu hồi" : "Recall alerts", overviewData?.totalRecalls ?? 0, AlertTriangle, "text-red-700", "bg-red-50"],
        ] as Array<[string, number, LucideIcon, string, string]>).map(([label, value, Icon, color, background]) => (
          <div className={cardClass} key={String(label)}>
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${background}`}><Icon className={`h-5 w-5 ${color}`} /></div>
            <div className="text-2xl font-bold text-gray-900">{Number(value).toLocaleString()}</div>
            <div className="mt-1 text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {distribution.isLoading ? <LoadingCard /> : <section className={cardClass}>
          <div className="mb-5"><h2 className="font-semibold text-gray-900">{lang === "vi" ? "Phân bổ lô hàng" : "Batch distribution"}</h2><p className="mt-1 text-xs text-gray-500">{lang === "vi" ? "Các lô hàng hiện tại theo trạng thái vòng đời" : "Current batches by lifecycle status"}</p></div>
          {statusItems.length ? <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <ResponsiveContainer width="50%" height={220}><PieChart><Pie data={statusItems} dataKey={statusItems[0].count !== undefined ? "count" : "value"} nameKey={statusItems[0].statusName ? "statusName" : "name"} innerRadius={55} outerRadius={82} paddingAngle={3}>{statusItems.map((item: any, index: number) => <Cell key={item.statusName ?? item.name ?? index} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
            <div className="flex-1 space-y-3">{statusItems.map((item: any, index: number) => <div className="flex items-center justify-between text-sm" key={item.statusName ?? item.name ?? index}><span className="flex items-center gap-2 text-gray-600"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />{item.statusName ?? item.name}</span><strong className="text-gray-900">{(item.count ?? item.value ?? 0).toLocaleString()}</strong></div>)}</div>
          </div> : <p className="py-16 text-center text-sm text-gray-400">{lang === "vi" ? "Không có dữ liệu phân bổ." : "No distribution data available."}</p>}
        </section>}

        {processing.isLoading ? <LoadingCard /> : <section className={cardClass}>
          <div className="mb-5 flex items-start justify-between"><div><h2 className="font-semibold text-gray-900">{lang === "vi" ? "Thời gian xử lý" : "Processing time"}</h2><p className="mt-1 text-xs text-gray-500">{lang === "vi" ? "Số giờ trung bình theo loại sự kiện" : "Average hours by event type"}</p></div><Clock3 className="h-5 w-5 text-green-700" /></div>
          {stages.length ? <ResponsiveContainer width="100%" height={220}><BarChart data={stages} layout="vertical" margin={{ left: 12, right: 12 }}><CartesianGrid stroke="#f0f0f0" horizontal={false} /><XAxis type="number" tick={{ fontSize: 11 }} /><YAxis type="category" dataKey={stages[0].eventTypeCode ? "eventTypeCode" : "stage"} width={90} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey={stages[0].averageHours !== undefined ? "averageHours" : "avgHours"} name={lang === "vi" ? "Số giờ trung bình" : "Average hours"} fill="#2E7D32" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer> : <p className="py-16 text-center text-sm text-gray-400">{lang === "vi" ? "Không có dữ liệu thời gian xử lý." : "No processing data available."}</p>}
        </section>}
      </div>

      <section className={cardClass}>
        <div className="mb-4"><h2 className="font-semibold text-gray-900">{lang === "vi" ? "Phân tích truy vết" : "Traceback analysis"}</h2><p className="mt-1 text-xs text-gray-500">{lang === "vi" ? "Tìm các lô hàng và tổ chức liên quan đến một lô hàng nguồn." : "Find batches and organizations related to a source batch."}</p></div>
        <form onSubmit={searchTraceback} className="flex max-w-xl gap-2"><input value={batchId} onChange={(event) => setBatchId(event.target.value)} placeholder={lang === "vi" ? "Nhập mã lô hàng" : "Enter batch ID"} className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" /><button disabled={!batchId.trim() || traceback.isFetching} className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"><Search className="h-4 w-4" /> {lang === "vi" ? "Tìm kiếm" : "Search"}</button></form>
        {tracebackId && traceback.isLoading && <p className="mt-5 text-sm text-gray-500">{lang === "vi" ? "Đang tải dữ liệu vết…" : "Loading traceback…"}</p>}
        {tracebackId && traceback.isError && <p className="mt-5 text-sm text-red-600">{lang === "vi" ? "Không thể tải dữ liệu vết cho lô hàng này." : "Unable to load traceback for this batch."}</p>}
        {traceback.data?.data && <div className="mt-6 grid gap-6 md:grid-cols-2"><div><h3 className="mb-3 text-sm font-semibold text-gray-700">{lang === "vi" ? "Các lô hàng liên quan" : "Affected batches"}</h3><div className="space-y-2">{((traceback.data.data as any).affectedBatches ?? []).map((item: any) => <div className="flex justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm" key={item.batchId}><span className="font-medium text-gray-800">{item.batchCode}</span><span className="text-gray-500">{item.relationship}</span></div>)}</div></div><div><h3 className="mb-3 text-sm font-semibold text-gray-700">{lang === "vi" ? "Các tổ chức liên quan" : "Related organizations"}</h3><div className="space-y-2">{((traceback.data.data as any).relatedOrganizations ?? []).map((item: any) => <div className="flex justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm" key={item.organizationId}><span className="font-medium text-gray-800">{item.name}</span><span className="text-gray-500">{item.type}</span></div>)}</div></div></div>}
      </section>
    </div>
  );
}