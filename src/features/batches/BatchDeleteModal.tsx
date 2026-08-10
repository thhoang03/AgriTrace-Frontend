import { useState } from "react";
import { Power, AlertTriangle, X } from "lucide-react";
import { useUpdateBatch } from "./batches.queries";
import { useLanguage } from "../../contexts/LanguageContext";

interface BatchDeleteModalProps {
  batchId: string;
  batchCode: string;
  productName: string;
  isDeleted?: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export function BatchDeleteModal({
  batchId,
  batchCode,
  productName,
  isDeleted,
  onClose,
  onDeleted,
}: BatchDeleteModalProps) {
  const updateBatch = useUpdateBatch(batchId);
  const [error, setError] = useState("");
  const { lang } = useLanguage();

  const handleToggle = async () => {
    setError("");
    try {
      await updateBatch.mutateAsync({ isDeleted: !isDeleted });
      onDeleted?.();
      onClose();
    } catch {
      setError(
        lang === "vi"
          ? `Không thể ${isDeleted ? "kích hoạt" : "vô hiệu hóa"} lô hàng. Vui lòng thử lại.`
          : `Failed to ${isDeleted ? "activate" : "deactivate"} batch. Please try again.`
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl w-full max-w-md mx-4 overflow-hidden"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDeleted ? "bg-green-100" : "bg-orange-100"}`}
            >
              <Power className={`w-4 h-4 ${isDeleted ? "text-green-600" : "text-orange-600"}`} />
            </div>
            <span className="font-semibold text-foreground">
              {isDeleted
                ? (lang === "vi" ? "Kích Hoạt Lô Hàng" : "Activate Batch")
                : (lang === "vi" ? "Vô Hiệu Hóa Lô Hàng" : "Deactivate Batch")}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div
            className="flex items-start gap-3 rounded-xl p-4 mb-4"
            style={{ background: isDeleted ? "#F0FDF4" : "#FFF7ED", border: `1px solid ${isDeleted ? "#BBF7D0" : "#FED7AA"}` }}
          >
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: isDeleted ? "#16A34A" : "#EA580C" }} />
            <div>
              <div className="font-semibold text-sm" style={{ color: isDeleted ? "#15803D" : "#9A3412" }}>
                {isDeleted
                  ? (lang === "vi" ? "Lô hàng sẽ trở lại hoạt động" : "Batch will become active")
                  : (lang === "vi" ? "Lô hàng sẽ chuyển sang không hoạt động" : "Batch will become inactive")}
              </div>
              <div className="text-sm mt-1" style={{ color: isDeleted ? "#166534" : "#C2410C" }}>
                {isDeleted
                  ? (lang === "vi"
                      ? "Lô hàng này sẽ hiển thị với tất cả người dùng và các thao tác bình thường có thể tiếp tục."
                      : "This batch will be visible to all users and normal operations can resume.")
                  : (lang === "vi"
                      ? "Lô hàng này sẽ bị ẩn khỏi các trang công khai và các thao tác mới sẽ bị hạn chế."
                      : "This batch will be hidden from public views and new actions will be restricted.")}
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-2">
            {lang === "vi"
              ? `Bạn sắp ${isDeleted ? "kích hoạt" : "vô hiệu hóa"}:`
              : `You are about to ${isDeleted ? "activate" : "deactivate"}:`}
          </p>
          <div
            className="rounded-xl p-3 mb-4 bg-muted"
            style={{ border: "1px solid #E5E7EB" }}
          >
            <div className="text-sm font-semibold text-foreground">{productName}</div>
            <code
              className="text-xs font-mono mt-0.5 inline-block px-2 py-0.5 rounded-lg bg-primary/10"
              style={{ color: "#2E7D32" }}
            >
              {batchCode}
            </code>
          </div>

          {error && (
            <div
              className="rounded-xl px-3 py-2 text-sm mb-4 bg-destructive/10 text-destructive border border-destructive/30"
            >
              {error}
            </div>
          )}
         {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border bg-muted/50">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-card transition-colors"
          >
            {lang === "vi" ? "Hủy bỏ" : "Cancel"}
          </button>
          <button
            onClick={handleToggle}
            disabled={updateBatch.isPending}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 ${
              isDeleted ? "bg-green-600" : "bg-orange-500"
            }`}
          >
            {updateBatch.isPending
              ? (lang === "vi" ? "Đang xử lý..." : "Processing...")
              : isDeleted
                ? (lang === "vi" ? "Kích Hoạt" : "Activate")
                : (lang === "vi" ? "Vô Hiệu Hóa" : "Deactivate")}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
