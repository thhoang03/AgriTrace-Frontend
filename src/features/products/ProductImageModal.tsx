import { useState } from "react";
import { X, Upload, Trash2, Star } from "lucide-react";
import { useProductImages, useUploadProductImage, useDeleteProductImage } from "./products.queries";
import { useLanguage } from "../../contexts/LanguageContext";

interface ProductImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
}

export function ProductImageModal({ isOpen, onClose, productId }: ProductImageModalProps) {
  const { lang } = useLanguage();
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
      <div className="bg-card rounded-2xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">{lang === "vi" ? "Quản Lý Hình Ảnh Sản Phẩm" : "Manage Product Images"}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Section */}
        <div className="mb-6 p-4 rounded-xl border-2 border-dashed border-border bg-muted">
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <Upload className="w-4 h-4" /> {lang === "vi" ? "Chọn Hình Ảnh" : "Choose Image"}
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
                  {uploadImage.isPending ? (lang === "vi" ? "Đang tải lên..." : "Uploading...") : (lang === "vi" ? "Tải lên" : "Upload")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Images Grid */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">{lang === "vi" ? `Hình Ảnh Hiện Có (${images.length})` : `Current Images (${images.length})`}</h4>
          {images.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">{lang === "vi" ? "Chưa có hình ảnh nào được tải lên" : "No images uploaded yet"}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image: any) => (
                <div key={image.imageId} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={image.imageUrl}
                      alt="Product"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {image.isPrimary && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white" style={{ background: "#2E7D32" }}>
                      <Star className="w-3 h-3 inline mr-1" /> {lang === "vi" ? "Chính" : "Primary"}
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

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            {lang === "vi" ? "Đóng" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
