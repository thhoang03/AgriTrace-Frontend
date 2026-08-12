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
import { useLanguage } from "../../contexts/LanguageContext";
import { SortHeader, sortRows, useColumnSort } from "../../components/common/SortableHeader";
import { useProductsList } from "../products/products.queries";
import { translateApiError } from "../../utils/error-translator";

const EMPTY_FORM = { name: "", description: "" };

interface Alert { type: "success" | "error"; message: string; }

export function CategoriesPage() {
  const { user } = useAuth();
  const { lang } = useLanguage();
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

  const getApiErrorMessage = (err: unknown) => {
    const raw = (err as any)?.response?.data?.message || (err as any)?.message || "An error occurred";
    return translateApiError(raw, lang);
  };

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
    if (!form.name.trim()) {
      setError(lang === "vi" ? "Vui lòng nhập tên danh mục" : "Please enter category name");
      return;
    }
    const duplicate = categories.find(
      (c) => c.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
        c.categoryId !== editing?.categoryId,
    );
    if (duplicate) {
      setError(lang === "vi" ? "Tên danh mục đã tồn tại" : "Category name already exists");
      return;
    }
    setError("");
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.categoryId, data: form });
        showAlert("success", lang === "vi" ? `Cập nhật "${form.name}" thành công` : `"${form.name}" updated successfully`);
      } else {
        await createMutation.mutateAsync(form);
        showAlert("success", lang === "vi" ? `Thêm "${form.name}" thành công` : `"${form.name}" added successfully`);
      }
      setShowModal(false);
    } catch (e: any) {
      setError(getApiErrorMessage(e));
    }
  };

  const handleToggleStatus = async (cat: Category) => {
    const newStatus = !cat.isActive;
    const confirmMsg = lang === "vi"
      ? `Bạn có chắc muốn ${newStatus ? "kích hoạt" : "vô hiệu hóa"} danh mục "${cat.name}"?`
      : `Are you sure you want to ${newStatus ? "activate" : "deactivate"} category "${cat.name}"?`;
    if (!confirm(confirmMsg)) return;
    try {
      await statusMutation.mutateAsync({ id: cat.categoryId, data: { isActive: newStatus } });
      showAlert(
        "success",
        lang === "vi"
          ? `"${cat.name}" đã được ${newStatus ? "kích hoạt" : "vô hiệu hóa"}`
          : `"${cat.name}" has been ${newStatus ? "activated" : "deactivated"}`
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
            <h1 className="text-white" style={{ fontSize: 24, fontWeight: 700 }}>
              {lang === "vi" ? "Quản Lý Danh Mục" : "Category Management"}
            </h1>
            <p className="text-green-100 text-sm mt-1">
              {lang === "vi" ? "Quản lý các danh mục sản phẩm nông nghiệp trong chuỗi cung ứng" : "Manage product categories in the supply chain"}
            </p>
          </div>
          <div className="flex items-center gap-6">
            {["ACTIVE", "INACTIVE"].map((s) => {
              const count = categories.filter((c) =>
                s === "ACTIVE" ? c.isActive : !c.isActive
              ).length;
              return (
                <div key={s} className="text-center">
                  <div className="font-bold text-white" style={{ fontSize: 20 }}>{count}</div>
                  <div className="text-green-200 text-xs">
                    {s === "ACTIVE" ? (lang === "vi" ? "HOẠT ĐỘNG" : "ACTIVE") : (lang === "vi" ? "NGƯNG ĐỘNG" : "INACTIVE")}
                  </div>
                </div>
              );
            })}
            <div className="text-center">
              <div className="font-bold text-white" style={{ fontSize: 20 }}>{totalCount}</div>
              <div className="text-green-200 text-xs">{lang === "vi" ? "TỔNG CỘNG" : "TOTAL"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-10">
        {/* Filters */}
        <div className="bg-card rounded-2xl p-4 mb-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-48 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={lang === "vi" ? "Tìm kiếm danh mục..." : "Search categories..."}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm outline-none bg-input-background"
              />
              {search && (
                <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? "text-white" : "text-muted-foreground border-border hover:bg-muted"}`}
              style={showFilters ? { background: "#2E7D32", border: "1px solid #2E7D32" } : {}}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center" style={{ background: showFilters ? "rgba(255,255,255,0.2)" : "#2E7D32", color: "white" }}>{activeFilterCount}</span>}
            </button>
            {isAdmin && (
              <button onClick={openAdd} className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity" style={{ background: "#2E7D32" }}>
                <Plus className="w-4 h-4" /> {lang === "vi" ? "Thêm Danh Mục" : "Add Category"}
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                  <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as "All" | "Active" | "Inactive"); setPage(1); }} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none bg-input-background">
                    {["All", "Active", "Inactive"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Sort By</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none bg-input-background">
                    {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-2 w-full justify-center px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="px-6 py-4 border-b border-border flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {lang === "vi" ? `Hiển thị ${displayed.length} danh mục` : `Showing ${displayed.length} categories`}
            </span>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">{lang === "vi" ? "Đang tải..." : "Loading..."}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted border-b border-border">
                    <SortHeader label={lang === "vi" ? "Danh Mục" : "Category"} sortKey="name" sort={sort} onSort={toggle} className="px-5 py-2.5 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest whitespace-nowrap" />
                    <SortHeader label={lang === "vi" ? "Mô Tả" : "Description"} sortKey="description" sort={sort} onSort={toggle} className="px-5 py-2.5 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest whitespace-nowrap" />
                    <SortHeader label={lang === "vi" ? "Trạng Thái" : "Status"} sortKey="status" sort={sort} onSort={toggle} className="px-5 py-2.5 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest whitespace-nowrap" />
                    <th className="text-left px-5 py-2.5 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest whitespace-nowrap">{lang === "vi" ? "Thao Tác" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayed.map((cat) => {
                    const isActive = cat.isActive;
                    return (
                      <tr key={cat.categoryId} className="hover:bg-green-50/20 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10">
                              <Tags className="w-4 h-4" style={{ color: "#1B5E20" }} />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-foreground">{cat.name}</div>
                              <div className="text-xs text-muted-foreground">ID: {cat.categoryId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-muted-foreground">{cat.description || "—"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isActive
                              ? "text-green-700"
                              : "text-gray-600"
                              }`}
                            style={{ background: isActive ? "#E8F5E9" : "#F5F5F5" }}
                          >
                            {isActive ? (lang === "vi" ? "Hoạt động" : "Active") : (lang === "vi" ? "Ngưng hoạt động" : "Inactive")}
                          </span>
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
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Tags className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">No categories found</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing {totalCount === 0 ? 0 : ((page - 1) * perPage) + 1} to {Math.min(page * perPage, totalCount)} of {totalCount} categories
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Rows/page</label>
                  <select
                    value={perPage}
                    onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                    className="px-2 py-1 rounded-lg border border-border text-sm outline-none bg-input-background"
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
                  className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {page > 1 && (
                  <>
                    <button
                      onClick={() => setPage(1)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${page === 1 ? "text-white" : "text-muted-foreground hover:bg-muted border-border"}`}
                      style={page === 1 ? { background: "#2E7D32", borderColor: "#2E7D32" } : {}}
                    >
                      1
                    </button>
                    {page > 2 && <span className="px-1 text-muted-foreground text-sm">…</span>}
                  </>
                )}
                {[page - 1, page, page + 1].filter((p) => p > 1 && p < totalPages).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${p === page ? "text-white" : "text-muted-foreground hover:bg-muted border-border"}`}
                    style={p === page ? { background: "#2E7D32", borderColor: "#2E7D32" } : {}}
                  >
                    {p}
                  </button>
                ))}
                {page < totalPages && (
                  <>
                    {page < totalPages - 1 && <span className="px-1 text-muted-foreground text-sm">…</span>}
                    <button
                      onClick={() => setPage(totalPages)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${page === totalPages ? "text-white" : "text-muted-foreground hover:bg-muted border-border"}`}
                      style={page === totalPages ? { background: "#2E7D32", borderColor: "#2E7D32" } : {}}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
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
          <div className="bg-card rounded-2xl p-6 max-w-md w-full" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground">{editing ? "Edit Category" : "Add Category"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  {lang === "vi" ? "Tên Danh Mục" : "Category Name"}
                </label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-green-400 bg-input-background" placeholder={lang === "vi" ? "Tên danh mục" : "Category name"} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  {lang === "vi" ? "Mô Tả" : "Description"}
                </label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-green-400 resize-none bg-input-background" placeholder={lang === "vi" ? "Mô tả danh mục" : "Category description"} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted">
                  {lang === "vi" ? "Hủy" : "Cancel"}
                </button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60" style={{ background: "#2E7D32" }}>
                  {saving
                    ? (lang === "vi" ? "Đang lưu..." : "Saving...")
                    : editing
                    ? (lang === "vi" ? "Lưu Thay Đổi" : "Save Changes")
                    : (lang === "vi" ? "Thêm Danh Mục" : "Add Category")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <CategoryDetailModal
          detail={detail}
          onClose={() => setDetail(null)}
          onEdit={(cat) => openEdit(cat)}
          onToggleStatus={(cat) => handleToggleStatus(cat)}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}

function CategoryDetailModal({
  detail,
  onClose,
  onEdit,
  onToggleStatus,
  isAdmin,
}: {
  detail: Category;
  onClose: () => void;
  onEdit: (c: Category) => void;
  onToggleStatus: (c: Category) => void;
  isAdmin: boolean;
}) {
  const catIdStr = String(detail.categoryId || detail.id || "");
  const { lang } = useLanguage();
  const { data: productsData, isLoading } = useProductsList({
    categoryId: catIdStr,
    pageSize: 100,
  });

  const rawProducts = productsData?.data?.items ?? [];
  const matchingProducts = rawProducts.filter(
    (p) =>
      p.categoryId === catIdStr ||
      (p.categoryName && p.categoryName.toLowerCase() === detail.name.toLowerCase())
  );
  const count = productsData?.data?.totalCount ?? matchingProducts.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        <div className="p-5" style={{ background: "linear-gradient(135deg, #1B5E20, #2E7D32)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/15">
                <Tags className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">{detail.name}</h3>
                <p className="text-green-200 text-xs font-mono">ID: {detail.categoryId || detail.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {[
            { label: lang === "vi" ? "Mô Tả" : "Description", value: detail.description || "—" },
            { label: lang === "vi" ? "Trạng Thái" : "Status", value: detail.isActive ? "ACTIVE" : "INACTIVE" },
          ].map(({ label, value }) => {
            const isStatus = label === (lang === "vi" ? "Trạng Thái" : "Status");
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

          <div className="rounded-xl p-3.5 bg-gray-50 border border-gray-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-gray-700">
                {lang === "vi" ? "Sản Phẩm Liên Quan" : "Associated Products"}
              </span>
              </div>
              <span className="text-xs font-bold text-green-700 px-2.5 py-0.5 bg-green-100 rounded-full">
                {isLoading ? "..." : lang === "vi" ? `${count} sản phẩm` : `${count} product${count !== 1 ? "s" : ""}`}
              </span>
            </div>

            {isLoading ? (
              <p className="text-xs text-gray-400 animate-pulse">
                {lang === "vi" ? "Đang tải sản phẩm..." : "Loading products..."}
              </p>
            ) : matchingProducts.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1 max-h-36 overflow-y-auto pr-1">
                {matchingProducts.map((p) => (
                  <span key={p.id} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-gray-800 border border-gray-200 shadow-2xs">
                    {p.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">
                {lang === "vi" ? "Chưa có sản phẩm nào trong danh mục này." : "No products registered under this category."}
              </p>
            )}
          </div>

          {isAdmin && (
            <div className="flex gap-3 pt-1">
              <button onClick={() => { onClose(); onEdit(detail); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
                <Edit2 className="w-3.5 h-3.5" />
                {lang === "vi" ? "Chỉnh SỮa" : "Edit"}
              </button>
              <button
                onClick={() => onToggleStatus(detail)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${detail.isActive ? "bg-red-50 text-red-600 hover:bg-red-100" : "text-white hover:opacity-90"}`}
                style={!detail.isActive ? { background: "#2E7D32" } : {}}
              >
                {detail.isActive
                  ? <><PowerOff className="w-3.5 h-3.5" />{lang === "vi" ? "Vô Hiệu Hóa" : "Deactivate"}</>
                  : <><Power className="w-3.5 h-3.5" />{lang === "vi" ? "Kích Hoạt" : "Activate"}</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
