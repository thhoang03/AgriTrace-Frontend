import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Search, Plus, Download, X, SlidersHorizontal,
  CheckCircle, XCircle, Clock, FlaskConical, User, Calendar, Eye,
  ChevronLeft, ChevronRight, FileText, AlertTriangle, Trash2, Beaker,
} from "lucide-react";
import { toast } from "sonner";
import type { InspectionItem, InspectionStatus, LabTest } from "./inspection.types";
import { InspectionTypeLabel, StatusLabel } from "./inspection.types";
import { InspectionCreateModal } from "./InspectionCreateModal";
import { AddLabTestModal } from "./AddLabTestModal";
import { useInspections, useCreateInspection, useConcludeInspection, useAddLabTest, useRemoveLabTest } from "./inspection.queries";
import { supplyChainApi } from "../supply-chain/supply-chain.api";
import type { SupplyChainEvent } from "../supply-chain/supply-chain.types";
import { useEffect } from "react";

const statusConfig: Record<InspectionStatus, { bg: string; color: string; icon: React.ElementType; label: string }> = {
  Pending: { bg: "#FFF9C4", color: "#F57F17", icon: Clock, label: "Pending" },
  Passed: { bg: "#E8F5E9", color: "#2E7D32", icon: CheckCircle, label: "Passed" },
  Failed: { bg: "#FFEBEE", color: "#C62828", icon: XCircle, label: "Failed" },
};

