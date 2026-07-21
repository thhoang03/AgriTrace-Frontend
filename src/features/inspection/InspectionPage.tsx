import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Search, Plus, Download, Eye, X, SlidersHorizontal,
  CheckCircle, XCircle, Clock, FlaskConical, User, Calendar,
  Upload, ChevronLeft, ChevronRight, FileText, AlertTriangle,
} from "lucide-react";
import type { InspectionItem, InspectionResult, InspectionCategory, LabTest } from "./inspection.types";
import { InspectionCreateModal } from "./InspectionCreateModal";
import { useInspections, useCreateInspection, useUpdateInspection } from "./inspection.queries";

const BANNER_IMG = "https://images.unsplash.com/photo-1684259498900-afdea87b1a97?w=1400&q=80";

const resultConfig: Record<InspectionResult, { bg: string; color: string; icon: React.ElementType; label: string }> = {
  Pass: { bg: "#E8F5E9", color: "#2E7D32", icon: CheckCircle, label: "PASS" },
  Fail: { bg: "#FFEBEE", color: "#C62828", icon: XCircle, label: "FAIL" },
  Pending: { bg: "#FFF9C4", color: "#F57F17", icon: Clock, label: "PENDING" },
};

const categoryColors: Record<InspectionCategory, string> = {
  Quality: "#2E7D32",
  Safety: "#1565C0",
  Regulatory: "#7B1FA2",
};

