import { useState } from "react";
import { X, Layers, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { batchesApi, type Batch } from "./batches.api";

interface MergeBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBatches: Batch[];
  onSuccess: () => void;
}

export function MergeBatchModal({ isOpen, onClose, availableBatches, onSuccess }: MergeBatchModalProps) {
  const { lang } = useLanguage();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [productionDate, setProductionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  // Filter out recalled batches
  const validBatches = availableBatches.filter((b) => b.status !== "RECALLED" && b.status !== "Recalled");

  const selectedBatches = validBatches.filter((b) => selectedIds.includes(b.id));

  // Determine if selected batches belong to the same product
  const firstProduct = selectedBatches[0]?.productId || selectedBatches[0]?.product;
  const isSingleProduct = selectedBatches.every(
    (b) => (b.productId || b.product) === firstProduct
  );

  const totalQuantity = selectedBatches.reduce(
    (sum, b) => sum + ((b as any).remainingQuantity ?? b.quantity ?? 0),
    0
  );

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (selectedIds.length < 2) {
      setError(lang === "vi" ? "Vui lòng chọn ít nhất 2 lô hàng để gộp" : "Please select at least 2 batches to merge.");
      return;
    }

    if (!isSingleProduct) {
      setError(lang === "vi" ? "Tất cả các lô hàng được chọn phải cùng một sản phẩm!" : "All selected batches must be of the same product!");
      return;
    }

    setLoading(true);
    try {
      const targetProduct = selectedBatches[0];
      const payload = {
        sourceBatchIds: selectedIds,
        productId: targetProduct.productId || "00000000-0000-0000-0000-000000000000",
        quantity: totalQuantity,
        unitId: targetProduct.unitId || "00000000-0000-0000-0000-000000000000",
        productionDate,
      };

      await batchesApi.merge(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        "Failed to merge batches.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-border">
        {/* Header Banner */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{lang === "vi" ? "Gộp Lô Nông Sản (Merge Batches)" : "Merge Batches"}</h3>
              <p className="text-xs text-teal-200">{lang === "vi" ? "Kết hợp nhiều lô nguồn thành lô mới" : "Combine multiple source batches into a new batch"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Select Source Batches List */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
              {lang === "vi" ? "Chọn các Lô hàng Nguồn *" : "Select Source Batches *"} ({selectedIds.length} {lang === "vi" ? "đã chọn" : "selected"})
            </label>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {validBatches.length === 0 ? (
                <div className="p-4 rounded-xl bg-muted text-center text-xs text-muted-foreground">
                  {lang === "vi" ? "Không có lô hàng khả dụng để gộp" : "No available batches to merge"}
                </div>
              ) : (
                validBatches.map((b) => {
                  const isChecked = selectedIds.includes(b.id);
                  const qty = (b as any).remainingQuantity ?? b.quantity ?? 0;
                  return (
                    <div
                      key={b.id}
                      onClick={() => handleToggleSelect(b.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isChecked
                          ? "bg-teal-50/80 border-teal-400 shadow-sm"
                          : "bg-muted/60 border-border hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${isChecked ? "bg-teal-600 border-teal-600 text-white" : "border-border bg-card"}`}>
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-xs">{b.batchCode || b.id}</div>
                          <div className="text-[11px] text-muted-foreground">{b.product || b.productName}</div>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="font-bold text-teal-900">{qty} {b.unit || "kg"}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Merge Result Preview */}
          {selectedIds.length >= 2 && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
              <div className="font-bold text-emerald-950 flex items-center justify-between">
                <span>{lang === "vi" ? "Lô Gộp Mới Dự Kiến" : "Expected Merged Batch"}</span>
                <span className="font-mono bg-emerald-200/60 px-2 py-0.5 rounded text-emerald-800">
                  {selectedBatches[0]?.product || selectedBatches[0]?.productName}
                </span>
              </div>
              <div className="text-emerald-900 flex justify-between">
                <span>{lang === "vi" ? "Tổng sản lượng mới:" : "Total Merged Quantity:"}</span>
                <strong className="font-bold text-emerald-950 text-sm">{totalQuantity} {selectedBatches[0]?.unit || "kg"}</strong>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-1.5">
              {lang === "vi" ? "Ngày sản xuất lô mới *" : "Production Date *"}
            </label>
            <input
              type="date"
              value={productionDate}
              onChange={(e) => setProductionDate(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-border text-xs font-semibold outline-none focus:border-teal-500 bg-input-background"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              {lang === "vi" ? "Hủy bỏ" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading || selectedIds.length < 2 || !isSingleProduct}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 shadow-md shadow-teal-700/20 transition-all disabled:opacity-50"
            >
              {loading ? (lang === "vi" ? "Đang xử lý..." : "Processing...") : (lang === "vi" ? "Xác Nhận Gộp Lô" : "Confirm Merge")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
