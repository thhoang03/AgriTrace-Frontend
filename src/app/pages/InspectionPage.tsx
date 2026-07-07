import { useState } from "react";
import { CheckCircle, XCircle, Clock, Upload, Download, FlaskConical, User, Calendar } from "lucide-react";

const BANNER_IMG = "https://images.unsplash.com/photo-1684259498900-afdea87b1a97?w=1400&q=80";

type InspectionResult = "Pass" | "Fail" | "Pending";

interface Inspection {
  id: string;
  batchId: string;
  product: string;
  result: InspectionResult;
  inspector: string;
  date: string;
  certificate: string | null;
  notes: string;
  tests: { name: string; result: string; standard: string; ok: boolean }[];
}

const inspections: Inspection[] = [
  {
    id: "INS-2024-001",
    batchId: "BTH-2024-001",
    product: "Organic Dragon Fruit",
    result: "Pass",
    inspector: "Lý Thị Ngọc",
    date: "Jun 16, 2024",
    certificate: "CERT-VFA-2024-001.pdf",
    notes: "All parameters within acceptable limits. Product meets VFA food safety standards. No pesticide residue detected. Approved for distribution.",
    tests: [
      { name: "Pesticide Residue", result: "< 0.01 ppm", standard: "< 0.1 ppm", ok: true },
      { name: "Heavy Metal (Lead)", result: "0.002 mg/kg", standard: "< 0.1 mg/kg", ok: true },
      { name: "Microbiological", result: "< 100 CFU/g", standard: "< 1000 CFU/g", ok: true },
      { name: "Moisture Content", result: "85.2%", standard: "< 90%", ok: true },
      { name: "Sugar Brix", result: "14.8°Bx", standard: "> 12°Bx", ok: true },
    ],
  },
  {
    id: "INS-2024-002",
    batchId: "BTH-2024-006",
    product: "Durian Monthong",
    result: "Fail",
    inspector: "Trần Văn Khải",
    date: "Jun 25, 2024",
    certificate: null,
    notes: "Chlorpyrifos pesticide detected at 0.18 ppm, exceeding VFA limit of 0.05 ppm. Product cannot be distributed. Recall initiated.",
    tests: [
      { name: "Pesticide (Chlorpyrifos)", result: "0.18 ppm", standard: "< 0.05 ppm", ok: false },
      { name: "Heavy Metal (Lead)", result: "0.004 mg/kg", standard: "< 0.1 mg/kg", ok: true },
      { name: "Microbiological", result: "< 100 CFU/g", standard: "< 1000 CFU/g", ok: true },
      { name: "Moisture Content", result: "64.5%", standard: "< 70%", ok: true },
    ],
  },
  {
    id: "INS-2024-003",
    batchId: "BTH-2024-003",
    product: "Robusta Coffee",
    result: "Pending",
    inspector: "Nguyễn Văn Kỳ",
    date: "Jun 27, 2024",
    certificate: null,
    notes: "Sample collected. Lab analysis in progress. Results expected within 2 business days.",
    tests: [
      { name: "Pesticide Residue", result: "Analyzing...", standard: "< 0.1 ppm", ok: true },
      { name: "Mycotoxin (OTA)", result: "Analyzing...", standard: "< 5 μg/kg", ok: true },
      { name: "Moisture Content", result: "Analyzing...", standard: "< 12%", ok: true },
    ],
  },
];

const resultConfig: Record<InspectionResult, { bg: string; color: string; icon: React.ElementType; label: string }> = {
  Pass: { bg: "#E8F5E9", color: "#2E7D32", icon: CheckCircle, label: "PASS" },
  Fail: { bg: "#FFEBEE", color: "#C62828", icon: XCircle, label: "FAIL" },
  Pending: { bg: "#FFF9C4", color: "#F57F17", icon: Clock, label: "PENDING" },
};

