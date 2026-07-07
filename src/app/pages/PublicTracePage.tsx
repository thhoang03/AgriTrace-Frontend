import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  CheckCircle, MapPin, Calendar, QrCode, Download, Share2,
  ArrowLeft, Leaf, Hash, ChevronDown, ChevronUp, Award,
} from "lucide-react";
import { batches, timelineEvents } from "../data/mockData";

const PRODUCT_IMG = "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=600&q=80";

export function PublicTracePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  const batch = batches.find((b) => b.id === id) || batches[0];

  return (
    <div className="min-h-screen" style={{ background: "#F5F7FA" }}>
      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
            <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "#2E7D32" }}>
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900" style={{ fontSize: 14 }}>AgriTrace</span>
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <Share2 className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto pb-8">
        {/* Product image + verification badge */}
        <div className="relative">
          <img src={PRODUCT_IMG} alt={batch.product} className="w-full h-72 object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "#2E7D32", boxShadow: "0 2px 8px rgba(46,125,50,0.4)" }}>
              <CheckCircle className="w-4 h-4 text-white" />
              <span className="text-white text-xs font-bold">VERIFIED</span>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-white" style={{ fontSize: 22, fontWeight: 800 }}>{batch.product}</h1>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-3.5 h-3.5 text-green-300" />
              <span className="text-green-100 text-sm">{batch.location}</span>
            </div>
          </div>
        </div>

        <div className="px-4 mt-4 space-y-4">
          {/* QR + Batch ID */}
          <div className="bg-white rounded-2xl p-4 flex items-center gap-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#E8F5E9" }}>
              <QrCode style={{ color: "#2E7D32", width: 28, height: 28 }} />
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-0.5">Batch ID</div>
              <code className="font-mono font-bold" style={{ color: "#2E7D32", fontSize: 15 }}>{batch.id}</code>
              <div className="text-xs text-gray-400 mt-0.5">{batch.category}</div>
            </div>
            <div className="ml-auto">
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#2E7D32" }}>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Blockchain Secured
              </div>
            </div>
          </div>

          {/* Product details grid */}
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-gray-900 mb-4" style={{ fontSize: 14 }}>Product Details</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Farm", value: batch.farm },
                { label: "Farmer", value: batch.farmer },
                { label: "Harvest Date", value: batch.harvestDate },
                { label: "Quantity", value: batch.weight },
                { label: "Status", value: batch.status },
                { label: "VietGAP", value: "Grade A Certified" },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-xl" style={{ background: "#F8FAF8" }}>
                  <div className="text-xs text-gray-400 mb-1">{label}</div>
                  <div className="text-sm font-semibold text-gray-800 leading-tight">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 14 }}>Supply Chain Journey</h3>
              <p className="text-gray-400 text-xs mt-0.5">Farm to Table — 6 verified stages</p>
            </div>
            <div className="p-4">
              {timelineEvents.map((event, i) => (
                <div key={event.id} className="relative">
                  {i < timelineEvents.length - 1 && (
                    <div className="absolute left-5 top-10 w-0.5 h-6" style={{ background: "linear-gradient(to bottom, #2E7D32, #A5D6A7)" }} />
                  )}
                  <div className="mb-1">
                    <button
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-left transition-colors"
                      onClick={() => setExpanded(expanded === event.id ? null : event.id)}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: "#E8F5E9", border: "2px solid #2E7D32" }}>
                        {event.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-sm">{event.stage}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "#E8F5E9", color: "#2E7D32" }}>✓</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{event.organization} · {event.date}</div>
                      </div>
                      {expanded === event.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {expanded === event.id && (
                      <div className="ml-13 px-3 pb-3" style={{ marginLeft: 52 }}>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">{event.description}</p>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {[
                            { label: "Location", value: event.location },
                            { label: "Employee", value: event.employee },
                            event.temp && { label: "Temperature", value: event.temp },
                            event.humidity && { label: "Humidity", value: event.humidity },
                          ].filter(Boolean).map((item) => item && (
                            <div key={item.label} className="p-2.5 rounded-xl" style={{ background: "#F8FAF8" }}>
                              <div className="text-xs text-gray-400">{item.label}</div>
                              <div className="text-sm font-medium text-gray-700">{item.value}</div>
                            </div>
                          ))}
                        </div>
                        <div className="p-2.5 rounded-xl" style={{ background: "#F0F4F0" }}>
                          <div className="flex items-center gap-1 mb-1">
                            <Hash className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">Blockchain Hash</span>
                          </div>
                          <code className="text-xs text-gray-600 break-all">{event.hash.slice(0, 30)}...</code>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certificates */}
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-gray-900 mb-3" style={{ fontSize: 14 }}>Quality Certificates</h3>
            <div className="space-y-2.5">
              {[
                { name: "VietGAP Certificate", issuer: "Vietnam GAP Authority", valid: true },
                { name: "Food Safety Certificate", issuer: "Vietnam Food Authority (VFA)", valid: true },
                { name: "Phytosanitary Certificate", issuer: "Plant Protection Department", valid: true },
              ].map(({ name, issuer, valid }) => (
                <div key={name} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#F8FAF8" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#E8F5E9" }}>
                    <Award style={{ color: "#2E7D32", width: 16, height: 16 }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{name}</div>
                    <div className="text-xs text-gray-400">{issuer}</div>
                  </div>
                  {valid && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Map placeholder */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2" style={{ fontSize: 14 }}>
                <MapPin style={{ color: "#2E7D32", width: 16, height: 16 }} /> Origin Location
              </h3>
            </div>
            <div className="relative h-40 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)" }}>
              <div className="text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2" style={{ color: "#2E7D32" }} />
                <div className="font-medium text-gray-700 text-sm">{batch.location}</div>
                <div className="text-xs text-gray-400 mt-0.5">{batch.gps}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50">
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90" style={{ background: "#2E7D32" }}>
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>

          {/* Footer */}
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold" style={{ color: "#2E7D32" }}>Verified by AgriTrace Vietnam</span>
            </div>
            <p className="text-xs text-gray-400">
              Ministry of Agriculture and Rural Development<br />
              Scan count: 1,247 · Last verified: Today
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
