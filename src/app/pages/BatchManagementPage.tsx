import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Search, Filter, Plus, Download, QrCode, Eye, Edit2, Trash2,
  ChevronLeft, ChevronRight, X, SlidersHorizontal,
} from "lucide-react";
import { batches, type BatchStatus } from "../data/mockData";

const BANNER_IMG = "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=1400&q=80";

const statusConfig: Record<BatchStatus, { bg: string; color: string; label: string }> = {
  Harvested: { bg: "#E8F5E9", color: "#2E7D32", label: "Harvested" },
  Processing: { bg: "#FFF3E0", color: "#F57C00", label: "Processing" },
  Packaged: { bg: "#E3F2FD", color: "#1565C0", label: "Packaged" },
  "In Transit": { bg: "#F3E5F5", color: "#7B1FA2", label: "In Transit" },
  Distributed: { bg: "#E0F2F1", color: "#00695C", label: "Distributed" },
  "At Retail": { bg: "#E8F5E9", color: "#1B5E20", label: "At Retail" },
  Recalled: { bg: "#FFEBEE", color: "#C62828", label: "Recalled" },
};

const allStatuses: BatchStatus[] = ["Harvested", "Processing", "Packaged", "In Transit", "Distributed", "At Retail", "Recalled"];

export function BatchManagementPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BatchStatus | "All">("All");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [showQR, setShowQR] = useState<string | null>(null);
  const perPage = 6;

  const filtered = batches.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.product.toLowerCase().includes(search.toLowerCase()) ||
      b.farm.toLowerCase().includes(search.toLowerCase()) ||
      b.farmer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="pb-8">
      {/* Banner */}
      <div className="relative h-36 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BANNER_IMG})` }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(27,94,32,0.9) 0%, rgba(46,125,50,0.6) 100%)" }} />
        <div className="relative z-10 h-full flex items-center px-8">
          <div>
            <h1 className="text-white" style={{ fontSize: 24, fontWeight: 700 }}>Batch Management</h1>
            <p className="text-green-100 text-sm mt-1">Track and manage all agricultural product batches</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-center bg-white/10 rounded-xl px-4 py-2">
              <div className="text-white font-bold" style={{ fontSize: 20 }}>{batches.length}</div>
              <div className="text-green-200 text-xs">Total Batches</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-10">
        {/* Toolbar */}
        <div className="bg-white rounded-2xl p-4 mb-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex-1 min-w-56 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by Batch ID, product, farm, farmer..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all"
                style={{ background: "#F8FAF8" }}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? "text-white" : "text-gray-600 border-gray-200 hover:bg-gray-50"}`}
              style={showFilters ? { background: "#2E7D32", border: "1px solid #2E7D32" } : {}}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {statusFilter !== "All" && <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center" style={{ background: showFilters ? "rgba(255,255,255,0.2)" : "#2E7D32", color: "white" }}>1</span>}
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" /> Export Excel
              </button>
              <button
                onClick={() => navigate("/app/batches/new")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "#2E7D32" }}
              >
                <Plus className="w-4 h-4" /> New Batch
              </button>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setStatusFilter("All"); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === "All" ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  style={statusFilter === "All" ? { background: "#2E7D32" } : {}}
                >
                  All ({batches.length})
                </button>
                {allStatuses.map((s) => {
                  const cfg = statusConfig[s];
                  const count = batches.filter((b) => b.status === s).length;
                  return (
                    <button
                      key={s}
                      onClick={() => { setStatusFilter(s); setPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? "ring-2" : ""}`}
                      style={{
                        background: statusFilter === s ? cfg.color : cfg.bg,
                        color: statusFilter === s ? "white" : cfg.color,
                        ringColor: cfg.color,
                      }}
                    >
                      {s} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <span className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-800">{filtered.length}</span> batches
            </span>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Live data
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "#F8FAF8" }}>
                  {["Product", "Batch ID", "Farm / Farmer", "Harvest Date", "Quantity", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((batch) => {
                  const cfg = statusConfig[batch.status];
                  return (
                    <tr
                      key={batch.id}
                      className="hover:bg-green-50/30 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/app/batches/${batch.id}`)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={batch.image}
                            alt={batch.product}
                            className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                          />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{batch.product}</div>
                            <div className="text-xs text-gray-400">{batch.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono font-semibold px-2 py-1 rounded-lg" style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                            {batch.id}
                          </code>
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowQR(batch.id); }}
                            className="p-1 rounded-lg hover:bg-gray-100"
                          >
                            <QrCode className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-sm font-medium text-gray-700">{batch.farm}</div>
                        <div className="text-xs text-gray-400">{batch.farmer}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-sm text-gray-700">{batch.harvestDate}</div>
                        <div className="text-xs text-gray-400">{batch.location}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-sm font-semibold text-gray-900">{batch.quantity.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{batch.weight}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap" style={{ background: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/app/batches/${batch.id}`); }}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <span className="text-sm text-gray-400">
              Page {page} of {totalPages || 1} · {filtered.length} results
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              {Array.from({ length: totalPages || 1 }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? "text-white" : "text-gray-600 hover:bg-gray-100"}`}
                  style={page === i + 1 ? { background: "#2E7D32" } : {}}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages || 1, page + 1))}
                disabled={page === (totalPages || 1)}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowQR(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-xs w-full mx-4" onClick={(e) => e.stopPropagation()} style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">QR Code</h3>
              <button onClick={() => setShowQR(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-48 h-48 rounded-2xl flex items-center justify-center" style={{ background: "#F8FAF8", border: "2px dashed #E0E0E0" }}>
                <QrCode className="w-24 h-24 text-gray-300" />
              </div>
              <code className="text-sm font-mono font-semibold px-3 py-1.5 rounded-lg" style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                {showQR}
              </code>
              <div className="flex gap-2 w-full">
                <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50">Download</button>
                <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "#2E7D32" }}>Print Label</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
