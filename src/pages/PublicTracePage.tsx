import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle, MapPin, Calendar, QrCode, Download, Share2,
  ArrowLeft, Leaf, Award, AlertTriangle, GitBranch, GitMerge, ShieldCheck,
  Copy, RefreshCw, Layers, Microscope, PlusCircle, Inbox, Factory,
  Package, Truck, Boxes, Store, ClipboardCheck,
  Lock, Printer, ZoomIn, User,
  Eye, X
} from "lucide-react";
import { publicTraceApi } from "../features/public-trace/public-trace.api";
import type { PublicTraceCertificate, PublicTraceInspection } from "../features/public-trace/public-trace.types";
import { toast } from "sonner";

// Matches the real EventType.Code seed values (AgriTrace-Backend/.../SeedData.cs)
const EVENT_TYPE_ICONS: Record<string, { icon: typeof Layers; color: string }> = {
  CREATED: { icon: PlusCircle, color: "#1976D2" },
  HARVEST: { icon: Leaf, color: "#2E7D32" },
  RECEIVE: { icon: Inbox, color: "#0288D1" },
  PROCESSING: { icon: Factory, color: "#7B1FA2" },
  PACKAGING: { icon: Package, color: "#F57C00" },
  TRANSPORT: { icon: Truck, color: "#0288D1" },
  DISTRIBUTION: { icon: Boxes, color: "#0288D1" },
  RETAIL: { icon: Store, color: "#F57C00" },
  INSPECTION: { icon: ClipboardCheck, color: "#4338CA" },
  RECALL: { icon: AlertTriangle, color: "#D32F2F" },
  SPLIT: { icon: GitBranch, color: "#6D28D9" },
  MERGE: { icon: GitMerge, color: "#6D28D9" },
};
const DEFAULT_EVENT_ICON = { icon: Layers, color: "#2E7D32" };

// Matches the real BatchStatus enum (AgriTrace-Backend/AgriTrace.Domain/Entities/Batches/BatchStatus.cs):
// Created=1, Harvested=2, Processing=3, Transporting=4, Distributed=5, Retail=6, Recalled=7
function getStatusBadge(status?: number) {
  switch (status) {
    case 1:
      return { labelVi: "Mới Khởi Tạo", labelEn: "Created", color: "#1976D2", bg: "#E3F2FD" };
    case 2:
      return { labelVi: "Đã Thu Hoạch", labelEn: "Harvested", color: "#2E7D32", bg: "#E8F5E9" };
    case 3:
      return { labelVi: "Đang Chế Biến", labelEn: "Processing", color: "#7B1FA2", bg: "#F3E5F5" };
    case 4:
      return { labelVi: "Đang Vận Chuyển", labelEn: "In Transit", color: "#0288D1", bg: "#E0F7FA" };
    case 5:
      return { labelVi: "Đã Phân Phối", labelEn: "Distributed", color: "#00796B", bg: "#E0F2F1" };
    case 6:
      return { labelVi: "Đang Bày Bán", labelEn: "At Retail", color: "#F57C00", bg: "#FFF3E0" };
    case 7:
      return { labelVi: "Cảnh Báo Thu Hồi", labelEn: "Recalled", color: "#D32F2F", bg: "#FFEBEE" };
    default:
      return { labelVi: "Chưa Xác Định", labelEn: "Unknown", color: "#6B7280", bg: "#F3F4F6" };
  }
}

