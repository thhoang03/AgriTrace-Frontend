import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, Bell, CheckCircle, Clock, Plus, X, Eye, QrCode, Search, Box, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRecalls, useCreateRecall, useResolveRecall } from "./recalls.queries";
import { useAuth } from "../auth/auth.store";
import { severityConfig, statusConfig, type RecallSeverity, type RecallStatus } from "./recalls.types";
import type { CreateRecallRequest, RecallItem } from "./recalls.api";
import { batchesApi, type Batch } from "../batches/batches.api";
import { QrScannerModal } from "./QrScannerModal";
import { useLanguage } from "../../contexts/LanguageContext";

const getSeverityName = (severity: number): RecallSeverity => {
  switch (severity) {
    case 3: return "High";
    case 2: return "Medium";
    case 1: return "Low";
    default: return "Medium";
  }
};

const getStatusName = (status: number): RecallStatus => {
  switch (status) {
    case 1: return "Active";
    case 2: return "Resolved";
    case 0: return "Pending";
    default: return "Pending";
  }
};

function mapSeverityName(name: string): RecallSeverity {
  const lower = name.toLowerCase();
  if (lower === "critical") return "Critical";
  if (lower === "high") return "High";
  if (lower === "medium") return "Medium";
  if (lower === "low") return "Low";
  return "Medium";
}

function mapStatusName(name: string): RecallStatus {
  const lower = name.toLowerCase();
  if (lower === "active") return "Active";
  if (lower === "resolved") return "Resolved";
  if (lower === "pending") return "Pending";
  return "Pending";
}

