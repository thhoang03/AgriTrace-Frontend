import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Search, Plus, Eye, Edit2, Trash2,
  ChevronLeft, ChevronRight, X, SlidersHorizontal, Package,
} from "lucide-react";
import { useProductsList, useDeleteProduct } from "./products.queries";
import type { ProductListItem } from "./products.types";
import { ProductFormModal } from "./ProductFormModal";

const BANNER_IMG = "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1400&q=80";

export function ProductManagementPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
  const perPage = 10;

  const deleteProduct = useDeleteProduct();

  const { data: productsData, isLoading, isError } = useProductsList({
    search: search || undefined,
    page,
    pageSize: perPage,
  });



  const products = productsData?.data?.items || [];
  const totalCount = productsData?.data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / perPage);

  const filteredProducts = products.filter((p: ProductListItem) => {
    if (statusFilter === "All") return true;
    return statusFilter === "Active" ? p.isActive : !p.isActive;
  });

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct.mutateAsync(id);
      setShowDeleteModal(null);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="pb-8">
      <div className="relative h-36 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BANNER_IMG})` }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(27,94,32,0.9) 0%, rgba(46,125,50,0.6) 100%)" }} />
        <div className="relative z-10 h-full flex items-center px-8">
          <div>
            <h1 className="text-white" style={{ fontSize: 24, fontWeight: 700 }}>Product Management</h1>
            <p className="text-green-100 text-sm mt-1">Manage agricultural products and categories</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-center bg-white/10 rounded-xl px-4 py-2">
              <div className="text-white font-bold" style={{ fontSize: 20 }}>{totalCount}</div>
              <div className="text-green-200 text-xs">Total Products</div>
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
                placeholder="Search by product name, category..."
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
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "#2E7D32" }}
              >
                <Plus className="w-4 h-4" /> Create Product
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as "All" | "Active" | "Inactive")}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none bg-white"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading products...</div>
          ) : isError ? (
            <div className="p-8 text-center text-red-500">Error loading products</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No products found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product: ProductListItem) => (
                      <tr key={product.productId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{product.productId}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#E8F5E9" }}>
                              <Package className="w-5 h-5" style={{ color: "#2E7D32" }} />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.categoryName}</td>
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
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/app/products/${product.productId}`)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShowEditModal(product.productId)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShowDeleteModal(product.productId)}
                              className="p-2 rounded-lg hover:bg-red-50 transition-colors text-gray-500 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, totalCount)} of {totalCount} products
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 text-sm font-medium" style={{ background: "#2E7D32", color: "white", borderRadius: 6 }}>
                      {page}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                disabled={deleteProduct.isPending}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {deleteProduct.isPending ? "Deleting..." : "Delete"}
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
        productId={showEditModal}
        initialData={showEditModal ? filteredProducts.find((p: ProductListItem) => p.productId === showEditModal) : undefined}
      />
    </div>
  );
}
