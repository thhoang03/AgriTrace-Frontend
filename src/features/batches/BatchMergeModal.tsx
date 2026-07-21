import { useState } from "react";
import { Merge, X, AlertCircle, Search } from "lucide-react";
import { useMergeBatch, useBatches } from "./batches.queries";

interface BatchMergeModalProps {
  currentBatchId: string;
  currentBatchCode: string;
  productName: string;
  productId?: number;
  onClose: () => void;
  onMerged?: (mergedBatchId: number) => void;
}

export function BatchMergeModal({
  currentBatchId,
  currentBatchCode,
  productName,
  productId,
  onClose,
  onMerged,
}: BatchMergeModalProps) {
  const mergeBatch = useMergeBatch();
  const { data: batchesData } = useBatches();
  const allBatches = batchesData?.data ?? [];

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mergedQuantity, setMergedQuantity] = useState("");
  const [mergedUnit, setMergedUnit] = useState("kg");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const candidateBatches = allBatches.filter(
    (b) => b.id !== currentBatchId && !b.isDeleted
  );

  const filteredCandidates = candidateBatches.filter((b) => {
    const term = search.toLowerCase();
    return (
      (b.batchCode ?? b.id).toLowerCase().includes(term) ||
      (b.productName ?? b.product).toLowerCase().includes(term)
    );
  });

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const isValid =
    selectedIds.length >= 1 &&
    Number(mergedQuantity) > 0;

  const handleMerge = async () => {
    setError("");
    if (!isValid) {
      setError(
        !selectedIds.length
          ? "Select at least one other batch to merge."
          : "Specify the quantity of the merged batch."
      );
      return;
    }
    try {
      const allIds = [Number(currentBatchId), ...selectedIds.map(Number)];
      const result = await mergeBatch.mutateAsync({
        batchIds: allIds,
        productId: productId ?? 0,
        quantity: Number(mergedQuantity),
        unit: mergedUnit || undefined,
        notes: notes || undefined,
      });
      onMerged?.(result.data.mergedBatchId);
      onClose();
    } catch {
      setError("Failed to merge batches. Please try again.");
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
          style={{ background: "linear-gradient(90deg, #4A1472 0%, #7B1FA2 100%)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/20">
              <Merge className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-semibold text-white">Merge Batches</div>
              <code className="text-purple-200 text-xs font-mono">{currentBatchCode}</code>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Current batch */}
          <div
            className="rounded-xl p-3"
            style={{ background: "#FAF5FF", border: "1px solid #E9D5FF" }}
          >
            <div className="text-xs text-purple-500 font-semibold mb-0.5">Current Batch (primary)</div>
            <div className="text-sm font-semibold text-purple-900">{productName}</div>
            <code className="text-xs font-mono text-purple-600">{currentBatchCode}</code>
          </div>

          {/* Batch selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Select Batches to Merge
              </span>
              <span className="text-xs text-gray-400">{selectedIds.length} selected</span>
            </div>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search batches..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"
                style={{ background: "#F8FAF8" }}
              />
            </div>
            <div
              className="rounded-xl overflow-hidden divide-y divide-gray-50"
              style={{ border: "1px solid #E5E7EB", maxHeight: 200, overflowY: "auto" }}
            >
              {filteredCandidates.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-400">No other batches available</div>
              ) : (
                filteredCandidates.map((b) => {
                  const isSelected = selectedIds.includes(b.id);
                  return (
                    <button
                      key={b.id}
                      onClick={() => toggleSelect(b.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-purple-50 transition-colors text-left"
                      style={isSelected ? { background: "#FAF5FF" } : {}}
                    >
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          background: isSelected ? "#7B1FA2" : "transparent",
                          border: isSelected ? "none" : "1.5px solid #D1D5DB",
                        }}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">
                          {b.productName ?? b.product}
                        </div>
                        <code className="text-xs font-mono text-gray-400">
                          {b.batchCode ?? b.id}
                        </code>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-semibold text-gray-700">
                          {b.quantity.toLocaleString()} {b.unit ?? "units"}
                        </div>
                        <div className="text-xs text-gray-400">{b.status}</div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Result quantity */}
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Merged Quantity *
              </span>
              <input
                type="number"
                min={1}
                value={mergedQuantity}
                onChange={(e) => setMergedQuantity(e.target.value)}
                placeholder="Total quantity"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none text-sm"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit</span>
              <input
                value={mergedUnit}
                onChange={(e) => setMergedUnit(e.target.value)}
                placeholder="kg"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none text-sm"
              />
            </label>
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
              placeholder="Reason for merging..."
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
            onClick={handleMerge}
            disabled={mergeBatch.isPending || !isValid}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            style={{ background: "#7B1FA2" }}
          >
            <Merge className="w-4 h-4" />
            {mergeBatch.isPending
              ? "Merging..."
              : `Merge ${selectedIds.length + 1} batches`}
          </button>
        </div>
      </div>
    </div>
  );
}
