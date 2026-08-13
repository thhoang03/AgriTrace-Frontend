import { useState } from "react";
import { X, GitBranch, Plus, Trash2, AlertCircle } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { batchesApi, type Batch } from "./batches.api";

interface SplitBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch | null;
  onSuccess: () => void;
}

export function SplitBatchModal({ isOpen, onClose, batch, onSuccess }: SplitBatchModalProps) {
  const { lang } = useLanguage();
  const [splits, setSplits] = useState<{ quantity: number }[]>([
    { quantity: 0 },
    { quantity: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !batch) return null;

  const remainingQty = (batch as any).remainingQuantity ?? batch.quantity ?? 0;
  const totalSplitQty = splits.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const isOverQuantity = totalSplitQty > remainingQty;

  const handleAddSplit = () => {
    setSplits((prev) => [...prev, { quantity: 0 }]);
  };

  const handleRemoveSplit = (index: number) => {
    if (splits.length <= 2) return;
    setSplits((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, val: number) => {
    setSplits((prev) => {
      const next = [...prev];
      next[index] = { quantity: val };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (splits.length < 2) {
      setError(lang === "vi" ? "Phải phân chia tối thiểu 2 lô con" : "A split requires at least 2 child batches.");
      return;
    }

    if (splits.some((s) => s.quantity <= 0)) {
      setError(lang === "vi" ? "Sản lượng mỗi lô con phải lớn hơn 0" : "Quantity for each child batch must be > 0.");
      return;
    }

    if (isOverQuantity) {
      setError(lang === "vi" ? "Tổng sản lượng lô con vượt quá sản lượng còn lại của lô cha!" : "Total split quantity exceeds remaining quantity!");
      return;
    }

    setLoading(true);
    try {
      const payload = splits.map((s) => ({
        quantity: Number(s.quantity),
        unitId: batch.unitId || "00000000-0000-0000-0000-000000000000",
      }));

      await batchesApi.split(batch.id, payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        (lang === "vi" ? "Không thể tách lô hàng." : "Failed to split batch.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-border">
        {/* Header Banner */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{lang === "vi" ? "Tách Lô Nông Sản (Split Batch)" : "Split Batch"}</h3>
              <p className="text-xs text-purple-200">{lang === "vi" ? "Phân chia lô hàng thành các lô nhỏ hơn" : "Divide batch into smaller child batches"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Parent Batch Info Card */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1 text-xs">
            <div className="font-bold text-purple-950 text-sm flex items-center justify-between">
              <span>{batch.batchCode || batch.id}</span>
              <span className="font-mono bg-purple-200/60 px-2 py-0.5 rounded text-purple-800">
                {batch.product || batch.productName}
              </span>
            </div>
            <div className="text-purple-800">
              {lang === "vi" ? "Sản lượng khả dụng:" : "Available Quantity:"}{" "}
              <strong className="text-purple-950 font-bold">{remainingQty} {batch.unit || "kg"}</strong>
            </div>
          </div>

          {/* Child Splits Inputs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                {lang === "vi" ? "Danh sách Lô con" : "Child Batches"} ({splits.length})
              </label>
              <button
                type="button"
                onClick={handleAddSplit}
                className="text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> {lang === "vi" ? "Thêm lô con" : "Add Child"}
              </button>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {splits.map((s, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-muted border border-border">
                  <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      step="any"
                      value={s.quantity || ""}
                      onChange={(e) => handleQuantityChange(idx, parseFloat(e.target.value) || 0)}
                      placeholder={lang === "vi" ? `Nhập sản lượng lô #${idx + 1}` : `Quantity for child #${idx + 1}`}
                      className="w-full h-9 px-3 rounded-xl border border-border text-xs font-semibold outline-none focus:border-purple-500 bg-input-background"
                      required
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{batch.unit || "kg"}</span>
                  {splits.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSplit(idx)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary Progress Bar */}
          <div className="p-3.5 rounded-2xl bg-muted border border-border space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground">{lang === "vi" ? "Đã phân chia:" : "Total Allocated:"}</span>
              <span className={`font-bold ${isOverQuantity ? "text-rose-600" : "text-purple-900"}`}>
                {totalSplitQty} / {remainingQty} {batch.unit || "kg"}
              </span>
            </div>
            <div className="w-full bg-border h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${isOverQuantity ? "bg-rose-500" : "bg-purple-600"}`}
                style={{ width: `${Math.min(100, (totalSplitQty / (remainingQty || 1)) * 100)}%` }}
              />
            </div>
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
              disabled={loading || isOverQuantity || totalSplitQty <= 0}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 shadow-md shadow-purple-700/20 transition-all disabled:opacity-50"
            >
              {loading ? (lang === "vi" ? "Đang xử lý..." : "Processing...") : (lang === "vi" ? "Xác Nhận Tách Lô" : "Confirm Split")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
