import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Search, Plus, Eye, Edit2, Trash2, RotateCcw, ToggleLeft, ToggleRight,
  ChevronLeft, ChevronRight, X, SlidersHorizontal, Package,
} from "lucide-react";
import { useProductsList, useDeleteProduct, useUpdateProductStatus } from "./products.queries";
import { useCategoriesList } from "../categories/categories.queries";
import { useOrganizationsList } from "../organizations/organizations.queries";
import { ProductFormModal } from "./ProductFormModal";
import { useLanguage } from "../../contexts/LanguageContext";
import { toast } from "sonner";
import { translateApiError } from "../../utils/error-translator";
import { SortHeader, sortRows, useColumnSort } from "../../components/common/SortableHeader";
import { useAuth } from "../auth/auth.store";

const BANNER_IMG = "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1400&q=80";

export function ProductManagementPage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [organizationFilter, setOrganizationFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const { sort, toggle } = useColumnSort();

  const deleteProduct = useDeleteProduct();
  const updateProductStatus = useUpdateProductStatus();

  const { data: productsData, isLoading, isError } = useProductsList({
    search: search || undefined,
    organizationId: organizationFilter || undefined,
    categoryId: categoryFilter || undefined,
    page,
    pageSize: perPage,
  });

  const { data: categoriesData } = useCategoriesList();
  const { data: organizationsData } = useOrganizationsList({ pageSize: 100 });

  const organizations = organizationsData?.data?.items || [];
  const categories = categoriesData?.data?.items || [];

  const activeFilterCount =
    (statusFilter !== "All" ? 1 : 0) +
    (organizationFilter ? 1 : 0) +
    (categoryFilter ? 1 : 0);

  const products = productsData?.data?.items || [];
  const totalCount = productsData?.data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / perPage);

  const filteredProducts = products.filter((p: any) => {
    if (statusFilter === "All") return true;
    return statusFilter === "Active" ? p.isActive : !p.isActive;
  });

  const productSortValue = (p: any, key: string): string | number | boolean => {
    switch (key) {
      case "id": return String(p.id || p.productId);
      case "name": return p.name;
      case "category": return p.categoryName;
      case "organization": return p.organizationName;
      case "unit": return p.unit;
      case "status": return p.isActive;
      default: return "";
    }
  };

  const sortedProducts = sortRows(filteredProducts, sort, (p: any) =>
    productSortValue(p, sort?.key ?? ""),
  );

  const handleToggleStatus = async (product: any) => {
    const prodId = product.id || product.productId;
    try {
      if (product.isActive) {
        await updateProductStatus.mutateAsync({
          id: prodId,
          data: { status: "Inactive" },
        });
        toast.success(lang === "vi" ? "Đã vô hiệu hóa sản phẩm!" : "Product deactivated!");
      } else {
        await updateProductStatus.mutateAsync({
          id: prodId,
          data: { status: "Active" },
        });
        toast.success(lang === "vi" ? "Đã kích hoạt lại sản phẩm!" : "Product activated!");
      }
    } catch (error: any) {
      console.error("Error toggling product status:", error);
      const backendError = error?.response?.data?.message || error?.response?.data?.detail;
      const rawMsg = backendError || (lang === "vi" ? "Cập nhật trạng thái thất bại" : "Failed to update status");
      toast.error(translateApiError(rawMsg, lang));
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await updateProductStatus.mutateAsync({
        id,
        data: { status: "Inactive" },
      });
      setShowDeleteModal(null);
      toast.success(lang === "vi" ? "Đã xóa sản phẩm thành công!" : "Product deleted successfully!");
    } catch (error: any) {
      console.error("Error deactivating product:", error);
      const backendError = error?.response?.data?.message || error?.response?.data?.detail;
      const rawMsg = backendError || (lang === "vi" ? "Xóa sản phẩm thất bại" : "Failed to delete product");
      toast.error(translateApiError(rawMsg, lang));
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setOrganizationFilter("");
    setCategoryFilter("");
    setPage(1);
  };

  return (
    <div className="pb-8">
      <div className="relative h-36 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BANNER_IMG})` }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(27,94,32,0.9) 0%, rgba(46,125,50,0.6) 100%)" }} />
        <div className="relative z-10 h-full flex items-center px-8">
          <div>
            <h1 className="text-white" style={{ fontSize: 24, fontWeight: 700 }}>
              {lang === "vi" ? "Quản Lý Sản Phẩm" : "Product Management"}
            </h1>
            <p className="text-green-100 text-sm mt-1">
              {lang === "vi" ? "Quản lý danh mục và nông sản hệ thống" : "Manage agricultural products and categories"}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-center bg-white/10 rounded-xl px-4 py-2">
              <div className="text-white font-bold" style={{ fontSize: 20 }}>{totalCount}</div>
              <div className="text-green-200 text-xs">
                {lang === "vi" ? "Tổng Sản Phẩm" : "Total Products"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-10">
        <div className="bg-card rounded-2xl p-4 mb-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-56 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={lang === "vi" ? "Tìm kiếm theo tên sản phẩm, danh mục..." : "Search by product name, category..."}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm outline-none transition-all bg-input-background"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
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
              {lang === "vi" ? "Bộ Lọc" : "Filters"}
              {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center" style={{ background: showFilters ? "rgba(255,255,255,0.2)" : "#2E7D32", color: "white" }}>{activeFilterCount}</span>}
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "#2E7D32" }}
              >
                <Plus className="w-4 h-4" /> {lang === "vi" ? "Tạo Sản Phẩm" : "Create Product"}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Organization</label>
                  <select
                    value={organizationFilter}
                    onChange={(e) => { setOrganizationFilter(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none bg-input-background"
                  >
                    <option value="">All Organizations</option>
                    {organizations.map((org: any) => {
                      const orgId = String(org.id || org.organizationId || "");
                      return (
                        <option key={orgId} value={orgId}>{org.name}</option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none bg-input-background"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat: any) => {
                      const catId = String(cat.id || cat.categoryId || "");
                      return (
                        <option key={catId} value={catId}>{cat.name}</option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{lang === "vi" ? "Trạng thái" : "Status"}</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as "All" | "Active" | "Inactive")}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none bg-input-background"
                  >
                    <option value="All">{lang === "vi" ? "Tất cả trạng thái" : "All Status"}</option>
                    <option value="Active">{lang === "vi" ? "Hoạt động" : "Active"}</option>
                    <option value="Inactive">{lang === "vi" ? "Ngưng hoạt động" : "Inactive"}</option>
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

        <div className="bg-card rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">{lang === "vi" ? "Đang tải dữ liệu sản phẩm..." : "Loading products..."}</div>
          ) : isError ? (
            <div className="p-8 text-center text-destructive">{lang === "vi" ? "Lỗi khi tải danh sách sản phẩm" : "Error loading products"}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">{lang === "vi" ? "Không tìm thấy sản phẩm nào" : "No products found"}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <SortHeader label={lang === "vi" ? "Sản Phẩm" : "Product"} sortKey="name" sort={sort} onSort={toggle} className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider" />
                      <SortHeader label={lang === "vi" ? "Danh Mục" : "Category"} sortKey="category" sort={sort} onSort={toggle} className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider" />
                      <SortHeader label={lang === "vi" ? "Tổ Chức" : "Organization"} sortKey="organization" sort={sort} onSort={toggle} className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider" />
                      <SortHeader label={lang === "vi" ? "Đơn Vị Tính" : "Unit"} sortKey="unit" sort={sort} onSort={toggle} className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider" />
                      <SortHeader label={lang === "vi" ? "Trạng Thái" : "Status"} sortKey="status" sort={sort} onSort={toggle} className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider" />
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{lang === "vi" ? "Thao Tác" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProducts.map((product: any) => {
                      const prodId = product.id || product.productId;
                      return (
                        <tr key={prodId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#E8F5E9" }}>
                                <Package className="w-4 h-4" style={{ color: "#1B5E20" }} />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                                <div className="text-xs text-gray-400 font-mono">ID: {String(prodId).slice(0, 8)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{product.categoryName}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{product.organizationName || "—"}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{product.unit}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${product.isActive
                                ? "text-green-700 bg-primary/10"
                                : "text-gray-600 bg-muted"
                                }`}
                            >
                              {product.isActive ? (lang === "vi" ? "Hoạt động" : "Active") : (lang === "vi" ? "Ngưng hoạt động" : "Inactive")}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1 transition-opacity">
                              <button
                                onClick={() => navigate(`/app/products/${prodId}`)}
                                className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                                title={lang === "vi" ? "Xem chi tiết" : "View Detail"}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Only allow edit/deactivate/delete if ADMIN or belongs to user's org */}
                              {(user?.role === "ADMIN" || user?.organizationId === product.organizationId) && (
                                <>
                                  <button
                                    onClick={() => setShowEditModal(prodId)}
                                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                                    title={lang === "vi" ? "Chỉnh sửa" : "Edit"}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  {product.isActive ? (
                                    <button
                                      onClick={() => setShowDeleteModal(prodId)}
                                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                                      title={lang === "vi" ? "Xóa" : "Delete"}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleToggleStatus(product)}
                                      className="p-1.5 rounded-lg hover:bg-green-50 text-green-500 transition-colors"
                                      title={lang === "vi" ? "Khôi phục" : "Restore"}
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <div className="text-sm text-muted-foreground">
                    {lang === "vi"
                      ? `Hiển thị ${((page - 1) * perPage) + 1} đến ${Math.min(page * perPage, totalCount)} trong số ${totalCount} sản phẩm`
                      : `Showing ${((page - 1) * perPage) + 1} to ${Math.min(page * perPage, totalCount)} of ${totalCount} products`}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {lang === "vi" ? "Xóa sản phẩm" : "Delete Product"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {lang === "vi"
                ? "Bạn có chắc chắn muốn xóa sản phẩm này không?"
                : "Are you sure you want to delete this product?"}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                {lang === "vi" ? "Hủy bỏ" : "Cancel"}
              </button>
              <button
                onClick={() => handleDeactivate(showDeleteModal)}
                disabled={updateProductStatus.isPending}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {updateProductStatus.isPending ? (lang === "vi" ? "Đang xử lý..." : "Processing...") : (lang === "vi" ? "Xóa" : "Delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      <ProductFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Edit Product Modal */}
      <ProductFormModal
        isOpen={showEditModal !== null}
        onClose={() => setShowEditModal(null)}
        productId={showEditModal || undefined}
        initialData={showEditModal ? filteredProducts.find((p: any) => (p.id || p.productId) === showEditModal) : undefined}
      />
    </div>
  );
}
