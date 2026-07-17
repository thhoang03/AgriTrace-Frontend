import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, QrCode, CheckCircle, MapPin, Calendar, Hash,
  User, Building2, Award, Download, Share2, Shield,
  Edit2, Scissors, Merge, AlertCircle, Package, Plus,
} from "lucide-react";
import { useBatch, useBatchTimeline, useBatchQrCode } from "./batches.queries";
import { BatchEditModal } from "./BatchEditModal";
import { BatchSplitModal } from "./BatchSplitModal";
import { BatchMergeModal } from "./BatchMergeModal";
import { BatchEventModal } from "./BatchEventModal";
import { BatchMediaTab } from "./BatchMediaTab";
import { BatchLineageTab } from "./BatchLineageTab";

const PRODUCT_IMG = "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=800&q=80";

const statusConfig: Record<string, { bg: string; color: string }> = {
  Harvested:    { bg: "#E8F5E9", color: "#2E7D32" },
  Processing:   { bg: "#FFF3E0", color: "#F57C00" },
  Packaged:     { bg: "#E3F2FD", color: "#1565C0" },
  "In Transit": { bg: "#F3E5F5", color: "#7B1FA2" },
  Distributed:  { bg: "#E0F2F1", color: "#00695C" },
  "At Retail":  { bg: "#E8F5E9", color: "#1B5E20" },
  Recalled:     { bg: "#FFEBEE", color: "#C62828" },
};

