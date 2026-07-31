import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Plus, Hash, CheckCircle, MapPin, Thermometer, Droplets, ChevronDown, ChevronUp, X, AlertCircle, Search, Clock, LocateFixed, FileText,
} from "lucide-react";
import { useEvents, useCreateEvent, useEventTypes, useRecentBatches } from "./supply-chain.queries";
import type { CreateEventRequest, SupplyChainEvent } from "./supply-chain.api";
import { useAuth } from "../auth/auth.store";
import { canCreateEvent, getAllowedEventTypes } from "../auth/permissions";
import type { EventType } from "../auth/permissions";
import { QrScannerButton } from "./QrScannerButton";



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

function getInitialForm(allowed: EventType[]) {
  return {
    batchId: "",
    eventType: allowed.length > 0 ? allowed[0] : "HARVEST" as EventType,
    location: "",
    description: "",
  };
}

function parseEventData(eventData?: string): Record<string, unknown> {
  if (!eventData) return {};
  try {
    return JSON.parse(eventData) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function formatEventTime(eventTime?: string): { date: string; time: string } {
  if (!eventTime) return { date: "", time: "" };
  const parts = eventTime.split("T");
  const d = parts[0] ?? "";
  const t = parts[1]?.split(".")[0] ?? "";
  return { date: d, time: t };
}

export function SupplyChainPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const orgType = user?.organizationType;
  const allowedEventTypes = getAllowedEventTypes(orgType);
  const [form, setForm] = useState(getInitialForm(allowedEventTypes));
  const [error, setError] = useState("");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [activeBatchId, setActiveBatchId] = useState("");
  const [searchBatchId, setSearchBatchId] = useState("");
  const [locating, setLocating] = useState(false);

  const { data: events = [], isLoading: eventsLoading, refetch: refetchEvents } = useEvents(activeBatchId);
  const createEventMutation = useCreateEvent(activeBatchId || form.batchId);
  const { data: eventTypesLookup = [], isLoading: eventTypesLoading } = useEventTypes();
  const { data: recentBatches = [] } = useRecentBatches();


  const eventTypeGuidMap = new Map(
    eventTypesLookup.map((et) => [et.code.toUpperCase(), et.id])
  );

  const eventTypes = ALL_EVENT_TYPES.filter((et) => allowedEventTypes.includes(et.value));
  const canSubmit = canCreateEvent(orgType, form.eventType);

  const handleSearchBatch = () => {
    if (searchBatchId.trim()) {
      setActiveBatchId(searchBatchId.trim());
      setError("");
    }
  };

  const handleSelectBatch = (batchId: string) => {
    setSearchBatchId(batchId);
    setActiveBatchId(batchId);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setError("Your organization is not allowed to create this event type");
      return;
    }
    if (!form.batchId.trim()) {
      setError("Please enter or scan a Batch ID");
      return;
    }
    if (!form.location.trim() || !form.description.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    setError("");
    try {
      const eventTypeId = eventTypeGuidMap.get(form.eventType.toUpperCase());
      if (!eventTypeId) {
        setError("Event types data not loaded yet. Please try again.");
        return;
      }

      const payload: CreateEventRequest = {
        eventType: eventTypeId,
        location: form.location,
        description: form.description,
      };
      const result = await createEventMutation.mutateAsync(payload);
      setShowForm(false);
      setActiveBatchId(form.batchId);
      setForm(getInitialForm(allowedEventTypes));
      refetchEvents();
      toast.success("Event recorded to blockchain", {
        description: `Hash: ${result.currentHash?.slice(0, 20)}...`,
      });
    } catch (e: any) {
      const msg =
        e?.response?.data?.errors?.[0]?.message ||
        e?.response?.data?.message ||
        e?.message ||
        "An error occurred";
      setError(msg);
    }
  };

  const handleQrScan = (raw: string) => {
    const scanned = raw.includes("/") ? raw.split("/").pop() ?? raw : raw;
    setSearchBatchId(scanned);
    setActiveBatchId(scanned);
    setError("");
  };

  const handleQrScanModal = (raw: string) => {
    const scanned = raw.includes("/") ? raw.split("/").pop() ?? raw : raw;
    setForm({ ...form, batchId: scanned });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm({ ...form, location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` });
        setLocating(false);
      },
      () => {
        setError("Unable to retrieve location. Please enter manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
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
              <div className="font-bold text-white" style={{ fontSize: 20 }}>{events.filter((e) => e.currentHash).length}</div>
              <div className="text-green-200 text-xs">VERIFIED</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-10">
        {/* Actions bar */}
        <div className="bg-white rounded-2xl p-4 mb-5 flex flex-wrap items-center gap-3" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-700">Blockchain connected</span>
          </div>
          <button
            onClick={() => { setShowForm(true); setError(""); }}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ background: "#2E7D32" }}
          >
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>

        {/* Batch search */}
        <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Batch ID</label>
          <div className="flex gap-2">
            <input
              value={searchBatchId}
              onChange={(e) => setSearchBatchId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchBatch()}
              className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400"
              style={{ background: "#F8FAF8", maxWidth: 760 }}
              placeholder="Enter Batch ID to view timeline..."
            />
            <QrScannerButton onScan={handleQrScan} />
            <button
              onClick={handleSearchBatch}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: "#2E7D32" }}
            >
              <Search className="w-4 h-4" /> Search
            </button>
          </div>
        </div>

        {!activeBatchId ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Guide + Recent Batches */}
            <div className="lg:col-span-2 space-y-5">
              {/* Guide */}
              <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h4 className="font-semibold text-gray-900 mb-5" style={{ fontSize: 15 }}>How to view supply chain events</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { step: "1", icon: Search, label: "Enter Batch ID", desc: "Type a batch ID in the search field above, or scan a QR code" },
                    { step: "2", icon: Clock, label: "Select a Batch", desc: "Pick from your recent batches below or use the search results" },
                    { step: "3", icon: Hash, label: "Explore Timeline", desc: "View blockchain-secured events, verify hashes, and track history" },
                  ].map(({ step, icon: Icon, label, desc }) => (
                    <div key={step} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 p-4 rounded-xl" style={{ background: "#F8FAF8" }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0" style={{ background: "#2E7D32" }}>{step}</div>
                      <div className="sm:mt-1">
                        <div className="flex items-center sm:justify-center gap-1.5 font-semibold text-gray-800 text-sm">
                          <Icon className="w-3.5 h-3.5 text-green-600" />{label}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent batches as cards */}
              {recentBatches.length > 0 && (
                <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div className="flex items-center gap-1.5 mb-4">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">Recent Batches</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recentBatches.slice(0, 6).map((batch: any) => (
                      <button
                        key={batch.id}
                        onClick={() => handleSelectBatch(batch.id)}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-green-300 hover:bg-green-50/50 transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-white" style={{ background: "#2E7D32" }}>
                          {(batch.batchCode || batch.id).slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-800 truncate">{batch.batchCode || batch.id.slice(0, 10)}</div>
                          <div className="text-xs text-gray-500 truncate">{batch.productName || batch.product || ""}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right: Event Types */}
            <div>
              <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h4 className="font-semibold text-gray-900 mb-3" style={{ fontSize: 14 }}>Event Types</h4>
                <div className="space-y-2">
                  {eventTypes.map(({ value, label, emoji, color }) => (
                    <div key={value} className="flex items-center gap-2">
                      <span className="text-sm">{emoji}</span>
                      <span className="text-xs text-gray-600">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Recent batches + QR */}
            <div className="flex flex-col sm:flex-row gap-4 mb-5">
              {recentBatches.length > 0 && (
                <div className="flex-1 bg-white rounded-2xl p-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">Recent Batches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentBatches.slice(0, 5).map((batch: any) => (
                      <button
                        key={batch.id}
                        onClick={() => handleSelectBatch(batch.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                          activeBatchId === batch.id
                            ? "border-green-400 bg-green-50 text-green-700"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-green-300 hover:text-green-600"
                        }`}
                      >
                        <div className="w-5 h-5 rounded flex items-center justify-center font-bold text-white text-[10px] shrink-0" style={{ background: activeBatchId === batch.id ? "#2E7D32" : "#9CA3AF" }}>
                          {(batch.batchCode || batch.id).slice(0, 1).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[100px]">{batch.batchCode || batch.id.slice(0, 8)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Timeline */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Event Timeline</span>
                    <span className="text-sm text-gray-400">{events.length} events</span>
                  </div>

                  {eventsLoading ? (
                    <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading...</div>
                  ) : events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                      <Hash className="w-10 h-10 mb-3 opacity-30" />
                      <p className="text-sm">No events recorded for this batch</p>
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="relative">
                        <div className="absolute left-5 top-0 bottom-0 w-0.5" style={{ background: "#E8F5E9" }} />

                        <div className="space-y-4">
                          {events.map((event: SupplyChainEvent, idx: number) => {
                            const typeCode = event.eventTypeCode ?? "";
                            const cfg = getEventConfig(typeCode);
                            const isExpanded = expandedEvent === event.eventId;
                            const isLast = idx === events.length - 1;
                            const { date, time } = formatEventTime(event.eventTime);
                            const eventData = parseEventData(event.eventData);
                            const description = (eventData.description as string) ?? "";
                            const temperature = eventData.temperature as string | undefined;
                            const humidity = eventData.humidity as string | undefined;
                            const verified = !!event.currentHash;

                            return (
                              <div key={event.eventId} className="relative flex gap-4">
                                <div className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg ring-4 ring-white" style={{ background: "#E8F5E9" }}>
                                  {cfg.emoji}
                                </div>

                                <div className="flex-1 bg-gray-50 rounded-xl overflow-hidden" style={{ border: isLast ? `2px solid ${cfg.color}20` : "1px solid #F0F0F0" }}>
                                  <div
                                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => setExpandedEvent(isExpanded ? null : event.eventId)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                                      {verified && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                                      <span className="text-xs text-gray-400">{date} · {time}</span>
                                    </div>
                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                  </div>

                                  {isExpanded && (
                                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                                      <div className="flex items-start gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-700">{event.location}</p>
                                      </div>
                                      {description && (
                                        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                                      )}
                                      {(event.organizationName || event.performedByName) && (
                                        <div className="flex gap-4 text-xs text-gray-500">
                                          {event.organizationName && (
                                            <span>🏢 {event.organizationName}</span>
                                          )}
                                          {event.performedByName && (
                                            <span>👤 {event.performedByName}</span>
                                          )}
                                        </div>
                                      )}
                                      {event.inspectionId && (
                                        <button
                                          onClick={() => navigate(`/app/inspections/${event.inspectionId}`)}
                                          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition-colors"
                                          style={{ background: "#E8F5E9" }}
                                        >
                                          <FileText className="w-3.5 h-3.5" />
                                          View Inspection
                                        </button>
                                      )}
                                      {(temperature || humidity) && (
                                        <div className="flex gap-4">
                                          {temperature && (
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                              <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                                              {temperature}
                                            </div>
                                          )}
                                          {humidity && (
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                              <Droplets className="w-3.5 h-3.5 text-blue-400" />
                                              {humidity}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      {event.currentHash && (
                                        <div className="p-2.5 rounded-lg" style={{ background: "#F0F4F0" }}>
                                          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Hash className="w-3 h-3" /> Hash</p>
                                          <code className="text-xs text-gray-600 break-all">{event.currentHash}</code>
                                        </div>
                                      )}
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

              {/* Event types legend */}
              <div className="space-y-5">
                <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <h4 className="font-semibold text-gray-900 mb-3" style={{ fontSize: 14 }}>Event Types</h4>
                  <div className="space-y-2">
                    {eventTypes.map(({ value, label, emoji, color }) => {
                      const count = events.filter((e: SupplyChainEvent) => e.eventTypeCode === value).length;
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
          </>
        )}
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
                  <p className="text-xs text-red-500 mt-2">Your organization is not allowed to create this event type</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Batch ID <span className="text-red-400">*</span></label>
                  <div className="flex gap-2">
                    <input
                      value={form.batchId}
                      onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400"
                      style={{ background: "#F8FAF8" }}
                      placeholder="Enter or scan batch ID"
                    />
                    <QrScannerButton onScan={handleQrScanModal} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block"><MapPin className="w-3.5 h-3.5 inline mr-1" />Location <span className="text-red-400">*</span></label>
                  <div className="flex gap-2">
                    <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400" style={{ background: "#F8FAF8" }} placeholder="Address or location" />
                    <button type="button" onClick={handleGetLocation} disabled={locating} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-green-400 transition-colors disabled:opacity-50" title="Lấy vị trí hiện tại">
                      <LocateFixed className={`w-4 h-4 ${locating ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description <span className="text-red-400">*</span></label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none focus:border-green-400" style={{ background: "#F8FAF8" }} placeholder="Describe what happened at this stage..." />
                </div>
              </div>

              {error && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={createEventMutation.isPending || !canSubmit || eventTypesLoading} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2" style={{ background: "#2E7D32" }}>
                  {createEventMutation.isPending ? "Saving..." : <><Hash className="w-4 h-4" /> Save to Blockchain</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}