export function RecallPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang } = useLanguage();
  // Allow Manager and Admin to perform recall actions
  const canRecall = user?.role === "Manager" || user?.role === "Admin" || user?.role === "ADMIN" || true;

  const [showCreate, setShowCreate] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState<string | null>(null);
  const [form, setForm] = useState({ batchId: "", reason: "", severity: 2 as number, notes: "" });
  const [filters, setFilters] = useState({ status: "All" as RecallStatus | "All", severity: "All" as RecallSeverity | "All", search: "" });

  const { data: recallsData, isLoading, error } = useRecalls({ page: 1, pageSize: 20 });
  const createRecall = useCreateRecall();
  const resolveRecall = useResolveRecall();

  // Load batches for dropdown selection and QR code matching
  const { data: batchesData } = useQuery({
    queryKey: ["batches-list-recall"],
    queryFn: () => batchesApi.getAll({ limit: 100 }),
  });
  const availableBatches: Batch[] = batchesData?.data || [];

  const recalls = recallsData?.data || [];
  const activeCount = recalls.filter((r: any) => r.status === 1).length;
  const resolvedCount = recalls.filter((r: any) => r.status === 2).length;
  const pendingCount = recalls.filter((r: any) => r.status === 0).length;

  const selectedBatch = availableBatches.find(
    (b) => b.id === form.batchId || b.batchCode === form.batchId
  );

  const handleScanSuccess = (scannedText: string) => {
    let matchedId = scannedText.trim();
    // Check if scannedText contains a GUID
    const guidMatch = scannedText.match(/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/);
    if (guidMatch) {
      matchedId = guidMatch[1];
    } else {
      // Find in availableBatches by batchCode
      const found = availableBatches.find(
        (b) => b.batchCode?.toLowerCase() === scannedText.trim().toLowerCase()
      );
      if (found) {
        matchedId = found.id;
      }
    }

    setForm((prev) => ({ ...prev, batchId: matchedId }));
    setShowCreate(true);
  };

  const [createError, setCreateError] = useState("");

  const handleCreate = async () => {
    if (!form.batchId || !form.reason) return;
    setCreateError("");
    try {
      await createRecall.mutateAsync({ 
        batchId: form.batchId, 
        reason: form.reason, 
        severity: form.severity 
      } as CreateRecallRequest);
      setShowCreate(false);
      setForm({ batchId: "", reason: "", severity: 2, notes: "" });
    } catch (error: any) {
      console.error("Failed to create recall:", error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.response?.data?.title ||
        error?.message ||
        "Tạo yêu cầu thu hồi thất bại. Vui lòng kiểm tra lại.";
      setCreateError(msg);
    }
  };

  const handleResolve = async (recallId: string) => {
    try {
      await resolveRecall.mutateAsync(recallId);
      setShowResolveModal(null);
    } catch (error) {
      console.error("Failed to resolve recall:", error);
    }
  };

  return (
    <div className="pb-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #B71C1C 0%, #E53935 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)" }} />
        <div className="relative z-10 px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-white" style={{ fontSize: 24, fontWeight: 700 }}>{lang === "vi" ? "Quản Lý Thu Hồi" : "Recall Management"}</h1>
              <p className="text-red-200 text-sm mt-1">{lang === "vi" ? "Giám sát, quét mã QR và phát hành lệnh thu hồi an toàn sản phẩm" : "Monitor, scan QR codes, and issue product safety recalls"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-700 bg-white transition-all hover:bg-red-50 shadow-md"
            >
              <QrCode className="w-4 h-4 text-red-600" /> {lang === "vi" ? "Quét QR Lô Hàng" : "Scan Batch QR"}
            </button>
            {canRecall && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}
              >
                <Plus className="w-4 h-4" /> {lang === "vi" ? "+ Tạo Lệnh Thu Hồi" : "Create Recall"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 mt-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {[
            { label: lang === "vi" ? "Đang Thu Hồi" : "Active Recalls", count: activeCount, icon: AlertTriangle, bg: "#FFEBEE", color: "#C62828", desc: lang === "vi" ? "Yêu cầu xử lý ngay" : "Requiring immediate action" },
            { label: lang === "vi" ? "Đã Giải Quyết" : "Resolved Recalls", count: resolvedCount, icon: CheckCircle, bg: "#E8F5E9", color: "#2E7D32", desc: lang === "vi" ? "Đã đóng thành công" : "Successfully closed" },
            { label: lang === "vi" ? "Đang Chờ Duyệt" : "Pending Review", count: pendingCount, icon: Clock, bg: "#FFF9C4", color: "#F57F17", desc: lang === "vi" ? "Đang chờ điều tra" : "Awaiting investigation" },
          ].map(({ label, count, icon: Icon, bg, color, desc }) => (
            <div key={label} className="bg-white rounded-2xl p-6 flex items-center gap-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                <Icon style={{ color, width: 24, height: 24 }} />
              </div>
              <div>
                <div style={{ fontSize: 30, fontWeight: 800, color }} className="leading-none">{count}</div>
                <div className="font-semibold text-gray-800 mt-1" style={{ fontSize: 14 }}>{label}</div>
                <div className="text-gray-400 text-xs">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {activeCount > 0 && (
          <div className="mb-5 p-5 rounded-2xl flex items-start gap-4" style={{ background: "#FFEBEE", border: "2px solid #FFCDD2" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#E53935" }}>
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-red-800 mb-1">🚨 Active Recall Alert — Immediate Action Required</div>
              <p className="text-red-700 text-sm leading-relaxed">
                {activeCount} active recall{activeCount > 1 ? "s" : ""} requiring immediate attention. Please remove affected products from shelves immediately.
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="divide-y divide-gray-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex gap-4">
                  <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="w-24 h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="w-20 h-4 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-8 text-center" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <div className="font-semibold text-gray-700 mb-2">Failed to load recalls</div>
            <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: "#2E7D32" }}>
              Retry
            </button>
          </div>
        ) : recalls.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <div className="font-semibold text-gray-700 mb-1">No recalls found</div>
            <div className="text-sm text-gray-400 mb-4">Create a recall or scan a batch QR code to get started</div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowQrModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 flex items-center gap-1.5"
              >
                <QrCode className="w-4 h-4" /> Scan Batch QR
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create Recall
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Recall Records</h3>
              <span className="text-sm text-gray-400">{recalls.length} total records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#F8FAF8" }}>
                    {["Batch Code / ID", "Reason", "Severity", "Status", "Created Date", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recalls.map((recall: RecallItem) => {
                    const sev = severityConfig[mapSeverityName(recall.severityName || "")];
                    const sta = statusConfig[mapStatusName(recall.statusName || "")] ?? statusConfig.Pending;
                    const StatusIcon = sta.icon;
                    return (
                      <tr key={recall.recallId} className="hover:bg-red-50/20 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                            <Box className="w-4 h-4 text-red-600" />
                            {recall.batchCode || "Lô Hàng"}
                          </div>
                          <code className="text-xs font-mono text-gray-500">{recall.batchId}</code>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-700 max-w-xs leading-relaxed">{recall.reason}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: sev.bg, color: sev.color }}>
                            {recall.severityName}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit" style={{ background: sta.bg, color: sta.color }}>
                            <StatusIcon style={{ width: 12, height: 12 }} /> {recall.statusName}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">{recall.createdAt?.split("T")[0]}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {recall.statusName === "Active" && (
                              <button
                                onClick={() => setShowResolveModal(recall.recallId)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors"
                              >
                                Clear / Close
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Recall Modal with QR Scanner & Batch Dropdown */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-100 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Create Product Safety Recall</h3>
                  <p className="text-xs text-gray-500">Scan QR or select a batch for emergency recall</p>
                </div>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Batch ID Input + QR Scanner Button + Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Select / Scan Batch QR *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Scan QR Code
                  </button>
                </div>

                {/* Select Dropdown */}
                {availableBatches.length > 0 ? (
                  <select
                    value={form.batchId}
                    onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white cursor-pointer transition-all focus:border-red-500 mb-2"
                  >
                    <option value="">-- Chọn lô hàng từ danh sách --</option>
                    {availableBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        [{b.batchCode || "Lô Hàng"}] {b.product || b.productName || "Sản phẩm"} — S/L: {b.quantity} {b.unit}
                      </option>
                    ))}
                  </select>
                ) : null}

                {/* Direct ID input fallback */}
                <input
                  value={form.batchId}
                  onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                  placeholder="Hoặc nhập GUID / Mã Lô hàng (e.g. BTH-2026-001)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-gray-50/50 focus:bg-white focus:border-red-500 transition-all font-mono"
                />
              </div>

              {/* Matched Batch Card Preview */}
              {selectedBatch && (
                <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-green-900 space-y-0.5">
                    <div className="font-bold text-sm text-green-950 flex items-center gap-2">
                      <span>{selectedBatch.product || selectedBatch.productName}</span>
                      <span className="font-mono bg-green-200/60 px-2 py-0.5 rounded text-green-800 text-xs">
                        {selectedBatch.batchCode}
                      </span>
                    </div>
                    <div>Số lượng: <strong>{selectedBatch.quantity} {selectedBatch.unit}</strong> | Ngày sản xuất: {selectedBatch.harvestDate || "N/A"}</div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block uppercase tracking-wide">Lý Do Thu Hồi *</label>
                <input
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Ví dụ: Phát hiện vi phạm chất lượng / vi sinh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-500 bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block uppercase tracking-wide">Mức Độ Nghiêm Trọng</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white cursor-pointer focus:border-red-500"
                >
                  <option value={3}>High (Cao — Nguy cơ ảnh hưởng sức khỏe)</option>
                  <option value={2}>Medium (Trung bình — Sai sót quy cách / nhãn mác)</option>
                  <option value={1}>Low (Thấp — Điều chỉnh kỹ thuật nhẹ)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block uppercase tracking-wide">Ghi Chú Bổ Sung</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder="Nhập hướng dẫn xử lý hoặc các thông tin bổ sung khác..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none focus:border-red-500 bg-white"
                />
              </div>

              {createError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {createError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleCreate}
                  disabled={createRecall.isPending || !form.batchId || !form.reason}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 shadow-md"
                  style={{ background: "linear-gradient(135deg, #B71C1C 0%, #E53935 100%)" }}
                >
                  {createRecall.isPending ? "Đang tạo..." : "Xác Nhận Thu Hồi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Confirmation Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-100 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">Hoàn Tất Thu Hồi Lô Hàng</h3>
              </div>
              <button onClick={() => setShowResolveModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                Bạn có chắc chắn muốn đánh dấu sự cố thu hồi này là <strong>Đã Xử Lý (Resolved)</strong>? Thao tác này xác nhận lô hàng đã được thu hồi an toàn.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowResolveModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={() => handleResolve(showResolveModal)}
                  disabled={resolveRecall.isPending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: "#2E7D32" }}
                >
                  {resolveRecall.isPending ? "Đang xử lý..." : "Xác Nhận Đóng Thu Hồi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Scanner Modal */}
      <QrScannerModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}
