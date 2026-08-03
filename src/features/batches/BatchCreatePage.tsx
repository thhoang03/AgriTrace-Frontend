import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Save, Package, MapPin, User, Leaf,
  Image as ImageIcon, AlertCircle, CheckCircle, LocateFixed, Map,
} from "lucide-react";
import { useCreateBatch } from "./batches.queries";
import type { CreateBatchRequest } from "./batches.types";
import { useAuth } from "../auth/auth.store";
import { useCategoriesList } from "../categories/categories.queries";
import { useProductsList } from "../products/products.queries";
import { lookupApi } from "../../lib/api/lookup";
import { MapPickerModal } from "../../components/common/MapPickerModal";

const DEFAULT_UNITS = [
  { id: "10000000-0000-0000-0000-000000000001", code: "kg", name: "Kilogram (kg)" },
  { id: "10000000-0000-0000-0000-000000000002", code: "ton", name: "Tấn (Ton)" },
  { id: "10000000-0000-0000-0000-000000000003", code: "g", name: "Gram (g)" },
  { id: "10000000-0000-0000-0000-000000000004", code: "box", name: "Thùng (Box)" },
  { id: "10000000-0000-0000-0000-000000000005", code: "bag", name: "Bao / Túi (Bag)" },
  { id: "10000000-0000-0000-0000-000000000006", code: "crate", name: "Sọt (Crate)" },
  { id: "10000000-0000-0000-0000-000000000007", code: "liter", name: "Lít (Liter)" },
];

