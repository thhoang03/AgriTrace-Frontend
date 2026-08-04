import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, QrCode, CheckCircle, MapPin, Calendar, Hash,
  User, Building2, Award, Download, Share2, Shield,
  Edit2, Scissors, Merge, AlertCircle, Package, Plus, Send, Clock, CheckCircle2, XCircle,
} from "lucide-react";
import { useBatch, useBatchTimeline, useBatchQrCode } from "./batches.queries";
import { useInspections } from "../inspection/inspection.queries";
import { InspectionTypeLabel } from "../inspection/inspection.types";
import { useEventRequests } from "../event-requests/event-requests.queries";
import { BatchEditModal } from "./BatchEditModal";
import { BatchSplitModal } from "./BatchSplitModal";
import { BatchMergeModal } from "./BatchMergeModal";
import { BatchEventModal } from "./BatchEventModal";
import { BatchMediaTab } from "./BatchMediaTab";
import { BatchLineageTab } from "./BatchLineageTab";
import { BatchInspectionRequestModal } from "./BatchInspectionRequestModal";
import { useLanguage } from "../../contexts/LanguageContext";

const PRODUCT_IMG = "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=800&q=80";

const statusConfig: Record<string, { bg: string; color: string }> = {
  Created:      { bg: "#E0F7FA", color: "#00838F" },
  Harvested:    { bg: "#E8F5E9", color: "#2E7D32" },
  Processing:   { bg: "#FFF3E0", color: "#F57C00" },
  Packaged:     { bg: "#E3F2FD", color: "#1565C0" },
  "In Transit": { bg: "#F3E5F5", color: "#7B1FA2" },
  Distributed:  { bg: "#E0F2F1", color: "#00695C" },
  "At Retail":  { bg: "#E8F5E9", color: "#1B5E20" },
  Recalled:     { bg: "#FFEBEE", color: "#C62828" },
};

const tabsEn = ["Information", "Timeline", "Media", "Lineage", "Certificates", "Inspection Requests", "Audit Log"] as const;
const tabsVi = ["Thông tin", "Lịch sử", "Phương tiện", "Phả hệ", "Chứng nhận", "Yêu cầu kiểm định", "Nhật ký"] as const;
type Tab = typeof tabsEn[number];