export function InspectionPage() {
  const [selected, setSelected] = useState<Inspection>(inspections[0]);

  return (
    <div className="pb-8">
      {/* Banner */}
      <div className="relative h-36 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-top" style={{ backgroundImage: `url(${BANNER_IMG})` }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(27,94,32,0.9) 0%, rgba(46,125,50,0.6) 100%)" }} />
        <div className="relative z-10 h-full flex items-center px-8">
          <div>
            <h1 className="text-white" style={{ fontSize: 24, fontWeight: 700 }}>Quality Inspection</h1>
            <p className="text-green-100 text-sm mt-1">Food safety testing and certification management</p>
          </div>
          <div className="ml-auto flex items-center gap-5">
            {[
              { label: "Passed", count: inspections.filter((i) => i.result === "Pass").length, color: "#66BB6A" },
              { label: "Failed", count: inspections.filter((i) => i.result === "Fail").length, color: "#EF5350" },
              { label: "Pending", count: inspections.filter((i) => i.result === "Pending").length, color: "#FFB300" },
            ].map(({ label, count, color }) => (
              <div key={label} className="text-center">
                <div className="font-bold text-white" style={{ fontSize: 22 }}>{count}</div>
                <div className="text-xs" style={{ color }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 mt-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Inspection list */}
          <div className="space-y-3">
            {inspections.map((ins) => {
              const cfg = resultConfig[ins.result];
              const Ico = cfg.icon;
              return (
                <button
                  key={ins.id}
                  onClick={() => setSelected(ins)}
                  className={`w-full text-left p-4 rounded-2xl transition-all ${selected.id === ins.id ? "ring-2" : "bg-white hover:shadow-md"}`}
                  style={{
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    background: selected.id === ins.id ? cfg.bg : "white",
                    ringColor: cfg.color,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Ico style={{ color: cfg.color, width: 20, height: 20, flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">{ins.product}</div>
                      <code className="text-xs font-mono" style={{ color: "#2E7D32" }}>{ins.batchId}</code>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{ins.date}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Inspection detail */}
          <div className="lg:col-span-2 space-y-5">
            {/* Result card */}
            {(() => {
              const cfg = resultConfig[selected.result];
              const Ico = cfg.icon;
              return (
                <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: cfg.bg }}>
                        <Ico style={{ color: cfg.color, width: 28, height: 28 }} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900" style={{ fontSize: 22 }}>{selected.product}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-sm font-mono" style={{ color: "#2E7D32" }}>{selected.batchId}</code>
                          <span className="text-gray-300">·</span>
                          <span className="text-sm text-gray-500">{selected.id}</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-2 rounded-2xl font-bold text-lg" style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { icon: User, label: "Inspector", value: selected.inspector },
                      { icon: Calendar, label: "Date", value: selected.date },
                      { icon: FlaskConical, label: "Standard", value: "VFA 2024" },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="p-3 rounded-xl" style={{ background: "#F8FAF8" }}>
                        <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-xs">{label}</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-800">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Lab Tests */}
            <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Laboratory Test Results</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#F8FAF8" }}>
                    {["Test Parameter", "Result", "Standard", "Status"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {selected.tests.map((test) => (
                    <tr key={test.name}>
                      <td className="px-5 py-3 text-sm font-medium text-gray-800">{test.name}</td>
                      <td className="px-5 py-3 text-sm text-gray-700 font-mono">{test.result}</td>
                      <td className="px-5 py-3 text-sm text-gray-400 font-mono">{test.standard}</td>
                      <td className="px-5 py-3">
                        {test.result.includes("Analyzing") ? (
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#FFF9C4", color: "#F57F17" }}>Pending</span>
                        ) : test.ok ? (
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#E8F5E9", color: "#2E7D32" }}>✓ Pass</span>
                        ) : (
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#FFEBEE", color: "#C62828" }}>✗ Fail</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notes + Certificate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h4 className="font-semibold text-gray-900 mb-3" style={{ fontSize: 14 }}>Inspector Notes</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{selected.notes}</p>
              </div>
              <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h4 className="font-semibold text-gray-900 mb-3" style={{ fontSize: 14 }}>Certificate</h4>
                {selected.certificate ? (
                  <div>
                    <div className="p-3 rounded-xl mb-3 flex items-center gap-3" style={{ background: "#E8F5E9" }}>
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-green-800">{selected.certificate}</span>
                    </div>
                    <button className="w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 flex items-center justify-center gap-2" style={{ background: "#2E7D32" }}>
                      <Download className="w-4 h-4" /> Download Certificate
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="p-3 rounded-xl mb-3 border-2 border-dashed border-gray-200 text-center">
                      <Upload className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                      <p className="text-xs text-gray-400">No certificate uploaded</p>
                    </div>
                    <button className="w-full py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4" /> Upload Certificate
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ background: "#2E7D32" }}>
                ✓ Approve
              </button>
              <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ background: "#E53935" }}>
                ✗ Reject
              </button>
              <button className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50">
                Request Retest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
