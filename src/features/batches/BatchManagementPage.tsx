import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Search, Plus, Download, QrCode, Eye, Edit2,
  ChevronLeft, ChevronRight, X, SlidersHorizontal,
  Package, ChevronUp, ChevronDown, Leaf, MoreVertical,
  Scissors, Merge, Power
} from "lucide-react";
import { useBatches } from "./batches.queries";
import type { BatchStatus, Batch } from "./batches.types";
import { BatchDeleteModal } from "./BatchDeleteModal";
import { BatchEditModal } from "./BatchEditModal";
import { BatchSplitModal } from "./BatchSplitModal";
import { BatchMergeModal } from "./BatchMergeModal";


const BANNER_IMG = "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=1400&q=80";

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  Harvested:     { bg: "#E8F5E9", color: "#2E7D32", label: "Harvested" },
  Processing:    { bg: "#FFF3E0", color: "#F57C00", label: "Processing" },
  Packaged:      { bg: "#E3F2FD", color: "#1565C0", label: "Packaged" },
  "In Transit":  { bg: "#F3E5F5", color: "#7B1FA2", label: "In Transit" },
  Distributed:   { bg: "#E0F2F1", color: "#00695C", label: "Distributed" },
  "At Retail":   { bg: "#E8F5E9", color: "#1B5E20", label: "At Retail" },
  Recalled:      { bg: "#FFEBEE", color: "#C62828", label: "Recalled" },
};

const allStatuses: BatchStatus[] = [
  "Harvested", "Processing", "Packaged", "In Transit", "Distributed", "At Retail", "Recalled",
];

const normalizeBatchStatus = (status: BatchStatus): BatchStatus => {
  const upper = status.toUpperCase();
  switch (upper) {
    case "HARVESTED":    return "Harvested";
    case "PROCESSING":   return "Processing";
    case "PACKAGING":    return "Packaged";
    case "TRANSPORTING": return "In Transit";
    case "DISTRIBUTING": return "Distributed";
    case "RETAIL":       return "At Retail";
    case "COMPLETED":    return "Distributed";
    case "RECALLED":     return "Recalled";
    default:             return status;
  }
};

type SortField = "product" | "harvestDate" | "quantity" | "status";

