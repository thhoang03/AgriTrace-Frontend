import { useState, useEffect } from "react";
import { Calendar, MapPin, AlignLeft, AlertCircle, X, CheckCircle, Thermometer, Droplets } from "lucide-react";
import { useCreateEvent } from "../supply-chain/supply-chain.queries";
import { lookupApi, LookupItem } from "../../lib/api/lookup";

interface BatchEventModalProps {
  batchId: string;
  batchCode: string;
  onClose: () => void;
}

export function BatchEventModal({ batchId, batchCode, onClose }: BatchEventModalProps) {
  const createEvent = useCreateEvent(batchId);
  const [eventTypes, setEventTypes] = useState<LookupItem[]>([]);
  const [eventType, setEventType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [temp, setTemp] = useState("");
  const [humidity, setHumidity] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    lookupApi.getEventTypes().then(res => setEventTypes(res.data)).catch(console.error);
  }, []);

  const isValid = !!eventType && !!description;

  const handleSubmit = async () => {
    setError("");
    if (!isValid) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      const metadata: Record<string, unknown> = {};
      if (temp) metadata.temperature = Number(temp);
      if (humidity) metadata.humidity = Number(humidity);

      await createEvent.mutateAsync({
        eventType,
        location: location || undefined,
        description,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      });
      onClose();
    } catch {
      setError("Failed to create event. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.25)", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ background: "linear-gradient(90deg, #2E7D32 0%, #388E3C 100%)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/20">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-semibold text-white">Add Supply Chain Event</div>
              <code className="text-green-200 text-xs font-mono">{batchCode}</code>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          <label className="space-y-1.5 block">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Event Type *</span>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none text-sm bg-white"
            >
              <option value="" disabled>Select event type</option>
              {eventTypes.map(et => (
                <option key={et.value} value={et.value}>{et.label}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 block">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Location
            </span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Warehouse A, Ho Chi Minh City"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none text-sm"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5 block">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5" /> Temperature (°C)
              </span>
              <input
                type="number"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none text-sm"
              />
            </label>
            <label className="space-y-1.5 block">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5" /> Humidity (%)
              </span>
              <input
                type="number"
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none text-sm"
              />
            </label>
          </div>

          <label className="space-y-1.5 block">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5" /> Description *
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe what happened in this event..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none text-sm resize-none"
            />
          </label>

          <div className="bg-green-50 text-green-800 text-xs rounded-xl p-3 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p>This event will be secured via blockchain hash and cannot be modified or deleted once created.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl px-3 py-2 text-sm" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 mt-auto">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={createEvent.isPending || !isValid}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            style={{ background: "#2E7D32" }}
          >
            {createEvent.isPending ? "Saving..." : "Add Event"}
          </button>
        </div>
      </div>
    </div>
  );
}