const initialForm: CreateBatchRequest = {
  product: "",
  productName: "",
  category: "",
  farm: "",
  farmer: "",
  harvestDate: "",
  quantity: 0,
  unit: "kg",
  unitId: "",
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
      <option value="">-- Select category --</option>
      {isLoading && <option disabled>Loading...</option>}
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

function ProductSelect({
  value,
  onChange,
  onProductSelected,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  onProductSelected?: (product: any) => void;
  className: string;
}) {
  const { data, isLoading } = useProductsList({ pageSize: 100 });
  const products = data?.data?.items ?? [];

  return (
    <select
      value={value}
      onChange={(e) => {
        const val = e.target.value;
        onChange(val);
        if (onProductSelected) {
          const product = products.find((p: any) => String(p.productId) === val);
          if (product) onProductSelected(product);
        }
      }}
      className={className}
      style={{ appearance: "auto" }}
    >
      <option value="">-- Select product --</option>
      {isLoading && <option disabled>Loading...</option>}
      {products
        .filter((c: any) => c.isActive)
        .map((c: any) => (
          <option key={c.productId} value={String(c.productId)}>
            {c.name}
          </option>
        ))}
    </select>
  );
}

function UnitSelect({
  value,
  unitId,
  onChange,
  className,
}: {
  value: string;
  unitId?: string;
  onChange: (unitCode: string, unitId: string) => void;
  className: string;
}) {
  const [units, setUnits] = useState<Array<{ id: string; code: string; name: string }>>(DEFAULT_UNITS);

  useEffect(() => {
    lookupApi
      .getUnits()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map((u: any) => ({
            id: u.value || u.id || u.code,
            code: u.label || u.code || u.value,
            name: `${u.label || u.code}`,
          }));
          setUnits(mapped);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_UNITS
      });
  }, []);

  const currentValue = unitId || units.find((u) => u.code.toLowerCase() === value.toLowerCase())?.id || value || DEFAULT_UNITS[0].id;

  return (
    <select
      value={currentValue}
      onChange={(e) => {
        const selectedId = e.target.value;
        const matched = units.find((u) => u.id === selectedId || u.code === selectedId);
        onChange(matched?.code || selectedId, matched?.id || selectedId);
      }}
      className={className}
      style={{ appearance: "auto" }}
    >
      <option value="">-- Select unit --</option>
      {units.map((u) => (
        <option key={u.id} value={u.id}>
          {u.name}
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
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleMapSelect = (selectedLocationStr: string) => {
    const coordMatch = selectedLocationStr.match(/\((-?\d+\.\d+),\s*(-?\d+\.\d+)\)/);
    if (coordMatch) {
      const lat = coordMatch[1];
      const lng = coordMatch[2];
      const addressOnly = selectedLocationStr.replace(/\s*\(-?\d+\.\d+,\s*-?\d+\.\d+\)/, "").trim();
      setForm((curr) => ({
        ...curr,
        location: addressOnly || curr.location,
        gps: `${lat}, ${lng}`,
        gpsLocation: `${lat}, ${lng}`,
        productionArea: addressOnly || curr.productionArea,
      }));
    } else {
      setForm((curr) => ({
        ...curr,
        location: selectedLocationStr,
      }));
    }
  };

  const handleDetectGps = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        setForm((curr) => ({
          ...curr,
          gps: `${lat}, ${lng}`,
          gpsLocation: `${lat}, ${lng}`,
        }));
      },
      (err) => {
        console.warn("GPS detection error:", err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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
                    <ProductSelect
                      value={form.product}
                      onChange={(val) => handleChange("product", val)}
                      onProductSelected={(product) => {
                        handleChange("productName", product.name);
                        if (product.categoryName) handleChange("category", product.categoryName);
                        if (product.unit) handleChange("unit", product.unit);
                        if (product.unitId) handleChange("unitId", product.unitId);
                      }}
                      className={inputClass}
                    />
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
                    <input value={form.farm} onChange={(e) => handleChange("farm", e.target.value)} className={inputClass} placeholder="Farm / Cooperative name" />
                  </label>
                  <label className="space-y-1.5 md:col-span-2">
                    <FieldLabel required>Farmer / Producer</FieldLabel>
                    <input value={form.farmer} onChange={(e) => handleChange("farmer", e.target.value)} className={inputClass} placeholder="Farmer full name" />
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
                    <FieldLabel required>Unit</FieldLabel>
                    <UnitSelect
                      value={form.unit || "kg"}
                      unitId={form.unitId}
                      onChange={(unitCode, unitId) => {
                        setForm((curr) => ({ ...curr, unit: unitCode, unitId: unitId }));
                      }}
                      className={inputClass}
                    />
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
                    <div className="font-semibold text-gray-900">Location &amp; GPS Mapping</div>
                    <div className="text-xs text-gray-400">Geographic origin, farm address, and GPS coordinates</div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {/* Location Mapping Action Bar */}
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Interactive Location Mapping</span>
                      <p className="text-xs text-emerald-600 mt-0.5">Pick location on 3rd-party interactive map or detect current device GPS</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsMapPickerOpen(true)}
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Map className="w-4 h-4" /> Pick on Map
                      </button>
                      <button
                        type="button"
                        onClick={handleDetectGps}
                        className="px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <LocateFixed className="w-4 h-4" /> Use Device GPS
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="space-y-1.5 md:col-span-2">
                      <FieldLabel required>Location Address</FieldLabel>
                      <div className="relative">
                        <input
                          value={form.location}
                          onChange={(e) => handleChange("location", e.target.value)}
                          className={inputClass}
                          placeholder="e.g. Xã Đại Lộc, Huyện Hậu Lộc, Thanh Hóa"
                        />
                      </div>
                    </label>

                    <label className="space-y-1.5">
                      <FieldLabel>Production Area</FieldLabel>
                      <input value={form.productionArea} onChange={(e) => handleChange("productionArea", e.target.value)} className={inputClass} placeholder="e.g. Bình Thuận Province" />
                    </label>

                    <div className="space-y-1.5">
                      <FieldLabel required>GPS Coordinates (Lat, Lng)</FieldLabel>
                      <div className="flex gap-2">
                        <input
                          value={form.gps}
                          onChange={(e) => handleChange("gps", e.target.value)}
                          className={inputClass}
                          placeholder="11.9404, 108.4583"
                        />
                        <button
                          type="button"
                          onClick={openMaps}
                          disabled={!form.gps}
                          className="flex-shrink-0 px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                        >
                          <MapPin className="w-3.5 h-3.5" /> View Google Maps
                        </button>
                      </div>
                      {form.gps && (
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" /> Coordinates entered ({form.gps})
                        </div>
                      )}
                    </div>
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

      {/* Map Picker Modal */}
      <MapPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        onSelectLocation={handleMapSelect}
        initialLocation={form.location}
      />
    </div>
  );
}
