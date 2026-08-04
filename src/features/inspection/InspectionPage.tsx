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
  Pending: { bg: "#FFF9C4", color: "#F57F17", icon: Clock, label: "Chờ kiểm định" },
  Passed: { bg: "#E8F5E9", color: "#2E7D32", icon: CheckCircle, label: "Đạt chuẩn (PASS)" },
  Failed: { bg: "#FFEBEE", color: "#C62828", icon: XCircle, label: "Không đạt (FAIL)" },
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
              <span className="text-green-200 text-xs font-medium uppercase tracking-widest">AgriTrace QA / QC</span>
            </div>
            <h1 className="text-white" style={{ fontSize: 26, fontWeight: 800 }}>Kiểm Định Chất Lượng Nông Sản</h1>
            <p className="text-green-100 text-sm mt-0.5">Quản lý phiếu kiểm định lô hàng, chỉ số phòng lab & kết luận chất lượng</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {[
              { label: "Đạt chuẩn", count: passedCount, color: "#A5D6A7" },
              { label: "Không đạt", count: failedCount, color: "#EF9A9A" },
              { label: "Chờ kiểm định", count: pendingCount, color: "#FFE082" },
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
                placeholder="Tìm kiếm theo mã lô hàng, chuyên viên QC..."
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
              Bộ lọc
              {statusFilter !== "All" && (
                <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center" style={{ background: showFilters ? "rgba(255,255,255,0.2)" : "#2E7D32", color: "white" }}>1</span>
              )}
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 shadow-md shadow-emerald-700/20"
                style={{ background: "linear-gradient(135deg, #2E7D32, #388E3C)" }}
              >
                <Plus className="w-4 h-4" /> Tạo Phiếu Kiểm Định Mới
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Trạng thái kiểm định</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: "All", label: "Tất cả" },
                  { value: "Pending", label: "Chờ kiểm định" },
                  { value: "Passed", label: "Đạt chuẩn (PASS)" },
                  { value: "Failed", label: "Không đạt (FAIL)" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => { setStatusFilter(value as any); setPage(1); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: statusFilter === value ? "#2E7D32" : "#F3F4F6",
                      color: statusFilter === value ? "white" : "#6B7280",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-gray-100 shadow-xs">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "#F0F9F0" }}>
              <FlaskConical className="w-8 h-8" style={{ color: "#A5D6A7" }} />
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-800 mb-1 text-base">Không tìm thấy phiếu kiểm định nào</div>
              <div className="text-sm text-gray-400">Vui lòng thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc trạng thái</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left panel: Master List (col-span-5) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Danh sách phiếu (<span className="text-emerald-700 font-bold">{filtered.length}</span>)
                </span>
                <span className="text-xs text-gray-400">Trang {page} / {totalPages || 1}</span>
              </div>
              {paginated.map((ins) => {
                const cfg = statusConfig[ins.status];
                const Icon = cfg.icon;
                const isSelected = selected?.id === ins.id;
                return (
                  <button
                    key={ins.id}
                    onClick={() => setSelectedId(ins.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all relative overflow-hidden ${
                      isSelected
                        ? "bg-emerald-50/70 border-2 border-emerald-600 shadow-md"
                        : "bg-white hover:bg-gray-50/80 border border-gray-100 shadow-xs hover:shadow-md"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-600" />
                    )}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs" style={{ background: cfg.bg }}>
                        <Icon style={{ color: cfg.color, width: 18, height: 18 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-gray-900 text-sm truncate">{ins.batchCode}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
                            {cfg.label}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          {InspectionTypeLabel[ins.inspectionType] || "Kiểm định nông sản"}
                        </div>
                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100/80 text-xs text-gray-400">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            {ins.inspectionDate}
                          </span>
                          <span className="flex items-center gap-1 font-medium text-gray-600">
                            <User className="w-3 h-3 text-gray-400" />
                            {ins.inspector}
                          </span>
                          <span className="font-semibold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-md text-[10px]">
                            🧪 {ins.labTests?.length ?? 0} chỉ số Lab
                          </span>
                        </div>
                      </div>
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

            {/* Right panel: Detailed Inspection View (col-span-7) */}
            {selected ? (
              <div className="lg:col-span-7 space-y-4">
                {/* Header Card */}
                {(() => {
                  const cfg = statusConfig[selected.status];
                  const Icon = cfg.icon;
                  return (
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs" style={{ background: cfg.bg }}>
                            <Icon style={{ color: cfg.color, width: 24, height: 24 }} />
                          </div>
                          <div>
                            <div className="font-extrabold text-gray-900 text-lg">{selected.batchCode}</div>
                            <div className="text-xs text-gray-400 font-mono mt-0.5">{selected.id}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="px-3.5 py-1.5 rounded-xl font-bold text-xs" style={{ background: cfg.bg, color: cfg.color }}>
                            {cfg.label}
                          </div>
                          <button
                            onClick={() => navigate(`/app/batches/${selected.batchId}`)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-700" /> Xem Lô Hàng
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                        {[
                          { icon: User, label: "Chuyên viên QC", value: selected.inspector },
                          { icon: Calendar, label: "Ngày kiểm tra", value: selected.inspectionDate },
                          { icon: FlaskConical, label: "Loại hình", value: InspectionTypeLabel[selected.inspectionType] || "Nông sản" },
                          { icon: FileText, label: "Ghi chú", value: selected.notes || "—" },
                        ].map(({ icon: I, label, value }) => (
                          <div key={label} className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-100">
                            <div className="flex items-center gap-1 text-gray-400 mb-0.5">
                              <I className="w-3 h-3" />
                              <span className="text-[11px] font-medium">{label}</span>
                            </div>
                            <div className="text-xs font-bold text-gray-800 truncate">{value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Action Bar for Pending Ticket */}
                      {selected.status === "Pending" && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                          <button
                            onClick={() => setShowAddLabTest(true)}
                            disabled={addLabTestMutation.isPending}
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold border border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" /> Thêm Chỉ Số Lab
                          </button>
                          <button
                            onClick={() => handleConclude("PASS")}
                            disabled={concludeMutation.isPending}
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
                            style={{ background: "#2E7D32" }}
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Nghiệm Thu ĐẠT (PASS)
                          </button>
                          <button
                            onClick={() => handleConclude("FAIL")}
                            disabled={concludeMutation.isPending}
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
                            style={{ background: "#C62828" }}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Nghiệm Thu KHÔNG ĐẠT (FAIL)
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Lab Tests Section */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                      <Beaker className="w-4 h-4 text-emerald-600" />
                      Chỉ Số Xét Nghiệm Phòng Lab (Lab Tests)
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200/80 text-gray-700 rounded-full">
                        {selected.labTests.length} chỉ số
                      </span>
                      {selected.status === "Pending" && (
                        <button
                          onClick={() => setShowAddLabTest(true)}
                          className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Thêm chỉ số
                        </button>
                      )}
                    </div>
                  </div>

                  {selected.labTests.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50/80 border-b border-gray-100">
                            {["Chỉ số xét nghiệm", "Kết quả đo", "Ngưỡng tiêu chuẩn", "Đánh giá", ""].map((h) => (
                              <th key={h} className="text-left px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selected.labTests.map((test) => (
                            <tr key={test.id} className="hover:bg-gray-50/60 transition-colors text-xs">
                              <td className="px-4 py-2.5 font-bold text-gray-800">{test.testName}</td>
                              <td className="px-4 py-2.5 font-mono text-gray-900 font-semibold">{test.measuredValue || "—"} {test.unit || ""}</td>
                              <td className="px-4 py-2.5 font-mono text-gray-400">
                                {test.minStandardValue || test.maxStandardValue
                                  ? `${test.minStandardValue || "0"}${test.maxStandardValue ? ` - ${test.maxStandardValue}` : ""}`
                                  : "—"}
                              </td>
                              <td className="px-4 py-2.5">
                                {test.isPassed ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold" style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                                    <CheckCircle className="w-3 h-3" /> Đạt (Pass)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold" style={{ background: "#FFEBEE", color: "#C62828" }}>
                                    <XCircle className="w-3 h-3" /> Không đạt (Fail)
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <button
                                  onClick={() => handleRemoveLabTest(test.id)}
                                  className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-6 px-4 text-center bg-emerald-50/20 border-t border-dashed border-gray-200">
                      <Beaker className="w-6 h-6 text-emerald-300 mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-gray-700">Chưa có chỉ số xét nghiệm Lab được ghi nhận</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Bấm nút "Thêm Chỉ Số Lab" để cập nhật dư lượng BVTV, chỉ tiêu vi sinh, độ đường...</p>
                      {selected.status === "Pending" && (
                        <button
                          onClick={() => setShowAddLabTest(true)}
                          className="mt-2.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Thêm chỉ số Lab ngay
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Supply Chain Events Section */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      Sự Kiện Chuỗi Cung Ứng Liên Quan
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200/80 text-gray-700 rounded-full">
                      {relatedEvents.length} sự kiện
                    </span>
                  </div>
                  {eventsLoading ? (
                    <div className="py-6 text-center text-xs text-gray-400 font-medium">Đang tải nhật ký sự kiện...</div>
                  ) : relatedEvents.length > 0 ? (
                    <div className="divide-y divide-gray-100 text-xs">
                      {relatedEvents.map((evt) => (
                        <div key={evt.eventId} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div>
                            <div className="font-bold text-gray-800">{evt.eventTypeCode ?? "SỰ KIỆN"}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5">{new Date(evt.eventTime ?? "").toLocaleString()}</div>
                            {evt.eventData && (
                              <div className="text-[11px] text-gray-600 mt-1 font-mono bg-gray-100/80 px-2 py-1 rounded-md">{evt.eventData}</div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2.5 py-1 rounded-lg">{evt.location ?? "—"}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 px-4 text-center bg-gray-50/30">
                      <FileText className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
                      <p className="text-xs text-gray-500 font-medium">Không có sự kiện chuỗi cung ứng trực tiếp đính kèm phiếu này</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="lg:col-span-7 flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-xs">
                <FlaskConical className="w-10 h-10 text-emerald-300 mb-2" />
                <div className="font-bold text-gray-700 text-base">Vui lòng chọn phiếu kiểm định</div>
                <div className="text-xs text-gray-400 mt-1">Bấm vào phiếu bên danh sách để xem chi tiết nghiệm thu & chỉ số Lab</div>
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
