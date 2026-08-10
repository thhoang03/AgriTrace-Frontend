import { useState, useEffect } from "react";
import { Edit2, X, Save } from "lucide-react";
import { useUpdateBatch } from "./batches.queries";
import type { Batch, BatchStatus, UpdateBatchRequest } from "./batches.types";
import { useLanguage } from "../../contexts/LanguageContext";

const PIPELINE_STATUSES: BatchStatus[] = [
  "Harvested",
  "Processing",
  "Packaged",
  "In Transit",
  "Distributed",
  "At Retail",
  "Recalled",
];

const statusColors: Record<string, { bg: string; color: string }> = {
  Harvested:     { bg: "#E8F5E9", color: "#2E7D32" },
  Processing:    { bg: "#FFF3E0", color: "#F57C00" },
  Packaged:      { bg: "#E3F2FD", color: "#1565C0" },
  "In Transit":  { bg: "#F3E5F5", color: "#7B1FA2" },
  Distributed:   { bg: "#E0F2F1", color: "#00695C" },
  "At Retail":   { bg: "#E8F5E9", color: "#1B5E20" },
  Recalled:      { bg: "#FFEBEE", color: "#C62828" },
};

interface BatchEditModalProps {
  batch: Batch;
  onClose: () => void;
  onSaved?: () => void;
}

export function BatchEditModal({ batch, onClose, onSaved }: BatchEditModalProps) {
  const updateBatch = useUpdateBatch(batch.id);
  const [error, setError] = useState("");
  const { lang } = useLanguage();
  const statusLabelMap: Record<string, string> = {
    Harvested: "Đã thu hoạch",
    Processing: "Đang chế biến",
    Packaged: "Đã đóng gói",
    "In Transit": "Đang vận chuyển",
    Distributed: "Đã phân phối",
    "At Retail": "Tại điểm bán",
    Recalled: "Bị thu hồi",
  };
  const [form, setForm] = useState<UpdateBatchRequest>({
    status: batch.status as BatchStatus,
    quantity: batch.quantity,
    weight: batch.weight,
    location: batch.location,
    description: batch.description ?? "",
    productionArea: batch.productionArea ?? "",
  });

  // keep form in sync if parent batch prop changes
  useEffect(() => {
    setForm({
      status: batch.status as BatchStatus,
      quantity: batch.quantity,
      weight: batch.weight,
      location: batch.location,
      description: batch.description ?? "",
      productionArea: batch.productionArea ?? "",
    });
  }, [batch.id]);

  const set = (field: keyof UpdateBatchRequest, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setError("");
    try {
      await updateBatch.mutateAsync(form);
      onSaved?.();
      onClose();
    } catch {
      setError(
        lang === "vi"
          ? "Không thể cập nhật lô hàng. Vui lòng thử lại."
          : "Failed to update batch. Please try again."
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl w-full max-w-lg mx-4 overflow-hidden"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ background: "linear-gradient(90deg, #1B5E20 0%, #2E7D32 100%)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/20">
              <Edit2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-semibold text-white">{lang === "vi" ? "Chỉnh Sửa Lô Hàng" : "Edit Batch"}</div>
              <code className="text-green-200 text-xs font-mono">
                {batch.batchCode ?? batch.id}
              </code>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {lang === "vi" ? "Trạng Thái Quy Trình" : "Pipeline Status"}
            </label>
            <div className="flex flex-wrap gap-2">
              {PIPELINE_STATUSES.map((s) => {
                const cfg = statusColors[s] ?? { bg: "#F3F4F6", color: "#6B7280" };
                const isSelected = form.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => set("status", s)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: isSelected ? cfg.color : cfg.bg,
                      color: isSelected ? "#fff" : cfg.color,
                      outline: isSelected ? `2px solid ${cfg.color}` : "none",
                      outlineOffset: 2,
                    }}
                  >
                    {lang === "vi" ? (statusLabelMap[s] || s) : s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity + Weight */}
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {lang === "vi" ? "Số Lượng" : "Quantity"}
              </span>
              <input
                type="number"
                min={1}
                value={form.quantity ?? ""}
                onChange={(e) => set("quantity", Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-border outline-none text-sm focus:ring-2 transition-all"
                style={{ focusRingColor: "#2E7D32" } as React.CSSProperties}
              />
            </label>
          </div>

          {/* Location + Production Area */}
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {lang === "vi" ? "Địa Điểm" : "Location"}
              </span>
              <input
                value={form.location ?? ""}
                onChange={(e) => set("location", e.target.value)}
                placeholder={lang === "vi" ? "Thành phố / Tỉnh" : "City / Province"}
                className="w-full px-3 py-2.5 rounded-xl border border-border outline-none text-sm"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {lang === "vi" ? "Khu Vực Sản Xuất" : "Production Area"}
              </span>
              <input
                value={form.productionArea ?? ""}
                onChange={(e) => set("productionArea", e.target.value)}
                placeholder={lang === "vi" ? "Tỉnh" : "Province"}
                className="w-full px-3 py-2.5 rounded-xl border border-border outline-none text-sm"
              />
            </label>
          </div>

          {/* Description */}
          <label className="space-y-1.5 block">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {lang === "vi" ? "Mô Tả / Ghi Chú" : "Description / Notes"}
            </span>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder={lang === "vi" ? "Ghi chú hoặc cập nhật về lô hàng này..." : "Any notes or updates about this batch..."}
              className="w-full px-3 py-2.5 rounded-xl border border-border outline-none text-sm resize-none"
            />
          </label>

          {error && (
            <div
              className="rounded-xl px-3 py-2 text-sm bg-destructive/10 text-destructive border border-destructive/30"
            >
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            {lang === "vi" ? "Hủy bỏ" : "Cancel"}
          </button>
          <button
            onClick={handleSave}
            disabled={updateBatch.isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            style={{ background: "#2E7D32" }}
          >
            <Save className="w-4 h-4" />
            {updateBatch.isPending ? (lang === "vi" ? "Đang lưu..." : "Saving...") : (lang === "vi" ? "Lưu Thay Đổi" : "Save Changes")}
          </button>
        </div>
      </div>
    </div>
  );
}
