import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Save, Package, Leaf, Calendar, MapPin, Map, LocateFixed,
  Image as ImageIcon, AlertCircle, CheckCircle, FileText, Building, UserCheck
} from "lucide-react";
import { useCreateBatch } from "./batches.queries";
import type { CreateBatchRequest } from "./batches.types";
import { useAuth } from "../auth/auth.store";
import { useLanguage } from "../../contexts/LanguageContext";
import { useProductsList, useUpdateProduct } from "../products/products.queries";
import { lookupApi } from "../../lib/api/lookup";
import { MapPickerModal } from "../../components/common/MapPickerModal";
import { fetchDeviceLocation } from "../../utils/locationUtils";
import { supplyChainApi } from "../supply-chain/supply-chain.api";
import { usersApi } from "../users/users.api";

const DEFAULT_UNITS = [
  { id: "40000000-0000-0000-0000-000000000001", code: "KG", name: "Kilogram (kg)" },
  { id: "40000000-0000-0000-0000-000000000002", code: "GRAM", name: "Gram (g)" },
  { id: "40000000-0000-0000-0000-000000000003", code: "LITER", name: "Lít (Liter)" },
  { id: "40000000-0000-0000-0000-000000000005", code: "BOX", name: "Thùng (Box)" },
  { id: "40000000-0000-0000-0000-000000000006", code: "BAG", name: "Bao / Túi (Bag)" },
  { id: "40000000-0000-0000-0000-000000000008", code: "CRATE", name: "Sọt (Crate)" },
];

type Section = "product" | "quantity" | "origin";

const getSections = (lang: string): { key: Section; label: string; icon: React.ElementType; desc: string }[] => [
  { key: "product",  label: lang === "vi" ? "1. Thông tin Sản phẩm" : "1. Product Details",   icon: Package,  desc: lang === "vi" ? "Sản phẩm & Danh mục nông sản" : "Product & Category" },
  { key: "quantity", label: lang === "vi" ? "2. Sản xuất & Số lượng" : "2. Production & Quantity",  icon: Calendar, desc: lang === "vi" ? "Số lượng, đơn vị, ngày tạo & HSD" : "Quantity, unit, production & expiry" },
  { key: "origin",   label: lang === "vi" ? "3. Nguồn gốc & Ghi chú" : "3. Origin & Notes",  icon: Leaf,     desc: lang === "vi" ? "Thông tin nông trại & ghi chú thêm" : "Farm info & additional notes" },
];

function FieldLabel({ required, children }: { required?: boolean; children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
      {children}
      {required && <span className="text-rose-500 font-bold">*</span>}
    </span>
  );
}

function ProductSelect({
  lang,
  value,
  onChange,
  onProductSelected,
  className,
}: {
  lang: string;
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
          const product = products.find((p: any) => String(p.productId) === val || String(p.id) === val);
          if (product) onProductSelected(product);
        }
      }}
      className={className}
      style={{ appearance: "auto" }}
    >
      <option value="">{lang === "vi" ? "-- Chọn sản phẩm nông sản --" : "-- Select Product --"}</option>
      {isLoading && <option disabled>{lang === "vi" ? "Đang tải danh sách sản phẩm..." : "Loading products..."}</option>}
      {products
        .filter((c: any) => c.isActive ?? true)
        .map((c: any) => {
          const pId = String(c.productId || c.id || "");
          return (
            <option key={pId} value={pId}>
              {c.name} {c.code ? `(${c.code})` : ""}
            </option>
          );
        })}
    </select>
  );
}