export function InspectionPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<InspectionResult | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<InspectionCategory | "All">("All");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const perPage = 6;

  const { data: inspectionsData, isLoading, isError, refetch } = useInspections();
  const createMutation = useCreateInspection();
  const updateMutation = useUpdateInspection();

  const allInspections = inspectionsData?.data ?? [];

  const filtered = useMemo(() => {
    return allInspections.filter((ins) => {
      const matchesSearch =
        ins.product.toLowerCase().includes(search.toLowerCase()) ||
        ins.batchCode.toLowerCase().includes(search.toLowerCase()) ||
        ins.id.toLowerCase().includes(search.toLowerCase()) ||
        ins.inspector.toLowerCase().includes(search.toLowerCase());
      const matchesResult = resultFilter === "All" || ins.result === resultFilter;
      const matchesCategory = categoryFilter === "All" || ins.category === categoryFilter;
      return matchesSearch && matchesResult && matchesCategory;
    });
  }, [allInspections, search, resultFilter, categoryFilter]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);
  const selected = selectedId ? allInspections.find((ins) => ins.id === selectedId) ?? null : null;

  const passedCount = allInspections.filter((i) => i.result === "Pass").length;
  const failedCount = allInspections.filter((i) => i.result === "Fail").length;
  const pendingCount = allInspections.filter((i) => i.result === "Pending").length;

  const handleCreate = (data: { batchId: string; category: InspectionCategory; inspector: string; result: InspectionResult; notes: string }) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setShowCreate(false);
        setSelectedId(null);
      },
    });
  };

  const handleApprove = () => {
    if (!selected) return;
    updateMutation.mutate({ id: selected.id, result: "Pass", notes: "Approved" });
  };

  const handleReject = () => {
    if (!selected) return;
    updateMutation.mutate({ id: selected.id, result: "Fail", notes: "Rejected" });
  };

  const handleRetest = () => {
    if (!selected) return;
    updateMutation.mutate({ id: selected.id, result: "Pending", notes: "Retest requested" });
  };

  const handleExport = () => {
    const escapeCsv = (value: string) => {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return '"' + value.replace(/"/g, '""') + '"';
      }
      return value;
    };

    const headers = ["ID", "Batch Code", "Product", "Inspector", "Date", "Category", "Result", "Score"];
    const csvContent = [
      headers.join(","),
      ...filtered.map((ins) =>
        [
          ins.id,
          ins.batchCode,
          escapeCsv(ins.product),
          escapeCsv(ins.inspector),
          ins.date,
          ins.category,
          ins.result,
          ins.score,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inspections_export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "#E8F5E9" }}>
          <FlaskConical className="w-5 h-5 animate-pulse" style={{ color: "#2E7D32" }} />
        </div>
        <div className="text-sm text-gray-500">Loading inspections...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="text-sm text-red-500">Failed to load inspections</div>
        <button onClick={() => refetch()} className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: "#2E7D32" }}>
          Retry
        </button>
      </div>
    );
  }

  if (allInspections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "#F0F9F0" }}>
          <FlaskConical className="w-5 h-5" style={{ color: "#A5D6A7" }} />
        </div>
        <div className="text-sm text-gray-500">No inspections available</div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Banner */}
      <div className="relative h-36 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BANNER_IMG})` }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(27,94,32,0.9) 0%, rgba(46,125,50,0.6) 100%)" }} />
        <div className="relative z-10 h-full flex items-center px-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FlaskConical className="w-4 h-4 text-green-300" />
              <span className="text-green-200 text-xs font-medium uppercase tracking-widest">AgriTrace</span>
            </div>
            <h1 className="text-white" style={{ fontSize: 26, fontWeight: 800 }}>Quality Inspection</h1>
            <p className="text-green-100 text-sm mt-0.5">Food safety testing and certification management</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-center bg-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm">
              <div className="text-white font-bold" style={{ fontSize: 22 }}>{passedCount}</div>
              <div className="text-xs" style={{ color: "#A5D6A7" }}>Passed</div>
            </div>
            <div className="text-center bg-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm">
              <div className="text-white font-bold" style={{ fontSize: 22 }}>{failedCount}</div>
              <div className="text-xs" style={{ color: "#EF9A9A" }}>Failed</div>
            </div>
            <div className="text-center bg-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm">
              <div className="text-white font-bold" style={{ fontSize: 22 }}>{pendingCount}</div>
              <div className="text-xs" style={{ color: "#FFE082" }}>Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary chips */}
      <div className="px-6 -mt-4 relative z-10 mb-4">
        <div className="bg-white rounded-2xl p-3 flex flex-wrap gap-2" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          {(Object.keys(resultConfig) as InspectionResult[]).map((result) => {
            const count = allInspections.filter((i) => i.result === result).length;
            const cfg = resultConfig[result];
            const Icon = cfg.icon;
            return (
              <button
                key={result}
                onClick={() => { setResultFilter(result); setPage(1); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:opacity-80 ${resultFilter === result ? "ring-2 ring-offset-1" : ""}`}
                style={{ background: cfg.bg, ringColor: cfg.color }}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: cfg.color }} />
                <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-md text-white" style={{ background: cfg.color }}>
                  {count}
                </span>
              </button>
            );
          })}
          {(resultFilter !== "All" || categoryFilter !== "All") && (
            <button
              onClick={() => { setResultFilter("All"); setCategoryFilter("All"); setPage(1); }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 ml-auto"
            >
              <X className="w-3 h-3" /> Clear all filters
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
                placeholder="Search by product, batch, inspector..."
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
              {(resultFilter !== "All" || categoryFilter !== "All") && (
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
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #2E7D32, #388E3C)" }}
              >
                <Plus className="w-4 h-4" /> New Inspection
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Result</label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => { setResultFilter("All"); setPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${resultFilter === "All" ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      style={resultFilter === "All" ? { background: "#2E7D32" } : {}}
                    >
                      All
                    </button>
                    {(Object.keys(resultConfig) as InspectionResult[]).map((result) => {
                      const cfg = resultConfig[result];
                      return (
                        <button
                          key={result}
                          onClick={() => { setResultFilter(result); setPage(1); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: resultFilter === result ? cfg.color : cfg.bg,
                            color: resultFilter === result ? "white" : cfg.color,
                          }}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(["All", "Quality", "Safety", "Regulatory"] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { setCategoryFilter(cat); setPage(1); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: categoryFilter === cat ? (cat === "All" ? "#2E7D32" : categoryColors[cat]) : "#F3F4F6",
                          color: categoryFilter === cat ? "white" : "#6B7280",
                        }}
                      >
                        {cat === "All" ? "All" : cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "#F0F9F0" }}>
              <FlaskConical className="w-8 h-8" style={{ color: "#A5D6A7" }} />
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-700 mb-1">No inspections found</div>
              <div className="text-sm text-gray-400">
                {search || resultFilter !== "All" || categoryFilter !== "All"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first inspection to get started"}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left panel — Inspection list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-800">{paginated.length}</span> of{" "}
                  <span className="font-semibold text-gray-800">{filtered.length}</span> inspections
                </span>
              </div>
              {paginated.map((ins) => {
                const cfg = resultConfig[ins.result];
                const Icon = cfg.icon;
                const isSelected = selected?.id === ins.id;
                return (
                  <button
                    key={ins.id}
                    onClick={() => setSelectedId(ins.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all ${isSelected ? "ring-2" : "bg-white hover:shadow-md"}`}
                    style={{
                      boxShadow: isSelected ? "0 4px 16px rgba(0,0,0,0.08)" : "0 2px 12px rgba(0,0,0,0.06)",
                      background: isSelected ? cfg.bg : "white",
                      ringColor: cfg.color,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
                        <Icon style={{ color: cfg.color, width: 18, height: 18 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm truncate">{ins.product}</div>
                        <code className="text-xs font-mono" style={{ color: "#2E7D32" }}>{ins.batchCode}</code>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{ins.date}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span className="text-xs" style={{ color: categoryColors[ins.category] }}>{ins.category}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 pt-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
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
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Right panel — Detail */}
            {selected && (
              <div className="lg:col-span-2 space-y-5">
                {/* Header */}
                {(() => {
                  const cfg = resultConfig[selected.result];
                  const Icon = cfg.icon;
                  return (
                    <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: cfg.bg }}>
                            <Icon style={{ color: cfg.color, width: 28, height: 28 }} />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900" style={{ fontSize: 22 }}>{selected.product}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-sm font-mono" style={{ color: "#2E7D32" }}>{selected.batchCode}</code>
                              <span className="text-gray-300">·</span>
                              <span className="text-sm text-gray-500">{selected.id}</span>
                            </div>
                          </div>
                        </div>
                        <div className="px-5 py-2 rounded-2xl font-bold text-lg" style={{ background: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { icon: User, label: "Inspector", value: selected.inspector },
                          { icon: Calendar, label: "Date", value: selected.date },
                          { icon: FlaskConical, label: "Category", value: selected.category },
                          { icon: FileText, label: "Organization", value: selected.organization },
                        ].map(({ icon: I, label, value }) => (
                          <div key={label} className="p-3 rounded-xl" style={{ background: "#F8FAF8" }}>
                            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                              <I className="w-3.5 h-3.5" />
                              <span className="text-xs">{label}</span>
                            </div>
                            <div className="text-sm font-semibold text-gray-800 truncate">{value}</div>
                          </div>
                        ))}
                      </div>

                      {selected.result !== "Pending" && (
                        <div className="mt-4 flex items-center gap-2">
                          <div className="text-sm text-gray-500">Score:</div>
                          <div className="flex items-center gap-2">
                            <div className="w-48 h-2 rounded-full bg-gray-200 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${selected.score}%`,
                                  background: selected.score >= 80 ? "#2E7D32" : selected.score >= 60 ? "#F57F17" : "#C62828",
                                }}
                              />
                            </div>
                            <span className="text-sm font-bold" style={{ color: selected.score >= 80 ? "#2E7D32" : selected.score >= 60 ? "#F57F17" : "#C62828" }}>
                              {selected.score}/100
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Lab Test Results */}
                <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Laboratory Test Results</h3>
                    <span className="text-xs text-gray-400">{selected.tests.length} parameters</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ background: "#F8FAF8" }}>
                          {["Test Parameter", "Result", "Standard", "Status"].map((h) => (
                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {selected.tests.map((test) => (
                          <tr key={test.name} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-5 py-3 text-sm font-medium text-gray-800">{test.name}</td>
                            <td className="px-5 py-3">
                              <span className={`text-sm font-mono ${test.result.includes("Analyzing") ? "text-gray-400 italic" : "text-gray-700"}`}>
                                {test.result}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-sm text-gray-400 font-mono">{test.standard}</td>
                            <td className="px-5 py-3">
                              {test.result.includes("Analyzing") ? (
                                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#FFF9C4", color: "#F57F17" }}>
                                  <Clock className="w-3 h-3" /> Pending
                                </span>
                              ) : test.ok ? (
                                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                                  <CheckCircle className="w-3 h-3" /> Pass
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#FFEBEE", color: "#C62828" }}>
                                  <XCircle className="w-3 h-3" /> Fail
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes & Certificate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2" style={{ fontSize: 14 }}>
                      <FileText className="w-4 h-4 text-gray-400" />
                      Inspector Notes
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{selected.notes}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                    <h4 className="font-semibold text-gray-900 mb-3" style={{ fontSize: 14 }}>Certificate</h4>
                    {selected.certificate ? (
                      <div>
                        <div className="p-3 rounded-xl mb-3 flex items-center gap-3" style={{ background: "#E8F5E9" }}>
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm font-medium text-green-800 truncate">{selected.certificate}</span>
                        </div>
                        <button className="w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 flex items-center justify-center gap-2 transition-all" style={{ background: "#2E7D32" }}>
                          <Download className="w-4 h-4" /> Download Certificate
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="p-3 rounded-xl mb-3 border-2 border-dashed border-gray-200 text-center">
                          <Upload className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                          <p className="text-xs text-gray-400">No certificate uploaded</p>
                        </div>
                        <button className="w-full py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
                          <Upload className="w-4 h-4" /> Upload Certificate
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {selected.result === "Pending" ? (
                    <>
                      <button
                        onClick={handleApprove}
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50"
                        style={{ background: "#2E7D32" }}
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50"
                        style={{ background: "#C62828" }}
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </>
                  ) : selected.result === "Fail" ? (
                    <button
                      onClick={handleRetest}
                      disabled={updateMutation.isPending}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <AlertTriangle className="w-4 h-4" style={{ color: "#F57F17" }} /> Request Retest
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate(`/app/batches/${selected.batchId}`)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" /> View Batch
                      </button>
                      <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4" /> Download Report
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <InspectionCreateModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
          isSubmitting={createMutation.isPending}
        />
      )}
    </div>
  );
}
