import { useState } from "react";
import { X, Upload, Trash2, Star } from "lucide-react";
import type { ProductImage } from "./products.types";
import { useProductImages, useUploadProductImage, useDeleteProductImage } from "./products.queries";

interface ProductImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
}

export function ProductImageModal({ isOpen, onClose, productId }: ProductImageModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: imagesData, refetch } = useProductImages(productId);
  const uploadImage = useUploadProductImage();
  const deleteImage = useDeleteProductImage();

  const images = imagesData?.data || [];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      await uploadImage.mutateAsync({ productId, formData });
      setSelectedFile(null);
      setPreviewUrl(null);
      refetch();
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleDelete = async (imageId: number) => {
    try {
      await deleteImage.mutateAsync(imageId);
      refetch();
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Manage Product Images</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Section */}
        <div className="mb-6 p-4 rounded-xl border-2 border-dashed border-gray-200" style={{ background: "#F8FAF8" }}>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                <Upload className="w-4 h-4" /> Choose Image
              </label>
            </div>
            {previewUrl && (
              <div className="flex items-center gap-3">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <button
                  onClick={handleUpload}
                  disabled={uploadImage.isPending}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: "#2E7D32" }}
                >
                  {uploadImage.isPending ? "Uploading..." : "Upload"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Images Grid */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Current Images ({images.length})</h4>
          {images.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No images uploaded yet</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image: ProductImage) => (
                <div key={image.imageId} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={image.imageUrl}
                      alt="Product"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {image.isPrimary && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white" style={{ background: "#2E7D32" }}>
                      <Star className="w-3 h-3 inline mr-1" /> Primary
                    </div>
                  )}
                  <button
                    onClick={() => handleDelete(image.imageId)}
                    className="absolute bottom-2 right-2 p-2 rounded-lg bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
