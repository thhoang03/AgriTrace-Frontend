import { useState } from "react";
import { Upload, MapPin, Hash, CheckCircle, Camera, FileText } from "lucide-react";

const BANNER_IMG = "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=1400&q=80";

const eventTypes = [
  { value: "processing", label: "Processing", emoji: "⚙️" },
  { value: "packaging", label: "Packaging", emoji: "📦" },
  { value: "transport", label: "Transportation", emoji: "🚚" },
  { value: "distribution", label: "Distribution", emoji: "🏭" },
  { value: "retail", label: "Retail Entry", emoji: "🏪" },
  { value: "storage", label: "Cold Storage", emoji: "❄️" },
  { value: "quality_check", label: "Quality Check", emoji: "✅" },
];

export function SupplyChainPage() {
  const [form, setForm] = useState({
    eventType: "processing",
    batchId: "BTH-2024-001",
    company: "",
    employee: "",
    location: "",
    gps: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    temperature: "",
    humidity: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [hash] = useState("0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(""));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pb-8">
      {/* Banner */}
      <div className="relative h-36 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BANNER_IMG})` }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(27,94,32,0.9) 0%, rgba(46,125,50,0.6) 100%)" }} />
        <div className="relative z-10 h-full flex items-center px-8">
          <div>
            <h1 className="text-white" style={{ fontSize: 24, fontWeight: 700 }}>Add Supply Chain Event</h1>
            <p className="text-green-100 text-sm mt-1">Record a new event to the blockchain supply chain trail</p>
          </div>
        </div>
      </div>

      <div className="px-6 mt-5">
        {submitted ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-10 text-center" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#E8F5E9" }}>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="font-bold text-gray-900 mb-2" style={{ fontSize: 20 }}>Event Recorded Successfully!</h2>
              <p className="text-gray-500 text-sm mb-6">Your supply chain event has been recorded to the blockchain and is now immutable.</p>
              <div className="p-4 rounded-xl mb-6 text-left" style={{ background: "#F0F4F0" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-600">Generated Blockchain Hash</span>
                </div>
                <code className="text-xs text-gray-700 break-all leading-relaxed">{hash}</code>
              </div>
              <button onClick={() => setSubmitted(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "#2E7D32" }}>
                Add Another Event
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Event Type */}
                <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <h3 className="font-semibold text-gray-900 mb-4" style={{ fontSize: 15 }}>Event Information</h3>
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Event Type</label>
                    <div className="flex flex-wrap gap-2">
                      {eventTypes.map(({ value, label, emoji }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setForm({ ...form, eventType: value })}
                          className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${form.eventType === value ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                          style={form.eventType === value ? { background: "#2E7D32" } : {}}
                        >
                          <span>{emoji}</span> {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-1.5 block">Batch ID</label>
                      <input value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none" style={{ background: "#F8FAF8" }} placeholder="BTH-2024-001" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-1.5 block">Date & Time</label>
                      <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-1.5 block">Company / Organization</label>
                      <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none" style={{ background: "#F8FAF8" }} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-1.5 block">Employee Responsible</label>
                      <input value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} placeholder="Full name" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none" style={{ background: "#F8FAF8" }} required />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <h3 className="font-semibold text-gray-900 mb-4" style={{ fontSize: 15 }}>Location Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600 mb-1.5 block">Location / Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Enter location" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none" style={{ background: "#F8FAF8" }} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-1.5 block">GPS Coordinates</label>
                      <input value={form.gps} onChange={(e) => setForm({ ...form, gps: e.target.value })} placeholder="10.8231° N, 106.6297° E" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none" style={{ background: "#F8FAF8" }} />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-600 mb-1.5 block">Temp (°C)</label>
                        <input type="number" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} placeholder="e.g. 18" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none" style={{ background: "#F8FAF8" }} />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-600 mb-1.5 block">Humidity (%)</label>
                        <input type="number" value={form.humidity} onChange={(e) => setForm({ ...form, humidity: e.target.value })} placeholder="e.g. 75" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none" style={{ background: "#F8FAF8" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description & Uploads */}
                <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <h3 className="font-semibold text-gray-900 mb-4" style={{ fontSize: 15 }}>Description & Attachments</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-1.5 block">Event Description</label>
                      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Describe what happened at this stage..." className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none" style={{ background: "#F8FAF8" }} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: "Upload Photos", icon: Camera, accept: "image/*", hint: "PNG, JPG up to 10MB" },
                        { label: "Upload Documents", icon: FileText, accept: ".pdf,.doc,.docx", hint: "PDF, DOC up to 20MB" },
                      ].map(({ label, icon: Icon, hint }) => (
                        <div key={label}>
                          <label className="text-sm font-medium text-gray-600 mb-1.5 block">{label}</label>
                          <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-green-400 transition-colors" style={{ background: "#F8FAF8" }}>
                            <Icon className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">
                              <span className="font-medium" style={{ color: "#2E7D32" }}>Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="px-6 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity" style={{ background: "#2E7D32" }}>
                    Save Event to Blockchain
                  </button>
                  <button type="button" onClick={() => window.history.back()} className="px-6 py-3 rounded-xl border border-gray-200 font-semibold text-sm text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* Hash preview */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h4 className="font-semibold text-gray-900 mb-3" style={{ fontSize: 14 }}>Blockchain Preview</h4>
                <div className="p-3 rounded-xl mb-3" style={{ background: "#F0F4F0" }}>
                  <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Hash className="w-3 h-3" /> Current Block Hash</div>
                  <code className="text-xs text-gray-600 break-all">{hash.slice(0, 42)}...</code>
                </div>
                <div className="p-3 rounded-xl" style={{ background: "#F0F4F0" }}>
                  <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Hash className="w-3 h-3" /> Previous Hash</div>
                  <code className="text-xs text-gray-600 break-all">0x8e1f6a2b3c4d5e6f7a8b9c0d1e2f...</code>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: "#2E7D32" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Blockchain node connected
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h4 className="font-semibold text-gray-900 mb-3" style={{ fontSize: 14 }}>Guidelines</h4>
                <div className="space-y-2.5">
                  {[
                    "Record events immediately when they occur",
                    "GPS coordinates improve traceability",
                    "Temperature and humidity are required for cold chain",
                    "Each event creates an immutable blockchain record",
                    "Uploaded photos are stored securely",
                  ].map((tip) => (
                    <div key={tip} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#E8F5E9" }}>
                        <span className="text-green-600" style={{ fontSize: 9 }}>✓</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
