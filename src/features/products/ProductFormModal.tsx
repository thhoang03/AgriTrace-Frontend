import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useCategoriesList } from "../categories/categories.queries";
import { useCreateProduct, useUpdateProduct } from "./products.queries";
import { useAuth } from "../auth/auth.store";
import { useLanguage } from "../../contexts/LanguageContext";
import { toast } from "sonner";
import { translateApiError } from "../../utils/error-translator";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  initialData?: {
    name?: string;
    categoryId?: string;
    unit?: string;
    organizationId?: string;
    gtin?: string;
  };
}

export function ProductFormModal({ isOpen, onClose, productId, initialData }: ProductFormModalProps) {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    unit: "40000000-0000-0000-0000-000000000001",
    gtin: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categoriesData } = useCategoriesList();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const categories = categoriesData?.data?.items || [];
  const isEdit = !!productId;

  useEffect(() => {
    if (initialData) {
      let mappedUnitGuid = initialData.unitId || "";
      if (!mappedUnitGuid && initialData.unit) {
        const u = initialData.unit.toLowerCase();
        if (u.includes("kg") || u.includes("kilogram")) mappedUnitGuid = "40000000-0000-0000-0000-000000000001";
        else if (u.includes("ton")) mappedUnitGuid = "40000000-0000-0000-0000-000000000008";
        else if (u.includes("box")) mappedUnitGuid = "40000000-0000-0000-0000-000000000005";
        else if (u.includes("sack")) mappedUnitGuid = "40000000-0000-0000-0000-000000000009";
        else if (u.includes("bag") || u.includes("pack") || u.includes("piece")) mappedUnitGuid = "40000000-0000-0000-0000-000000000007";
        else if (u.includes("liter")) mappedUnitGuid = "40000000-0000-0000-0000-000000000003";
      }
      if (!mappedUnitGuid) mappedUnitGuid = "40000000-0000-0000-0000-000000000001";

      setFormData({
        name: initialData.name || "",
        categoryId: initialData.categoryId || (categories.length > 0 ? String(categories[0].id) : ""),
        unit: mappedUnitGuid,
        gtin: initialData.gtin || "",
      });
    } else {
      setFormData({
        name: "",
        categoryId: categories.length > 0 ? String(categories[0].id) : "",
        unit: "40000000-0000-0000-0000-000000000001",
        gtin: "",
      });
    }
  }, [initialData, isOpen, categoriesData]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }
    if (!formData.unit.trim()) {
      newErrors.unit = "Unit is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const orgId = initialData?.organizationId || (user as any)?.organizationId || (user as any)?.orgId || undefined;
      if (isEdit && productId) {
        await updateProduct.mutateAsync({
          id: productId,
          data: {
            name: formData.name,
            categoryId: formData.categoryId || undefined,
            unitId: formData.unit,
            unit: formData.unit,
            organizationId: orgId,
            gtin: formData.gtin || undefined,
          },
        });
        toast.success(lang === "vi" ? "Cập nhật sản phẩm thành công!" : "Product updated successfully!");
      } else {
        await createProduct.mutateAsync({
          name: formData.name,
          categoryId: formData.categoryId || undefined,
          unitId: formData.unit,
          unit: formData.unit,
          organizationId: orgId,
          gtin: formData.gtin || undefined,
        });
        toast.success(lang === "vi" ? "Tạo sản phẩm mới thành công!" : "Product created successfully!");
      }
      onClose();
    } catch (error: any) {
      console.error("Error saving product:", error);
      const errData = error?.response?.data;
      const errorList = Array.isArray(errData?.errorMessages) && errData.errorMessages.length > 0
        ? errData.errorMessages.join(", ")
        : null;
        const fallbackMsg = lang === "vi" ? "Lưu sản phẩm thất bại" : "Failed to save product";
        const rawMsg = errorList || errData?.detail || errData?.data || errData?.message || error?.message || fallbackMsg;
        const errMsg = translateApiError(rawMsg, lang);
        setErrors({ submit: errMsg });
        toast.error(errMsg);
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isEdit 
                ? (lang === "vi" ? "Chỉnh sửa sản phẩm" : "Edit Product") 
                : (lang === "vi" ? "Thêm sản phẩm mới" : "Create New Product")}
            </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Organic Jasmine Rice"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                GTIN (GS1 Standard)
              </label>
              <button
                type="button"
                onClick={() => {
                  const randomDigits = "893" + Math.floor(10000000 + Math.random() * 90000000).toString();
                  let sum = 0;
                  for (let i = 0; i < 11; i++) {
                    const val = parseInt(randomDigits[i], 10);
                    sum += (i % 2 === 0) ? val : val * 3;
                  }
                  const checkDigit = (10 - (sum % 10)) % 10;
                  setFormData({ ...formData, gtin: randomDigits + checkDigit });
                }}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                ⚡ Auto-generate GS1
              </button>
            </div>
            <input
              type="text"
              value={formData.gtin}
              onChange={(e) => setFormData({ ...formData, gtin: e.target.value.replace(/\D/g, '').slice(0, 14) })}
              placeholder="e.g. 8934567890123 (Leave blank for auto-generation)"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-600 focus:ring-2 focus:ring-green-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Category
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white transition-all focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat: any) => {
                const catId = String(cat.id || cat.categoryId || "");
                return (
                  <option key={catId} value={catId}>
                    {cat.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Unit of Measurement <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white transition-all focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >
              <option value="40000000-0000-0000-0000-000000000001">kg (Kilogram)</option>
              <option value="40000000-0000-0000-0000-000000000008">ton (Metric Ton)</option>
              <option value="40000000-0000-0000-0000-000000000005">box (Box)</option>
              <option value="40000000-0000-0000-0000-000000000009">sack (Sack)</option>
              <option value="40000000-0000-0000-0000-000000000007">bag / pack (Piece)</option>
              <option value="40000000-0000-0000-0000-000000000003">liter (Liter)</option>
            </select>
            {errors.unit && <p className="text-xs text-red-500 mt-1">{errors.unit}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProduct.isPending || updateProduct.isPending}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "#2E7D32" }}
            >
              {createProduct.isPending || updateProduct.isPending
                ? "Saving..."
                : isEdit
                ? "Update Product"
                : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