export function BatchManagementPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BatchStatus | "All">("All");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("harvestDate");
  const [sortAsc, setSortAsc] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; code: string; name: string; isDeleted?: boolean } | null>(null);
  const [editTarget, setEditTarget] = useState<Batch | null>(null);
  const [splitTarget, setSplitTarget] = useState<Batch | null>(null);
  const [mergeTarget, setMergeTarget] = useState<Batch | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const perPage = 8;

  const { data: batchesData, isLoading, isError } = useBatches({
    search: search || undefined,
    status: statusFilter === "All" ? undefined : statusFilter,
  });

  const batches = batchesData?.data ?? [];
  const normalizedBatches = batches.map((batch) => ({
    ...batch,
    status: normalizeBatchStatus(batch.status),
  }));

  const filtered = normalizedBatches.filter((b) => {
    const matchesSearch =
      (b.batchCode ?? b.id).toLowerCase().includes(search.toLowerCase()) ||
      (b.productName ?? b.product).toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase()) ||
      b.farm.toLowerCase().includes(search.toLowerCase()) ||
      b.farmer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA: string | number = "";
    let valB: string | number = "";
    if (sortField === "product")     { valA = a.productName ?? a.product; valB = b.productName ?? b.product; }
    if (sortField === "harvestDate") { valA = a.harvestDate; valB = b.harvestDate; }
    if (sortField === "quantity")    { valA = a.quantity; valB = b.quantity; }
    if (sortField === "status")      { valA = a.status; valB = b.status; }
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const paginated = sorted.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(sorted.length / perPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc((v) => !v);
    else { setSortField(field); setSortAsc(true); }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField !== field ? (
      <ChevronUp className="w-3 h-3 opacity-25" />
    ) : sortAsc ? (
      <ChevronUp className="w-3 h-3" style={{ color: "#2E7D32" }} />
    ) : (
      <ChevronDown className="w-3 h-3" style={{ color: "#2E7D32" }} />
    );

  // Status distribution counts
  const statusCounts = allStatuses.map((s) => ({
    status: s,
    count: normalizedBatches.filter((b) => b.status === s).length,
  }));

  const handleExport = () => {
    const headers = ["Batch ID", "Product", "Category", "Farm", "Farmer", "Harvest Date", "Quantity", "Status", "Location"];
    const csvContent = [
      headers.join(","),
      ...normalizedBatches.map(b => 
        [
          b.batchCode ?? b.id,
          `"${b.productName ?? b.product}"`,
          `"${b.category}"`,
          `"${b.farm}"`,
          `"${b.farmer}"`,
          b.harvestDate,
          b.quantity,
          b.status,
          `"${b.location}"`
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "batches_export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "#E8F5E9" }}>
          <Package className="w-5 h-5 animate-pulse" style={{ color: "#2E7D32" }} />
        </div>
        <div className="text-sm text-gray-500">Loading batches...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="text-red-500 text-sm">Error loading batches. Please refresh.</div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Banner */}
      <div className="relative h-40 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BANNER_IMG})` }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(27,94,32,0.93) 0%, rgba(46,125,50,0.65) 100%)" }} />
        <div className="relative z-10 h-full flex items-center px-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="w-4 h-4 text-green-300" />
              <span className="text-green-200 text-xs font-medium uppercase tracking-widest">AgriTrace</span>
            </div>
            <h1 className="text-white" style={{ fontSize: 26, fontWeight: 800 }}>Batch Management</h1>
            <p className="text-green-100 text-sm mt-0.5">Track and manage all agricultural product batches</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-center bg-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm">
              <div className="text-white font-bold" style={{ fontSize: 22 }}>{normalizedBatches.length}</div>
              <div className="text-green-200 text-xs">Total Batches</div>
            </div>
            <div className="text-center bg-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm">
              <div className="text-white font-bold" style={{ fontSize: 22 }}>
                {normalizedBatches.filter((b) => b.status === "Recalled").length}
              </div>
              <div className="text-red-200 text-xs">Recalled</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status distribution bar */}
      <div className="px-6 -mt-4 relative z-10 mb-4">
        <div className="bg-white rounded-2xl p-3 flex flex-wrap gap-2" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          {statusCounts.filter((s) => s.count > 0).map(({ status, count }) => {
            const cfg = statusConfig[status] ?? { bg: "#F3F4F6", color: "#6B7280", label: status };
            return (
              <button
                key={status}
                onClick={() => { setStatusFilter(status); setPage(1); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
                style={{ background: cfg.bg }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                <span className="text-xs font-semibold" style={{ color: cfg.color }}>{status}</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-md text-white" style={{ background: cfg.color }}>
                  {count}
                </span>
              </button>
            );
          })}
          {statusFilter !== "All" && (
            <button
              onClick={() => { setStatusFilter("All"); setPage(1); }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 ml-auto"
            >
              <X className="w-3 h-3" /> Clear filter
            </button>
          )}
        </div>
      </div>

      <div className="px-6">
        {/* Search & Actions */}
        <div className="bg-white rounded-2xl p-4 mb-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-56 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by ID, product, farm, farmer..."
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
              {statusFilter !== "All" && (
                <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center" style={{ background: showFilters ? "rgba(255,255,255,0.2)" : "#2E7D32", color: "white" }}>1</span>
              )}
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" /> Export
              </button>
              <button
                onClick={() => navigate("/app/batches/new")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #2E7D32, #388E3C)" }}
              >
                <Plus className="w-4 h-4" /> New Batch
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setStatusFilter("All"); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === "All" ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  style={statusFilter === "All" ? { background: "#2E7D32" } : {}}
                >
                  All ({normalizedBatches.length})
                </button>
                {allStatuses.map((s) => {
                  const cfg = statusConfig[s];
                  const count = normalizedBatches.filter((b) => b.status === s).length;
                  return (
                    <button
                      key={s}
                      onClick={() => { setStatusFilter(s); setPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all`}
                      style={{
                        background: statusFilter === s ? cfg.color : cfg.bg,
                        color: statusFilter === s ? "white" : cfg.color,
                        outline: statusFilter === s ? `2px solid ${cfg.color}` : "none",
                        outlineOffset: 2,
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
              Showing <span className="font-semibold text-gray-800">{paginated.length}</span> of{" "}
              <span className="font-semibold text-gray-800">{sorted.length}</span> batches
            </span>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Live data
            </div>
          </div>

          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "#F0F9F0" }}>
                <Package className="w-8 h-8" style={{ color: "#A5D6A7" }} />
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-700 mb-1">No batches found</div>
                <div className="text-sm text-gray-400">
                  {search || statusFilter !== "All"
                    ? "Try adjusting your search or filter criteria"
                    : "Create your first batch to get started"}
                </div>
              </div>
              {!search && statusFilter === "All" && (
                <button
                  onClick={() => navigate("/app/batches/new")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
                  style={{ background: "#2E7D32" }}
                >
                  <Plus className="w-4 h-4" /> Create First Batch
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "#F8FAF8" }}>
                      <th
                        className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
                        onClick={() => handleSort("product")}
                      >
                        <div className="flex items-center gap-1.5">Product <SortIcon field="product" /></div>
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Batch ID
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Farm / Farmer
                      </th>
                      <th
                        className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
                        onClick={() => handleSort("harvestDate")}
                      >
                        <div className="flex items-center gap-1.5">Harvest Date <SortIcon field="harvestDate" /></div>
                      </th>
                      <th
                        className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
                        onClick={() => handleSort("quantity")}
                      >
                        <div className="flex items-center gap-1.5">Quantity <SortIcon field="quantity" /></div>
                      </th>
                      <th
                        className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center gap-1.5">Status <SortIcon field="status" /></div>
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        State
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginated.map((batch) => {
                      const cfg = statusConfig[batch.status] ?? { bg: "#F3F4F6", color: "#6B7280", label: batch.status };
                      return (
                        <tr
                          key={batch.id}
                          className="hover:bg-green-50/30 transition-colors group cursor-pointer"
                          onClick={() => navigate(`/app/batches/${batch.id}`)}
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={batch.productImage || batch.image}
                                alt={batch.productName ?? batch.product}
                                className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=80&q=60";
                                }}
                              />
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{batch.productName ?? batch.product}</div>
                                <div className="text-xs text-gray-400">{batch.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono font-semibold px-2 py-1 rounded-lg" style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                                {batch.batchCode ?? batch.id}
                              </code>
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowQR(batch.id); }}
                                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                              >
                                <QrCode className="w-3.5 h-3.5" />
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
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${batch.isDeleted ? "bg-orange-500" : "bg-green-500"}`}></span>
                              <span className={`text-xs font-medium ${batch.isDeleted ? "text-orange-700" : "text-green-700"}`}>
                                {batch.isDeleted ? "Inactive" : "Active"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1 relative">
                              <button
                                onClick={() => navigate(`/app/batches/${batch.id}`)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-green-600 transition-colors"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditTarget(batch)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(openMenuId === batch.id ? null : batch.id);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                {openMenuId === batch.id && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-1" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={() => { setSplitTarget(batch); setOpenMenuId(null); }}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        <Scissors className="w-4 h-4 text-blue-500" /> Split Batch
                                      </button>
                                      <button
                                        onClick={() => { setMergeTarget(batch); setOpenMenuId(null); }}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        <Merge className="w-4 h-4 text-purple-500" /> Merge Batches
                                      </button>
                                      <div className="border-t border-gray-100 my-1"></div>
                                      <button
                                        onClick={() => {
                                          setDeleteTarget({
                                            id: batch.id,
                                            code: batch.batchCode ?? batch.id,
                                            name: batch.productName ?? batch.product,
                                            isDeleted: batch.isDeleted
                                          });
                                          setOpenMenuId(null);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                                          batch.isDeleted ? "text-green-600 hover:bg-green-50" : "text-orange-600 hover:bg-orange-50"
                                        }`}
                                      >
                                        <Power className="w-4 h-4" /> 
                                        {batch.isDeleted ? "Set Active" : "Set Inactive"}
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
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
                  Page {page} of {totalPages || 1} · {sorted.length} results
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  {Array.from({ length: Math.min(totalPages || 1, 7) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
                        style={page === pageNum ? { background: "#2E7D32", color: "white" } : { color: "#374151" }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(Math.min(totalPages || 1, page + 1))}
                    disabled={page === (totalPages || 1)}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowQR(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-xs w-full mx-4" onClick={(e) => e.stopPropagation()} style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">QR Code</h3>
              <button onClick={() => setShowQR(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-48 h-48 rounded-2xl flex items-center justify-center" style={{ background: "#F8FAF8", border: "2px dashed #E0E0E0" }}>
                <QrCode className="w-24 h-24 text-gray-300" />
              </div>
              <code className="text-sm font-mono font-semibold px-3 py-1.5 rounded-lg" style={{ background: "#E8F5E9", color: "#2E7D32" }}>{showQR}</code>
              <div className="flex gap-2 w-full">
                <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50">Download</button>
                <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "#2E7D32" }}>Print Label</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <BatchDeleteModal
          batchId={deleteTarget.id}
          batchCode={deleteTarget.code}
          productName={deleteTarget.name}
          isDeleted={deleteTarget.isDeleted}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {/* Edit Modal */}
      {editTarget && (
        <BatchEditModal
          batch={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
      {splitTarget && (
        <BatchSplitModal
          batchId={splitTarget.id}
          batchCode={splitTarget.batchCode ?? splitTarget.id}
          productName={splitTarget.productName ?? splitTarget.product}
          totalQuantity={splitTarget.quantity}
          unit={splitTarget.unit}
          onClose={() => setSplitTarget(null)}
        />
      )}
      {mergeTarget && (
        <BatchMergeModal
          currentBatchId={mergeTarget.id}
          currentBatchCode={mergeTarget.batchCode ?? mergeTarget.id}
          productName={mergeTarget.productName ?? mergeTarget.product}
          productId={mergeTarget.categoryId}
          onClose={() => setMergeTarget(null)}
          onMerged={(mergedId) => navigate(`/app/batches/${mergedId}`)}
        />
      )}
    </div>
  );
}
