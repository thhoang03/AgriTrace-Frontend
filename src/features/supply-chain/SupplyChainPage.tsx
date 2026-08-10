import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus, Hash, CheckCircle, MapPin, Thermometer, Droplets, ChevronDown, ChevronUp, X, AlertCircle, Search, Clock, LocateFixed, FileText, Globe,
} from "lucide-react";
import { useEvents, useCreateEvent, useEventTypes, useRecentBatches } from "./supply-chain.queries";
import { useEventRequests, useApprovedExtraEvents } from "../event-requests/event-requests.queries";
import { supplyChainApi, type CreateEventRequest, type SupplyChainEvent } from "./supply-chain.api";
import { useAuth } from "../auth/auth.store";
import { canCreateEvent, getAllowedEventTypes } from "../auth/permissions";
import type { EventType } from "../auth/permissions";
import { QrScannerButton } from "./QrScannerButton";
import { fetchDeviceLocation } from "../../utils/locationUtils";
import { MapPickerModal } from "../../components/common/MapPickerModal";
import { useLanguage } from "../../contexts/LanguageContext";
import { batchesApi } from "../batches/batches.api";



const ALL_EVENT_TYPES: { value: EventType; label: {en: string, vi: string}; emoji: string; color: string }[] = [
  { value: "CREATED", label: {en: "Created", vi: "Đã tạo"}, emoji: "🌱", color: "#2E7D32" },
  { value: "HARVEST", label: {en: "Harvest", vi: "Thu hoạch"}, emoji: "🌾", color: "#2E7D32" },
  { value: "RECEIVE", label: {en: "Receive", vi: "Tiếp nhận"}, emoji: "📥", color: "#1565C0" },
  { value: "PROCESSING", label: {en: "Processing", vi: "Chế biến"}, emoji: "⚙️", color: "#1565C0" },
  { value: "PACKAGING", label: {en: "Packaging", vi: "Đóng gói"}, emoji: "📦", color: "#6A1B9A" },
  { value: "TRANSPORT", label: {en: "Transport", vi: "Vận chuyển"}, emoji: "🚚", color: "#E65100" },
  { value: "DISTRIBUTION", label: {en: "Distribution", vi: "Phân phối"}, emoji: "🏭", color: "#004D40" },
  { value: "RETAIL", label: {en: "Retail", vi: "Bán lẻ"}, emoji: "🏪", color: "#F57F17" },
  { value: "INSPECTION", label: {en: "Inspection", vi: "Kiểm định"}, emoji: "✅", color: "#558B2F" },
  { value: "RECALL", label: {en: "Recall", vi: "Thu hồi"}, emoji: "⚠️", color: "#C62828" },
  { value: "SPLIT", label: {en: "Split", vi: "Tách lô"}, emoji: "✂️", color: "#6A1B9A" },
  { value: "MERGE", label: {en: "Merge", vi: "Gộp lô"}, emoji: "🔗", color: "#004D40" },
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
  const { lang } = useLanguage();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const orgType = user?.organizationType;
  const approvedExtraEvents = useApprovedExtraEvents();
  const allowedEventTypes = getAllowedEventTypes(orgType, user?.role, approvedExtraEvents);
  const [form, setForm] = useState(getInitialForm(allowedEventTypes));

  useEffect(() => {
    if (allowedEventTypes.length > 0 && !allowedEventTypes.includes(form.eventType)) {
      setForm((prev) => ({ ...prev, eventType: allowedEventTypes[0] }));
    }
  }, [allowedEventTypes, form.eventType]);

  const [error, setError] = useState("");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [activeBatchId, setActiveBatchId] = useState("");
  const [searchBatchId, setSearchBatchId] = useState("");
  const [locating, setLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: events = [], isLoading: eventsLoading, refetch: refetchEvents } = useEvents(activeBatchId);
  const createEventMutation = useCreateEvent(activeBatchId || form.batchId);
  const { data: eventTypesLookup = [], isLoading: eventTypesLoading } = useEventTypes();
  const { data: recentBatches = [] } = useRecentBatches();

  useEffect(() => {
    if (!activeBatchId && recentBatches.length > 0) {
      const firstBatch = recentBatches[0];
      const actualId = firstBatch?.id || firstBatch?.batchCode || "";
      const displayCode = firstBatch?.batchCode || firstBatch?.id || "";
      if (actualId) {
        setActiveBatchId(actualId);
        setSearchBatchId(displayCode);
      }
    }
  }, [recentBatches, activeBatchId]);


  const eventTypeGuidMap = new Map(
    eventTypesLookup.map((et) => [et.code.toUpperCase(), et.id])
  );

  const eventTypes = ALL_EVENT_TYPES.filter((et) => allowedEventTypes.includes(et.value));
  const canSubmit = canCreateEvent(orgType, form.eventType, user?.role, approvedExtraEvents);

  const handleSearchBatch = async () => {
    if (!searchBatchId.trim()) return;
    const q = searchBatchId.trim();

    const localMatch = recentBatches.find(
      (b) => b.id.toLowerCase() === q.toLowerCase() || b.batchCode?.toLowerCase() === q.toLowerCase()
    );
    if (localMatch) {
      setActiveBatchId(localMatch.id);
      setError("");
      return;
    }

    try {
      const res = await batchesApi.getAll({ search: q, limit: 1 });
      if (res.data && res.data.length > 0) {
        setActiveBatchId(res.data[0].id);
        setError("");
      } else {
        try {
          const byIdRes = await batchesApi.getById(q);
          if (byIdRes.data && byIdRes.data.id) {
            setActiveBatchId(byIdRes.data.id);
            setError("");
          } else {
            setActiveBatchId(q);
          }
        } catch {
          setActiveBatchId(q);
        }
      }
    } catch {
      setActiveBatchId(q);
    }
  };

  const handleSelectBatch = (batchId: string, displayCode?: string) => {
    setSearchBatchId(displayCode || batchId);
    setActiveBatchId(batchId);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (isSubmitting) return;
    e.preventDefault();
    if (!canSubmit) {
      setError("Your organization is not allowed to create this event type");
      return;
    }
    if (!form.batchId.trim()) {
      setError("Please enter or scan a Batch Code");
      return;
    }
    if (!form.location.trim() || !form.description.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const eventTypeId = eventTypeGuidMap.get(form.eventType.toUpperCase());
      if (!eventTypeId) {
        setError("Event types data not loaded yet. Please try again.");
        return;
      }

      // Resolve actual GUID batchId from user's input batchCode / GUID
      let targetBatchId = form.batchId.trim();
      const localMatch = recentBatches.find(
        (b) => b.batchCode?.toLowerCase() === targetBatchId.toLowerCase() || b.id.toLowerCase() === targetBatchId.toLowerCase()
      );
      if (localMatch) {
        targetBatchId = localMatch.id;
      } else {
        try {
          const res = await batchesApi.getAll({ search: targetBatchId, limit: 1 });
          if (res.data && res.data.length > 0) {
            targetBatchId = res.data[0].id;
          } else {
            try {
              const byIdRes = await batchesApi.getById(targetBatchId);
              if (byIdRes.data?.id) {
                targetBatchId = byIdRes.data.id;
              }
            } catch {
              // Fallback to public trace API to resolve globally
              try {
                const { get } = await import("../../lib/api");
                const publicRes = await get<any>(`/public/trace/code/${targetBatchId}`);
                if (publicRes.data && publicRes.data.batchId) {
                  targetBatchId = publicRes.data.batchId;
                }
              } catch {
                // Ignore
              }
            }
          }
        } catch {
          // fallback to targetBatchId as is
        }
      }

      const payload: CreateEventRequest = {
        eventType: eventTypeId,
        location: form.location,
        description: form.description,
      };

      const result = await supplyChainApi.createEvent(targetBatchId, payload);
      setShowForm(false);
      setActiveBatchId(targetBatchId);
      setForm(getInitialForm(allowedEventTypes));
      refetchEvents();
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["supply-chain"] });
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQrScan = async (raw: string) => {
    const scanned = raw.includes("/") ? raw.split("/").pop() ?? raw : raw;
    setSearchBatchId(scanned);
    
    const localMatch = recentBatches.find(
      (b) => b.id.toLowerCase() === scanned.toLowerCase() || b.batchCode?.toLowerCase() === scanned.toLowerCase()
    );
    if (localMatch) {
      setActiveBatchId(localMatch.id);
      setError("");
      return;
    }

    try {
      const res = await batchesApi.getAll({ search: scanned, limit: 1 });
      if (res.data && res.data.length > 0) {
        setActiveBatchId(res.data[0].id);
      } else {
        try {
          const byIdRes = await batchesApi.getById(scanned);
          if (byIdRes.data && byIdRes.data.id) {
            setActiveBatchId(byIdRes.data.id);
          } else {
            throw new Error("Not found by ID");
          }
        } catch {
          // Fallback to public trace API to resolve globally
          try {
            const { get } = await import("../../lib/api");
            const publicRes = await get<any>(`/public/trace/code/${scanned}`);
            if (publicRes.data && publicRes.data.batchId) {
              setActiveBatchId(publicRes.data.batchId);
            } else {
              setActiveBatchId(scanned);
            }
          } catch {
            setActiveBatchId(scanned);
          }
        }
      }
    } catch {
      setActiveBatchId(scanned);
    }
    setError("");
  };

  const handleQrScanModal = (raw: string) => {
    const scanned = raw.includes("/") ? raw.split("/").pop() ?? raw : raw;
    setForm({ ...form, batchId: scanned });
  };

  const handleGetLocation = async () => {
    setLocating(true);
    try {
      const res = await fetchDeviceLocation();
      setForm((prev) => ({ ...prev, location: res.locationString }));
    } catch (err: any) {
      setError(err.message || "Unable to retrieve device location.");
    } finally {
      setLocating(false);
    }
  };

  const getEventConfig = (type: string) => ALL_EVENT_TYPES.find((e) => e.value === type) || { emoji: "📋", label: {en: type, vi: type}, color: "#666" };

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="relative h-36 overflow-hidden" style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #66BB6A 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10 h-full flex items-center px-8 justify-between">
          <div>
            <h1 className="text-white" style={{ fontSize: 24, fontWeight: 700 }}>{lang === "vi" ? "Sự Kiện Chuỗi Cung Ứng" : "Supply Chain Events"}</h1>
            <p className="text-green-100 text-sm mt-1">{lang === "vi" ? "Theo dõi và ghi nhận các sự kiện chuỗi cung ứng được bảo mật bằng Blockchain" : "Track and record blockchain-secured supply chain events"}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="font-bold text-white" style={{ fontSize: 20 }}>{events.length}</div>
              <div className="text-green-200 text-xs">{lang === "vi" ? "SỰ KIỆN" : "EVENTS"}</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-white" style={{ fontSize: 20 }}>{events.filter((e) => e.currentHash).length}</div>
              <div className="text-green-200 text-xs">{lang === "vi" ? "XÁC THỰC" : "VERIFIED"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-10">
        {/* Actions bar */}
        <div className="bg-card rounded-2xl p-4 mb-5 flex flex-wrap items-center gap-3" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-700">{lang === "vi" ? "Đã kết nối Blockchain" : "Blockchain connected"}</span>
          </div>
          <button
            onClick={() => {
              const currentMatch = recentBatches.find(
                (b) => b.id.toLowerCase() === activeBatchId.toLowerCase() || b.batchCode?.toLowerCase() === searchBatchId.toLowerCase()
              );
              const codeToDisplay = currentMatch?.batchCode || (searchBatchId && !searchBatchId.includes("-") ? searchBatchId : currentMatch?.batchCode || activeBatchId);
              setForm((prev) => ({ ...prev, batchId: codeToDisplay }));
              setShowForm(true);
              setError("");
            }}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ background: "#2E7D32" }}
          >
            <Plus className="w-4 h-4" /> {lang === "vi" ? "Thêm Sự Kiện" : "Add Event"}
          </button>
        </div>

        {/* Batch search */}
        <div className="bg-card rounded-2xl p-5 mb-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {lang === "vi" ? "Mã Lô Hàng (Batch Code)" : "Batch Code"}
          </label>
          <div className="flex gap-2">
            <input
              value={searchBatchId}
              onChange={(e) => setSearchBatchId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchBatch()}
              className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm outline-none focus:border-green-400"
              style={{ maxWidth: 760 }}
              placeholder={lang === "vi" ? "Nhập Mã Lô Hàng (Batch Code) để xem hành trình..." : "Enter Batch Code to view timeline..."}
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
              <div className="bg-card rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h4 className="font-semibold text-foreground mb-5" style={{ fontSize: 15 }}>{lang === "vi" ? "Cách xem sự kiện chuỗi cung ứng" : "How to view supply chain events"}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { step: "1", icon: Search, label: lang === "vi" ? "Nhập Mã Lô" : "Enter Batch ID", desc: lang === "vi" ? "Nhập mã lô vào ô tìm kiếm hoặc quét QR" : "Type a batch ID in the search field above, or scan a QR code" },
                    { step: "2", icon: Clock, label: lang === "vi" ? "Chọn Lô Hàng" : "Select a Batch", desc: lang === "vi" ? "Chọn từ lô gần đây hoặc kết quả tìm kiếm" : "Pick from your recent batches below or use the search results" },
                    { step: "3", icon: Hash, label: lang === "vi" ? "Khám Phá Hành Trình" : "Explore Timeline", desc: lang === "vi" ? "Xem các sự kiện được bảo mật bằng blockchain" : "View blockchain-secured events, verify hashes, and track history" },
                  ].map(({ step, icon: Icon, label, desc }) => (
                    <div key={step} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 p-4 rounded-xl bg-muted">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0" style={{ background: "#2E7D32" }}>{step}</div>
                      <div className="sm:mt-1">
                        <div className="flex items-center sm:justify-center gap-1.5 font-semibold text-foreground text-sm">
                          <Icon className="w-3.5 h-3.5 text-green-600" />{label}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent batches as cards */}
              {recentBatches.length > 0 && (
                <div className="bg-card rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div className="flex items-center gap-1.5 mb-4">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">{lang === "vi" ? "Lô Hàng Gần Đây" : "Recent Batches"}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recentBatches.slice(0, 6).map((batch: any) => (
                      <button
                        key={batch.id}
                        onClick={() => handleSelectBatch(batch.id, batch.batchCode || batch.id)}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-green-300 hover:bg-green-50/50 transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-white" style={{ background: "#2E7D32" }}>
                          {(batch.batchCode || batch.id).slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground truncate">{batch.batchCode || batch.id.slice(0, 10)}</div>
                          <div className="text-xs text-muted-foreground truncate">{batch.productName || batch.product || ""}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right: Event Types */}
            <div>
              <div className="bg-card rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h4 className="font-semibold text-foreground mb-3" style={{ fontSize: 14 }}>{lang === "vi" ? "Loại Sự Kiện" : "Event Types"}</h4>
                <div className="space-y-2">
                  {eventTypes.map(({ value, label, emoji, color }) => (
                    <div key={value} className="flex items-center gap-2">
                      <span className="text-sm">{emoji}</span>
                      <span className="text-xs text-muted-foreground">{lang === "vi" ? label.vi : label.en}</span>
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
                <div className="flex-1 bg-card rounded-2xl p-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">{lang === "vi" ? "Lô Hàng Gần Đây" : "Recent Batches"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentBatches.slice(0, 5).map((batch: any) => (
                      <button
                        key={batch.id}
                        onClick={() => handleSelectBatch(batch.id, batch.batchCode || batch.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                          activeBatchId === batch.id
                            ? "border-green-400 bg-green-50 text-green-700"
                            : "border-border bg-muted text-muted-foreground hover:border-green-300 hover:text-green-600"
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
                <div className="bg-card rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <span className="font-semibold text-foreground" style={{ fontSize: 15 }}>{lang === "vi" ? "Hành Trình Sự Kiện" : "Event Timeline"}</span>
                    <span className="text-sm text-muted-foreground">{events.length} {lang === "vi" ? "sự kiện" : "events"}</span>
                  </div>

                  {eventsLoading ? (
                    <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">{lang === "vi" ? "Đang tải..." : "Loading..."}</div>
                  ) : events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <Hash className="w-10 h-10 mb-3 opacity-30" />
                      <p className="text-sm">{lang === "vi" ? "Chưa có sự kiện nào được ghi nhận cho lô hàng này" : "No events recorded for this batch"}</p>
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="relative">
                        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-primary/10" />

                        <div className="space-y-4">
                          {events.map((event: SupplyChainEvent, idx: number) => {
                            const typeCode = event.eventTypeCode ?? "";
                            const cfg = getEventConfig(typeCode);
                            const isExpanded = expandedEvent === event.eventId;
                            const isLast = idx === events.length - 1;
                            const { date, time } = formatEventTime(event.eventTime);
                            const eventData = parseEventData(event.eventData);
                            
                            let description = (eventData.description as string) ?? "";
                            if (!description && eventData.action) {
                              if (eventData.action === "created") {
                                description = lang === "vi" ? "Khởi tạo phiếu kiểm định chất lượng" : "Quality inspection created";
                              } else if (eventData.action === "concluded") {
                                const res = eventData.overallResult ? ` (${eventData.overallResult})` : "";
                                description = lang === "vi" ? `Kết luận nghiệm thu kiểm định${res}` : `Quality inspection concluded${res}`;
                              }
                            } else if (!description && typeof event.eventData === "string" && event.eventData.trim()) {
                              if (event.eventData.startsWith("{")) {
                                try {
                                  const parsed = JSON.parse(event.eventData);
                                  const parts = Object.entries(parsed)
                                    .filter(([k]) => k !== "inspectionId")
                                    .map(([k, v]) => `${k}: ${v}`);
                                  description = parts.join(" | ");
                                } catch {
                                  description = event.eventData;
                                }
                              } else {
                                description = event.eventData;
                              }
                            }

                            const temperature = eventData.temperature as string | undefined;
                            const humidity = eventData.humidity as string | undefined;
                            const verified = !!event.currentHash;

                            // Custom sub-label for inspection action
                            let eventLabel = lang === "vi" ? cfg.label.vi : cfg.label.en;
                            if (typeCode === "INSPECTION" && eventData.action) {
                              if (eventData.action === "created") {
                                eventLabel += lang === "vi" ? " (Khởi tạo)" : " (Created)";
                              } else if (eventData.action === "concluded") {
                                eventLabel += lang === "vi" ? " (Kết luận)" : " (Concluded)";
                              }
                            }

                            return (
                              <div key={event.eventId} className="relative flex gap-4">
                                <div className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg ring-4 ring-white bg-primary/10">
                                  {cfg.emoji}
                                </div>

                                <div className="flex-1 bg-muted rounded-xl overflow-hidden" style={{ border: isLast ? `2px solid ${cfg.color}20` : "1px solid #F0F0F0" }}>
                                  <div
                                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted transition-colors"
                                    onClick={() => setExpandedEvent(isExpanded ? null : event.eventId)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm font-semibold" style={{ color: cfg.color }}>{eventLabel}</span>
                                      {verified && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                                      <span className="text-xs text-muted-foreground">{date} · {time}</span>
                                    </div>
                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                  </div>

                                  {isExpanded && (
                                    <div className="px-4 pb-4 space-y-3 border-t border-border">
                                      <div className="flex items-start gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-foreground">{event.location}</p>
                                      </div>
                                      {description && (
                                        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                                      )}
                                      {(event.organizationName || event.performedByName) && (
                                        <div className="flex gap-4 text-xs text-muted-foreground">
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
                                          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition-colors bg-primary/10"
                                        >
                                          <FileText className="w-3.5 h-3.5" />
                                          {lang === "vi" ? "Xem Kiểm Định" : "View Inspection"}
                                        </button>
                                      )}
                                      {(temperature || humidity) && (
                                        <div className="flex gap-4">
                                          {temperature && (
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                              <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                                              {temperature}
                                            </div>
                                          )}
                                          {humidity && (
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                              <Droplets className="w-3.5 h-3.5 text-blue-400" />
                                              {humidity}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      {event.currentHash && (
                                        <div className="p-2.5 rounded-lg bg-muted">
                                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Hash className="w-3 h-3" /> Hash</p>
                                          <code className="text-xs text-muted-foreground break-all">{event.currentHash}</code>
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
                <div className="bg-card rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <h4 className="font-semibold text-foreground mb-3" style={{ fontSize: 14 }}>{lang === "vi" ? "Loại Sự Kiện" : "Event Types"}</h4>
                  <div className="space-y-2">
                    {eventTypes.map(({ value, label, emoji, color }) => {
                      const count = events.filter((e: SupplyChainEvent) => e.eventTypeCode === value).length;
                      return (
                        <div key={value} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{emoji}</span>
                            <span className="text-xs text-muted-foreground">{lang === "vi" ? label.vi : label.en}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-border" style={{ boxShadow: "0 25px 70px rgba(0,0,0,0.25)" }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-gradient-to-r from-emerald-800 via-green-800 to-green-700 text-white relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-snug tracking-tight">{lang === "vi" ? "Thêm Sự Kiện Chuỗi Cung Ứng" : "Add Supply Chain Event"}</h3>
                  <p className="text-xs text-green-100 opacity-90">{lang === "vi" ? "Ghi lại sự kiện truy xuất xác thực vào sổ cái bất biến" : "Record verified trace event to the immutable ledger"}</p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Event Type Selector */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {lang === "vi" ? "Chọn Loại Sự Kiện" : "Select Event Type"}
                  </label>
                  {form.eventType && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> {lang === "vi" ? "Đã chọn:" : "Selected:"} {form.eventType}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {eventTypes.map(({ value, label, emoji, color }) => {
                    const isSelected = form.eventType === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setForm({ ...form, eventType: value })}
                        className={`px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 flex items-center justify-start gap-2 border text-left ${
                          isSelected
                            ? "bg-emerald-700 text-white border-emerald-800 shadow-md shadow-emerald-700/20 scale-[1.02]"
                            : "bg-muted/80 hover:bg-emerald-50/50 text-foreground border-border/80 hover:border-emerald-300"
                        }`}
                      >
                        <span className="text-base shrink-0">{emoji}</span>
                        <span className="truncate">{lang === "vi" ? label.vi : label.en}</span>
                      </button>
                    );
                  })}
                </div>
                {!canSubmit && (
                  <p className="text-xs text-rose-500 mt-2 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {lang === "vi" ? "Tổ chức của bạn không có quyền tạo loại sự kiện này" : "Your organization is not authorized to create this event type"}
                  </p>
                )}
              </div>

              {/* Input Fields Section Card */}
              <div className="bg-gradient-to-b from-gray-50/90 to-slate-50/50 p-4 rounded-2xl border border-border/80 shadow-xs space-y-4">
                {/* Row 1: Batch ID */}
                <div>
                  <div className="flex items-center justify-between mb-2 min-h-[28px]">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-emerald-600" />
                      {lang === "vi" ? "Mã Lô Hàng" : "Batch Code"}
                    </label>
                    <QrScannerButton
                      onScan={handleQrScanModal}
                      className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 shadow-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    {/* Dropdown removed as requested */}

                    <input
                      value={form.batchId}
                      onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl border border-border text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-input-background shadow-xs transition-all"
                      placeholder={lang === "vi" ? "Nhập mã lô hàng hoặc quét mã QR..." : "Enter Batch ID or scan QR code..."}
                    />
                  </div>
                </div>

                {/* Row 2: Location */}
                <div>
                  <div className="flex items-center justify-between mb-2 min-h-[28px]">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {lang === "vi" ? "Vị Trí" : "Location"}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={locating}
                        className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 shadow-xs"
                        title="Get Current Computer / Device GPS Location"
                      >
                        <LocateFixed className={`w-3 h-3 ${locating ? "animate-spin" : ""}`} />
                        {locating ? (lang === "vi" ? "Đang định vị..." : "Locating...") : (lang === "vi" ? "Thiết bị (GPS)" : "Device (GPS)")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMapPicker(true)}
                        className="text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors flex items-center gap-1 shadow-xs"
                        title="Select Location from Interactive Map"
                      >
                        <MapPin className="w-3 h-3 text-blue-600" /> {lang === "vi" ? "Bản Đồ" : "Map Picker"}
                      </button>
                    </div>
                  </div>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-border text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-input-background shadow-xs transition-all"
                    placeholder={lang === "vi" ? "VD: Kho A, Đà Lạt hoặc chọn trên bản đồ..." : "e.g. Warehouse A, Da Lat or select on map..."}
                  />
                </div>

                {/* Description Textarea */}
                <div>
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    {lang === "vi" ? "Mô Tả / Ghi Chú" : "Description / Activity Notes"}
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs outline-none resize-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-input-background shadow-xs transition-all"
                    placeholder={lang === "vi" ? "Mô tả những gì đã xảy ra (VD: Thu hoạch 500kg táo hữu cơ tại Nông trại A)..." : "Describe what occurred at this supply chain stage (e.g. Harvested 500kg organic apples at Farm A)..."}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
                >
                  {lang === "vi" ? "Hủy bỏ" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || createEventMutation.isPending || !canSubmit || eventTypesLoading}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-800 hover:to-green-800 shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting || createEventMutation.isPending ? (
                    lang === "vi" ? "Đang lưu vào sổ cái..." : "Saving to Ledger..."
                  ) : (
                    <>
                      <Hash className="w-4 h-4" /> {lang === "vi" ? "Lưu vào Blockchain" : "Save to Blockchain"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Map Picker Modal */}
      <MapPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onSelectLocation={(selectedLoc) => setForm((prev) => ({ ...prev, location: selectedLoc }))}
        initialLocation={form.location}
      />
    </div>
  );
}