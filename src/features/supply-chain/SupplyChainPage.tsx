import { useState, useEffect } from "react";
import { Plus, Hash, CheckCircle, Camera, FileText, MapPin, Thermometer, Droplets, ChevronDown, ChevronUp, X, AlertCircle } from "lucide-react";
import { supplyChainApi, SupplyChainEvent } from "./supply-chain.api";
import { useAuth } from "../auth/auth.store";
import { canCreateEvent, getAllowedEventTypes } from "../auth/permissions";
import type { EventType } from "../auth/permissions";

const batches = [
  { id: "BTH-2024-001", product: "Organic Dragon Fruit", farm: "Binh Thuan Dragon Fruit Farm", farmer: "Trần Văn Bình", status: "At Retail", weight: "2,400 kg" },
  { id: "BTH-2024-002", product: "Premium Jasmine Rice", farm: "Mekong Delta Rice Cooperative", farmer: "Nguyễn Thị Mai", status: "Distributed", weight: "5,000 kg" },
  { id: "BTH-2024-003", product: "Robusta Coffee", farm: "Dak Lak Highland Coffee Estate", farmer: "Lê Minh Tuấn", status: "Processing", weight: "800 kg" },
  { id: "BTH-2024-004", product: "Longan Fruit", farm: "Hung Yen Longan Cooperative", farmer: "Phạm Thị Hoa", status: "In Transit", weight: "1,200 kg" },
  { id: "BTH-2024-005", product: "Bitter Melon", farm: "Da Lat Vegetable Farm", farmer: "Đặng Văn Hùng", status: "Packaged", weight: "600 kg" },
];

const ALL_EVENT_TYPES: { value: EventType; label: string; emoji: string; color: string }[] = [
  { value: "HARVEST", label: "Harvest", emoji: "🌾", color: "#2E7D32" },
  { value: "RECEIVE", label: "Receive", emoji: "📥", color: "#1565C0" },
  { value: "PROCESSING", label: "Processing", emoji: "⚙️", color: "#1565C0" },
  { value: "PACKAGING", label: "Packaging", emoji: "📦", color: "#6A1B9A" },
  { value: "TRANSPORT", label: "Transport", emoji: "🚚", color: "#E65100" },
  { value: "DISTRIBUTION", label: "Distribution", emoji: "🏭", color: "#004D40" },
  { value: "RETAIL", label: "Retail", emoji: "🏪", color: "#F57F17" },
  { value: "INSPECTION", label: "Inspection", emoji: "✅", color: "#558B2F" },
  { value: "RECALL", label: "Recall", emoji: "⚠️", color: "#C62828" },
  { value: "SPLIT", label: "Split", emoji: "✂️", color: "#6A1B9A" },
  { value: "MERGE", label: "Merge", emoji: "🔗", color: "#004D40" },
];

const EMPTY_FORM = {
  batchId: "BTH-2024-001",
  eventType: "HARVEST" as EventType,
  organization: "",
  location: "",
  gps: "",
  employee: "",
  description: "",
  temperature: "",
  humidity: "",
  date: new Date().toISOString().split("T")[0],
  splitQuantities: "",
  mergeSourceBatches: "",
};

