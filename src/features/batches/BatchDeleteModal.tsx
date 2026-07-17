import { useState } from "react";
import { Power, AlertTriangle, X } from "lucide-react";
import { useUpdateBatch } from "./batches.queries";

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

  const handleToggle = async () => {
    setError("");
    try {
      await updateBatch.mutateAsync({ isDeleted: !isDeleted });
      onDeleted?.();
      onClose();
    } catch {
      setError(`Failed to ${isDeleted ? "activate" : "deactivate"} batch. Please try again.`);
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
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDeleted ? "bg-green-100" : "bg-orange-100"}`}
            >
              <Power className={`w-4 h-4 ${isDeleted ? "text-green-600" : "text-orange-600"}`} />
            </div>
            <span className="font-semibold text-gray-900">
              {isDeleted ? "Activate Batch" : "Deactivate Batch"}
            </span>
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
            style={{ background: isDeleted ? "#F0FDF4" : "#FFF7ED", border: `1px solid ${isDeleted ? "#BBF7D0" : "#FED7AA"}` }}
          >
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: isDeleted ? "#16A34A" : "#EA580C" }} />
            <div>
              <div className="font-semibold text-sm" style={{ color: isDeleted ? "#15803D" : "#9A3412" }}>
                {isDeleted ? "Batch will become active" : "Batch will become inactive"}
              </div>
              <div className="text-sm mt-1" style={{ color: isDeleted ? "#166534" : "#C2410C" }}>
                {isDeleted
                  ? "This batch will be visible to all users and normal operations can resume."
                  : "This batch will be hidden from public views and new actions will be restricted."}
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-2">
            You are about to {isDeleted ? "activate" : "deactivate"}:
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
         {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleToggle}
            disabled={updateBatch.isPending}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 ${
              isDeleted ? "bg-green-600" : "bg-orange-500"
            }`}
          >
            {updateBatch.isPending ? "Processing..." : isDeleted ? "Activate" : "Deactivate"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
