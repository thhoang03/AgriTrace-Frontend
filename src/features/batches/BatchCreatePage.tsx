import { useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Save, Package, MapPin, User, Leaf,
  Image as ImageIcon, AlertCircle, CheckCircle,
} from "lucide-react";
import { useCreateBatch } from "./batches.queries";
import type { CreateBatchRequest } from "./batches.types";
import { useAuth } from "../auth/auth.store";
import { useCategoriesList } from "../categories/categories.queries";

const initialForm: CreateBatchRequest = {
  product: "",
  productName: "",
  category: "",
  farm: "",
  farmer: "",
  harvestDate: "",
  quantity: 0,
  unit: "kg",
  weight: "",
  productionArea: "",
  location: "",
  gps: "",
  gpsLocation: "",
  description: "",
  productImage: "",
};

type Section = "product" | "farm" | "quantity" | "location";

const SECTIONS: { key: Section; label: string; icon: React.ElementType; desc: string }[] = [
  { key: "product",  label: "Product Details",  icon: Package, desc: "Product and category information" },
  { key: "farm",     label: "Farm & Producer",   icon: Leaf,    desc: "Farming origin and producer info" },
  { key: "quantity", label: "Quantity & Weight", icon: Package, desc: "Volume, unit, and weight details" },
  { key: "location", label: "Location & GPS",    icon: MapPin,  desc: "Geographic and GPS coordinates" },
];

function FieldLabel({ required, children }: { required?: boolean; children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
      {children}
      {required && <span className="text-red-500">*</span>}
    </span>
  );
}

function CategorySelect({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  className: string;
}) {
  const { data, isLoading } = useCategoriesList({ pageSize: 100 });
  const categories = data?.data?.items ?? [];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      style={{ appearance: "auto" }}
    >
      <option value="">-- Chọn danh mục --</option>
      {isLoading && <option disabled>Đang tải...</option>}
      {categories
        .filter((c) => c.isActive)
        .map((c) => (
          <option key={c.categoryId} value={c.name}>
            {c.name}
          </option>
        ))}
    </select>
  );
}

