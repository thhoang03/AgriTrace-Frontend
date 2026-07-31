import { useEffect, useState } from "react";
import { X, FlaskConical } from "lucide-react";
import { useBatches } from "../batches/batches.queries";
import { QrScannerButton } from "../supply-chain/QrScannerButton";
import { InspectionTypeValues, type InspectionType } from "./inspection.types";

interface InspectionCreateModalProps {
  onClose: () => void;
  onSubmit: (data: {
    batchId: string;
    inspectionType: InspectionType;
    inspectionDate: string;
    notes: string;
  }) => void;
  isSubmitting?: boolean;
}

export function InspectionCreateModal({ onClose, onSubmit, isSubmitting = false }: InspectionCreateModalProps) {
  const { data: batchesData, isLoading: isLoadingBatches } = useBatches({ limit: 100 });
  const batchOptions = (batchesData?.data ?? []).filter((batch) => !!batch.id);

  const [form, setForm] = useState({
    batchId: "",
    inspectionType: 1 as InspectionType,
    inspectionDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    if (!form.batchId && batchOptions.length > 0) {
      setForm((prev) => ({ ...prev, batchId: batchOptions[0].id }));
    }
  }, [batchOptions, form.batchId]);

  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.batchId.trim()) return;
    try {
      await onSubmit(form);
      setErrorMessage('');
    } catch (err: any) {
      const msg = err?.message || 'Lab test failed: An unexpected error occurred';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()} style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#E8F5E9" }}>
              <FlaskConical className="w-5 h-5" style={{ color: "#2E7D32" }} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">New Inspection</h3>
              <p className="text-xs text-gray-500 mt-0.5">Record a quality inspection for a batch</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Batch ID <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                value={form.batchId}
                onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                placeholder="e.g. 11111111-2222-3333-4444-555555555555"
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-400"
                style={{ background: "#F8FAF8" }}
                required
              />
              <QrScannerButton
                onScan={(result) => {
                  const match = result.match(/\/public\/trace\/(.+)/);
                  setForm({ ...form, batchId: match ? match[1] : result });
                }}
              />
            </div>
            <div className="mt-2">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Quick select existing batch</label>
              <select
                value={form.batchId}
                onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                disabled={isLoadingBatches}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white transition-all focus:border-green-400 disabled:opacity-60"
              >
                {isLoadingBatches ? (
                  <option value="">Loading batches...</option>
                ) : batchOptions.length === 0 ? (
                  <option value="">No batches available</option>
                ) : (
                  batchOptions.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.batchCode || batch.id} · {batch.product || batch.category || "Batch"}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Inspection Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.inspectionType}
              onChange={(e) => setForm({ ...form, inspectionType: Number(e.target.value) as InspectionType })}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white transition-all focus:border-green-400"
            >
              {InspectionTypeValues.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Inspection Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.inspectionDate}
              onChange={(e) => setForm({ ...form, inspectionDate: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white transition-all focus:border-green-400"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Inspection notes, observations..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none transition-all focus:border-green-400"
              style={{ background: "#F8FAF8" }}
            />
          </div>

          {errorMessage && (
            <div className="mb-3 p-2 bg-red-100 text-red-800 rounded" role="alert">
              {errorMessage}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #2E7D32, #388E3C)" }}
            >
              {isSubmitting ? "Creating..." : "Create Inspection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