const tabs = ["Information", "Timeline", "Media", "Lineage", "Certificates", "Audit Log"] as const;
type Tab = typeof tabs[number];

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
  const [activeTab, setActiveTab] = useState<Tab>("Information");
  const [showEdit, setShowEdit] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [showMerge, setShowMerge] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  const { data: batchData, isLoading, isError } = useBatch(id ?? "");
  const { data: timelineData, isLoading: timelineLoading } = useBatchTimeline(id ?? "");
  const { data: qrData } = useBatchQrCode(id ?? "");

  const batch = batchData?.data;
  const timelineEvents = timelineData?.data ?? [];
  const qrCode = qrData?.data;

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

  const handleDownloadQr = () => {
    if (!qrCode?.qrCodeUrl) return;
    const a = document.createElement("a");
    a.href = qrCode.qrCodeUrl;
    a.download = `qrcode-${batch?.batchCode || batch?.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => setShowSplit(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-500/80 text-white hover:bg-blue-600/90 flex items-center gap-2 transition-colors"
              >
                <Scissors className="w-4 h-4" /> Split
              </button>
              <button
                onClick={() => setShowMerge(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-purple-500/80 text-white hover:bg-purple-600/90 flex items-center gap-2 transition-colors"
              >
                <Merge className="w-4 h-4" /> Merge
              </button>
              <button className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/15 text-white hover:bg-white/25 flex items-center gap-2 transition-colors">
                <Share2 className="w-4 h-4" /> Share
              </button>
              <button className="px-4 py-2 rounded-xl text-sm font-semibold bg-white text-gray-800 hover:opacity-90 flex items-center gap-2 transition-opacity">
                <Download className="w-4 h-4" /> PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mt-5">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-2xl p-1.5 max-w-fit" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-700"}`}
              style={activeTab === tab ? { background: "linear-gradient(135deg, #2E7D32, #388E3C)" } : {}}
            >
              {tab}
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
                <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Product Information</h3>
              </div>
              <div className="space-y-3.5">
                {[
                  { label: "Product Name", value: batch.productName ?? batch.product },
                  { label: "Category", value: batch.category },
                  { label: "Batch Code", value: batch.batchCode ?? batch.id, mono: true },
                  { label: "Harvest Date", value: batch.harvestDate },
                  { label: "Quantity", value: `${batch.quantity.toLocaleString()} ${batch.unit ?? "units"}` },
                  { label: "Total Weight", value: batch.weight },
                  { label: "Status", value: statusNorm || batch.status },
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
                <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Farm &amp; Producer</h3>
              </div>
              <div className="space-y-3.5">
                {[
                  { label: "Farm Name", value: batch.farm },
                  { label: "Farmer", value: batch.farmer },
                  { label: "Location", value: batch.location },
                  { label: "Production Area", value: batch.productionArea || "—" },
                  { label: "GPS Coordinates", value: batch.gps || batch.gpsLocation || "—" },
                  { label: "Certification", value: "VietGAP Grade A" },
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
                    <MapPin className="w-3.5 h-3.5" /> Open in Google Maps
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
                    {qrCode?.qrCodeUrl ? (
                      <img src={qrCode.qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
                    ) : (
                      <QrCode className="w-16 h-16 text-gray-300" />
                    )}
                  </div>
                  <code className="text-xs font-mono px-3 py-1 rounded-lg" style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                    {qrCode?.batchCode ?? batch.batchCode ?? batch.id}
                  </code>
                  {qrCode?.qrCodeUrl && (
                    <div className="text-xs text-gray-400 text-center break-all leading-relaxed">{qrCode.qrCodeUrl}</div>
                  )}
                  <div className="flex gap-2 w-full">
                    <button onClick={handleDownloadQr} className="flex-1 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <button className="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-1.5" style={{ background: "#2E7D32" }}>
                      Print
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
                    <div className="font-semibold text-gray-900" style={{ fontSize: 14 }}>Government Verified</div>
                    <div className="text-xs text-gray-400">Ministry of Agriculture</div>
                  </div>
                  <CheckCircle className="ml-auto w-5 h-5 text-green-500" />
                </div>
                {[
                  { label: "VietGAP Certified", ok: true },
                  { label: "Food Safety Standard", ok: true },
                  { label: "Blockchain Secured", ok: true },
                  { label: "Recall-Free", ok: !batch.status.toLowerCase().includes("recall") },
                ].map(({ label, ok }) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className={`text-xs font-semibold ${ok ? "text-green-600" : "text-red-500"}`}>{ok ? "✓ Pass" : "✗ Fail"}</span>
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
                <Plus className="w-4 h-4" /> Add Event
              </button>
            </div>
            {timelineLoading ? (
              <div className="flex flex-col items-center py-16 gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center animate-pulse" style={{ background: "#E8F5E9" }}>
                  <Calendar className="w-5 h-5" style={{ color: "#2E7D32" }} />
                </div>
                <div className="text-sm text-gray-400">Loading timeline...</div>
              </div>
            ) : timelineEvents.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#F0F9F0" }}>
                  <Calendar className="w-7 h-7" style={{ color: "#A5D6A7" }} />
                </div>
                <div className="font-semibold text-gray-600">No timeline events yet</div>
                <div className="text-sm text-gray-400">Events will appear as this batch moves through the supply chain</div>
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
                            <span className="text-xs font-semibold" style={{ color: "#2E7D32" }}>Verified</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4">{event.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                          {[
                            { label: "Organization", value: event.organization },
                            { label: "Location", value: event.location },
                            { label: "Employee", value: event.employee },
                            ...(event.temp ? [{ label: "Temperature", value: event.temp }] : []),
                            ...(event.humidity ? [{ label: "Humidity", value: event.humidity }] : []),
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
                            <span className="text-xs font-semibold text-gray-500">Blockchain Hash</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { name: "VietGAP Certificate", issuer: "Vietnam Good Agricultural Practices", date: "Jan 15, 2024", expiry: "Jan 14, 2025", status: "Valid", color: "#2E7D32" },
              { name: "Food Safety Certificate", issuer: "Vietnam Food Authority (VFA)", date: "Feb 01, 2024", expiry: "Jan 31, 2025", status: "Valid", color: "#1976D2" },
              { name: "Export Phytosanitary", issuer: "Plant Protection Department", date: "Jun 14, 2024", expiry: "Sep 14, 2024", status: "Valid", color: "#F57C00" },
              { name: "Organic Certification", issuer: "Vietnam Organic Association", date: "Mar 10, 2024", expiry: "Mar 09, 2025", status: "Valid", color: "#7B1FA2" },
              { name: "Cold Chain Compliance", issuer: "Logistics Standards Agency", date: "Jun 17, 2024", expiry: "Jun 16, 2025", status: "Valid", color: "#00695C" },
            ].map(({ name, issuer, date, expiry, status, color }) => (
              <div key={name} className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                    <Award style={{ color, width: 20, height: 20 }} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "#E8F5E9", color: "#2E7D32" }}>{status}</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-1" style={{ fontSize: 14 }}>{name}</h4>
                <p className="text-xs text-gray-400 mb-4">{issuer}</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Issued</span>
                    <span className="font-medium text-gray-700">{date}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Expires</span>
                    <span className="font-medium text-gray-700">{expiry}</span>
                  </div>
                </div>
                <button className="mt-4 w-full py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Download Certificate
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Audit Log ── */}
        {activeTab === "Audit Log" && (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>System Audit Trail</h3>
                <p className="text-gray-400 text-xs mt-0.5">All system actions related to this batch</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { action: "Batch Created", user: "Trần Văn Bình", ip: "203.162.4.191", time: "2024-06-15 06:25:33", type: "create" },
                { action: "Processing Event Added", user: "Nguyễn Văn Công", ip: "203.162.4.192", time: "2024-06-16 08:00:12", type: "update" },
                { action: "Packaging Event Added", user: "Lê Thị Lan", ip: "203.162.4.193", time: "2024-06-16 14:32:05", type: "update" },
                { action: "Quality Inspection Passed", user: "Lý Thị Ngọc", ip: "203.162.4.194", time: "2024-06-16 16:45:22", type: "inspect" },
                { action: "QR Code Generated", user: "System", ip: "Internal", time: "2024-06-16 16:50:00", type: "generate" },
                { action: "Transport Event Added", user: "Phạm Văn Đức", ip: "203.162.4.195", time: "2024-06-17 04:02:18", type: "update" },
                { action: "Distribution Confirmed", user: "Trần Thị Bảo", ip: "203.162.4.196", time: "2024-06-17 11:15:44", type: "update" },
                { action: "Retail Arrival Logged", user: "Nguyễn Thị Kim", ip: "203.162.4.197", time: "2024-06-18 07:05:33", type: "update" },
              ].map(({ action, user, ip, time, type }) => {
                const style = auditTypeStyle[type] ?? auditTypeStyle["update"];
                return (
                  <div key={time} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: style.bg, color: style.color }}
                    >
                      {type}
                    </span>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-800">{action}</span>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{user}</span>
                        <span>IP: {ip}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
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
          onClose={() => setShowSplit(false)}
        />
      )}
      {showMerge && batch && (
        <BatchMergeModal
          currentBatchId={batch.id}
          currentBatchCode={batch.batchCode ?? batch.id}
          productName={batch.productName ?? batch.product}
          productId={batch.categoryId}
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
    </div>
  );
}
