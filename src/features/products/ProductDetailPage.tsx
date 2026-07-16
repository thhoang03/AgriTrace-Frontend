import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Edit2, Trash2, Image as ImageIcon, Package, Tag, MapPin, Power } from "lucide-react";
import { useProductDetail, useProductImages, useDeleteProduct, useUpdateProductStatus } from "./products.queries";
import { ProductFormModal } from "./ProductFormModal";

const BANNER_IMG = "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1400&q=80";

export function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || "0");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const { data: productData, isLoading, isError } = useProductDetail(productId);
  const { data: imagesData } = useProductImages(productId);
  const deleteProduct = useDeleteProduct();
  const updateProductStatus = useUpdateProductStatus();

  const product = productData?.data;
  const images = imagesData?.data || [];

  const handleDelete = async () => {
    try {
      await deleteProduct.mutateAsync(productId);
      navigate("/app/products");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleToggleStatus = () => {
    if (!product) return;
    setShowStatusModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!product) return;
    try {
      await updateProductStatus.mutateAsync({
        id: productId,
        data: { isActive: !product.isActive },
      });
      setShowStatusModal(false);
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
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
          <div>
            <h1 className="text-white" style={{ fontSize: 24, fontWeight: 700 }}>Product Details</h1>
            <p className="text-green-100 text-sm mt-1">View and manage product information</p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl p-6 mb-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate("/app/products")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Products
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={handleToggleStatus}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Power className="w-4 h-4" /> {product.isActive ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h2>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      product.isActive ? "text-green-700" : "text-gray-600"
                    }`}
                    style={{ background: product.isActive ? "#E8F5E9" : "#F5F5F5" }}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="text-gray-400 text-sm">ID: #{product.productId}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl" style={{ background: "#F8FAF8" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4" style={{ color: "#2E7D32" }} />
                    <span className="text-xs font-medium text-gray-500 uppercase">Category</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{product.category?.name || product.categoryName || "N/A"}</div>
                </div>
                <div className="p-4 rounded-xl" style={{ background: "#F8FAF8" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4" style={{ color: "#2E7D32" }} />
                    <span className="text-xs font-medium text-gray-500 uppercase">Unit</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{product.unit}</div>
                </div>
                <div className="p-4 rounded-xl" style={{ background: "#F8FAF8" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" style={{ color: "#2E7D32" }} />
                    <span className="text-xs font-medium text-gray-500 uppercase">Organization ID</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">#{product.organizationId}</div>
                </div>
              </div>
            </div>

            <div>
              <div className="p-4 rounded-xl" style={{ background: "#F8FAF8" }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" style={{ color: "#2E7D32" }} />
                    <span className="text-sm font-medium text-gray-900">Product Images</span>
                  </div>
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="text-xs font-medium" style={{ color: "#2E7D32" }}
                  >
                    Manage
                  </button>
                </div>
                {images.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">No images uploaded</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {images.slice(0, 4).map((image: any) => (
                      <div
                        key={image.imageId}
                        className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                      >
                        <img
                          src={image.imageUrl}
                          alt="Product"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
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

      {/* Status Toggle Confirmation Modal */}
      {showStatusModal && product && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {product.isActive ? "Deactivate Product" : "Activate Product"}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to {product.isActive ? "deactivate" : "activate"} this product?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmToggleStatus}
                disabled={updateProductStatus.isPending}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                style={{ background: product.isActive ? "#F57C00" : "#2E7D32" }}
              >
                {updateProductStatus.isPending ? "Updating..." : (product.isActive ? "Deactivate" : "Activate")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal - TODO */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Images</h3>
            <p className="text-sm text-gray-600 mb-6">Upload and manage product images</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Close
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
        initialData={product ? {
          name: product.name,
          categoryId: product.categoryId,
          unit: product.unit,
          organizationId: product.organizationId,
        } : undefined}
      />
    </div>
  );
}
