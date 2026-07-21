import { useState } from "react";
import { X, FlaskConical, AlertTriangle } from "lucide-react";
import type { InspectionCategory, InspectionResult } from "./inspection.types";

interface InspectionCreateModalProps {
  onClose: () => void;
  onSubmit: (data: {
    batchId: string;
    category: InspectionCategory;
    inspector: string;
    result: InspectionResult;
    notes: string;
  }) => void;
  isSubmitting?: boolean;
}

export function InspectionCreateModal({ onClose, onSubmit, isSubmitting = false }: InspectionCreateModalProps) {
  const [form, setForm] = useState({
    batchId: "",
    category: "Quality" as InspectionCategory,
    inspector: "",
    result: "Pending" as InspectionResult,
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.batchId.trim() || !form.inspector.trim()) return;
    onSubmit(form);
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
              <p className="text-xs text-gray-500 mt-0.5">Create a new quality inspection record</p>
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
            <input
              value={form.batchId}
              onChange={(e) => setForm({ ...form, batchId: e.target.value })}
              placeholder="e.g. BTH-2024-001"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-400"
              style={{ background: "#F8FAF8" }}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Inspector Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.inspector}
              onChange={(e) => setForm({ ...form, inspector: e.target.value })}
              placeholder="e.g. Lý Thị Ngọc"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-400"
              style={{ background: "#F8FAF8" }}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as InspectionCategory })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white transition-all focus:border-green-400"
              >
                <option value="Quality">Quality</option>
                <option value="Safety">Safety</option>
                <option value="Regulatory">Regulatory</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Result</label>
              <select
                value={form.result}
                onChange={(e) => setForm({ ...form, result: e.target.value as InspectionResult })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white transition-all focus:border-green-400"
              >
                <option value="Pending">Pending</option>
                <option value="Pass">Pass</option>
                <option value="Fail">Fail</option>
              </select>
            </div>
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

          <div className="p-3 rounded-xl flex items-start gap-3" style={{ background: "#FFF9C4" }}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#F57F17" }} />
            <p className="text-xs" style={{ color: "#795548" }}>
              Inspection results and lab tests will be recorded after the inspection is completed.
            </p>
          </div>

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