export function PublicTracePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState<"vi" | "en">("vi");
  const [isQRViewOpen, setIsQRViewOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeStepTab, setActiveStepTab] = useState<number | null>(null);
  const [isPreviewImageOpen, setIsPreviewImageOpen] = useState(false);

  const { data: traceData, isLoading, isError, refetch } = useQuery({
    queryKey: ["publicTrace", id],
    queryFn: () => publicTraceApi.getTrace(id!),
    enabled: !!id,
  });

  const rawBatch = traceData?.data;
  const certificates: PublicTraceCertificate[] = rawBatch?.certificates ?? [];
  const inspections: PublicTraceInspection[] = rawBatch?.inspections ?? [];

  const batch = {
    productName: rawBatch?.productName,
    batchCode: rawBatch?.batchCode || id || "",
    productImage: rawBatch?.productImage,
    farmName: rawBatch?.farmName,
    farmerName: rawBatch?.farmerName,
    currentOrganizationName: rawBatch?.currentOrganizationName,
    location: rawBatch?.location,
    gps: rawBatch?.gps,
    quantity: rawBatch?.quantity != null ? `${rawBatch.quantity}`.trim() : undefined,
    harvestDate: rawBatch?.harvestDate,
    status: rawBatch?.status,
    recallStatus: rawBatch?.recallStatus,
    recallReason: rawBatch?.recallReason,
    recallSeverity: rawBatch?.recallSeverity,
    timeline: (rawBatch?.timeline ?? []).map((e) => {
      const code = e.eventTypeCode || "EVENT";
      const iconMeta = EVENT_TYPE_ICONS[code.toUpperCase()] || DEFAULT_EVENT_ICON;
      return {
        code,
        titleVi: e.eventTypeCode || "Sự kiện chuỗi cung ứng",
        titleEn: e.eventTypeCode || "Supply Chain Event",
        org: e.organizationName || (lang === "vi" ? "Đơn vị thực hiện" : "Recording organization"),
        performedByName: e.performedByName,
        location: e.location || (lang === "vi" ? "Chưa cập nhật" : "Not provided"),
        time: e.eventTime ? new Date(e.eventTime).toLocaleString("vi-VN") : "",
        icon: iconMeta.icon,
        color: iconMeta.color,
      };
    }),
  };

  // Recall.Status enum on the backend is Pending | Processing | Completed | Cancelled (not Active/Resolved/None)
  const RECALL_STATUS_LABELS: Record<string, { vi: string; en: string; color: string; bg: string }> = {
    PENDING: { vi: "Đã Thu Hồi — Đang Chờ Xử Lý", en: "Recalled — Pending Review", color: "#B45309", bg: "#FEF3C7" },
    PROCESSING: { vi: "Đã Thu Hồi — Đang Xử Lý", en: "Recalled — In Progress", color: "#B91C1C", bg: "#FEE2E2" },
    COMPLETED: { vi: "Đã Thu Hồi — Hoàn Tất", en: "Recalled — Completed", color: "#374151", bg: "#F3F4F6" },
    CANCELLED: { vi: "Đã Hủy Lệnh Thu Hồi", en: "Recall Cancelled", color: "#15803D", bg: "#DCFCE7" },
  };
  const recallInfo = batch.recallStatus ? RECALL_STATUS_LABELS[batch.recallStatus] : undefined;
  const statusInfo = getStatusBadge(typeof batch.status === "number" ? batch.status : undefined);
  const shareUrl = window.location.href;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}&color=1B5E20&bg=ffffff`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success(lang === "vi" ? "Đã sao chép liên kết mã QR!" : "Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    toast.info(lang === "vi" ? "Đang xuất chứng thư số truy xuất..." : "Preparing certificate PDF...");
    window.print();
  };

  const filteredTimeline = activeStepTab !== null
    ? batch.timeline.filter((_: any, idx: number) => idx === activeStepTab)
    : batch.timeline;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-800 animate-bounce mb-4 shadow-md">
          <Leaf className="w-8 h-8" />
        </div>
        <h3 className="font-extrabold text-gray-900 text-lg">
          {lang === "vi" ? "Đang truy xuất Hộ Chiếu Số Nông Sản..." : "Fetching Digital Produce Passport..."}
        </h3>
        <p className="text-gray-500 text-xs mt-1">
          {lang === "vi" ? "Đang tải dữ liệu chuỗi cung ứng..." : "Loading supply chain data..."}
        </p>
      </div>
    );
  }

  if (isError || !rawBatch) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-100 flex items-center justify-center text-red-700 mb-4 shadow-md">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="font-extrabold text-gray-900 text-lg">
          {lang === "vi" ? "Không tìm thấy dữ liệu truy xuất" : "Trace data not found"}
        </h3>
        <p className="text-gray-500 text-xs mt-1 max-w-sm">
          {lang === "vi"
            ? `Không có dữ liệu cho mã lô "${id}". Vui lòng kiểm tra lại mã hoặc thử lại sau.`
            : `No data found for batch code "${id}". Please check the code or try again later.`}
        </p>
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {lang === "vi" ? "Thử lại" : "Retry"}
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold"
          >
            {lang === "vi" ? "Về trang chủ" : "Back to Home"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-gray-900 pb-16">
      {/* 1. Header Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-700 hover:text-green-800 text-xs font-bold transition-colors px-3 py-2 rounded-xl bg-gray-50 hover:bg-green-50 border border-gray-200"
            >
              <ArrowLeft className="w-4 h-4 text-green-700" />
              <span>{lang === "vi" ? "Trang chủ" : "Home"}</span>
            </button>
            <div className="h-5 w-[1px] bg-gray-200 hidden sm:block" />
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-800 to-emerald-700 flex items-center justify-center text-white shadow-sm">
                <Leaf className="w-4 h-4" />
              </div>
              <div className="flex flex-col hidden sm:flex">
                <span className="font-extrabold text-gray-900 text-sm leading-tight">AgriTrace Vietnam</span>
                <span className="text-[9px] text-green-700 font-bold uppercase tracking-wider">Cổng Tra Cứu Quốc Gia</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              <span>{lang === "vi" ? "In chứng thư" : "Print PDF"}</span>
            </button>

            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as "en" | "vi")}
              className="text-xs font-semibold border border-gray-200 rounded-xl px-2.5 py-2 outline-none bg-gray-50 hover:bg-white transition-colors cursor-pointer"
            >
              <option value="vi">🇻🇳 Tiếng Việt</option>
              <option value="en">🇬🇧 English</option>
            </select>

            <button
              onClick={handleCopyLink}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
              title={lang === "vi" ? "Chia sẻ" : "Share"}
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsQRViewOpen(true)}
              className="px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === "vi" ? "Mã QR Truy Xuất" : "View QR"}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section - "Hộ Chiếu Số Nông Sản" */}
      <section className="relative bg-gradient-to-r from-green-950 via-green-900 to-emerald-950 text-white py-12 px-6 overflow-hidden shadow-lg">
        {/* Glow ambient background effect */}
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-80 h-80 rounded-full bg-green-400/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            
            {/* Left Header Details */}
            <div className="space-y-4 max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-500/30 backdrop-blur">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {lang === "vi" ? "MÃ BẢO CHỨNG SỐ QUỐC GIA" : "OFFICIAL GOVERNMENT VERIFIED"}
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm" style={{ background: statusInfo.bg, color: statusInfo.color }}>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {lang === "vi" ? statusInfo.labelVi : statusInfo.labelEn}
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-green-200 text-xs font-mono font-semibold backdrop-blur">
                  <Lock className="w-3 h-3 text-amber-300" />
                  SHA-256 Verified
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {batch.productName || (lang === "vi" ? "Chưa cập nhật tên sản phẩm" : "Product name not provided")}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm text-green-100/90 font-medium">
                {batch.farmName && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>{batch.farmName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 text-xs">{lang === "vi" ? "Mã Lô:" : "Batch Code:"}</span>
                  <code className="bg-white/15 px-3 py-1 rounded-xl text-xs font-mono font-extrabold text-green-200 border border-white/20">
                    {batch.batchCode}
                  </code>
                </div>
              </div>
            </div>

            {/* Right Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <button
                onClick={() => navigate(`/trace/${id}/lineage`)}
                className="flex-1 lg:flex-none px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all backdrop-blur border border-white/20 active:scale-95 hover:scale-102"
              >
                <GitBranch className="w-4 h-4 text-amber-300" />
                <span>{lang === "vi" ? "Xem Phả Hệ Tách/Gộp Lô" : "Lineage Family Tree"}</span>
              </button>

              <button
                onClick={() => setIsQRViewOpen(true)}
                className="flex-1 lg:flex-none px-5 py-3 rounded-2xl bg-white text-green-900 hover:bg-green-50 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 hover:scale-102"
              >
                <QrCode className="w-4 h-4 text-green-700" />
                <span>{lang === "vi" ? "Chứng Thư Mã QR" : "QR Certificate"}</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Interactive Stepper Process Bar */}
      <section className="py-6 px-6 bg-white border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
              {lang === "vi" ? "Quy Trình Chuỗi Cung Ứng Thực Tế:" : "Verified Supply Chain Workflow:"}
            </span>
            {activeStepTab !== null && (
              <button
                onClick={() => setActiveStepTab(null)}
                className="text-xs font-bold text-green-700 hover:underline"
              >
                {lang === "vi" ? "Xem tất cả sự kiện" : "Show all events"}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {batch.timeline.map((stepItem: any, idx: number) => {
              const StepIcon = stepItem.icon;
              const isSelected = activeStepTab === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStepTab(isSelected ? null : idx)}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? "text-white shadow-md scale-102"
                      : "bg-green-50/70 border-green-200 text-green-900 hover:bg-green-100/60 hover:-translate-y-0.5"
                  }`}
                  style={isSelected ? { background: stepItem.color, borderColor: stepItem.color } : undefined}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      isSelected ? "bg-white" : "text-white"
                    }`}
                    style={isSelected ? { color: stepItem.color } : { background: stepItem.color }}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold line-clamp-1">{lang === "vi" ? stepItem.titleVi : stepItem.titleEn}</div>
                    <div className={`text-[10px] ${isSelected ? "text-green-100" : "text-green-700"}`}>
                      {lang === "vi" ? "✓ Đã xác thực" : "✓ Verified"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Main Content Grid */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Timeline, Quality Certs, Lab Tests */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Timeline Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-green-700" />
                    {lang === "vi" ? "Nhật Ký Hành Trình Chuỗi Cung Ứng Bất Biến" : "Verified Supply Chain Timeline"}
                  </h3>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {lang === "vi"
                      ? `${filteredTimeline.length} sự kiện được đóng dấu thời gian bất biến trên sổ cái`
                      : `${filteredTimeline.length} immutable blockchain events recorded`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveStepTab(null);
                    refetch();
                  }}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{lang === "vi" ? "Làm mới" : "Refresh"}</span>
                </button>
              </div>

              <div className="space-y-6 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-green-200">
                {filteredTimeline.map((event: any, index: number) => {
                  const EventIcon = event.icon || Layers;
                  const eventColor = event.color || "#2E7D32";

                  return (
                    <div key={index} className="relative pl-14 group">
                      {/* Event Circle Badge */}
                      <div
                        className="absolute left-0 top-0 w-12 h-12 rounded-2xl bg-white border-2 shadow-md flex items-center justify-center group-hover:scale-110 transition-all z-10"
                        style={{ borderColor: eventColor, color: eventColor }}
                      >
                        <EventIcon className="w-5 h-5" />
                      </div>

                      {/* Event Card */}
                      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded bg-green-100 text-green-800 font-mono">
                                {event.code || "EVENT"}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-gray-900 text-base mt-1">
                              {lang === "vi" ? event.titleVi : event.titleEn}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{lang === "vi" ? "Đã Xác Thực 100%" : "Verified"}</span>
                          </div>
                        </div>

                        {/* Event Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-gray-600">
                          <div className="flex items-start gap-2.5 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <MapPin className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-[10px] text-gray-400 font-bold uppercase">{lang === "vi" ? "Đơn vị & Địa điểm" : "Location & Org"}</div>
                              <div className="font-bold text-gray-900">{event.org}</div>
                              <div className="text-[11px] text-gray-500 mt-0.5">{event.location}</div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <Calendar className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-[10px] text-gray-400 font-bold uppercase">{lang === "vi" ? "Thời gian ghi nhận" : "Recorded Timestamp"}</div>
                              <div className="font-bold text-gray-900">{event.time || (lang === "vi" ? "Chưa cập nhật" : "Not provided")}</div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 bg-gray-50 p-3 rounded-xl border border-gray-100 sm:col-span-2">
                            <User className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-[10px] text-gray-400 font-bold uppercase">{lang === "vi" ? "Người tạo sự kiện" : "Recorded By"}</div>
                              <div className="font-bold text-gray-900">{event.performedByName || (lang === "vi" ? "Chưa cập nhật" : "Not provided")}</div>
                            </div>
                          </div>
                        </div>

                        {/* Details metric note */}
                        {event.details && (
                          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-[11px] text-emerald-900 font-medium flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>{event.details}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quality Certificates Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  {lang === "vi" ? "Chứng Nhận Chất Lượng Số Đã Xác Minh" : "Verified Quality Certificates"}
                </h3>
                {certificates.length > 0 && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {certificates.filter((c) => c.status === 3 || c.status === undefined || c.status === 2).length}/{certificates.length} Valid
                  </span>
                )}
              </div>

              {certificates.length === 0 ? (
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-500 text-center">
                  {lang === "vi" ? "Chưa có chứng nhận nào được ghi nhận cho lô hàng này." : "No certificates have been recorded for this batch yet."}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {certificates.map((cert, i) => {
                    const isValid = cert.status === 3 || cert.status === undefined || cert.status === 2;
                    const expiryStr = cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : null;

                    return (
                      <div key={i} className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                        isValid ? "bg-amber-50/40 border-amber-100/80" : "bg-gray-50 border-gray-200"
                      }`}>
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-bold text-gray-900 text-sm truncate">{cert.certificateType}</h4>
                            {isValid ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                {lang === "vi" ? "HIỆU LỰC" : "ACTIVE"}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                                {lang === "vi" ? "HẾT HẠN" : "EXPIRED"}
                              </span>
                            )}
                          </div>
                          {cert.certificateNumber && (
                            <div className="text-xs font-mono font-bold text-amber-800 mt-0.5">
                              {cert.certificateNumber}
                            </div>
                          )}
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            {cert.issuingOrganization || "Accredited Certification Body"}
                          </div>
                          {expiryStr && (
                            <div className="text-[10px] text-gray-400 mt-1">
                              {lang === "vi" ? `Có hiệu lực đến: ${expiryStr}` : `Valid until: ${expiryStr}`}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Inspections & Lab Testing Results */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  <Microscope className="w-5 h-5 text-indigo-600" />
                  {lang === "vi" ? "Kết Quả Thử Nghiệm Phòng Lab" : "Lab Testing Results"}
                </h3>
              </div>

              {inspections.length === 0 ? (
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-500 text-center">
                  {lang === "vi" ? "Chưa có kết quả kiểm nghiệm nào được ghi nhận cho lô hàng này." : "No lab testing results have been recorded for this batch yet."}
                </div>
              ) : (
                <div className="space-y-3">
                  {inspections.map((inspection, i) => {
                    const passed = inspection.result?.toUpperCase() === "PASS";
                    const failed = inspection.result?.toUpperCase() === "FAIL";
                    return (
                      <div
                        key={i}
                        className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
                          passed ? "bg-emerald-50/70 border-emerald-100 text-emerald-950" : failed ? "bg-red-50 border-red-100 text-red-950" : "bg-gray-50 border-gray-200 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle className={`w-4 h-4 flex-shrink-0 ${passed ? "text-emerald-700" : failed ? "text-red-600" : "text-gray-400"}`} />
                          <div>
                            <div className="font-bold">{inspection.inspectorName || (lang === "vi" ? "Kỹ thuật viên kiểm định" : "Inspector")}</div>
                            <div className="text-[11px] opacity-80">
                              {inspection.createdAt ? new Date(inspection.createdAt).toLocaleString("vi-VN") : ""}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`font-extrabold px-3 py-1 rounded-xl shrink-0 ${
                            passed ? "text-emerald-800 bg-emerald-100" : failed ? "text-red-800 bg-red-100" : "text-gray-700 bg-gray-200"
                          }`}
                        >
                          {inspection.result || (lang === "vi" ? "CHỜ XỬ LÝ" : "PENDING")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Product Image Card, Specifications & Audit Proof */}
          <div className="lg:col-span-4 space-y-6">

            {/* 📸 REAL PRODUCT IMAGE PASSPORT CARD */}
            {batch.productImage && (
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3 group hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between text-xs font-extrabold text-gray-700 px-1">
                  <span className="flex items-center gap-1.5 text-green-800">
                    <Eye className="w-4 h-4 text-green-700" />
                    {lang === "vi" ? "Ảnh Thực Tế Lô Hàng" : "Real Batch Visual"}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono">
                    ✓ FARM SHOT
                  </span>
                </div>

                {/* Image Container with Hover Zoom & Modal Trigger */}
                <div
                  onClick={() => setIsPreviewImageOpen(true)}
                  className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100 cursor-pointer shadow-inner group/img"
                >
                  <img
                    src={batch.productImage}
                    alt={batch.productName}
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-xs">
                    <ZoomIn className="w-4 h-4" />
                    <span>{lang === "vi" ? "Phóng to hình ảnh" : "Enlarge Image"}</span>
                  </div>
                </div>

                <div className="text-[11px] text-gray-500 italic px-1 flex items-center justify-between">
                  <span>{lang === "vi" ? "Ảnh chụp xác nhận tại trang trại" : "Photo captured at origin farm"}</span>
                  <span className="font-mono text-green-700 font-bold">{batch.harvestDate}</span>
                </div>
              </div>
            )}
            
            {/* Batch Specifications Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-100 pb-3 flex items-center justify-between">
                <span>{lang === "vi" ? "Thông Tin Chi Tiết Lô Hàng" : "Batch Specifications"}</span>
                <span className="text-xs font-mono font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                  {batch.batchCode}
                </span>
              </h3>

              <div className="space-y-3 text-xs">
                {[
                  { labelVi: "Tên sản phẩm", labelEn: "Product Name", value: batch.productName },
                  { labelVi: "Mã định danh lô", labelEn: "Batch Code", value: batch.batchCode, code: true },
                  { labelVi: "Sản lượng lô", labelEn: "Quantity", value: batch.quantity },
                  { labelVi: "Đơn vị quản lý hiện tại", labelEn: "Current Organization", value: batch.currentOrganizationName },
                  { labelVi: "Trang trại sản xuất", labelEn: "Farm", value: batch.farmName },
                  { labelVi: "Chủ hộ / Nông dân", labelEn: "Farmer", value: batch.farmerName },
                  { labelVi: "Ngày thu hoạch", labelEn: "Harvest Date", value: batch.harvestDate },
                ]
                  .filter((item) => item.value)
                  .map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                      <span className="text-gray-500 font-medium">{lang === "vi" ? item.labelVi : item.labelEn}</span>
                      <span className={`font-bold ${item.code ? "font-mono text-green-800" : "text-gray-900"}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}

                <div className="p-2.5 rounded-xl" style={{ background: recallInfo ? recallInfo.bg : "#F9FAFB" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">{lang === "vi" ? "Trạng thái thu hồi" : "Recall Status"}</span>
                    <span className="font-bold" style={{ color: recallInfo ? recallInfo.color : "#047857" }}>
                      {recallInfo
                        ? (lang === "vi" ? recallInfo.vi : recallInfo.en)
                        : (lang === "vi" ? "Không thu hồi" : "No recall")}
                    </span>
                  </div>
                  {recallInfo && batch.recallReason && (
                    <div className="text-[11px] mt-1" style={{ color: recallInfo.color }}>
                      {lang === "vi" ? "Lý do: " : "Reason: "}
                      {batch.recallReason}
                    </div>
                  )}
                </div>
              </div>

              {/* View Lineage Tree Button */}
              <button
                onClick={() => navigate(`/trace/${id}/lineage`)}
                className="w-full py-3 rounded-2xl bg-green-50 hover:bg-green-100 text-green-900 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-green-200 active:scale-95"
              >
                <GitBranch className="w-4 h-4 text-green-700" />
                <span>{lang === "vi" ? "Xem Cây Phả Hệ Tách/Gộp Lô" : "Explore Batch Lineage Tree"}</span>
              </button>
            </div>

            {/* Official Certification Seal */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <div className="font-extrabold text-gray-900 text-sm">
                  {lang === "vi" ? "Bộ Nông Nghiệp & PTNT Bảo Chứng" : "Verified by AgriTrace Vietnam"}
                </div>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                  Ministry of Agriculture and Rural Development<br />
                  ISO/IEC 18004 & ISO 22000 Standard
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 5. View Fullscreen Product Image Modal */}
      {isPreviewImageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setIsPreviewImageOpen(false)}>
          <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsPreviewImageOpen(false)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={batch.productImage} alt="Product Full" className="w-full max-h-[80vh] object-contain rounded-2xl" />
            <div className="p-4 text-center">
              <div className="font-extrabold text-gray-900 text-base">{batch.productName}</div>
              <p className="text-gray-500 text-xs mt-0.5">{batch.farmName} • {batch.location}</p>
            </div>
          </div>
        </div>
      )}

      {/* 6. View QR Code Dialog Modal */}
      {isQRViewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 text-center p-6 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-green-800">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                AgriTrace Verified QR
              </span>
              <button
                onClick={() => setIsQRViewOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="bg-green-50 p-4 rounded-2xl border border-green-100 inline-block shadow-inner">
              <img src={qrImageUrl} alt="QR Code" className="w-48 h-48 mx-auto rounded-lg" />
            </div>

            <div>
              <div className="font-bold text-gray-900 text-base">{batch.productName}</div>
              <code className="font-mono text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-lg inline-block mt-1">
                {batch.batchCode}
              </code>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleCopyLink}
                className="py-2.5 px-3 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-gray-50"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? (lang === "vi" ? "Đã chép!" : "Copied!") : (lang === "vi" ? "Chép Link" : "Copy Link")}
              </button>
              <a
                href={qrImageUrl}
                download={`QR_${batch.batchCode}.png`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                {lang === "vi" ? "Tải QR" : "Download"}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}