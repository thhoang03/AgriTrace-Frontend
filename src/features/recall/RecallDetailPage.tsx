import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AlertTriangle, CheckCircle, Clock, ArrowLeft, X, Calendar, User, Building2, AlertCircle } from "lucide-react";
import { useRecall, useResolveRecall } from "./recalls.queries";
import { severityConfig, statusConfig, type RecallSeverity, type RecallStatus } from "./recalls.types";
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

export function RecallDetailPage() {
  const { lang } = useLanguage();
  const { recallId } = useParams<{ recallId: string }>();
  const navigate = useNavigate();
  const [showResolveModal, setShowResolveModal] = useState(false);

  const { data: recall, isLoading, error } = useRecall(recallId || "");
  const resolveRecall = useResolveRecall();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">{lang === "vi" ? "Đang tải chi tiết thu hồi..." : "Loading recall details..."}</div>
      </div>
    );
  }

  if (error || !recall) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">{lang === "vi" ? "Không thể tải chi tiết thu hồi" : "Failed to load recall details"}</div>
      </div>
    );
  }

  const severityName = getSeverityName(recall.severity ?? 1);
  const statusName = getStatusName(recall.status ?? 0);
  const sev = severityConfig[severityName];
  const sta = statusConfig[statusName];
  const StatusIcon = sta.icon;

  const handleResolve = async () => {
    if (!recallId) return;
    try {
      await resolveRecall.mutateAsync(recallId);
      setShowResolveModal(false);
    } catch (error) {
      console.error("Failed to resolve recall:", error);
    }
  };

  return (
    <div className="pb-8">
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #B71C1C 0%, #E53935 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)" }} />
        <div className="relative z-10 px-8 py-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button onClick={() => navigate("/app/recalls")} className="p-2 rounded-xl text-white hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-white" style={{ fontSize: 24, fontWeight: 700 }}>{lang === "vi" ? "Chi Tiết Thu Hồi" : "Recall Details"}</h1>
                <p className="text-red-200 text-sm mt-1">{recall.recallId}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(recall.status ?? 0) === 1 && (
              <button onClick={() => setShowResolveModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-green-700 transition-colors hover:opacity-90" style={{ background: "rgba(255,255,255,0.95)" }}>
                <CheckCircle className="w-4 h-4" /> {lang === "vi" ? "Hoàn Tất Thu Hồi" : "Resolve Recall"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-card rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: sev.bg }}>
                <AlertCircle style={{ color: sev.color, width: 20, height: 20 }} />
              </div>
              <div className="font-semibold text-foreground">{lang === "vi" ? "Mức Độ" : "Severity"}</div>
            </div>
            <div className="text-2xl font-bold" style={{ color: sev.color }}>{severityName}</div>
          </div>

          <div className="bg-card rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: sta.bg }}>
                <StatusIcon style={{ color: sta.color, width: 20, height: 20 }} />
              </div>
              <div className="font-semibold text-foreground">{lang === "vi" ? "Trạng Thái" : "Status"}</div>
            </div>
            <div className="text-2xl font-bold" style={{ color: sta.color }}>{statusName}</div>
          </div>

          <div className="bg-card rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#E3F2FD" }}>
                <Building2 style={{ color: "#1976D2", width: 20, height: 20 }} />
              </div>
              <div className="font-semibold text-foreground">{lang === "vi" ? "Doanh Nghiệp Bị Ảnh Hưởng" : "Affected Companies"}</div>
            </div>
            <div className="text-2xl font-bold text-foreground">{(recall as any).affectedCompanies || 0}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-foreground mb-4" style={{ fontSize: 16 }}>{lang === "vi" ? "Thông Tin Thu Hồi" : "Recall Information"}</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground mb-1">{lang === "vi" ? "Lý Do" : "Reason"}</div>
                  <div className="text-foreground">{recall.reason || "N/A"}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground mb-1">{lang === "vi" ? "Mã Lô Hàng" : "Batch Code"}</div>
                  <div className="text-foreground font-mono">{recall.batchCode || recall.batchId || "N/A"}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground mb-1">{lang === "vi" ? "Ngày Tạo" : "Created Date"}</div>
                  <div className="text-foreground">{recall.createdAt ? new Date(recall.createdAt).toLocaleString() : "N/A"}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground mb-1">{lang === "vi" ? "Người Tạo" : "Created By"}</div>
                  <div className="text-foreground">{recall.createdByName || "N/A"}</div>
                  <div className="text-xs text-muted-foreground">{recall.createdBy || ""}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-foreground mb-4" style={{ fontSize: 16 }}>{lang === "vi" ? "Thông Tin Sản Phẩm" : "Product Information"}</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground mb-1">{lang === "vi" ? "Tên Sản Phẩm" : "Product Name"}</div>
                  <div className="text-foreground">{(recall as any).product || "N/A"}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground mb-1">{lang === "vi" ? "ID Lô Hàng" : "Batch ID"}</div>
                  <div className="text-foreground font-mono">{recall.batchId || "N/A"}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground mb-1">{lang === "vi" ? "Doanh Nghiệp Bị Ảnh Hưởng" : "Affected Companies"}</div>
                  <div className="text-foreground">{(recall as any).affectedCompanies || 0} {lang === "vi" ? "doanh nghiệp" : "companies"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10">
                  <CheckCircle style={{ color: "#2E7D32", width: 18, height: 18 }} />
                </div>
                <h3 className="font-bold text-foreground">{lang === "vi" ? "Hoàn Tất Thu Hồi" : "Resolve Recall"}</h3>
              </div>
              <button onClick={() => setShowResolveModal(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-foreground">{lang === "vi" ? "Bạn có chắc chắn muốn hoàn tất thu hồi này không? Hành động này sẽ đánh dấu đợt thu hồi là đã hoàn tất và không thể hoàn tác." : "Are you sure you want to resolve this recall? This action will mark the recall as resolved and cannot be undone."}</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowResolveModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted">{lang === "vi" ? "Hủy bỏ" : "Cancel"}</button>
                <button onClick={handleResolve} disabled={resolveRecall.isPending} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50" style={{ background: "#2E7D32" }}>
                  {resolveRecall.isPending ? (lang === "vi" ? "Đang xử lý..." : "Resolving...") : (lang === "vi" ? "Hoàn Tất Thu Hồi" : "Resolve Recall")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
