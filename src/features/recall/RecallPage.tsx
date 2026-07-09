import { useState } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, Bell, CheckCircle, Clock, Plus, X, Eye } from "lucide-react";
import { recalls } from "../../lib/data/mockData";

type Severity = "Critical" | "High" | "Medium" | "Low";
type RecallStatus = "Active" | "Resolved" | "Pending";

const severityConfig: Record<Severity, { bg: string; color: string }> = {
  Critical: { bg: "#FFEBEE", color: "#C62828" },
  High: { bg: "#FFF3E0", color: "#E65100" },
  Medium: { bg: "#FFF9C4", color: "#F57F17" },
  Low: { bg: "#E8F5E9", color: "#2E7D32" },
};

const statusConfig: Record<RecallStatus, { bg: string; color: string; icon: React.ElementType }> = {
  Active: { bg: "#FFEBEE", color: "#C62828", icon: AlertTriangle },
  Resolved: { bg: "#E8F5E9", color: "#2E7D32", icon: CheckCircle },
  Pending: { bg: "#FFF9C4", color: "#F57F17", icon: Clock },
};

export function RecallPage() {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ batchId: "", reason: "", severity: "High", notes: "" });

  const activeCount = recalls.filter((r) => r.status === "Active").length;
  const resolvedCount = recalls.filter((r) => r.status === "Resolved").length;
  const pendingCount = recalls.filter((r) => r.status === "Pending").length;

  return (
    <div className="pb-8">
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #B71C1C 0%, #E53935 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)" }} />
        <div className="relative z-10 px-8 py-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-white" style={{ fontSize: 24, fontWeight: 700 }}>Recall Management</h1>
              <p className="text-red-200 text-sm mt-1">Monitor and manage product safety recall incidents</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-700 transition-colors hover:opacity-90" style={{ background: "rgba(255,255,255,0.95)" }}>
              <Bell className="w-4 h-4" /> Notify Stakeholders
            </button>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}>
              <Plus className="w-4 h-4" /> Create Recall
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {[
            { label: "Active Recalls", count: activeCount, icon: AlertTriangle, bg: "#FFEBEE", color: "#C62828", desc: "Requiring immediate action" },
            { label: "Resolved Recalls", count: resolvedCount, icon: CheckCircle, bg: "#E8F5E9", color: "#2E7D32", desc: "Successfully closed" },
            { label: "Pending Review", count: pendingCount, icon: Clock, bg: "#FFF9C4", color: "#F57F17", desc: "Awaiting investigation" },
          ].map(({ label, count, icon: Icon, bg, color, desc }) => (
            <div key={label} className="bg-white rounded-2xl p-6 flex items-center gap-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                <Icon style={{ color, width: 24, height: 24 }} />
              </div>
              <div>
                <div style={{ fontSize: 30, fontWeight: 800, color }} className="leading-none">{count}</div>
                <div className="font-semibold text-gray-800 mt-1" style={{ fontSize: 14 }}>{label}</div>
                <div className="text-gray-400 text-xs">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {activeCount > 0 && (
          <div className="mb-5 p-5 rounded-2xl flex items-start gap-4" style={{ background: "#FFEBEE", border: "2px solid #FFCDD2" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#E53935" }}>
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-red-800 mb-1">🚨 Active Recall Alert — Immediate Action Required</div>
              <p className="text-red-700 text-sm leading-relaxed">
                Batch <strong>BTH-2024-006</strong> (Durian Monthong) has been recalled due to pesticide residue exceeding VFA limit.
                12 partner companies have been notified. Please remove affected products from shelves immediately.
              </p>
            </div>
            <button onClick={() => navigate("/app/batches/BTH-2024-006")} className="px-3 py-2 rounded-xl text-xs font-semibold text-white flex-shrink-0" style={{ background: "#E53935" }}>
              View Batch
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Recall Records</h3>
            <span className="text-sm text-gray-400">{recalls.length} total records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "#F8FAF8" }}>
                  {["Batch / Product", "Reason", "Severity", "Affected Companies", "Status", "Created Date", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recalls.map((recall) => {
                  const sev = severityConfig[recall.severity];
                  const sta = statusConfig[recall.status];
                  const StatusIcon = sta.icon;
                  return (
                    <tr key={recall.id} className="hover:bg-red-50/20 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900 text-sm">{recall.product}</div>
                        <code className="text-xs font-mono" style={{ color: "#E53935" }}>{recall.batchId}</code>
                        <div className="text-xs text-gray-400">{recall.id}</div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-700 max-w-xs leading-relaxed">{recall.reason}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: sev.bg, color: sev.color }}>
                          {recall.severity}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900" style={{ fontSize: 18 }}>{recall.affectedCompanies}</div>
                        <div className="text-xs text-gray-400">companies</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit" style={{ background: sta.bg, color: sta.color }}>
                          <StatusIcon style={{ width: 12, height: 12 }} /> {recall.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{recall.createdDate}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Eye className="w-4 h-4" /></button>
                          {recall.status === "Active" && (
                            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "#E8F5E9", color: "#2E7D32" }}>Close</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#FFEBEE" }}>
                  <AlertTriangle style={{ color: "#E53935", width: 18, height: 18 }} />
                </div>
                <h3 className="font-bold text-gray-900">Create Recall</h3>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Batch ID</label>
                <input value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })} placeholder="e.g. BTH-2024-006" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none" style={{ background: "#F8FAF8" }} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Recall Reason</label>
                <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Describe the recall reason" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none" style={{ background: "#F8FAF8" }} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Severity</label>
                <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white">
                  <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Additional Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Additional details..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none" style={{ background: "#F8FAF8" }} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ background: "#E53935" }}>Create Recall</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