export function SupplyChainPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<SupplyChainEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState("BTH-2024-001");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [successEvent, setSuccessEvent] = useState<SupplyChainEvent | null>(null);

  const orgType = user?.organizationType;
  const allowedEventTypes = getAllowedEventTypes(orgType);
  const eventTypes = ALL_EVENT_TYPES.filter((et) => allowedEventTypes.includes(et.value));
  const canSubmit = canCreateEvent(orgType, form.eventType);

  const loadEvents = async (batchId: string) => {
    setLoading(true);
    try {
      const data = await supplyChainApi.getEvents(batchId);
      setEvents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEvents(selectedBatch); }, [selectedBatch]);

  const handleBatchChange = (batchId: string) => {
    setSelectedBatch(batchId);
    setForm({ ...EMPTY_FORM, batchId });
    setSuccessEvent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setError("Tổ chức của bạn không có quyền tạo sự kiện này");
      return;
    }
    if (!form.organization.trim() || !form.location.trim() || !form.employee.trim() || !form.description.trim()) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const newEvent = await supplyChainApi.createEvent(form.batchId, form);
      setEvents((prev) => [...prev, newEvent]);
      setSuccessEvent(newEvent);
      setShowForm(false);
      setForm({ ...EMPTY_FORM, batchId: selectedBatch });
    } catch (e: any) {
      setError(e.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const getEventConfig = (type: string) => ALL_EVENT_TYPES.find((e) => e.value === type) || { emoji: "📋", label: type, color: "#666" };

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="relative h-36 overflow-hidden" style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #66BB6A 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10 h-full flex items-center px-8 justify-between">
          <div>
            <h1 className="text-white" style={{ fontSize: 24, fontWeight: 700 }}>Supply Chain Events</h1>
            <p className="text-green-100 text-sm mt-1">Track and record blockchain-secured supply chain events</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="font-bold text-white" style={{ fontSize: 20 }}>{events.length}</div>
              <div className="text-green-200 text-xs">EVENTS</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-white" style={{ fontSize: 20 }}>{events.filter((e) => e.verified).length}</div>
              <div className="text-green-200 text-xs">VERIFIED</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-10">
        {/* Batch selector + Add button */}
        <div className="bg-white rounded-2xl p-4 mb-5 flex flex-wrap items-center gap-3" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex-1 min-w-48">
            <label className="text-xs font-medium text-gray-500 mb-1 block">Select Batch</label>
            <select
              value={selectedBatch}
              onChange={(e) => handleBatchChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none bg-white"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.id} — {b.product}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-700">Blockchain connected</span>
          </div>
          <button
            onClick={() => { setShowForm(true); setSuccessEvent(null); setError(""); }}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ background: "#2E7D32" }}
          >
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>

        {/* Success banner */}
        {successEvent && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">Event recorded to blockchain!</p>
              <p className="text-xs text-green-600 mt-0.5">Hash: <code className="break-all">{successEvent.currentHash}</code></p>
            </div>
            <button onClick={() => setSuccessEvent(null)}><X className="w-4 h-4 text-green-400" /></button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Event Timeline</span>
                <span className="text-sm text-gray-400">{events.length} events</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading...</div>
              ) : events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Hash className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">No events recorded for this batch</p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-5 top-0 bottom-0 w-0.5" style={{ background: "#E8F5E9" }} />

                    <div className="space-y-4">
                      {events.map((event, idx) => {
                        const cfg = getEventConfig(event.eventType);
                        const isExpanded = expandedEvent === event.eventId;
                        const isLast = idx === events.length - 1;
                        return (
                          <div key={event.eventId} className="relative flex gap-4">
                            {/* Icon */}
                            <div className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg ring-4 ring-white" style={{ background: "#E8F5E9" }}>
                              {cfg.emoji}
                            </div>

                            {/* Card */}
                            <div className="flex-1 bg-gray-50 rounded-xl overflow-hidden" style={{ border: isLast ? `2px solid ${cfg.color}20` : "1px solid #F0F0F0" }}>
                              <div
                                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => setExpandedEvent(isExpanded ? null : event.eventId)}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                                  {event.verified && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                                  <span className="text-xs text-gray-400">{event.date} · {event.time}</span>
                                </div>
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                              </div>

                              {isExpanded && (
                                <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                                  <div className="grid grid-cols-2 gap-3 mt-3">
                                    {[
                                      { label: "Organization", value: event.organization },
                                      { label: "Employee", value: event.employee },
                                    ].map(({ label, value }) => (
                                      <div key={label}>
                                        <p className="text-xs text-gray-400">{label}</p>
                                        <p className="text-sm font-medium text-gray-800">{value}</p>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="flex items-start gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-gray-700">{event.location}</p>
                                  </div>
                                  <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
                                  {(event.temperature || event.humidity) && (
                                    <div className="flex gap-4">
                                      {event.temperature && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                          <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                                          {event.temperature}
                                        </div>
                                      )}
                                      {event.humidity && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                          <Droplets className="w-3.5 h-3.5 text-blue-400" />
                                          {event.humidity}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  <div className="p-2.5 rounded-lg" style={{ background: "#F0F4F0" }}>
                                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Hash className="w-3 h-3" /> Hash</p>
                                    <code className="text-xs text-gray-600 break-all">{event.currentHash}</code>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-5">
            {/* Batch info */}
            {(() => {
              const batch = batches.find((b) => b.id === selectedBatch);
              return batch ? (
                <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <h4 className="font-semibold text-gray-900 mb-3" style={{ fontSize: 14 }}>Batch Info</h4>
                  {[
                    { label: "Batch ID", value: batch.id },
                    { label: "Product", value: batch.product },
                    { label: "Farm", value: batch.farm },
                    { label: "Status", value: batch.status },
                    { label: "Quantity", value: batch.weight },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-xs text-gray-400">{label}</span>
                      <span className="text-xs font-medium text-gray-800 text-right max-w-32 truncate">{value}</span>
                    </div>
                  ))}
                </div>
              ) : null;
            })()}

            {/* Event types legend */}
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h4 className="font-semibold text-gray-900 mb-3" style={{ fontSize: 14 }}>Event Types</h4>
              <div className="space-y-2">
                {eventTypes.map(({ value, label, emoji, color }) => {
                  const count = events.filter((e) => e.eventType === value).length;
                  return (
                    <div key={value} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{emoji}</span>
                        <span className="text-xs text-gray-600">{label}</span>
                      </div>
                      {count > 0 && <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{count}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-gray-900">Add Supply Chain Event</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Event type selector */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Event Type</label>
                <div className="flex flex-wrap gap-2">
                  {eventTypes.map(({ value, label, emoji, color }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, eventType: value })}
                      className="px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5"
                      style={form.eventType === value ? { background: color, color: "#fff" } : { background: "#F5F5F5", color: "#555" }}
                    >
                      {emoji} {label}
                    </button>
                  ))}
                </div>
                {!canSubmit && (
                  <p className="text-xs text-red-500 mt-2">Tổ chức của bạn không có quyền tạo sự kiện này</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Batch ID</label>
                  <select value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white">
                    {batches.map((b) => <option key={b.id} value={b.id}>{b.id}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Organization <span className="text-red-400">*</span></label>
                  <input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400" style={{ background: "#F8FAF8" }} placeholder="Company name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Employee <span className="text-red-400">*</span></label>
                  <input value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400" style={{ background: "#F8FAF8" }} placeholder="Full name" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block"><MapPin className="w-3.5 h-3.5 inline mr-1" />Location <span className="text-red-400">*</span></label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400" style={{ background: "#F8FAF8" }} placeholder="Address or location" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block"><Thermometer className="w-3.5 h-3.5 inline mr-1" />Temperature (°C)</label>
                  <input type="number" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400" style={{ background: "#F8FAF8" }} placeholder="e.g. 18" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block"><Droplets className="w-3.5 h-3.5 inline mr-1" />Humidity (%)</label>
                  <input type="number" value={form.humidity} onChange={(e) => setForm({ ...form, humidity: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400" style={{ background: "#F8FAF8" }} placeholder="e.g. 75" />
                </div>

                {form.eventType === "SPLIT" && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nhập số lượng tách cho từng lô con</label>
                    <input value={form.splitQuantities} onChange={(e) => setForm({ ...form, splitQuantities: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400" style={{ background: "#F8FAF8" }} placeholder="e.g. 500kg, 300kg, 200kg" />
                  </div>
                )}

                {form.eventType === "MERGE" && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Chọn các lô nguồn để gộp</label>
                    <input value={form.mergeSourceBatches} onChange={(e) => setForm({ ...form, mergeSourceBatches: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400" style={{ background: "#F8FAF8" }} placeholder="e.g. BTH-2024-001, BTH-2024-003" />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description <span className="text-red-400">*</span></label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none focus:border-green-400" style={{ background: "#F8FAF8" }} placeholder="Describe what happened at this stage..." />
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  {[
                    { label: "Upload Photos", icon: Camera, hint: "PNG, JPG up to 10MB" },
                    { label: "Upload Documents", icon: FileText, hint: "PDF, DOC up to 20MB" },
                  ].map(({ label, icon: Icon, hint }) => (
                    <div key={label}>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-green-400 transition-colors" style={{ background: "#F8FAF8" }}>
                        <Icon className="w-5 h-5 text-gray-300 mx-auto mb-1" />
                        <p className="text-xs text-gray-400">{hint}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving || !canSubmit} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2" style={{ background: "#2E7D32" }}>
                  {saving ? "Saving..." : <><Hash className="w-4 h-4" /> Save to Blockchain</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
