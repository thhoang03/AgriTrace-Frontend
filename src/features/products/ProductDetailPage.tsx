import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Edit2, Trash2, Package } from "lucide-react";
import { useProductDetail, useProductImages, useDeleteProduct } from "./products.queries";
import { ProductFormModal } from "./ProductFormModal";

const BANNER_IMG = "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1400&q=80";

export function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const productId = id || "";
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: productData, isLoading, isError } = useProductDetail(productId);
  const { data: imagesData } = useProductImages(productId);
  const deleteProduct = useDeleteProduct();

  const product = productData?.data;

  const handleDelete = async () => {
    try {
      await deleteProduct.mutateAsync(productId);
      navigate("/app/products");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading product details...</div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading product details</div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="relative h-36 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BANNER_IMG})` }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(27,94,32,0.9) 0%, rgba(46,125,50,0.6) 100%)" }} />
        <div className="relative z-10 h-full flex items-center px-8">
          <button
            onClick={() => navigate("/app/products")}
            className="mr-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white" style={{ fontSize: 24, fontWeight: 700 }}>{product.name}</h1>
            <p className="text-green-100 text-sm mt-1">Product Details & Specifications</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-green-800 text-sm font-semibold transition-all hover:bg-green-50"
            >
              <Edit2 className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-sm font-semibold transition-all"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl p-6 mb-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "#E8F5E9" }}>
              <Package className="w-8 h-8" style={{ color: "#2E7D32" }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
              <p className="text-sm text-gray-500 font-mono mt-0.5">ID: {product.id}</p>
            </div>
            <span
              className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${
                product.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}
            >
              {product.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Category</label>
              <p className="text-base font-semibold text-gray-900">{product.categoryName || "N/A"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Unit</label>
              <p className="text-base font-semibold text-gray-900">{product.unit || "N/A"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Organization</label>
              <p className="text-base font-semibold text-gray-900">{product.organizationName || "System Organization"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete "{product.name}"? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteProduct.isPending}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {deleteProduct.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      <ProductFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        productId={productId}
        initialData={{
          name: product.name,
          categoryId: product.categoryId,
          unit: product.unit,
          organizationId: product.organizationId,
        }}
      />
    </div>
  );
}
