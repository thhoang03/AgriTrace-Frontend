import { useState } from "react";
import { X, Beaker, Sparkles } from "lucide-react";
import type { CreateLabTestRequest } from "./inspection.types";

interface AddLabTestModalProps {
  onClose: () => void;
  onSubmit: (data: CreateLabTestRequest) => void;
  isSubmitting?: boolean;
}

const COMMON_LAB_PRESETS = [
  { name: "Dư lượng thuốc BVTV (Pesticides)", unit: "mg/kg", min: "0", max: "0.01" },
  { name: "Chỉ tiêu vi sinh (E.Coli / Salmonella)", unit: "CFU/g", min: "0", max: "10" },
  { name: "Kim loại nặng Lead (Pb)", unit: "mg/kg", min: "0", max: "0.05" },
  { name: "Độ đường (Brix)", unit: "°Bx", min: "12", max: "18" },
  { name: "Độ ẩm sản phẩm (Moisture)", unit: "%", min: "10", max: "14" },
  { name: "Độ pH môi trường", unit: "pH", min: "6.0", max: "7.5" },
];

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

  const handleApplyPreset = (preset: typeof COMMON_LAB_PRESETS[0]) => {
    setForm((prev) => ({
      ...prev,
      testName: preset.name,
      unit: preset.unit,
      minStandardValue: preset.min,
      maxStandardValue: preset.max,
    }));
  };

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
        <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#E8F5E9" }}>
              <Beaker className="w-5 h-5" style={{ color: "#2E7D32" }} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Thêm Chỉ Số Xét Nghiệm Lab (Lab Test)</h3>
              <p className="text-xs text-gray-500 mt-0.5">Ghi nhận chỉ số thử nghiệm phòng lab cho phiếu kiểm định</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mb-4 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
          <div className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Gợi ý mẫu chỉ số nhanh (VietGAP / GlobalGAP):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_LAB_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-2.5 py-1 bg-white hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200/60 rounded-lg text-xs font-medium transition-all shadow-2xs hover:border-emerald-400"
              >
                + {p.name.split(" (")[0]}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Tên chỉ số kiểm định / Xét nghiệm <span className="text-red-500">*</span>
            </label>
            <input
              value={form.testName}
              onChange={(e) => setForm({ ...form, testName: e.target.value })}
              placeholder="Ví dụ: Dư lượng thuốc BVTV, Vi sinh E.Coli..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-500 font-medium text-gray-800 bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Kết quả đo thực tế</label>
              <input
                value={form.measuredValue}
                onChange={(e) => setForm({ ...form, measuredValue: e.target.value })}
                placeholder="Ví dụ: 0.005"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-500 font-medium text-gray-800 bg-white"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Đơn vị tính (Unit)</label>
              <input
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="Ví dụ: mg/kg, CFU/g, %"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-500 font-medium text-gray-800 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Ngưỡng tối thiểu (Min Standard)</label>
              <input
                value={form.minStandardValue}
                onChange={(e) => setForm({ ...form, minStandardValue: e.target.value })}
                placeholder="Ví dụ: 0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-500 font-medium text-gray-800 bg-white"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Ngưỡng tối đa (Max Standard)</label>
              <input
                value={form.maxStandardValue}
                onChange={(e) => setForm({ ...form, maxStandardValue: e.target.value })}
                placeholder="Ví dụ: 0.01"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-500 font-medium text-gray-800 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Đánh giá chỉ số</label>
            <select
              value={form.result}
              onChange={(e) => setForm({ ...form, result: e.target.value as "pass" | "fail" })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white transition-all focus:border-green-500 font-semibold"
              style={{
                color: form.result === "pass" ? "#2E7D32" : "#C62828",
                appearance: "auto",
              }}
            >
              <option value="pass">Đạt chuẩn (PASS)</option>
              <option value="fail">Không đạt (FAIL)</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Ghi chú / Nhận xét phòng Lab</label>
            <textarea
              value={form.remark}
              onChange={(e) => setForm({ ...form, remark: e.target.value })}
              rows={3}
              placeholder="Nhập ghi chú chi tiết hoặc nhận xét từ phòng thí nghiệm..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none transition-all focus:border-green-500 bg-gray-50 text-gray-800"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 shadow-md shadow-emerald-700/20"
              style={{ background: "linear-gradient(135deg, #2E7D32, #388E3C)" }}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu Chỉ Số Xét Nghiệm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

