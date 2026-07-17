import { useState } from "react";
import { Scissors, Plus, Trash2, X, AlertCircle } from "lucide-react";
import { useSplitBatch } from "./batches.queries";
import type { SplitBatchChild } from "./split-merge.types";

interface BatchSplitModalProps {
  batchId: string;
  batchCode: string;
  productName: string;
  totalQuantity: number;
  unit?: string;
  onClose: () => void;
  onSplit?: (childIds: number[]) => void;
}

export function BatchSplitModal({
  batchId,
  batchCode,
  productName,
  totalQuantity,
  unit = "kg",
  onClose,
  onSplit,
}: BatchSplitModalProps) {
  const splitBatch = useSplitBatch(batchId);
  const [children, setChildren] = useState<SplitBatchChild[]>([
    { quantity: 0, unit },
    { quantity: 0, unit },
  ]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const totalAllocated = children.reduce((sum, c) => sum + (Number(c.quantity) || 0), 0);
  const remaining = totalQuantity - totalAllocated;
  const isValid =
    children.length >= 2 &&
    children.every((c) => Number(c.quantity) > 0) &&
    totalAllocated <= totalQuantity;

  const addChild = () =>
    setChildren((prev) => [...prev, { quantity: 0, unit }]);

  const removeChild = (idx: number) =>
    setChildren((prev) => prev.filter((_, i) => i !== idx));

  const setQty = (idx: number, val: string) =>
    setChildren((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, quantity: Number(val) } : c))
    );

  const handleSplit = async () => {
    setError("");
    if (!isValid) {
      setError(
        totalAllocated > totalQuantity
          ? `Total allocated (${totalAllocated}) exceeds parent quantity (${totalQuantity} ${unit}).`
          : "Each child batch must have a quantity greater than 0."
      );
      return;
    }
    try {
      const result = await splitBatch.mutateAsync({ children, notes: notes || undefined });
      onSplit?.(result.data.childBatchIds);
      onClose();
    } catch {
      setError("Failed to split batch. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg mx-4 overflow-hidden"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ background: "linear-gradient(90deg, #1565C0 0%, #1976D2 100%)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/20">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-semibold text-white">Split Batch</div>
              <code className="text-blue-200 text-xs font-mono">{batchCode}</code>
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
          {/* Parent info */}
          <div
            className="rounded-xl p-3 flex items-center justify-between"
            style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}
          >
            <div>
              <div className="text-sm font-semibold text-blue-900">{productName}</div>
              <div className="text-xs text-blue-600 mt-0.5">
                Parent batch · {totalQuantity.toLocaleString()} {unit} total
              </div>
            </div>
            <div className="text-right">
              <div
                className="text-sm font-bold"
                style={{ color: remaining < 0 ? "#DC2626" : "#2E7D32" }}
              >
                {remaining.toLocaleString()} {unit}
              </div>
              <div className="text-xs text-gray-400">remaining</div>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Allocated</span>
              <span>
                {totalAllocated.toLocaleString()} / {totalQuantity.toLocaleString()} {unit}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (totalAllocated / totalQuantity) * 100)}%`,
                  background: totalAllocated > totalQuantity ? "#DC2626" : "#2E7D32",
                }}
              />
            </div>
          </div>

          {/* Children */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Child Batches
              </span>
              <button
                onClick={addChild}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                style={{ color: "#1565C0", background: "#EFF6FF" }}
              >
                <Plus className="w-3.5 h-3.5" /> Add Batch
              </button>
            </div>
            {children.map((child, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-xl p-3"
                style={{ background: "#F8FAF8", border: "1px solid #E5E7EB" }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: "#1976D2" }}
                >
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 block mb-1">
                    Quantity ({unit})
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={totalQuantity}
                    value={child.quantity || ""}
                    onChange={(e) => setQty(idx, e.target.value)}
                    placeholder={`0 ${unit}`}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm"
                  />
                </div>
                {children.length > 2 && (
                  <button
                    onClick={() => removeChild(idx)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Notes */}
          <label className="space-y-1.5 block">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Notes (optional)
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Reason for splitting this batch..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none text-sm resize-none"
            />
          </label>

          {error && (
            <div
              className="flex items-start gap-2 rounded-xl px-3 py-2 text-sm"
              style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSplit}
            disabled={splitBatch.isPending || !isValid}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            style={{ background: "#1565C0" }}
          >
            <Scissors className="w-4 h-4" />
            {splitBatch.isPending ? "Splitting..." : `Split into ${children.length} batches`}
          </button>
        </div>
      </div>
    </div>
  );
}