export function InspectionPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InspectionStatus | "All">("All");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddLabTest, setShowAddLabTest] = useState(false);
  const [relatedEvents, setRelatedEvents] = useState<SupplyChainEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const perPage = 6;

  const { data: inspectionsData, isLoading, isError, refetch } = useInspections();
  const createMutation = useCreateInspection();
  const concludeMutation = useConcludeInspection();
  const addLabTestMutation = useAddLabTest();
  const removeLabTestMutation = useRemoveLabTest();

  const allInspections = inspectionsData?.data ?? [];

  const filtered = useMemo(() => {
    return allInspections.filter((ins) => {
      const q = search.toLowerCase();
      const matchesSearch =
        ins.batchCode.toLowerCase().includes(q) ||
        ins.inspector.toLowerCase().includes(q) ||
        ins.id.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || ins.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allInspections, search, statusFilter]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);
  const selected = selectedId ? allInspections.find((ins) => ins.id === selectedId) ?? null : null;

  useEffect(() => {
    if (!selected) {
      setRelatedEvents([]);
      return;
    }

    let cancelled = false;
    setEventsLoading(true);

    supplyChainApi.getEvents(selected.batchId, { pageSize: 100 })
      .then((res) => {
        if (!cancelled) {
          const filtered = (res.data ?? []).filter((e) => e.inspectionId === selected.id);
          setRelatedEvents(filtered);
        }
      })
      .catch(() => {
        if (!cancelled) setRelatedEvents([]);
      })
      .finally(() => {
        if (!cancelled) setEventsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selected?.id, selected?.batchId]);

  const passedCount = allInspections.filter((i) => i.status === "Passed").length;
  const failedCount = allInspections.filter((i) => i.status === "Failed").length;
  const pendingCount = allInspections.filter((i) => i.status === "Pending").length;

  const handleCreate = (data: { batchId: string; inspectionType: number; inspectionDate: string; notes: string }) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setShowCreate(false);
        setSelectedId(null);
        toast.success("Inspection created successfully");
      },
      onError: (err) => {
        const msg = (err as any)?.response?.data?.message || (err instanceof Error ? err.message : "Unknown error");
        toast.error(`Create inspection failed: ${msg}`);
      },
    });
  };

  const handleConclude = (overallResult: "PASS" | "FAIL") => {
    if (!selected) return;
    concludeMutation.mutate(
      { id: selected.id, overallResult, notes: selected.notes },
      {
        onSuccess: () => {
          toast.success(`Inspection concluded: ${overallResult}`);
          refetch();
        },
        onError: (err) => {
          const msg = (err as any)?.response?.data?.message || (err instanceof Error ? err.message : "Unknown error");
          toast.error(`Conclude inspection failed: ${msg}`);
        },
      }
    );
  };

  const handleAddLabTestSubmit = (data: { testName: string; measuredValue?: string; unit?: string; minStandardValue?: string; maxStandardValue?: string; isPassed: boolean; remark?: string }) => {
    if (!selected) return;
    addLabTestMutation.mutate(
      {
        inspectionId: selected.id,
        ...data,
      },
      {
        onSuccess: () => {
          setShowAddLabTest(false);
          toast.success("Lab test added successfully");
          refetch();
        },
        onError: (err) => {
          const msg = (err as any)?.response?.data?.message || (err instanceof Error ? err.message : "Unknown error");
          toast.error(`Add lab test failed: ${msg}`);
        },
      }
    );
  };

  const handleRemoveLabTest = (labTestId: string) => {
    if (confirm("Remove this lab test?")) {
      removeLabTestMutation.mutate(labTestId, {
        onSuccess: () => {
          toast.success("Lab test removed");
          refetch();
        },
        onError: (err) => {
          const msg = (err as any)?.response?.data?.message || (err instanceof Error ? err.message : "Unknown error");
          toast.error(`Remove lab test failed: ${msg}`);
        },
      });
    }
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
      <div className="relative h-36 overflow-hidden rounded-b-3xl" style={{ background: "linear-gradient(135deg, #1B5E20, #2E7D32)" }}>
        <div className="h-full flex items-center px-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FlaskConical className="w-4 h-4 text-green-300" />
              <span className="text-green-200 text-xs font-medium uppercase tracking-widest">AgriTrace</span>
            </div>
            <h1 className="text-white" style={{ fontSize: 26, fontWeight: 800 }}>Quality Inspection</h1>
            <p className="text-green-100 text-sm mt-0.5">Batch inspection and lab test management</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {[
              { label: "Passed", count: passedCount, color: "#A5D6A7" },
              { label: "Failed", count: failedCount, color: "#EF9A9A" },
              { label: "Pending", count: pendingCount, color: "#FFE082" },
            ].map(({ label, count, color }) => (
              <div key={label} className="text-center bg-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm">
                <div className="text-white font-bold" style={{ fontSize: 22 }}>{count}</div>
                <div className="text-xs" style={{ color }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 mt-4">
        {/* Search & Actions */}
        <div className="bg-white rounded-2xl p-4 mb-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-56 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by batch code, inspector..."
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
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Status</label>
              <div className="flex flex-wrap gap-1.5">
                {(["All", "Pending", "Passed", "Failed"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setPage(1); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: statusFilter === s ? "#2E7D32" : "#F3F4F6",
                      color: statusFilter === s ? "white" : "#6B7280",
                    }}
                  >
                    {s === "All" ? "All" : s}
                  </button>
                ))}
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
              <div className="text-sm text-gray-400">Try adjusting your search or filter criteria</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left panel */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-800">{paginated.length}</span> of{" "}
                  <span className="font-semibold text-gray-800">{filtered.length}</span> inspections
                </span>
              </div>
              {paginated.map((ins) => {
                const cfg = statusConfig[ins.status];
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
                        <div className="font-semibold text-gray-900 text-sm truncate">{ins.batchCode}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{InspectionTypeLabel[ins.inspectionType]}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{ins.inspectionDate}</span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <User className="w-3 h-3" />
                            {ins.inspector}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                  </button>
                );
              })}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 pt-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  {(() => {
                    const pages: (number | "...")[] = [];
                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (page > 3) pages.push("...");
                      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
                      if (page < totalPages - 2) pages.push("...");
                      pages.push(totalPages);
                    }
                    return pages.map((p, idx) =>
                      p === "..." ? (
                        <span key={`e-${idx}`} className="w-8 h-8 flex items-center justify-center text-sm text-gray-400">...</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
                          style={page === p ? { background: "#2E7D32", color: "white" } : { color: "#374151" }}
                        >
                          {p}
                        </button>
                      )
                    );
                  })()}
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

            {/* Right panel */}
            {selected && (
              <div className="lg:col-span-2 space-y-5">
                {/* Header */}
                {(() => {
                  const cfg = statusConfig[selected.status];
                  const Icon = cfg.icon;
                  return (
                    <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: cfg.bg }}>
                              <Icon style={{ color: cfg.color, width: 28, height: 28 }} />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900" style={{ fontSize: 22 }}>{selected.batchCode}</div>
                              <div className="text-sm text-gray-500 mt-0.5">{selected.id}</div>
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
                          { icon: Calendar, label: "Date", value: selected.inspectionDate },
                          { icon: FlaskConical, label: "Type", value: InspectionTypeLabel[selected.inspectionType] },
                          { icon: FileText, label: "Notes", value: selected.notes || "—" },
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

                      {selected.overallResult && (
                        <div className="mt-4 flex items-center gap-2">
                          <span className="text-sm text-gray-500">Overall Result:</span>
                          <span
                            className="px-3 py-1 rounded-full text-xs font-bold"
                            style={{
                              background: selected.overallResult === "PASS" ? "#E8F5E9" : "#FFEBEE",
                              color: selected.overallResult === "PASS" ? "#2E7D32" : "#C62828",
                            }}
                          >
                            {selected.overallResult}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Lab Tests */}
                <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2" style={{ fontSize: 15 }}>
                      <Beaker className="w-4 h-4 text-gray-400" />
                      Lab Tests
                    </h3>
                    <span className="text-xs text-gray-400">{selected.labTests.length} tests</span>
                  </div>
                  {selected.labTests.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                           <tr style={{ background: "#F8FAF8" }}>
                             {["Test", "Result", "Standard Range", "Status", ""].map((h) => (
                               <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                             ))}
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {selected.labTests.map((test) => (
                            <tr key={test.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-5 py-3 text-sm font-medium text-gray-800">{test.testName}</td>
                              <td className="px-5 py-3 text-sm font-mono text-gray-700">{test.measuredValue || "—"}</td>
                              <td className="px-5 py-3 text-sm font-mono text-gray-400">
                                {test.minStandardValue || test.maxStandardValue
                                  ? `${test.minStandardValue || "—"}${test.maxStandardValue ? ` - ${test.maxStandardValue}` : ""}`
                                  : "—"}
                              </td>
                              <td className="px-5 py-3">
                                {test.isPassed ? (
                                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                                    <CheckCircle className="w-3 h-3" /> Pass
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#FFEBEE", color: "#C62828" }}>
                                    <XCircle className="w-3 h-3" /> Fail
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-3">
                                <button
                                  onClick={() => handleRemoveLabTest(test.id)}
                                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <Beaker className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No lab tests recorded</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {selected.status === "Pending" && (
                    <>
                      <button
                        onClick={() => setShowAddLabTest(true)}
                        disabled={addLabTestMutation.isPending}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" /> Add Lab Test
                      </button>
                      <button
                        onClick={() => handleConclude("PASS")}
                        disabled={concludeMutation.isPending}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50"
                        style={{ background: "#2E7D32" }}
                      >
                        <CheckCircle className="w-4 h-4" /> Conclude Pass
                      </button>
                      <button
                        onClick={() => handleConclude("FAIL")}
                        disabled={concludeMutation.isPending}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50"
                        style={{ background: "#C62828" }}
                      >
                        <XCircle className="w-4 h-4" /> Conclude Fail
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => navigate(`/app/batches/${selected.batchId}`)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" /> View Batch
                  </button>
                </div>

                {/* Supply Chain Events */}
                <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2" style={{ fontSize: 15 }}>
                      <FileText className="w-4 h-4 text-gray-400" />
                      Supply Chain Events
                    </h3>
                    <span className="text-xs text-gray-400">{relatedEvents.length} events</span>
                  </div>
                  {eventsLoading ? (
                    <div className="py-8 text-center text-sm text-gray-400">Loading events...</div>
                  ) : relatedEvents.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                      {relatedEvents.map((evt) => (
                        <div key={evt.eventId} className="px-6 py-3 flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-800">{evt.eventTypeCode ?? "EVENT"}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{new Date(evt.eventTime ?? "").toLocaleString()}</div>
                            {evt.eventData && (
                              <div className="text-xs text-gray-500 mt-1 font-mono">{evt.eventData}</div>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">{evt.location ?? "—"}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No supply chain events linked to this inspection</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showCreate && (
        <InspectionCreateModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
          isSubmitting={createMutation.isPending}
        />
      )}

      {showAddLabTest && (
       <AddLabTestModal
         onClose={() => setShowAddLabTest(false)}
         onSubmit={handleAddLabTestSubmit}
         isSubmitting={addLabTestMutation.isPending}
       />
      )}
    </div>
  );
}
