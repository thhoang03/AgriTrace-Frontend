import { useState } from "react";
import { X, Beaker, Sparkles } from "lucide-react";
import type { CreateLabTestRequest } from "./inspection.types";
import { useLanguage } from "../../contexts/LanguageContext";

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
  const { lang } = useLanguage();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div className="flex items-center justify-between mb-5 border-b border-border pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
              <Beaker className="w-5 h-5" style={{ color: "#2E7D32" }} />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">{lang === "vi" ? "Thêm Chỉ Số Xét Nghiệm Lab (Lab Test)" : "Add Lab Test"}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{lang === "vi" ? "Ghi nhận chỉ số thử nghiệm phòng lab cho phiếu kiểm định" : "Record lab test result for this inspection"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mb-4 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
          <div className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            {lang === "vi" ? "Gợi ý mẫu chỉ số nhanh (VietGAP / GlobalGAP):" : "Quick Presets (VietGAP / GlobalGAP):"}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_LAB_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-2.5 py-1 bg-card hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200/60 rounded-lg text-xs font-medium transition-all shadow-2xs hover:border-emerald-400"
              >
                + {p.name.split(" (")[0]}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">
              {lang === "vi" ? "Tên chỉ số kiểm định / Xét nghiệm" : "Test Name"} <span className="text-red-500">*</span>
            </label>
            <input
              value={form.testName}
              onChange={(e) => setForm({ ...form, testName: e.target.value })}
              placeholder={lang === "vi" ? "Ví dụ: Dư lượng thuốc BVTV, Vi sinh E.Coli..." : "e.g. Pesticide residues, E.Coli..."}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none transition-all focus:border-green-500 font-medium text-foreground bg-input-background"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">{lang === "vi" ? "Kết quả đo thực tế" : "Measured Value"}</label>
              <input
                value={form.measuredValue}
                onChange={(e) => setForm({ ...form, measuredValue: e.target.value })}
                placeholder={lang === "vi" ? "Ví dụ: 0.005" : "e.g. 0.005"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none transition-all focus:border-green-500 font-medium text-foreground bg-input-background"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">{lang === "vi" ? "Đơn vị tính (Unit)" : "Unit"}</label>
              <input
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder={lang === "vi" ? "Ví dụ: mg/kg, CFU/g, %" : "e.g. mg/kg, CFU/g, %"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none transition-all focus:border-green-500 font-medium text-foreground bg-input-background"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">{lang === "vi" ? "Ngưỡng tối thiểu (Min Standard)" : "Min Standard Value"}</label>
              <input
                value={form.minStandardValue}
                onChange={(e) => setForm({ ...form, minStandardValue: e.target.value })}
                placeholder={lang === "vi" ? "Ví dụ: 0" : "e.g. 0"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none transition-all focus:border-green-500 font-medium text-foreground bg-input-background"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">{lang === "vi" ? "Ngưỡng tối đa (Max Standard)" : "Max Standard Value"}</label>
              <input
                value={form.maxStandardValue}
                onChange={(e) => setForm({ ...form, maxStandardValue: e.target.value })}
                placeholder={lang === "vi" ? "Ví dụ: 0.01" : "e.g. 0.01"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none transition-all focus:border-green-500 font-medium text-foreground bg-input-background"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">{lang === "vi" ? "Đánh giá chỉ số" : "Evaluation"}</label>
            <select
              value={form.result}
              onChange={(e) => setForm({ ...form, result: e.target.value as "pass" | "fail" })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none bg-input-background transition-all focus:border-green-500 font-semibold"
              style={{
                color: form.result === "pass" ? "#2E7D32" : "#C62828",
                appearance: "auto",
              }}
            >
              <option value="pass">{lang === "vi" ? "Đạt chuẩn (PASS)" : "Pass"}</option>
              <option value="fail">{lang === "vi" ? "Không đạt (FAIL)" : "Fail"}</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">{lang === "vi" ? "Ghi chú / Nhận xét phòng Lab" : "Lab Remark"}</label>
            <textarea
              value={form.remark}
              onChange={(e) => setForm({ ...form, remark: e.target.value })}
              rows={3}
              placeholder={lang === "vi" ? "Nhập ghi chú chi tiết hoặc nhận xét từ phòng thí nghiệm..." : "Enter detailed remarks..."}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none resize-none transition-all focus:border-green-500 bg-input-background text-foreground"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              {lang === "vi" ? "Hủy bỏ" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 shadow-md shadow-emerald-700/20"
              style={{ background: "linear-gradient(135deg, #2E7D32, #388E3C)" }}
            >
              {isSubmitting ? (lang === "vi" ? "Đang lưu..." : "Saving...") : (lang === "vi" ? "Lưu Chỉ Số Xét Nghiệm" : "Save Lab Test")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