export function BatchCreatePage() {
  const navigate = useNavigate();
  const createBatch = useCreateBatch();
  const { user } = useAuth();
  const [form, setForm] = useState<CreateBatchRequest>({
    ...initialForm,
    farm: user?.organization ?? "",
    farmer: user?.name ?? "",
    harvestDate: new Date().toISOString().split("T")[0],
  });
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<Section>("product");
  const [imageError, setImageError] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const isValid = useMemo(() => Boolean(
    form.product.trim() &&
    form.category.trim() &&
    form.farm.trim() &&
    form.farmer.trim() &&
    form.harvestDate.trim() &&
    form.location.trim() &&
    form.gps.trim() &&
    Number(form.quantity) > 0 &&
    form.weight.trim()
  ), [form]);

  const handleChange = (field: keyof CreateBatchRequest, value: string | number) =>
    setForm((curr) => ({ ...curr, [field]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!isValid) { setError("Please complete all required fields before submitting."); return; }
    try {
      const result = await createBatch.mutateAsync({ ...form, quantity: Number(form.quantity) });
      navigate(`/app/batches/${result.data.id}`);
    } catch {
      setError("Unable to create this batch right now. Please try again.");
    }
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none text-sm transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100";

  const openMaps = () => {
    if (form.gps) window.open(`https://maps.google.com/?q=${encodeURIComponent(form.gps)}`, "_blank");
  };

  return (
    <div className="pb-10">
      {/* Banner */}
      <div className="relative h-40 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)" }} />
        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-10 bg-white" />
        <div className="absolute right-32 bottom-0 w-24 h-24 rounded-full opacity-10 bg-white" />
        <div className="relative z-10 h-full flex items-center px-8">
          <div>
            <button
              onClick={() => navigate("/app/batches")}
              className="flex items-center gap-1.5 text-green-200 hover:text-white text-sm mb-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Batch List
            </button>
            <h1 className="text-white" style={{ fontSize: 26, fontWeight: 800 }}>Create New Batch</h1>
            <p className="text-green-100 text-sm mt-0.5">
              Register a new agricultural batch and generate traceability data
            </p>
          </div>
          <div className="ml-auto">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
            >
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">

          {/* Left: Section Navigator */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl p-3 sticky top-4" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 px-2 mb-2">Form Sections</div>
              {SECTIONS.map(({ key, label, icon: Icon, desc }) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveSection(key);
                    document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all mb-0.5 ${activeSection === key ? "text-white" : "text-gray-600 hover:bg-gray-50"}`}
                  style={activeSection === key ? { background: "linear-gradient(135deg, #2E7D32, #388E3C)" } : {}}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold">{label}</div>
                    <div className={`text-xs mt-0.5 ${activeSection === key ? "text-green-200" : "text-gray-400"}`}>{desc}</div>
                  </div>
                </button>
              ))}

              {/* Completion indicator */}
              <div className="mt-4 px-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Form Completion</span>
                  <span className="font-semibold" style={{ color: "#2E7D32" }}>
                    {isValid ? "100%" : "In progress"}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      background: "#2E7D32",
                      width: `${Math.min(100, [
                        form.product, form.category, form.farm, form.farmer,
                        form.harvestDate, form.location, form.gps,
                        String(form.quantity), form.weight,
                      ].filter(Boolean).length / 9 * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="xl:col-span-3">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">

              {/* Section: Product Details */}
              <div id="section-product" className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#E8F5E9" }}>
                    <Package className="w-4 h-4" style={{ color: "#2E7D32" }} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Product Details</div>
                    <div className="text-xs text-gray-400">Name, category, and product image</div>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-1.5">
                    <FieldLabel required>Product Name</FieldLabel>
                    <input value={form.product} onChange={(e) => handleChange("product", e.target.value)} className={inputClass} placeholder="e.g. Dragon Fruit" />
                  </label>
                  <label className="space-y-1.5">
                    <FieldLabel>Display Name</FieldLabel>
                    <input value={form.productName} onChange={(e) => handleChange("productName", e.target.value)} className={inputClass} placeholder="Optional display name" />
                  </label>
                  <label className="space-y-1.5 md:col-span-2">
                    <FieldLabel required>Category</FieldLabel>
                    <CategorySelect
                      value={form.category}
                      onChange={(val) => handleChange("category", val)}
                      className={inputClass}
                    />
                  </label>

                  {/* Image URL with preview */}
                  <div className="md:col-span-2 space-y-1.5">
                    <FieldLabel>Product Image URL</FieldLabel>
                    <div className="flex gap-3">
                      <input
                        value={form.productImage}
                        onChange={(e) => { handleChange("productImage", e.target.value); setImageError(false); }}
                        className={inputClass}
                        placeholder="https://... (optional)"
                      />
                      <div
                        className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
                        style={{ background: "#F8FAF8", border: "1.5px dashed #D1D5DB" }}
                      >
                        {form.productImage && !imageError ? (
                          <img
                            src={form.productImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Farm & Producer */}
              <div id="section-farm" className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#E8F5E9" }}>
                    <Leaf className="w-4 h-4" style={{ color: "#2E7D32" }} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Farm &amp; Producer</div>
                    <div className="text-xs text-gray-400">Origin farm and farmer details</div>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-1.5 md:col-span-2">
                    <FieldLabel required>Farm Name</FieldLabel>
                    <input value={form.farm} onChange={(e) => handleChange("farm", e.target.value)} disabled className={`${inputClass} bg-gray-50 opacity-70 cursor-not-allowed`} placeholder="Farm / Cooperative name" />
                  </label>
                  <label className="space-y-1.5 md:col-span-2">
                    <FieldLabel required>Farmer / Producer</FieldLabel>
                    <input value={form.farmer} onChange={(e) => handleChange("farmer", e.target.value)} disabled className={`${inputClass} bg-gray-50 opacity-70 cursor-not-allowed`} placeholder="Farmer full name" />
                  </label>
                  <label className="space-y-1.5 md:col-span-2">
                    <FieldLabel required>Harvest Date</FieldLabel>
                    <input type="date" value={form.harvestDate} onChange={(e) => handleChange("harvestDate", e.target.value)} className={inputClass} />
                  </label>
                </div>
              </div>

              {/* Section: Quantity & Weight */}
              <div id="section-quantity" className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#E8F5E9" }}>
                    <User className="w-4 h-4" style={{ color: "#2E7D32" }} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Quantity &amp; Weight</div>
                    <div className="text-xs text-gray-400">Volume, units, and weight information</div>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="space-y-1.5">
                    <FieldLabel required>Quantity</FieldLabel>
                    <input type="number" min={1} value={form.quantity || ""} onChange={(e) => handleChange("quantity", Number(e.target.value))} className={inputClass} placeholder="500" />
                  </label>
                  <label className="space-y-1.5">
                    <FieldLabel>Unit</FieldLabel>
                    <input value={form.unit} onChange={(e) => handleChange("unit", e.target.value)} className={inputClass} placeholder="kg" />
                  </label>
                  <label className="space-y-1.5">
                    <FieldLabel required>Weight</FieldLabel>
                    <input value={form.weight} onChange={(e) => handleChange("weight", e.target.value)} className={inputClass} placeholder="500 kg" />
                  </label>
                  <label className="md:col-span-3 space-y-1.5">
                    <FieldLabel>Description / Notes</FieldLabel>
                    <textarea
                      value={form.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      className={`${inputClass} min-h-24 resize-none`}
                      placeholder="Batch description, growing conditions, or additional notes..."
                    />
                  </label>
                </div>
              </div>

              {/* Section: Location & GPS */}
              <div id="section-location" className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#E8F5E9" }}>
                    <MapPin className="w-4 h-4" style={{ color: "#2E7D32" }} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Location &amp; GPS</div>
                    <div className="text-xs text-gray-400">Geographic origin and coordinates</div>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-1.5">
                    <FieldLabel required>Location</FieldLabel>
                    <input value={form.location} onChange={(e) => handleChange("location", e.target.value)} className={inputClass} placeholder="Province or city" />
                  </label>
                  <label className="space-y-1.5">
                    <FieldLabel>Production Area</FieldLabel>
                    <input value={form.productionArea} onChange={(e) => handleChange("productionArea", e.target.value)} className={inputClass} placeholder="e.g. Bình Thuận Province" />
                  </label>
                  <div className="space-y-1.5">
                    <FieldLabel required>GPS Coordinates</FieldLabel>
                    <div className="flex gap-2">
                      <input
                        value={form.gps}
                        onChange={(e) => handleChange("gps", e.target.value)}
                        className={inputClass}
                        placeholder="10.1234, 107.5678"
                      />
                      <button
                        type="button"
                        onClick={openMaps}
                        disabled={!form.gps}
                        className="flex-shrink-0 px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5" /> View
                      </button>
                    </div>
                    {form.gps && (
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" /> Coordinates entered
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Error + Submit */}
              {error && (
                <div
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
                  style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/app/batches")}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createBatch.isPending || !isValid}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #2E7D32, #388E3C)" }}
                >
                  <Save className="w-4 h-4" />
                  {createBatch.isPending ? "Creating..." : "Create Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
