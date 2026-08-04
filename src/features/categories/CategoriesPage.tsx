import { useState } from "react";
import { Search, Plus, Edit2, Power, PowerOff, X, Tags, Eye, CheckCircle, AlertCircle, Layers, RotateCcw, ChevronLeft, ChevronRight, SlidersHorizontal, ToggleLeft, ToggleRight } from "lucide-react";
import {
  useCategoriesList,
  useCreateCategory,
  useUpdateCategory,
  useUpdateCategoryStatus,
} from "./categories.queries";
import { useAuth } from "../auth/auth.store";
import type { Category } from "./categories.types";
import { SortHeader, sortRows, useColumnSort } from "../../components/common/SortableHeader";

const EMPTY_FORM = { name: "", description: "" };

interface Alert { type: "success" | "error"; message: string; }

export function CategoriesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [detail, setDetail] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState<Alert | null>(null);

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "name", label: "Name" },
  ] as const;

  const { data, isLoading } = useCategoriesList({
    search: search || undefined,
    status: statusFilter === "All" ? undefined : statusFilter,
    page,
    pageSize: perPage,
  });
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const statusMutation = useUpdateCategoryStatus();
  const { sort, toggle } = useColumnSort();

  const categories: Category[] = data?.data.items ?? [];
  const totalCount = data?.data.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / perPage);

  const showAlert = (type: Alert["type"], message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3000);
  };

  const getApiErrorMessage = (err: unknown) =>
    (err as any)?.response?.data?.message || (err as any)?.message || "An error occurred";

  const categorySortValue = (c: Category, key: string): string | number | boolean => {
    switch (key) {
      case "name": return c.name;
      case "description": return c.description ?? "";
      case "status": return c.isActive;
      default: return "";
    }
  };

  const displayed = sort
    ? sortRows(categories, sort, (c) => categorySortValue(c, sort.key))
    : [...categories].sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        const da = a.createdAt ? new Date(a.createdAt).getTime() : a.categoryId;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : b.categoryId;
        return sortBy === "newest" ? db - da : da - db;
      });

  const activeFilterCount =
    (statusFilter !== "All" ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setSortBy("newest");
    setPage(1);
    setShowFilters(false);
  };

  const missingDates = categories.some((c) => !c.createdAt);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setError(""); setShowModal(true); };
  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description ?? "" });
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Please enter category name"); return; }
    const duplicate = categories.find(
      (c) => c.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
        c.categoryId !== editing?.categoryId,
    );
    if (duplicate) { setError("Category name already exists"); return; }
    setError("");
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.categoryId, data: form });
        showAlert("success", `"${form.name}" updated successfully`);
      } else {
        await createMutation.mutateAsync(form);
        showAlert("success", `"${form.name}" added successfully`);
      }
      setShowModal(false);
    } catch (e: any) {
      setError(getApiErrorMessage(e));
    }
  };

  const handleToggleStatus = async (cat: Category) => {
    const newStatus = !cat.isActive;
    const action = newStatus ? "activate" : "deactivate";
    if (!confirm(`Are you sure you want to ${action} category "${cat.name}"?`)) return;
    try {
      await statusMutation.mutateAsync({ id: cat.categoryId, data: { isActive: newStatus } });
      showAlert(
        "success",
        `"${cat.name}" has been ${newStatus ? "activated" : "deactivated"}`
      );
    } catch (e: any) {
      showAlert("error", getApiErrorMessage(e));
    }
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="pb-8">
      {/* Alert */}
      {alert && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${alert.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {alert.type === "success"
            ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
          {alert.message}
        </div>
      )}

      {/* Header */}
      <div className="relative h-36 overflow-hidden" style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #66BB6A 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10 h-full flex items-center px-8 justify-between">
          <div>
            <h1 className="text-white" style={{ fontSize: 24, fontWeight: 700 }}>Category Management</h1>
            <p className="text-green-100 text-sm mt-1">Manage product categories in the supply chain</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="font-bold text-white" style={{ fontSize: 20 }}>{totalCount}</div>
              <div className="text-green-200 text-xs">TOTAL CATEGORIES</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-10">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 mb-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-48 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search categories..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none" style={{ background: "#F8FAF8" }} />
              {search && (
                <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
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
              {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center" style={{ background: showFilters ? "rgba(255,255,255,0.2)" : "#2E7D32", color: "white" }}>{activeFilterCount}</span>}
            </button>
            {isAdmin && (
              <button onClick={openAdd} className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity" style={{ background: "#2E7D32" }}>
                <Plus className="w-4 h-4" /> Add Category
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Status</label>
                  <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as "All" | "Active" | "Inactive"); setPage(1); }} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none bg-white">
                    {["All", "Active", "Inactive"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Sort By</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none bg-white">
                    {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-2 w-full justify-center px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-500">Showing <span className="font-medium text-gray-800">{totalCount}</span> categories</span>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#F8FAF8" }}>
                    <SortHeader label="Category" sortKey="name" sort={sort} onSort={toggle} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap" />
                    <SortHeader label="Description" sortKey="description" sort={sort} onSort={toggle} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap" />
                    <SortHeader label="Status" sortKey="status" sort={sort} onSort={toggle} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap" />
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {displayed.map((cat) => {
                    const isActive = cat.isActive;
                    return (
                      <tr key={cat.categoryId} className="hover:bg-green-50/20 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#E8F5E9" }}>
                              <Tags className="w-4 h-4" style={{ color: "#1B5E20" }} />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{cat.name}</div>
                              <div className="text-xs text-gray-400">ID: {cat.categoryId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-700">{cat.description || "—"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: isActive ? "#4CAF50" : "#9E9E9E" }} />
                            <span className="text-sm" style={{ color: isActive ? "#2E7D32" : "#757575" }}>{isActive ? "ACTIVE" : "INACTIVE"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 transition-opacity">
                            <button onClick={() => setDetail(cat)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors" title="View Detail">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {isAdmin && (
                              <>
                                <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors" title="Edit">
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleToggleStatus(cat)} className={`p-1.5 rounded-lg transition-colors ${isActive ? "hover:bg-red-50 text-red-400" : "hover:bg-green-50 text-green-500"}`} title={isActive ? "Deactivate" : "Activate"}>
                                  {isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {displayed.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Tags className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">No categories found</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <div className="text-sm text-gray-500">
                  Showing {totalCount === 0 ? 0 : ((page - 1) * perPage) + 1} to {Math.min(page * perPage, totalCount)} of {totalCount} categories
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">Rows/page</label>
                  <select
                    value={perPage}
                    onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                    className="px-2 py-1 rounded-lg border border-gray-200 text-sm outline-none bg-white"
                  >
                    {[5, 10, 20, 50].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {page > 1 && (
                  <>
                    <button
                      onClick={() => setPage(1)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${page === 1 ? "text-white" : "text-gray-600 hover:bg-gray-50 border-gray-200"}`}
                      style={page === 1 ? { background: "#2E7D32", borderColor: "#2E7D32" } : {}}
                    >
                      1
                    </button>
                    {page > 2 && <span className="px-1 text-gray-400 text-sm">…</span>}
                  </>
                )}
                {[page - 1, page, page + 1].filter((p) => p > 1 && p < totalPages).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${p === page ? "text-white" : "text-gray-600 hover:bg-gray-50 border-gray-200"}`}
                    style={p === page ? { background: "#2E7D32", borderColor: "#2E7D32" } : {}}
                  >
                    {p}
                  </button>
                ))}
                {page < totalPages && (
                  <>
                    {page < totalPages - 1 && <span className="px-1 text-gray-400 text-sm">…</span>}
                    <button
                      onClick={() => setPage(totalPages)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${page === totalPages ? "text-white" : "text-gray-600 hover:bg-gray-50 border-gray-200"}`}
                      style={page === totalPages ? { background: "#2E7D32", borderColor: "#2E7D32" } : {}}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">{editing ? "Edit Category" : "Add Category"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Category Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400" style={{ background: "#F8FAF8" }} placeholder="Tên danh mục" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400 resize-none" style={{ background: "#F8FAF8" }} placeholder="Mô tả danh mục" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60" style={{ background: "#2E7D32" }}>
                  {saving ? "Saving..." : editing ? "Save Changes" : "Add Category"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div className="p-5" style={{ background: "linear-gradient(135deg, #1B5E20, #2E7D32)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                    <Tags className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{detail.name}</h3>
                    <p className="text-green-200 text-xs">ID: {detail.categoryId}</p>
                  </div>
                </div>
                <button onClick={() => setDetail(null)} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {[
                { label: "Description", value: detail.description || "—" },
                { label: "Status", value: detail.isActive ? "ACTIVE" : "INACTIVE" },
              ].map(({ label, value }) => {
                const isStatus = label === "Status";
                const isActive = value === "ACTIVE";
                return (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-400">{label}</span>
                    {isStatus ? (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: isActive ? "#4CAF50" : "#9E9E9E" }} />
                        <span className="text-sm font-medium" style={{ color: isActive ? "#2E7D32" : "#757575" }}>{value}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-gray-800">{value}</span>
                    )}
                  </div>
                );
              })}

              <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: "#F8FAF8" }}>
                <Layers className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-400">Products</div>
                  <div className="text-sm font-semibold text-gray-800">—</div>
                </div>
              </div>

              {isAdmin && (
                <div className="flex gap-3 pt-1">
                  <button onClick={() => { setDetail(null); openEdit(detail); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(detail)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${detail.isActive ? "bg-red-50 text-red-600 hover:bg-red-100" : "text-white hover:opacity-90"}`}
                    style={!detail.isActive ? { background: "#2E7D32" } : {}}
                  >
                    {detail.isActive ? <><PowerOff className="w-3.5 h-3.5" /> Deactivate</> : <><Power className="w-3.5 h-3.5" /> Activate</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
