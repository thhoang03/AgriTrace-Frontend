import { useState } from "react";
import { X, Beaker } from "lucide-react";
import type { CreateLabTestRequest } from "./inspection.types";

interface AddLabTestModalProps {
  onClose: () => void;
  onSubmit: (data: CreateLabTestRequest) => void;
  isSubmitting?: boolean;
}

export function AddLabTestModal({ onClose, onSubmit, isSubmitting = false }: AddLabTestModalProps) {
  const [form, setForm] = useState({
    testName: "",
    measuredValue: "",
    unit: "",
    minStandardValue: "",
    maxStandardValue: "",
    result: "pass" as "pass" | "fail",
    remark: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.testName.trim()) return;

    onSubmit({
      testName: form.testName.trim(),
      measuredValue: form.measuredValue.trim() || undefined,
      unit: form.unit.trim() || undefined,
      minStandardValue: form.minStandardValue.trim() || undefined,
      maxStandardValue: form.maxStandardValue.trim() || undefined,
      isPassed: form.result === "pass",
      remark: form.remark.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()} style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#E8F5E9" }}>
              <Beaker className="w-5 h-5" style={{ color: "#2E7D32" }} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Add Lab Test</h3>
              <p className="text-xs text-gray-500 mt-0.5">Record a new lab test result for this inspection</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Test Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.testName}
              onChange={(e) => setForm({ ...form, testName: e.target.value })}
              placeholder="e.g. Pesticide residue"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-400"
              style={{ background: "#F8FAF8" }}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Measured Value</label>
              <input
                value={form.measuredValue}
                onChange={(e) => setForm({ ...form, measuredValue: e.target.value })}
                placeholder="e.g. 0.02"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-400"
                style={{ background: "#F8FAF8" }}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Unit</label>
              <input
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="e.g. mg/kg"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-400"
                style={{ background: "#F8FAF8" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Min Standard Value</label>
              <input
                value={form.minStandardValue}
                onChange={(e) => setForm({ ...form, minStandardValue: e.target.value })}
                placeholder="e.g. 6.0"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-400"
                style={{ background: "#F8FAF8" }}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Max Standard Value</label>
              <input
                value={form.maxStandardValue}
                onChange={(e) => setForm({ ...form, maxStandardValue: e.target.value })}
                placeholder="e.g. 7.0"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-400"
                style={{ background: "#F8FAF8" }}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Result</label>
            <select
              value={form.result}
              onChange={(e) => setForm({ ...form, result: e.target.value as "pass" | "fail" })}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white transition-all focus:border-green-400"
            >
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Remark</label>
            <textarea
              value={form.remark}
              onChange={(e) => setForm({ ...form, remark: e.target.value })}
              rows={3}
              placeholder="Additional notes"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none transition-all focus:border-green-400"
              style={{ background: "#F8FAF8" }}
            />
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
              {isSubmitting ? "Saving..." : "Save Lab Test"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
