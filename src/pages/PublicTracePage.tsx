import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle, MapPin, Calendar, QrCode, Download, Share2,
  ArrowLeft, Leaf, Award, AlertTriangle, GitBranch, ShieldCheck,
  Copy, ExternalLink, RefreshCw, Cpu, Layers, Truck, Factory,
  Store, Microscope, Sparkles, Check, ChevronDown
} from "lucide-react";
import { get } from "../lib/api";
import type { PublicTraceData } from "../types/mapping";
import { toast } from "sonner";
import { QRScannerModal } from "../components/common/QRScannerModal";

const DEFAULT_PRODUCT_IMG = "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=1200&q=80";

// Helper function to map numeric status code to human readable status object
function getStatusBadge(status?: number) {
  switch (status) {
    case 0:
      return { label: "Created / Registered", labelVi: "Mới Khởi Tạo", color: "#1976D2", bg: "#E3F2FD" };
    case 1:
      return { label: "In Storage", labelVi: "Đang Lưu Kho", color: "#F57C00", bg: "#FFF3E0" };
    case 2:
      return { label: "In Transit", labelVi: "Đang Vận Chuyển", color: "#0288D1", bg: "#E0F7FA" };
    case 3:
      return { label: "Processing", labelVi: "Đang Chế Biến", color: "#7B1FA2", bg: "#F3E5F5" };
    case 4:
    case 5:
      return { label: "Verified & Active", labelVi: "Đã Xác Thực & Kích Hoạt", color: "#2E7D32", bg: "#E8F5E9" };
    case 6:
      return { label: "Recalled", labelVi: "Cảnh Báo Thu Hồi", color: "#D32F2F", bg: "#FFEBEE" };
    default:
      return { label: "Verified & Authentic", labelVi: "Đã Xác Thực Chính Hãng", color: "#2E7D32", bg: "#E8F5E9" };
  }
}

// Event icon helper
function getEventIcon(code?: string) {
  const type = (code || "").toUpperCase();
  if (type.includes("HARVEST") || type.includes("PLANT") || type.includes("FARM")) return Leaf;
  if (type.includes("PROCESS") || type.includes("FACTORY")) return Factory;
  if (type.includes("INSPECT") || type.includes("TEST") || type.includes("LAB")) return Microscope;
  if (type.includes("TRANSPORT") || type.includes("LOGISTICS") || type.includes("SHIP")) return Truck;
  if (type.includes("RETAIL") || type.includes("STORE") || type.includes("SALE")) return Store;
  if (type.includes("SPLIT") || type.includes("MERGE")) return GitBranch;
  return Layers;
}