function UnitSelect({
  lang,
  value,
  unitId,
  onChange,
  className,
}: {
  value: string;
  lang: string;
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

  const currentValue = unitId || units.find((u) => u.code.toLowerCase() === value.toLowerCase())?.id || value || "";

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
      <option value="">{lang === "vi" ? "-- Chọn đơn vị tính --" : "-- Select Unit --"}</option>
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
  const { lang } = useLanguage();
  const createBatch = useCreateBatch();
  const { user } = useAuth();

  // Fetch event types once at mount to find the CREATED / HARVEST event type ID
  const [harvestEventTypeId, setHarvestEventTypeId] = useState<string>("");
  useEffect(() => {
    supplyChainApi.getEventTypes().then((types) => {
      const found = types.find(
        (t) =>
          t.code?.toUpperCase() === "CREATED" ||
          t.code?.toUpperCase() === "CREATE" ||
          t.code?.toUpperCase() === "HARVEST",
      );
      if (found) setHarvestEventTypeId(found.id);
    }).catch(() => {});
  }, []);

  const updateProduct = useUpdateProduct();
  const [selectedProductObj, setSelectedProductObj] = useState<any>(null);
  const [isAssigningGtin, setIsAssigningGtin] = useState(false);

  const [form, setForm] = useState<CreateBatchRequest & { gtin?: string }>({
    productId: "",
    product: "",
    productName: "",
    category: "",
    farm: user?.organizationName || (user as any)?.organization || "",
    farmer: user?.name || user?.email || "",
    productionDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    quantity: 0,
    unit: "",
    unitId: "",
    description: "",
    productImage: "",
  });

  useEffect(() => {
    const orgFallback = user?.organizationName || (user as any)?.organization || "AgriTrace Vietnam";
    const userFallback = user?.name || user?.email || "System Administrator";

    setForm((curr) => ({
      ...curr,
      farm: curr.farm || orgFallback,
      farmer: curr.farmer || userFallback,
    }));

    usersApi.getProfile().then((profile) => {
      if (profile) {
        const fetchedOrg = profile.organization || profile.organizationType || orgFallback;
        const fetchedName = profile.fullName || profile.username || userFallback;
        setForm((curr) => ({
          ...curr,
          farm: fetchedOrg || curr.farm || orgFallback,
          farmer: fetchedName || curr.farmer || userFallback,
        }));
      }
    }).catch(() => {});
  }, [user]);

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

  const [detectingGps, setDetectingGps] = useState(false);

  const handleDetectGps = async () => {
    setDetectingGps(true);
    try {
      const res = await fetchDeviceLocation();
      const addressOnly = res.address || res.locationString.replace(/\s*\(-?\d+\.\d+,\s*-?\d+\.\d+\)/, "").trim();
      const latStr = res.latitude ? res.latitude.toFixed(6) : "";
      const lngStr = res.longitude ? res.longitude.toFixed(6) : "";
      const coordsStr = latStr && lngStr ? `${latStr}, ${lngStr}` : res.locationString;

      setForm((curr) => ({
        ...curr,
        location: addressOnly || curr.location,
        gps: coordsStr || curr.gps,
        gpsLocation: coordsStr || curr.gpsLocation,
        productionArea: addressOnly || curr.productionArea,
      }));
    } catch (err: any) {
      console.warn("GPS detection error:", err);
    } finally {
      setDetectingGps(false);
    }
  };

  const openMaps = () => {
    if (form.gps) window.open(`https://maps.google.com/?q=${encodeURIComponent(form.gps)}`, "_blank");
  };

  const isValid = useMemo(() => Boolean(
    (form.productId?.trim() || form.product?.trim()) &&
    Number(form.quantity) > 0 &&
    (form.unitId?.trim() || form.unit?.trim()) &&
    form.productionDate?.trim()
  ), [form]);

  const handleChange = (field: keyof CreateBatchRequest, value: string | number) =>
    setForm((curr) => ({ ...curr, [field]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!isValid) {
      setError(lang === "vi" ? "Vui lòng điền đầy đủ các thông tin bắt buộc (*)." : "Please fill in all required fields (*).");
      return;
    }
    try {
      const payload: CreateBatchRequest = {
        ...form,
        productId: form.productId || form.product,
        product: form.productId || form.product,
        quantity: Number(form.quantity),
        productionDate: form.productionDate,
        expiryDate: form.expiryDate || undefined,
      };
      const result = await createBatch.mutateAsync(payload);
      const newBatchId = result.data.id;

      navigate(`/app/batches/${newBatchId}`);
    } catch (err: any) {
      const serverErrors = err?.response?.data?.errors;
      let msg = err?.response?.data?.message || err?.message || lang === "vi" ? "Không thể tạo lô hàng lúc này. Vui lòng thử lại." : "Cannot create batch at this time. Please try again.";
      if (Array.isArray(serverErrors) && serverErrors.length > 0) {
        msg = serverErrors.map((e: any) => e.message || e.field).join(" | ");
      }
      setError(msg);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none text-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white text-gray-800 shadow-xs font-medium";
  const readOnlyInputClass = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none text-sm bg-gray-50 text-gray-600 font-medium cursor-not-allowed";

  return (
    <div className="pb-10">
      {/* Header Banner */}
      <div className="relative h-40 overflow-hidden" style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)" }}>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-10 bg-white" />
        <div className="absolute right-32 bottom-0 w-24 h-24 rounded-full opacity-10 bg-white" />
        <div className="relative z-10 h-full flex items-center px-8">
          <div>
            <button
              onClick={() => navigate("/app/batches")}
              className="flex items-center gap-1.5 text-green-200 hover:text-white text-sm mb-3 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> {lang === "vi" ? "Quay lại danh sách Lô hàng" : "Back to Batches"}
            </button>
            <h1 className="text-white" style={{ fontSize: 26, fontWeight: 800 }}>{lang === "vi" ? "Khởi Tạo Lô Hàng Mới" : "Create New Batch"}</h1>
            <p className="text-green-100 text-sm mt-0.5 opacity-90">
              {lang === "vi" ? "Khai báo mã lô nông sản mới và phát sinh dữ liệu truy xuất nguồn gốc ban đầu" : "Declare new batch code and generate initial traceability data"}
            </p>
          </div>
          <div className="ml-auto">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner"
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
            <div className="bg-white rounded-2xl p-3 sticky top-4 border border-gray-100" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400 px-2 mb-2">{lang === "vi" ? "Các mục thông tin" : "Sections"}</div>
              {getSections(lang).map(({ key, label, icon: Icon, desc }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setActiveSection(key);
                    document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all mb-1 ${activeSection === key ? "text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
                  style={activeSection === key ? { background: "linear-gradient(135deg, #2E7D32, #388E3C)" } : {}}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold">{label}</div>
                    <div className={`text-[11px] mt-0.5 ${activeSection === key ? "text-green-100 opacity-90" : "text-gray-400"}`}>{desc}</div>
                  </div>
                </button>
              ))}

              {/* Progress completion bar */}
              <div className="mt-4 px-2 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-medium">
                  <span>{lang === "vi" ? "Tiến độ hoàn thành" : "Completion Progress"}</span>
                  <span className="font-bold" style={{ color: "#2E7D32" }}>
                    {isValid ? (lang === "vi" ? "Hoàn tất 100%" : "100% Completed") : (lang === "vi" ? "Đang nhập..." : "Entering...")}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      background: "#2E7D32",
                      width: `${Math.min(100, [
                        form.productId || form.product,
                        String(form.quantity),
                        form.unitId || form.unit,
                        form.productionDate,
                      ].filter(Boolean).length / 4 * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form fields */}
          <div className="xl:col-span-3">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">

              {/* Section 1: Product Details */}
              <div id="section-product" className="bg-white rounded-2xl overflow-hidden border border-gray-100" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-100">
                    <Package className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{lang === "vi" ? "1. Thông tin Sản phẩm (Product Details)" : "1. Product Details"}</div>
                    <div className="text-xs text-gray-500">{lang === "vi" ? "Chọn sản phẩm nông sản và danh mục liên quan" : "Select agricultural product and related category"}</div>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-1.5 md:col-span-2">
                    <FieldLabel required>{lang === "vi" ? "Sản phẩm Nông sản" : "Agricultural Product"}</FieldLabel>
                    <ProductSelect
                      value={form.productId || form.product}
                      onChange={(val) => {
                        setForm((curr) => ({ ...curr, productId: val, product: val }));
                      }}
                      onProductSelected={(product) => {
                        setSelectedProductObj(product);
                        handleChange("productName", product.name || "");
                        if (product.categoryName || product.category) {
                          handleChange("category", product.categoryName || product.category);
                        }
                        setForm((curr) => ({ ...curr, gtin: product.gtin || product.Gtin || "" }));
                        if (product.unit) handleChange("unit", product.unit);
                        if (product.unitId) handleChange("unitId", product.unitId);
                      }}
                      lang={lang}
                      className={inputClass}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <FieldLabel>{lang === "vi" ? "Danh mục nông sản" : "Category"}</FieldLabel>
                    <input
                      readOnly
                      value={form.category || (lang === "vi" ? "Theo sản phẩm đã chọn" : "Based on selected product")}
                      className={readOnlyInputClass}
                      placeholder={lang === "vi" ? "Danh mục tự động cập nhật" : "Automatically updated category"}
                    />
                  </label>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <FieldLabel>{lang === "vi" ? "Mã GTIN (GS1 chuẩn)" : "GTIN (GS1 Standard)"}</FieldLabel>
                      {form.productId && !form.gtin && (
                        <button
                          type="button"
                          disabled={isAssigningGtin}
                          onClick={async () => {
                            setIsAssigningGtin(true);
                            try {
                              const randomDigits = "893" + Math.floor(10000000 + Math.random() * 90000000).toString();
                              let sum = 0;
                              for (let i = 0; i < 11; i++) {
                                const val = parseInt(randomDigits[i], 10);
                                sum += (i % 2 === 0) ? val : val * 3;
                              }
                              const checkDigit = (10 - (sum % 10)) % 10;
                              const newGtin = randomDigits + checkDigit;

                              setForm((curr) => ({ ...curr, gtin: newGtin }));

                              if (selectedProductObj) {
                                await updateProduct.mutateAsync({
                                  id: form.productId,
                                  data: {
                                    name: selectedProductObj.name,
                                    categoryId: selectedProductObj.categoryId || selectedProductObj.category?.id,
                                    unitId: selectedProductObj.unitId || selectedProductObj.unit?.id,
                                    gtin: newGtin,
                                  },
                                });
                              }
                            } catch (err: any) {
                              console.warn("Auto GTIN error:", err);
                              setForm((curr) => ({ ...curr, gtin: selectedProductObj?.gtin || selectedProductObj?.Gtin || "" }));
                              alert(lang === "vi" ? "Không thể cấp GTIN: " + (err?.response?.data?.message || err.message) : "Failed to assign GTIN: " + (err?.response?.data?.message || err.message));
                            } finally {
                              setIsAssigningGtin(false);
                            }
                          }}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          ⚡ {isAssigningGtin ? (lang === "vi" ? "Đang gán..." : "Assigning...") : (lang === "vi" ? "Tự động cấp GTIN" : "Auto-assign GTIN")}
                        </button>
                      )}
                    </div>
                    <input
                      readOnly
                      value={form.gtin ? form.gtin : (form.productId ? (lang === "vi" ? "⚠️ Chưa gán GTIN trong Danh mục Sản phẩm" : "⚠️ No GTIN assigned in Product Catalog") : (lang === "vi" ? "Theo sản phẩm đã chọn" : "Based on selected product"))}
                      className={`${readOnlyInputClass} ${form.gtin ? "font-mono text-emerald-700 font-bold" : ""}`}
                      placeholder={lang === "vi" ? "Mã GTIN tự động kế thừa" : "Automatically inherited GTIN"}
                    />
                  </div>

                  {/* Product Image URL */}
                  <div className="md:col-span-2 space-y-1.5">
                    <FieldLabel>{lang === "vi" ? "URL Hình ảnh sản phẩm (Tùy chọn)" : "Product Image URL (Optional)"}</FieldLabel>
                    <div className="flex gap-3">
                      <input
                        value={form.productImage || ""}
                        onChange={(e) => { handleChange("productImage", e.target.value); setImageError(false); }}
                        className={inputClass}
                        placeholder="https://example.com/product-image.jpg"
                      />
                      <div
                        className="w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 shadow-xs"
                      >
                        {form.productImage && !imageError ? (
                          <img
                            src={form.productImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Production & Quantity */}
              <div id="section-quantity" className="bg-white rounded-2xl overflow-hidden border border-gray-100" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-100">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{lang === "vi" ? "2. Sản xuất & Số lượng (Production & Volume)" : "2. Production & Quantity"}</div>
                    <div className="text-xs text-gray-500">{lang === "vi" ? "Quy mô sản xuất, đơn vị tính, ngày khởi tạo và hạn sử dụng" : "Production scale, unit, creation date and expiry"}</div>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-1.5">
                    <FieldLabel required>{lang === "vi" ? "Số lượng Lô hàng" : "Batch Quantity"}</FieldLabel>
                    <input
                      type="number"
                      min={1}
                      value={form.quantity || ""}
                      onChange={(e) => handleChange("quantity", Number(e.target.value))}
                      className={inputClass}
                      placeholder={lang === "vi" ? "Nhập số lượng (vd: 500)" : "Enter quantity (e.g. 500)"}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <FieldLabel required>{lang === "vi" ? "Đơn vị tính" : "Unit of Measure"}</FieldLabel>
                    <UnitSelect
                      value={form.unit || "kg"}
                      unitId={form.unitId}
                      lang={lang}
                      onChange={(unitCode, unitId) => {
                        setForm((curr) => ({ ...curr, unit: unitCode, unitId: unitId }));
                      }}
                      className={inputClass}
                    />
                  </label>

                  <label className="space-y-1.5 md:col-span-2">
                    <FieldLabel required>{lang === "vi" ? "Ngày bắt đầu sản xuất / Gieo trồng (Production Date)" : "Production / Planting Date"}</FieldLabel>
                    <input
                      type="date"
                      value={form.productionDate}
                      onChange={(e) => handleChange("productionDate", e.target.value)}
                      className={inputClass}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <FieldLabel>{lang === "vi" ? "Hạn sử dụng dự kiến (Expiry Date)" : "Estimated Expiry Date"}</FieldLabel>
                    <input
                      type="date"
                      value={form.expiryDate || ""}
                      onChange={(e) => handleChange("expiryDate", e.target.value)}
                      className={inputClass}
                    />
                  </label>
                </div>
              </div>

              {/* Section 3: Origin & Notes */}
              <div id="section-origin" className="bg-white rounded-2xl overflow-hidden border border-gray-100" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-100">
                    <Leaf className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{lang === "vi" ? "3. Nguồn gốc Trang trại & Ghi chú" : "3. Farm Origin & Notes"}</div>
                    <div className="text-xs text-gray-500">{lang === "vi" ? "Đơn vị chủ quản và ghi chú bổ sung về lô hàng" : "Managing unit and additional batch notes"}</div>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Location Mapping Action Bar */}
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:col-span-2">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Interactive Location Mapping</span>
                      <p className="text-xs text-emerald-600 mt-0.5">{lang === "vi" ? "Chọn vị trí trên bản đồ tương tác hoặc định vị GPS thiết bị hiện tại" : "Select location on interactive map or use current device GPS"}</p>
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
                        disabled={detectingGps}
                        className="px-3.5 py-2 bg-white hover:bg-emerald-100 disabled:opacity-50 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <LocateFixed className={`w-4 h-4 ${detectingGps ? "animate-spin" : ""}`} />
                        {detectingGps ? lang === "vi" ? "Đang định vị địa chỉ..." : "Detecting address..." : "Use Device GPS"}
                      </button>
                    </div>
                  </div>

                  <label className="space-y-1.5">
                    <FieldLabel>{lang === "vi" ? "Đơn vị / Trang trại sản xuất" : "Production Unit / Farm"}</FieldLabel>
                    <div className="relative flex items-center">
                      <Building className="w-4 h-4 text-emerald-600 absolute left-3" />
                      <input
                        readOnly
                        value={form.farm || (user?.organizationName || "AgriTrace Vietnam")}
                        className={`${readOnlyInputClass} pl-9 font-semibold text-gray-800`}
                      />
                    </div>
                  </label>

                  <label className="space-y-1.5">
                    <FieldLabel>{lang === "vi" ? "Người lập hồ sơ / Chuyên viên" : "Profile Creator / Specialist"}</FieldLabel>
                    <div className="relative flex items-center">
                      <UserCheck className="w-4 h-4 text-emerald-600 absolute left-3" />
                      <input
                        readOnly
                        value={form.farmer || (user?.name || "System Administrator")}
                        className={`${readOnlyInputClass} pl-9 font-semibold text-gray-800`}
                      />
                    </div>
                  </label>

                  <label className="space-y-1.5 md:col-span-2">
                    <FieldLabel>{lang === "vi" ? "Địa chỉ Nông trại / Vùng sản xuất (Location Address)" : "Farm Address / Production Area"}</FieldLabel>
                    <div className="relative flex items-center">
                      <MapPin className="w-4 h-4 text-emerald-600 absolute left-3" />
                      <input
                        value={form.location || ""}
                        onChange={(e) => handleChange("location", e.target.value)}
                        className={`${inputClass} pl-9`}
                        placeholder={lang === "vi" ? "vd: Xã Đại Lộc, Huyện Hậu Lộc, Thanh Hóa" : "e.g., Dai Loc, Hau Loc, Thanh Hoa"}
                      />
                    </div>
                  </label>

                  <label className="space-y-1.5">
                    <FieldLabel>{lang === "vi" ? "Vùng canh tác / Khu vực gieo trồng (Production Area)" : "Farming / Planting Area"}</FieldLabel>
                    <input
                      value={form.productionArea || ""}
                      onChange={(e) => handleChange("productionArea", e.target.value)}
                      className={inputClass}
                      placeholder={lang === "vi" ? "vd: Khu vực A - Nông trường 1, Tỉnh Bình Thuận" : "e.g., Area A - Farm 1, Binh Thuan"}
                    />
                  </label>

                  <div className="space-y-1.5">
                    <FieldLabel>{lang === "vi" ? "Tọa độ GPS (Lat, Lng)" : "GPS Coordinates (Lat, Lng)"}</FieldLabel>
                    <div className="flex gap-2">
                      <input
                        value={form.gps || ""}
                        onChange={(e) => handleChange("gps", e.target.value)}
                        className={inputClass}
                        placeholder="vd: 11.9404, 108.4583"
                      />
                      <button
                        type="button"
                        onClick={openMaps}
                        disabled={!form.gps}
                        className="flex-shrink-0 px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5" /> Xem Google Maps
                      </button>
                    </div>
                    {form.gps && (
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <CheckCircle className="w-3 h-3 text-green-500" /> Tọa độ đã nhập ({form.gps})
                      </div>
                    )}
                  </div>

                  <label className="md:col-span-2 space-y-1.5">
                    <FieldLabel>{lang === "vi" ? "Mô tả / Ghi chú điều kiện gieo trồng (Tùy chọn)" : "Description / Planting conditions notes (Optional)"}</FieldLabel>
                    <textarea
                      value={form.description || ""}
                      onChange={(e) => handleChange("description", e.target.value)}
                      className={`${inputClass} min-h-24 resize-none`}
                      placeholder={lang === "vi" ? "Nhập mô tả về điều kiện canh tác, giống cây trồng, hoặc các lưu ý khác..." : "Enter description of farming conditions, crop varieties, or other notes..."}
                    />
                  </label>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium animate-in fade-in"
                  style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/app/batches")}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={createBatch.isPending || !isValid}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:opacity-90 shadow-md shadow-emerald-700/20"
                  style={{ background: "linear-gradient(135deg, #2E7D32, #388E3C)" }}
                >
                  <Save className="w-4 h-4" />
                  {createBatch.isPending ? lang === "vi" ? "Đang tạo lô hàng..." : "Creating batch..." : lang === "vi" ? "Khởi Tạo Lô Hàng" : "Create Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Interactive Map Picker Modal */}
      <MapPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        onSelectLocation={handleMapSelect}
        initialLocation={form.location}
      />
    </div>
  );
}