const auditTypeStyle: Record<string, { bg: string; color: string; dot: string }> = {
  create:   { bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  update:   { bg: "#F0FDF4", color: "#15803D", dot: "#22C55E" },
  inspect:  { bg: "#FAF5FF", color: "#7E22CE", dot: "#A855F7" },
  generate: { bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B" },
  delete:   { bg: "#FEF2F2", color: "#B91C1C", dot: "#EF4444" },
};

export function BatchDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("Information");
  const [showEdit, setShowEdit] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [showMerge, setShowMerge] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showRequestInspectionModal, setShowRequestInspectionModal] = useState(false);

  const { data: batchData, isLoading, isError } = useBatch(id ?? "");
  const { data: timelineData, isLoading: timelineLoading } = useBatchTimeline(id ?? "");
  const { data: qrData } = useBatchQrCode(id ?? "");
  const { data: inspectionsData } = useInspections();
  const { data: eventRequestsData, refetch: refetchRequests } = useEventRequests({ onlyMine: false });

  const batch = batchData?.data;
  const timelineEvents = timelineData?.data ?? [];
  const qrCode = qrData?.data;

  const allInspections = inspectionsData?.data ?? [];
  const batchInspections = batch
    ? allInspections.filter(i => i.batchId === batch.id || (batch.batchCode && i.batchCode === batch.batchCode))
    : [];

  const allRequests = eventRequestsData?.items ?? [];
  const batchRequests = batch
    ? allRequests.filter(r => r.batchId === batch.id || (batch.batchCode && r.batchCode === batch.batchCode))
    : [];

  const statusNorm = (() => {
    if (!batch) return "";
    const upper = batch.status.toUpperCase();
    if (upper === "PACKAGING") return "Packaged";
    if (upper === "TRANSPORTING") return "In Transit";
    if (upper === "DISTRIBUTING" || upper === "COMPLETED") return "Distributed";
    if (upper === "RETAIL") return "At Retail";
    const lc = batch.status.charAt(0).toUpperCase() + batch.status.slice(1).toLowerCase();
    return lc;
  })();

  const statusCfg = statusConfig[statusNorm] ?? { bg: "#F3F4F6", color: "#6B7280" };

  const handleDownloadQr = async () => {
    const qrUrl = qrCode?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin + "/public/trace/" + (batch?.id || ""))}`;
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `qrcode-${batch?.batchCode || batch?.id || "batch"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      const a = document.createElement("a");
      a.href = qrUrl;
      a.target = "_blank";
      a.download = `qrcode-${batch?.batchCode || batch?.id || "batch"}.png`;
      a.click();
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/app/batches/${batch?.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Batch Traceability - ${batch?.productName || batch?.product}`,
          text: `Check traceability for Batch ${batch?.batchCode || batch?.id}`,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or fallback
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Traceability link copied to clipboard!");
    } catch {
      alert(`Traceability link: ${shareUrl}`);
    }
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "#E8F5E9" }}>
          <Package className="w-5 h-5 animate-pulse" style={{ color: "#2E7D32" }} />
        </div>
        <div className="text-sm text-gray-500">Loading batch details...</div>
      </div>
    );
  }

  if (isError || !batch) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <div className="text-sm text-red-500">Error loading batch details.</div>
        <button onClick={() => navigate("/app/batches")} className="text-sm text-gray-500 hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Batch List
        </button>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Hero Image Banner */}
      <div className="relative h-72 overflow-hidden">
        <img
          src={batch.productImage || batch.image || PRODUCT_IMG}
          alt={batch.productName ?? batch.product}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG; }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)" }} />
        <div className="relative z-10 h-full flex flex-col justify-between p-6">
          <button
            onClick={() => navigate("/app/batches")}
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors self-start bg-black/20 hover:bg-black/30 px-3 py-1.5 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Batch List
          </button>
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500 text-white flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: statusCfg.bg, color: statusCfg.color }}>
                  {statusNorm || batch.status}
                </span>
              </div>
              <h1 className="text-white" style={{ fontSize: 28, fontWeight: 800 }}>{batch.productName ?? batch.product}</h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <code className="text-green-300 text-sm font-mono">{batch.batchCode ?? batch.id}</code>
                <span className="text-white/60 text-sm">·</span>
                <div className="flex items-center gap-1 text-white/80 text-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  {batch.productionArea || batch.location || "Unknown location"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button
                onClick={() => setShowEdit(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/15 text-white hover:bg-white/25 flex items-center gap-2 transition-colors"
              >
                <Edit2 className="w-4 h-4" /> {lang === "vi" ? "Chỉnh sửa" : "Edit"}
              </button>
              <button
                onClick={() => setShowSplit(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-500/80 text-white hover:bg-blue-600/90 flex items-center gap-2 transition-colors"
              >
                <Scissors className="w-4 h-4" /> {lang === "vi" ? "Tách lô" : "Split"}
              </button>
              <button
                onClick={() => setShowMerge(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-purple-500/80 text-white hover:bg-purple-600/90 flex items-center gap-2 transition-colors"
              >
                <Merge className="w-4 h-4" /> {lang === "vi" ? "Gộp lô" : "Merge"}
              </button>
              <button onClick={handleShare} className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/15 text-white hover:bg-white/25 flex items-center gap-2 transition-colors">
                <Share2 className="w-4 h-4" /> {lang === "vi" ? "Chia sẻ" : "Share"}
              </button>
              <button onClick={handleDownloadPdf} className="px-4 py-2 rounded-xl text-sm font-semibold bg-white text-gray-800 hover:opacity-90 flex items-center gap-2 transition-opacity">
                <Download className="w-4 h-4" /> PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mt-5">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-2xl p-1.5 max-w-fit flex-wrap" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          {tabsEn.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-700"}`}
              style={activeTab === tab ? { background: "linear-gradient(135deg, #2E7D32, #388E3C)" } : {}}
            >
              {lang === "vi" ? tabsVi[idx] : tab}
            </button>
          ))}
        </div>

        {/* ── Information ── */}
        {activeTab === "Information" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Product Info */}
            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#E8F5E9" }}>
                  <Award style={{ color: "#2E7D32", width: 16, height: 16 }} />
                </div>
                <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>{lang === "vi" ? "Thông Tin Sản Phẩm" : "Product Information"}</h3>
              </div>
              <div className="space-y-3.5">
                {[
                  { label: lang === "vi" ? "Tên sản phẩm" : "Product Name", value: batch.productName ?? batch.product },
                  { label: lang === "vi" ? "Danh mục" : "Category", value: batch.category },
                  { label: lang === "vi" ? "Mã lô hàng" : "Batch Code", value: batch.batchCode ?? batch.id, mono: true },
                  { label: lang === "vi" ? "Ngày thu hoạch" : "Harvest Date", value: batch.harvestDate },
                  { label: lang === "vi" ? "Số lượng" : "Quantity", value: `${batch.quantity.toLocaleString()} ${batch.unit ?? "units"}` },
                  { label: lang === "vi" ? "Tổng khối lượng" : "Total Weight", value: batch.weight },
                  { label: lang === "vi" ? "Trạng thái" : "Status", value: statusNorm || batch.status },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex justify-between items-start gap-3">
                    <span className="text-gray-400 text-sm flex-shrink-0">{label}</span>
                    <span
                      className={`text-sm font-medium text-gray-800 text-right ${mono ? "font-mono" : ""}`}
                      style={mono ? { color: "#2E7D32" } : {}}
                    >{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Farm & Producer */}
            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#E8F5E9" }}>
                  <Building2 style={{ color: "#2E7D32", width: 16, height: 16 }} />
                </div>
                <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>{lang === "vi" ? "Trang Trại & Nhà Sản Xuất" : "Farm & Producer"}</h3>
              </div>
              <div className="space-y-3.5">
                {[
                  { label: lang === "vi" ? "Tên trang trại" : "Farm Name", value: batch.farm },
                  { label: lang === "vi" ? "Nông dân" : "Farmer", value: batch.farmer },
                  { label: lang === "vi" ? "Địa điểm" : "Location", value: batch.location },
                  { label: lang === "vi" ? "Khu vực sản xuất" : "Production Area", value: batch.productionArea || "—" },
                  { label: lang === "vi" ? "Tọa độ GPS" : "GPS Coordinates", value: batch.gps || batch.gpsLocation || "—" },
                  { label: lang === "vi" ? "Chứng nhận" : "Certification", value: "VietGAP Grade A" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start gap-3">
                    <span className="text-gray-400 text-sm flex-shrink-0">{label}</span>
                    <span className="text-sm font-medium text-gray-800 text-right">{value}</span>
                  </div>
                ))}
                {batch.gps && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(batch.gps)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold mt-2 transition-colors"
                    style={{ color: "#2E7D32" }}
                  >
                    <MapPin className="w-3.5 h-3.5" /> {lang === "vi" ? "Mở trong Google Maps" : "Open in Google Maps"}
                  </a>
                )}
              </div>
            </div>

            {/* Right column: QR + Compliance */}
            <div className="space-y-5">
              {/* QR Code */}
              <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#E8F5E9" }}>
                    <QrCode style={{ color: "#2E7D32", width: 16, height: 16 }} />
                  </div>
                  <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>QR Code</h3>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-36 h-36 rounded-2xl overflow-hidden flex items-center justify-center" style={{ background: "#F8FAF8", border: "2px dashed #E0E0E0" }}>
                    <img
                      src={qrCode?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + "/trace/" + (batch.batchCode || batch.id || ""))}`}
                      alt="QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <code className="text-xs font-mono px-3 py-1 rounded-lg" style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                    {qrCode?.batchCode ?? batch.batchCode ?? batch.id}
                  </code>
                  {qrCode?.qrCodeUrl && (
                    <div className="text-xs text-gray-400 text-center break-all leading-relaxed">{qrCode.qrCodeUrl}</div>
                  )}
                  <div className="flex gap-2 w-full">
                    <button onClick={handleDownloadQr} className="flex-1 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
                      <Download className="w-3.5 h-3.5" /> {lang === "vi" ? "Tải xuống" : "Download"}
                    </button>
                    <button className="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-1.5" style={{ background: "#2E7D32" }}>
                      {lang === "vi" ? "In" : "Print"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Compliance card */}
              <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#E8F5E9" }}>
                    <Shield style={{ color: "#2E7D32", width: 20, height: 20 }} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900" style={{ fontSize: 14 }}>{lang === "vi" ? "Chính Phủ Xác Thực" : "Government Verified"}</div>
                    <div className="text-xs text-gray-400">{lang === "vi" ? "Bộ Nông Nghiệp" : "Ministry of Agriculture"}</div>
                  </div>
                  <CheckCircle className="ml-auto w-5 h-5 text-green-500" />
                </div>
                {[
                  { label: lang === "vi" ? "Chứng nhận VietGAP" : "VietGAP Certified", ok: true },
                  { label: lang === "vi" ? "Tiêu chuẩn an toàn thực phẩm" : "Food Safety Standard", ok: true },
                  { label: lang === "vi" ? "Bảo mật Blockchain" : "Blockchain Secured", ok: true },
                  { label: lang === "vi" ? "Không thu hồi" : "Recall-Free", ok: !batch.status.toLowerCase().includes("recall") },
                ].map(({ label, ok }) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className={`text-xs font-semibold ${ok ? "text-green-600" : "text-red-500"}`}>{ok ? (lang === "vi" ? "✓ Đạt" : "✓ Pass") : (lang === "vi" ? "✗ Không đạt" : "✗ Fail")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Timeline ── */}
        {activeTab === "Timeline" && (
          <div className="max-w-3xl">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowEventModal(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> {lang === "vi" ? "Thêm Sự Kiện" : "Add Event"}
              </button>
            </div>
            {timelineLoading ? (
              <div className="flex flex-col items-center py-16 gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center animate-pulse" style={{ background: "#E8F5E9" }}>
                  <Calendar className="w-5 h-5" style={{ color: "#2E7D32" }} />
                </div>
                <div className="text-sm text-gray-400">{lang === "vi" ? "Đang tải lịch sử..." : "Loading timeline..."}</div>
              </div>
            ) : timelineEvents.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#F0F9F0" }}>
                  <Calendar className="w-7 h-7" style={{ color: "#A5D6A7" }} />
                </div>
                <div className="font-semibold text-gray-600">{lang === "vi" ? "Chưa có sự kiện nào" : "No timeline events yet"}</div>
                <div className="text-sm text-gray-400">{lang === "vi" ? "Các sự kiện sẽ xuất hiện khi lô hàng di chuyển qua chuỗi cung ứng" : "Events will appear as this batch moves through the supply chain"}</div>
              </div>
            ) : (
              <div className="relative">
                {timelineEvents.map((event, index) => (
                  <div key={event.id} className="flex gap-5 mb-2 last:mb-0">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 z-10" style={{ background: "#E8F5E9", border: "3px solid #2E7D32" }}>
                        {event.icon}
                      </div>
                      {index < timelineEvents.length - 1 && (
                        <div className="w-0.5 flex-1 my-1" style={{ background: "linear-gradient(to bottom, #2E7D32, #A5D6A7)", minHeight: 40 }} />
                      )}
                    </div>
                    <div className="flex-1 pb-5">
                      <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-gray-900" style={{ fontSize: 15 }}>{event.stage}</h4>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{event.date}</span>
                              <span>{event.time}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "#E8F5E9" }}>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-xs font-semibold" style={{ color: "#2E7D32" }}>{lang === "vi" ? "Xác thực" : "Verified"}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4">{event.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                          {[
                            { label: lang === "vi" ? "Tổ chức" : "Organization", value: event.organization },
                            { label: lang === "vi" ? "Địa điểm" : "Location", value: event.location },
                            { label: lang === "vi" ? "Nhân viên" : "Employee", value: event.employee },
                            ...(event.temp ? [{ label: lang === "vi" ? "Nhiệt độ" : "Temperature", value: event.temp }] : []),
                            ...(event.humidity ? [{ label: lang === "vi" ? "Độ ẩm" : "Humidity", value: event.humidity }] : []),
                          ].map(({ label, value }) => (
                            <div key={label} className="p-2.5 rounded-xl" style={{ background: "#F8FAF8" }}>
                              <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                              <div className="text-sm font-medium text-gray-800">{value}</div>
                            </div>
                          ))}
                        </div>
                        <div className="rounded-xl p-3" style={{ background: "#F0F4F0" }}>
                          <div className="flex items-center gap-1 mb-1">
                            <Hash className="w-3 h-3 text-gray-400" />
                             <span className="text-xs font-semibold text-gray-500">{lang === "vi" ? "Mã xích Blockchain" : "Blockchain Hash"}</span>
                          </div>
                          <code className="text-xs text-gray-600 break-all leading-relaxed">{event.hash}</code>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Media ── */}
        {activeTab === "Media" && batch && (
          <BatchMediaTab batchId={batch.id} />
        )}

        {/* ── Lineage ── */}
        {activeTab === "Lineage" && batch && (
          <BatchLineageTab batchId={batch.id} />
        )}

        {/* ── Certificates ── */}
        {activeTab === "Certificates" && (
          <div>
            {batchInspections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {batchInspections.map((ins) => {
                  const isPass = ins.status === "Passed";
                  const isFail = ins.status === "Failed";
                  const color = isPass ? "#2E7D32" : isFail ? "#C62828" : "#F57F17";
                  const bg = isPass ? "#E8F5E9" : isFail ? "#FFEBEE" : "#FFF9C4";
                  const statusLabel = isPass ? "Đạt chuẩn (PASS)" : isFail ? "Không đạt (FAIL)" : "Chờ kiểm định";

                  return (
                    <div key={ins.id} className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                          <Award style={{ color, width: 20, height: 20 }} />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: bg, color }}>
                          {statusLabel}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1" style={{ fontSize: 14 }}>
                        Phiếu Kiểm Định QA/QC
                      </h4>
                      <p className="text-xs text-gray-500 mb-3 font-medium">
                        Loại: {InspectionTypeLabel[ins.inspectionType] || "Kiểm định nông sản"}
                      </p>
                      <div className="space-y-1.5 border-t border-gray-100 pt-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Chuyên viên QC</span>
                          <span className="font-semibold text-gray-800">{ins.inspector}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Ngày kiểm định</span>
                          <span className="font-medium text-gray-700">{ins.inspectionDate}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Chỉ số phòng Lab</span>
                          <span className="font-semibold text-emerald-700">{ins.labTests?.length ?? 0} chỉ số</span>
                        </div>
                      </div>
                      <button
                        onClick={handleDownloadPdf}
                        className="mt-4 w-full py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Tải Chứng Nhận (PDF)
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 text-center px-4">
                <Award className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-700 font-bold text-base">{lang === "vi" ? "Chưa có phiếu chứng nhận kiểm định" : "No Inspection Certificates Available"}</p>
                <p className="text-gray-500 text-xs mt-1 max-w-md">
                  {lang === "vi" ? "Lô hàng này chưa có phiếu chứng nhận chất lượng QA/QC. Nếu bạn là Nông trại (Farmer), hãy gửi yêu cầu kiểm định đến Đơn vị kiểm định bên thứ 3." : "This batch does not have a QA/QC certificate yet. If you are a Farmer, please submit an inspection request."}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                  <button
                    onClick={() => setShowRequestInspectionModal(true)}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> {lang === "vi" ? "Gửi Yêu Cầu Kiểm Định Mới" : "New Inspection Request"}
                  </button>
                  <button
                    onClick={() => navigate("/app/quality-inspection")}
                    className="px-4 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl transition-all"
                  >
                    {lang === "vi" ? "Đến Trang Quản Lý Kiểm Định (QC)" : "Go to Quality Inspection"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Inspection Requests ── */}
        {activeTab === "Inspection Requests" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div>
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-700" />
                  {lang === "vi" ? `Nhật Ký Yêu Cầu Kiểm Định Lô Hàng (${batchRequests.length})` : `Batch Inspection Requests (${batchRequests.length})`}
                </h3>
                <p className="text-gray-500 text-xs mt-0.5">
                  {lang === "vi" ? "Theo dõi tiến độ yêu cầu lấy mẫu & chứng nhận QA/QC gửi đến Đơn vị kiểm định bên thứ 3" : "Track inspection and certification request progress"}
                </p>
              </div>
              <button
                onClick={() => setShowRequestInspectionModal(true)}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" /> {lang === "vi" ? "Gửi Yêu Cầu Kiểm Định Mới" : "New Inspection Request"}
              </button>
            </div>

            {batchRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {batchRequests.map((req) => {
                  const isPending = req.status === 0 || req.status === "Pending";
                  const isApproved = req.status === 1 || req.status === "Approved";
                  return (
                    <div key={req.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-gray-100 text-gray-800">
                          {req.eventTypeCode || "INSPECT"}
                        </span>
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5" /> {lang === "vi" ? "Chờ Đơn Vị QC Tiếp Nhận" : "Awaiting QC Unit"}
                          </span>
                        ) : isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {lang === "vi" ? "Đã Tiếp Nhận & Duyệt" : "Approved"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5" /> {lang === "vi" ? "Từ Chối" : "Rejected"}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 text-xs text-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">{lang === "vi" ? "Người gửi yêu cầu:" : "Requester:"}</span>
                          <span className="font-semibold text-gray-900">{req.requestedByUserName || "Nông trại / Farmer"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">{lang === "vi" ? "Địa điểm hẹn kiểm tra:" : "Location:"}</span>
                          <span className="font-medium text-gray-800">{req.location || "Kho nông sản"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">{lang === "vi" ? "Thời gian tạo:" : "Created:"}</span>
                          <span className="font-mono text-gray-600">{new Date(req.createdAt).toLocaleDateString("vi-VN")}</span>
                        </div>
                        {req.description && (
                          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 italic">
                            "{req.description}"
                          </div>
                        )}
                      </div>

                      {/* Inspector Quick Link */}
                      <div className="pt-2 border-t border-gray-100 flex justify-end">
                        <button
                          onClick={() => navigate("/app/quality-inspection")}
                          className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                        >
                          {lang === "vi" ? "Mở trang Quản Lý Kiểm Định (QC) →" : "Open Quality Inspection →"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 text-center px-4">
                <Send className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-700 font-bold text-base">{lang === "vi" ? "Chưa gửi yêu cầu kiểm định nào cho lô này" : "No inspection requests sent for this batch"}</p>
                <p className="text-gray-500 text-xs mt-1 max-w-md">
                  {lang === "vi" ? "Bạn có thể gửi yêu cầu trực tiếp đến Đơn vị Kiểm định bên thứ 3 (QUATEST, SGS, Vinacontrol...) để họ đến kho lấy mẫu nghiệm thu chất lượng." : "You can send requests directly to third-party Inspection Units."}
                </p>
                <button
                  onClick={() => setShowRequestInspectionModal(true)}
                  className="mt-4 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> {lang === "vi" ? "Gửi Yêu Cầu Kiểm Định Ngay" : "Send Inspection Request Now"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Audit Log ── */}
        {activeTab === "Audit Log" && (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>{lang === "vi" ? "Nhật Ký Kiểm Toán Hệ Thống" : "System Audit Trail"}</h3>
                <p className="text-gray-400 text-xs mt-0.5">{lang === "vi" ? "Tất cả hành động liên quan đến lô hàng này" : "All system actions related to this batch"}</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  <Download className="w-3.5 h-3.5" /> {lang === "vi" ? "Xuất" : "Export"}
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { action: "Batch Created", user: "Tran Van Binh", ip: "203.162.4.191", time: "2024-06-15 06:25:33", type: "create" },
                { action: "Processing Event Added", user: "Nguyen Van Cong", ip: "203.162.4.192", time: "2024-06-16 08:00:12", type: "update" },
                { action: "Packaging Event Added", user: "Le Thi Lan", ip: "203.162.4.193", time: "2024-06-16 14:32:05", type: "update" },
              ].map(({ action, user, ip, time, type }) => {
                const style = auditTypeStyle[type] ?? auditTypeStyle.create;
                return (
                  <div key={time} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: style.dot }} />
                      <div>
                        <div className="text-xs font-semibold text-gray-800">{action}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                          <span>by {user}</span>
                          <span>•</span>
                          <span>{ip}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">{time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showEdit && batch && (
        <BatchEditModal
          batch={batch}
          onClose={() => setShowEdit(false)}
        />
      )}
      {showSplit && batch && (
        <BatchSplitModal
          batchId={batch.id}
          batchCode={batch.batchCode ?? batch.id}
          productName={batch.productName ?? batch.product}
          totalQuantity={batch.quantity}
          unit={batch.unit}
          unitId={batch.unitId}
          onClose={() => setShowSplit(false)}
        />
      )}
      {showMerge && batch && (
        <BatchMergeModal
          currentBatchId={batch.id}
          currentBatchCode={batch.batchCode ?? batch.id}
          productName={batch.productName ?? batch.product}
          productId={batch.productId}
          unitId={batch.unitId}
          onClose={() => setShowMerge(false)}
          onMerged={(mergedId) => navigate(`/app/batches/${mergedId}`)}
        />
      )}
      {showEventModal && batch && (
        <BatchEventModal
          batchId={batch.id}
          batchCode={batch.batchCode ?? batch.id}
          onClose={() => setShowEventModal(false)}
        />
      )}
      {showRequestInspectionModal && batch && (
        <BatchInspectionRequestModal
          isOpen={showRequestInspectionModal}
          onClose={() => setShowRequestInspectionModal(false)}
          batchId={batch.id}
          batchCode={batch.batchCode ?? batch.id}
          productName={batch.productName ?? batch.product}
          onSuccess={() => refetchRequests()}
        />
      )}
    </div>
  );
}