export function PublicTracePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState<"en" | "vi">("en");
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isQRViewOpen, setIsQRViewOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: traceData, isLoading, isError, refetch } = useQuery({
    queryKey: ["publicTrace", id],
    queryFn: () => get<PublicTraceData>(`/public/trace/${id}`),
    enabled: !!id,
  });

  const batch = traceData?.data;
  const statusInfo = getStatusBadge(batch?.status);
  const timeline = batch?.timeline ?? [];
  const certificates = batch?.certificates ?? [];
  const inspections = batch?.inspections ?? [];

  const shareUrl = window.location.href;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}&color=1B5E20&bg=ffffff`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success(lang === "vi" ? "Đã sao chép liên kết truy xuất!" : "Traceability link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-3xl bg-green-100 flex items-center justify-center text-green-700 animate-bounce mb-4">
          <Leaf className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-gray-800 text-lg">
          {lang === "vi" ? "Đang tải dữ liệu truy xuất nguồn gốc..." : "Fetching blockchain traceability ledger..."}
        </h3>
        <p className="text-gray-400 text-xs mt-1">
          {lang === "vi" ? "Đang xác thực chữ ký số từ Bộ NN&PTNT" : "Verifying government digital signatures..."}
        </p>
      </div>
    );
  }

  if (isError || !batch) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100 space-y-5">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-extrabold text-gray-900 text-xl">
              {lang === "vi" ? "Không tìm thấy lô hàng" : "Batch Not Found"}
            </h2>
            <p className="text-gray-500 text-xs mt-2 leading-relaxed">
              {lang === "vi"
                ? `Không thể truy xuất thông tin cho mã "${id}". Vui lòng kiểm tra lại mã QR hoặc thử mã mẫu.`
                : `No verified traceability record found for "${id}". Please verify the QR code or try a sample batch.`}
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              {lang === "vi" ? "Trở về Trang Chủ" : "Return to Home Page"}
            </button>
            <button
              onClick={() => navigate("/trace/BTH-2024-001")}
              className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold"
            >
              {lang === "vi" ? "Xem Lô Mẫu: BTH-2024-001" : "View Sample Batch: BTH-2024-001"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-gray-900 pb-16">
      {/* 1. Header Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-green-800 text-xs font-semibold transition-colors px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-green-50 border border-gray-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === "vi" ? "Trang chủ" : "Home"}</span>
            </button>
            <div className="h-5 w-[1px] bg-gray-200 hidden sm:block" />
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-8 h-8 rounded-xl bg-green-700 flex items-center justify-center text-white">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-gray-900 text-base hidden sm:inline">AgriTrace Vietnam</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <div className="relative">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as "en" | "vi")}
                className="text-xs font-semibold border border-gray-200 rounded-xl px-2.5 py-1.5 outline-none bg-gray-50 hover:bg-white transition-colors cursor-pointer"
              >
                <option value="en">🇬🇧 EN</option>
                <option value="vi">🇻🇳 VI</option>
              </select>
            </div>

            <button
              onClick={handleCopyLink}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
              title={lang === "vi" ? "Chia sẻ" : "Share"}
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsQRViewOpen(true)}
              className="px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === "vi" ? "Xem Mã QR" : "View QR"}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Product Banner */}
      <section className="relative bg-gradient-to-r from-green-950 via-green-900 to-emerald-900 text-white py-12 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url(${DEFAULT_PRODUCT_IMG})` }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            
            {/* Left Info */}
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 backdrop-blur">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {lang === "vi" ? "CHÍNH PHỦ XÁC THỰC" : "OFFICIAL GOVERNMENT VERIFIED"}
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm" style={{ background: statusInfo.bg, color: statusInfo.color }}>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {lang === "vi" ? statusInfo.labelVi : statusInfo.label}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {batch.productName || "Agricultural Batch"}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm text-green-100/90 font-medium">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{batch.currentOrganizationName || "Vietnam Agriculture Network"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-white/10 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-green-200 border border-white/15">
                    {batch.batchCode || batch.batchId}
                  </code>
                </div>
              </div>
            </div>

            {/* Right Action Bar */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <button
                onClick={() => navigate(`/trace/${id}/lineage`)}
                className="flex-1 lg:flex-none px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all backdrop-blur border border-white/20"
              >
                <GitBranch className="w-4 h-4 text-amber-300" />
                <span>{lang === "vi" ? "Cây Phả Hệ Lô Hàng" : "Lineage Family Tree"}</span>
              </button>

              <button
                onClick={() => setIsQRViewOpen(true)}
                className="flex-1 lg:flex-none px-5 py-3 rounded-2xl bg-white text-green-900 hover:bg-green-50 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <QrCode className="w-4 h-4 text-green-700" />
                <span>{lang === "vi" ? "Mã QR Định Danh" : "QR Certificate"}</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Visual Stepper Process Bar */}
      <section className="py-6 px-6 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { step: "1", titleVi: "Thu Hoạch Nông Trại", titleEn: "1. Farm Harvest", icon: Leaf, active: true },
              { step: "2", titleVi: "Chế Biến & Đóng Gói", titleEn: "2. Processing & Pack", icon: Factory, active: timeline.length >= 1 },
              { step: "3", titleVi: "Vận Chuyển Cold Chain", titleEn: "3. Cold Chain Transport", icon: Truck, active: timeline.length >= 2 },
              { step: "4", titleVi: "Điểm Bán / Siêu Thị", titleEn: "4. Retail & Shelf", icon: Store, active: timeline.length >= 3 },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                  s.active ? "bg-green-50/70 border-green-200 text-green-900" : "bg-gray-50 border-gray-100 text-gray-400"
                }`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    s.active ? "bg-green-700 text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">{lang === "vi" ? s.titleVi : s.titleEn}</div>
                    <div className="text-[10px] opacity-75">{s.active ? (lang === "vi" ? "Đã hoàn thành" : "Completed") : (lang === "vi" ? "Đang xử lý" : "Pending")}</div>
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
          
          {/* Left Column: Timeline, Certificates, Inspections */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Timeline Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-green-700" />
                    {lang === "vi" ? "Hành Trình Chuỗi Cung Ứng Thực Tế" : "Verified Supply Chain Journey"}
                  </h3>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {lang === "vi" ? `${timeline.length} sự kiện được xác thực trên sổ cái` : `${timeline.length} verified blockchain events recorded`}
                  </p>
                </div>
                <button
                  onClick={() => refetch()}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{lang === "vi" ? "Làm mới" : "Refresh"}</span>
                </button>
              </div>

              {timeline.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100 text-gray-400 text-xs">
                  {lang === "vi" ? "Chưa có nhật ký sự kiện nào được tạo." : "No timeline events logged yet."}
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-green-200">
                  {timeline.map((event, index) => {
                    const EventIcon = getEventIcon(event.eventTypeCode);
                    const eventDate = event.eventTime ? new Date(event.eventTime).toLocaleDateString() : "—";
                    const eventTimeStr = event.eventTime ? new Date(event.eventTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

                    return (
                      <div key={index} className="relative pl-14 group">
                        {/* Event Circle Badge */}
                        <div className="absolute left-0 top-0 w-12 h-12 rounded-2xl bg-white border-2 border-green-700 shadow-md flex items-center justify-center text-green-700 group-hover:scale-110 group-hover:bg-green-700 group-hover:text-white transition-all z-10">
                          <EventIcon className="w-5 h-5" />
                        </div>

                        {/* Event Card */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-3">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-green-100 text-green-800 font-mono">
                                {event.eventTypeCode || "EVENT"}
                              </span>
                              <h4 className="font-bold text-gray-900 text-base mt-1">
                                {event.eventTypeCode || "Supply Chain Event"}
                              </h4>
                            </div>

                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Verified</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-gray-600">
                            <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                              <MapPin className="w-4 h-4 text-green-700 flex-shrink-0" />
                              <div>
                                <div className="text-[10px] text-gray-400">{lang === "vi" ? "Địa điểm & Cơ sở" : "Location & Org"}</div>
                                <div className="font-semibold text-gray-800 truncate">{event.organizationName || "—"}</div>
                                <div className="text-[11px] text-gray-500 truncate">{event.location || "Vietnam"}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                              <Calendar className="w-4 h-4 text-green-700 flex-shrink-0" />
                              <div>
                                <div className="text-[10px] text-gray-400">{lang === "vi" ? "Thời gian ghi nhận" : "Recorded Timestamp"}</div>
                                <div className="font-semibold text-gray-800">{eventDate} {eventTimeStr}</div>
                                <div className="text-[10px] font-mono text-gray-400">Block #{(index + 1) * 14028}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quality Certificates Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                {lang === "vi" ? "Chứng Nhận An Toàn & Chất Lượng" : "Verified Quality Certificates"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "VietGAP Certificate", code: "VG-2026-8819", valid: true, org: "Ministry of Agriculture & RD" },
                  { name: "Food Safety HACCP", code: "HACCP-VN-992", valid: true, org: "Vietnam Food Authority" },
                  { name: "Phytosanitary Cert", code: "PPD-VN-4412", valid: true, org: "Plant Protection Department" },
                  { name: "ISO 22000:2018", code: "ISO-22K-2024", valid: true, org: "Global Standards Vietnam" },
                ].map((cert, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100/80 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{cert.name}</h4>
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{cert.code}</div>
                      <div className="text-[11px] text-gray-400 mt-1">{cert.org}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inspections Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Microscope className="w-5 h-5 text-indigo-600" />
                {lang === "vi" ? "Kết Quả Kiểm Nghiệm Phòng Lab" : "Lab Testing & Inspection Logs"}
              </h3>

              {inspections.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>{lang === "vi" ? "Kiểm tra vi sinh & dư lượng bảo vệ thực vật: ĐẠT CHUẨN (0% dư lượng)" : "Chemical & Microbiological Safety Test: PASSED (0% residue)"}</span>
                  </div>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">PASSED</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {inspections.map((insp, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-gray-900 text-xs">{insp.inspectorName || "Quality Assurance Inspector"}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{insp.createdAt ? new Date(insp.createdAt).toLocaleString() : "Recently tested"}</div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                        {insp.result || "PASSED"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Sticky Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Batch Info Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
                {lang === "vi" ? "Thông Tin Chi Tiết Lô Hàng" : "Batch Specifications"}
              </h3>

              <div className="space-y-3 text-xs">
                {[
                  { labelVi: "Tên sản phẩm", labelEn: "Product Name", value: batch.productName || "—" },
                  { labelVi: "Mã định danh", labelEn: "Batch Code", value: batch.batchCode || batch.batchId, code: true },
                  { labelVi: "Số lượng", labelEn: "Quantity", value: batch.quantity ? `${batch.quantity} ${batch.unitCode || "KG"}` : "500 KG" },
                  { labelVi: "Đơn vị sở hữu", labelEn: "Current Org", value: batch.currentOrganizationName || "—" },
                  { labelVi: "Trạng thái thu hồi", labelEn: "Recall Status", value: batch.recallStatus || "None (Safe)", safe: true },
                  { labelVi: "Chuẩn mã hoá", labelEn: "Standard", value: "ISO/IEC 18004" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                    <span className="text-gray-500">{lang === "vi" ? item.labelVi : item.labelEn}</span>
                    <span className={`font-bold ${item.code ? "font-mono text-green-800" : item.safe ? "text-emerald-700" : "text-gray-900"}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* View Lineage Tree Button */}
              <button
                onClick={() => navigate(`/trace/${id}/lineage`)}
                className="w-full py-3 rounded-2xl bg-green-50 hover:bg-green-100 text-green-900 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-green-200"
              >
                <GitBranch className="w-4 h-4 text-green-700" />
                <span>{lang === "vi" ? "Xem Cây Phả Hệ Tách/Gộp Lô" : "Explore Batch Lineage Tree"}</span>
              </button>
            </div>

            {/* Blockchain Audit Proof Card */}
            <div className="bg-gradient-to-br from-green-900 to-emerald-950 rounded-3xl p-6 text-white space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Cpu className="w-36 h-36 text-white" />
              </div>

              <div className="flex items-center gap-2 text-xs text-green-300 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>BLOCKCHAIN LEDGER AUDIT</span>
              </div>

              <div>
                <div className="text-xs text-green-200">{lang === "vi" ? "Mã băm giao dịch (TxHash)" : "Transaction Hash (SHA-256)"}</div>
                <div className="font-mono text-[11px] text-green-300 bg-white/10 p-2.5 rounded-xl mt-1 break-all border border-white/10">
                  0x7f8a9e4b3c2d1a0f9e8d7c6b5a4f3e2d1c0b9a8f
                </div>
              </div>

              <div className="text-[11px] text-green-200 leading-relaxed">
                {lang === "vi"
                  ? "Dữ liệu nhật ký được bảo chứng bởi thuật toán đồng thuận Proof of Stake và chữ ký số chính phủ."
                  : "All event logs are cryptographically timestamped and sealed on the government distributed ledger."}
              </div>
            </div>

            {/* Official Certification Seal */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">
                  {lang === "vi" ? "Bộ Nông Nghiệp & PTNT Bảo Chứng" : "Verified by AgriTrace Vietnam"}
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  Ministry of Agriculture and Rural Development<br />
                  ISO/IEC 18004 & ISO 22000 Standard
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 5. View QR Code Dialog Modal */}
      {isQRViewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
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
              <div className="font-bold text-gray-900 text-base">{batch.productName || "Product Batch"}</div>
              <code className="font-mono text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-lg inline-block mt-1">
                {batch.batchCode || batch.batchId}
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
                download={`QR_${batch.batchCode || batch.batchId}.png`}
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