import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Search, Plus, Eye, Edit2, Trash2, RotateCcw, ToggleLeft, ToggleRight,
  ChevronLeft, ChevronRight, X, SlidersHorizontal,
} from "lucide-react";
import { useProductsList, useDeleteProduct, useUpdateProductStatus } from "./products.queries";
import { useCategoriesList } from "../categories/categories.queries";
import { useOrganizationsList } from "../organizations/organizations.queries";
import { ProductFormModal } from "./ProductFormModal";
import { useLanguage } from "../../contexts/LanguageContext";
import { SortHeader, sortRows, useColumnSort } from "../../components/common/SortableHeader";

const BANNER_IMG = "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1400&q=80";

export function ProductManagementPage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
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
    const nextStatus = product.isActive ? "Inactive" : "Active";
    try {
      if (product.isActive) {
        await deleteProduct.mutateAsync(prodId);
      } else {
        await updateProductStatus.mutateAsync({
          id: prodId,
          data: { status: "Active" },
        });
      }
    } catch (error) {
      console.error("Error toggling product status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id);
      setShowDeleteModal(null);
    } catch (error) {
      console.error("Error deleting product:", error);
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
        <div className="bg-white rounded-2xl p-4 mb-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-56 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={lang === "vi" ? "Tìm kiếm theo tên sản phẩm, danh mục..." : "Search by product name, category..."}
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
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Organization</label>
                  <select
                    value={organizationFilter}
                    onChange={(e) => { setOrganizationFilter(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none bg-white"
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
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none bg-white"
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
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">{lang === "vi" ? "Trạng thái" : "Status"}</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as "All" | "Active" | "Inactive")}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none bg-white"
                  >
                    <option value="All">{lang === "vi" ? "Tất cả trạng thái" : "All Status"}</option>
                    <option value="Active">{lang === "vi" ? "Hoạt động" : "Active"}</option>
                    <option value="Inactive">{lang === "vi" ? "Ngưng hoạt động" : "Inactive"}</option>
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

        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">{lang === "vi" ? "Đang tải dữ liệu sản phẩm..." : "Loading products..."}</div>
          ) : isError ? (
            <div className="p-8 text-center text-red-500">{lang === "vi" ? "Lỗi khi tải danh sách sản phẩm" : "Error loading products"}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{lang === "vi" ? "Không tìm thấy sản phẩm nào" : "No products found"}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <SortHeader label="ID" sortKey="id" sort={sort} onSort={toggle} className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap" />
                      <SortHeader label={lang === "vi" ? "Tên Sản Phẩm" : "Name"} sortKey="name" sort={sort} onSort={toggle} className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider" />
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
                          <td className="px-6 py-4 text-xs font-medium text-gray-500 font-mono">{String(prodId).slice(0, 8)}...</td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-900">{product.name}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{product.categoryName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{product.organizationName || "—"}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{product.unit}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                product.isActive
                                  ? "text-green-700"
                                  : "text-gray-600"
                              }`}
                              style={{ background: product.isActive ? "#E8F5E9" : "#F5F5F5" }}
                            >
                              {product.isActive ? (lang === "vi" ? "Hoạt động" : "Active") : (lang === "vi" ? "Ngưng hoạt động" : "Inactive")}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => navigate(`/app/products/${prodId}`)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                                title={lang === "vi" ? "Xem chi tiết" : "View"}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowEditModal(prodId)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                                title={lang === "vi" ? "Chỉnh sửa" : "Edit"}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              {product.isActive ? (
                                <button
                                  onClick={() => setShowDeleteModal(prodId)}
                                  className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-500 hover:text-red-700"
                                  title={lang === "vi" ? "Ngưng hoạt động" : "Deactivate"}
                                >
                                  <ToggleRight className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleStatus(product)}
                                  className="p-2 rounded-lg hover:bg-green-50 transition-colors text-green-600 hover:text-green-800"
                                  title={lang === "vi" ? "Kích hoạt lại" : "Activate"}
                                >
                                  <ToggleLeft className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <div className="text-sm text-gray-500">
                    {lang === "vi"
                      ? `Hiển thị ${((page - 1) * perPage) + 1} đến ${Math.min(page * perPage, totalCount)} trong số ${totalCount} sản phẩm`
                      : `Showing ${((page - 1) * perPage) + 1} to ${Math.min(page * perPage, totalCount)} of ${totalCount} products`}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {lang === "vi" ? "Ngưng hoạt động sản phẩm" : "Deactivate Product"}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {lang === "vi"
                ? "Bạn có chắc chắn muốn chuyển sản phẩm này sang trạng thái Ngưng hoạt động (Inactive) không?"
                : "Are you sure you want to change this product status to Inactive?"}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                {lang === "vi" ? "Hủy bỏ" : "Cancel"}
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                disabled={deleteProduct.isPending}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {deleteProduct.isPending ? (lang === "vi" ? "Đang xử lý..." : "Processing...") : (lang === "vi" ? "Ngưng hoạt động" : "Deactivate")}
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
