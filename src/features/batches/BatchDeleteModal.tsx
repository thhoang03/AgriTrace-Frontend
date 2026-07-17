import { useState } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { useDeleteBatch } from "./batches.queries";

interface BatchDeleteModalProps {
  batchId: string;
  batchCode: string;
  productName: string;
  onClose: () => void;
  onDeleted?: () => void;
}

export function BatchDeleteModal({
  batchId,
  batchCode,
  productName,
  onClose,
  onDeleted,
}: BatchDeleteModalProps) {
  const deleteBatch = useDeleteBatch();
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setError("");
    try {
      await deleteBatch.mutateAsync(batchId);
      onDeleted?.();
      onClose();
    } catch {
      setError("Failed to delete batch. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "#FEE2E2" }}
            >
              <Trash2 className="w-4 h-4" style={{ color: "#DC2626" }} />
            </div>
            <span className="font-semibold text-gray-900">Delete Batch</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div
            className="flex items-start gap-3 rounded-xl p-4 mb-4"
            style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}
          >
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "#EA580C" }} />
            <div>
              <div className="font-semibold text-sm" style={{ color: "#9A3412" }}>
                This action cannot be undone
              </div>
              <div className="text-sm mt-1" style={{ color: "#C2410C" }}>
                All timeline events, certificates, and audit logs associated with this batch will
                be permanently removed from the system.
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-2">
            You are about to delete:
          </p>
          <div
            className="rounded-xl p-3 mb-4"
            style={{ background: "#F8FAF8", border: "1px solid #E5E7EB" }}
          >
            <div className="text-sm font-semibold text-gray-900">{productName}</div>
            <code
              className="text-xs font-mono mt-0.5 inline-block px-2 py-0.5 rounded-lg"
              style={{ background: "#E8F5E9", color: "#2E7D32" }}
            >
              {batchCode}
            </code>
          </div>

          {error && (
            <div
              className="rounded-xl px-3 py-2 text-sm mb-4"
              style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}
            >
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteBatch.isPending}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "#DC2626" }}
            >
              <Trash2 className="w-4 h-4" />
              {deleteBatch.isPending ? "Deleting..." : "Delete Batch"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
