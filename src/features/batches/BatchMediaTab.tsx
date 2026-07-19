import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { useUploadBatchImage, useDeleteBatchImage, useBatchImages } from "./batches.queries";

interface BatchMediaTabProps {
  batchId: string;
}

export function BatchMediaTab({ batchId }: BatchMediaTabProps) {
  const { data: imagesData, isLoading } = useBatchImages(batchId);
  const images = imagesData?.data ?? [];
  const uploadImage = useUploadBatchImage(batchId);
  const deleteImage = useDeleteBatchImage(batchId);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB.");
      return;
    }

    try {
      await uploadImage.mutateAsync(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setError("Failed to upload image. Please try again.");
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      await deleteImage.mutateAsync(imageId);
    } catch {
      setError("Failed to delete image.");
    }
  };

  if (isLoading) {
    return <div className="text-gray-500 py-8 text-center">Loading images...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900" style={{ fontSize: 16 }}>Batch Images & Media</h3>
            <p className="text-sm text-gray-400 mt-1">Upload photos of the product, packaging, or condition.</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadImage.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: "#2E7D32" }}
          >
            <Upload className="w-4 h-4" />
            {uploadImage.isPending ? "Uploading..." : "Upload Image"}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl px-3 py-2 text-sm" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
            <ImageIcon className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No images uploaded yet</p>
            <p className="text-gray-400 text-sm mt-1">Click the upload button to add images</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img.imageId} className="group relative rounded-xl overflow-hidden aspect-square border border-gray-200" style={{ background: "#F8FAF8" }}>
                <img
                  src={img.url}
                  alt={img.fileName || "Batch image"}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(img.imageId)}
                    disabled={deleteImage.isPending}
                    className="p-2 rounded-full bg-red-500/80 text-white hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
