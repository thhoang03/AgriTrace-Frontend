import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle, MapPin, Calendar, QrCode, Download, Share2,
  ArrowLeft, Leaf, Award, AlertTriangle,
} from "lucide-react";
import { get } from "../lib/api";
import type { PublicTraceData } from "../types/mapping";

const PRODUCT_IMG = "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=600&q=80";

function mapStatus(status?: number): string {
  if (status === undefined || status === null) return "Unknown";
  return `Status #${status}`;
}

export function PublicTracePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: traceData, isLoading, isError } = useQuery({
    queryKey: ["publicTrace", id],
    queryFn: () => get<PublicTraceData>(`/public/trace/${id}`),
    enabled: !!id,
  });

  const batch = traceData?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: "#F5F7FA" }}>
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="max-w-lg mx-auto pb-8">
          <div className="w-full h-72 bg-gray-200 animate-pulse" />
          <div className="px-4 mt-4 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
                <div className="h-3 w-full bg-gray-100 rounded mb-2" />
                <div className="h-3 w-2/3 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !batch) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F7FA" }}>
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <div className="font-semibold text-gray-700 mb-2">Batch not found</div>
          <button onClick={() => navigate("/")} className="text-sm text-gray-500 hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Home
          </button>
        </div>
      </div>
    );
  }

  const timeline = batch.timeline ?? [];

  return (
    <div className="min-h-screen" style={{ background: "#F5F7FA" }}>
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
        <div className="relative">
          <img src={PRODUCT_IMG} alt={batch.productName ?? "Product"} className="w-full h-72 object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "#2E7D32", boxShadow: "0 2px 8px rgba(46,125,50,0.4)" }}>
              <CheckCircle className="w-4 h-4 text-white" />
              <span className="text-white text-xs font-bold">VERIFIED</span>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-white" style={{ fontSize: 22, fontWeight: 800 }}>{batch.productName ?? "Unknown Product"}</h1>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-3.5 h-3.5 text-green-300" />
              <span className="text-green-100 text-sm">{batch.currentOrganizationName ?? "Unknown location"}</span>
            </div>
          </div>
        </div>

        <div className="px-4 mt-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 flex items-center gap-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#E8F5E9" }}>
              <QrCode style={{ color: "#2E7D32", width: 28, height: 28 }} />
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-0.5">Batch ID</div>
              <code className="font-mono font-bold" style={{ color: "#2E7D32", fontSize: 15 }}>{batch.batchCode ?? batch.batchId}</code>
              <div className="text-xs text-gray-400 mt-0.5">{mapStatus(batch.status)}</div>
            </div>
            <div className="ml-auto">
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#2E7D32" }}>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Blockchain Secured
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-gray-900 mb-4" style={{ fontSize: 14 }}>Product Details</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Product", value: batch.productName ?? "—" },
                { label: "Batch Code", value: batch.batchCode ?? "—" },
                { label: "Quantity", value: batch.quantity ? `${batch.quantity} ${batch.unitCode ?? ""}` : "—" },
                { label: "Status", value: mapStatus(batch.status) },
                { label: "Organization", value: batch.currentOrganizationName ?? "—" },
                { label: "Recall Status", value: batch.recallStatus ?? "None" },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-xl" style={{ background: "#F8FAF8" }}>
                  <div className="text-xs text-gray-400 mb-1">{label}</div>
                  <div className="text-sm font-semibold text-gray-800 leading-tight">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: 14 }}>Supply Chain Journey</h3>
              <p className="text-gray-400 text-xs mt-0.5">{timeline.length} verified stages</p>
            </div>
            <div className="p-4">
              {timeline.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <div className="text-sm">No timeline events available</div>
                </div>
              ) : (
                <div className="relative">
                  {timeline.map((event, i) => {
                    const dateStr = event.eventTime?.split("T")[0] ?? "";
                    const timeStr = event.eventTime?.split("T")[1]?.split(".")[0] ?? "";
                    return (
                      <div key={i} className="flex gap-5 mb-2 last:mb-0">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 z-10" style={{ background: "#E8F5E9", border: "3px solid #2E7D32" }}>
                            {event.eventTypeCode?.[0] ?? "?"}
                          </div>
                          {i < timeline.length - 1 && (
                            <div className="w-0.5 flex-1 my-1" style={{ background: "linear-gradient(to bottom, #2E7D32, #A5D6A7)", minHeight: 40 }} />
                          )}
                        </div>
                        <div className="flex-1 pb-5">
                          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-bold text-gray-900" style={{ fontSize: 15 }}>{event.eventTypeCode ?? "Event"}</h4>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{dateStr}</span>
                                  {timeStr && <span>{timeStr}</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "#E8F5E9" }}>
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span className="text-xs font-semibold" style={{ color: "#2E7D32" }}>Verified</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed mb-4">
                              {event.organizationName ?? "Unknown organization"} — {event.location ?? "Unknown location"}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {[
                                { label: "Organization", value: event.organizationName ?? "—" },
                                { label: "Location", value: event.location ?? "—" },
                                { label: "Event Type", value: event.eventTypeCode ?? "—" },
                              ].map(({ label, value }) => (
                                <div key={label} className="p-2.5 rounded-xl" style={{ background: "#F8FAF8" }}>
                                  <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                                  <div className="text-sm font-medium text-gray-800">{value}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

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

          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50">
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90" style={{ background: "#2E7D32" }}>
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>

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