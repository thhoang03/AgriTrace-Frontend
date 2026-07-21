import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useCategoriesList } from "../categories/categories.queries";
import type { Category } from "../categories/categories.types";
import { useCreateProduct, useUpdateProduct } from "./products.queries";
import type { CreateProductRequest, UpdateProductRequest } from "./products.types";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: number | null;
  initialData?: {
    name?: string;
    categoryId?: number;
    unit?: string;
    organizationId?: number;
  };
}

export function ProductFormModal({ isOpen, onClose, productId, initialData }: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    categoryId: 0,
    unit: "kg",
    organizationId: 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categoriesData } = useCategoriesList();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const categories = categoriesData?.data?.items || [];
  const isEdit = !!productId;

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        categoryId: initialData.categoryId || 0,
        unit: initialData.unit || "kg",
        organizationId: initialData.organizationId || 1,
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }
    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }
    if (!formData.unit.trim()) {
      newErrors.unit = "Unit is required";
    }
    if (!formData.organizationId) {
      newErrors.organizationId = "Organization is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      if (isEdit && productId) {
        await updateProduct.mutateAsync({
          id: productId,
          data: formData as UpdateProductRequest,
        });
      } else {
        await createProduct.mutateAsync(formData as CreateProductRequest);
      }
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Product" : "Create Product"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Product Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-400"
              style={{ background: "#F8FAF8" }}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Category *</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-400 bg-white"
            >
              <option value={0}>Select a category</option>
              {categories.map((cat: Category) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Unit *</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-400 bg-white"
            >
              <option value="kg">Kilogram (kg)</option>
              <option value="g">Gram (g)</option>
              <option value="ton">Ton</option>
              <option value="lb">Pound (lb)</option>
              <option value="piece">Piece</option>
              <option value="box">Box</option>
            </select>
            {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Organization ID *</label>
            <input
              type="number"
              value={formData.organizationId}
              onChange={(e) => setFormData({ ...formData, organizationId: parseInt(e.target.value) })}
              placeholder="Enter organization ID"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-400"
              style={{ background: "#F8FAF8" }}
            />
            {errors.organizationId && <p className="text-red-500 text-xs mt-1">{errors.organizationId}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProduct.isPending || updateProduct.isPending}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: "#2E7D32" }}
            >
              {createProduct.isPending || updateProduct.isPending
                ? "Saving..."
                : isEdit
                ? "Update"
                : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
