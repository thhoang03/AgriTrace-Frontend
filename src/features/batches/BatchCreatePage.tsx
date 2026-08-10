import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Save, Package, Leaf, Calendar, MapPin, Map, LocateFixed,
  Image as ImageIcon, AlertCircle, CheckCircle, FileText, Building, UserCheck,
  QrCode, Hash, Sparkles, ArrowRight
} from "lucide-react";
import { useCreateBatch } from "./batches.queries";
import type { CreateBatchRequest } from "./batches.types";
import { useAuth } from "../auth/auth.store";
import { useProductsList } from "../products/products.queries";
import { lookupApi } from "../../lib/api/lookup";
import { MapPickerModal } from "../../components/common/MapPickerModal";
import { fetchDeviceLocation } from "../../utils/locationUtils";
import { supplyChainApi } from "../supply-chain/supply-chain.api";
import { toast } from "sonner";

const DEFAULT_UNITS = [
  { id: "40000000-0000-0000-0000-000000000001", code: "KG", name: "Kilogram (kg)" },
  { id: "40000000-0000-0000-0000-000000000002", code: "GRAM", name: "Gram (g)" },
  { id: "40000000-0000-0000-0000-000000000003", code: "LITER", name: "Lít (Liter)" },
  { id: "40000000-0000-0000-0000-000000000005", code: "BOX", name: "Thùng (Box)" },
  { id: "40000000-0000-0000-0000-000000000006", code: "BAG", name: "Bao / Túi (Bag)" },
  { id: "40000000-0000-0000-0000-000000000008", code: "CRATE", name: "Sọt (Crate)" },
];

type Section = "product" | "quantity" | "origin" | "preview";

const SECTIONS: { key: Section; label: string; icon: React.ElementType; desc: string }[] = [
  { key: "product",  label: "1. Thông tin Sản phẩm",   icon: Package,  desc: "Sản phẩm & Danh mục nông sản" },
  { key: "quantity", label: "2. Sản xuất & Số lượng",  icon: Calendar, desc: "Số lượng, đơn vị, ngày tạo & HSD" },
  { key: "origin",   label: "3. Nguồn gốc & Ghi chú",  icon: Leaf,     desc: "Thông tin nông trại & ghi chú thêm" },
  { key: "preview",  label: "4. Xem Lại & Khởi Tạo",   icon: QrCode,   desc: "Xem trước & xác nhận thông tin lô" },
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
          const product = products.find((p: any) => String(p.productId) === val || String(p.id) === val);
          if (product) onProductSelected(product);
        }
      }}
      className={className}
      style={{ appearance: "auto" }}
    >
      <option value="">-- Chọn sản phẩm nông sản --</option>
      {isLoading && <option disabled>Đang tải danh sách sản phẩm...</option>}
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
      <option value="">-- Chọn đơn vị tính --</option>
      {units.map((u) => (
        <option key={u.id} value={u.id}>
          {u.name}
        </option>
      ))}
    </select>
  );
}

// Compute a preview batch code from product + date
function previewBatchCode(productName: string, date: string): string {
  if (!productName || !date) return "PRODUCT-YYYYMMDD-001";
  const prefix = productName
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 8) || "PRODUCT";
  const datePart = date.replace(/-/g, "").slice(0, 8);
  return `${prefix}-${datePart}-001`;
}

export function BatchCreatePage() {
  const navigate = useNavigate();
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

  const [form, setForm] = useState<CreateBatchRequest>({
    productId: "",
    product: "",
    productName: "",
    category: "",
    farm: user?.organization ?? "Nông trại mặc định",
    farmer: user?.name ?? "Nông dân sản xuất",
    productionDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    quantity: 0,
    unit: "",
    unitId: "",
    description: "",
    productImage: "",
  });

  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<Section>("product");
  const [imageError, setImageError] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [msvt, setMsvt] = useState(""); // Mã số vùng trồng (Planting Zone Code)
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
      toast.success("Đã lấy tọa độ GPS thành công!");
    } catch (err: any) {
      toast.error("Không thể lấy GPS. Vui lòng chọn thủ công trên bản đồ.");
    } finally {
      setDetectingGps(false);
    }
  };

  const openMaps = () => {
    if (form.gps) window.open(`https://maps.google.com/?q=${encodeURIComponent(form.gps)}`, "_blank");
  };

  // Compute completion percent from required fields
  const completionScore = useMemo(() => {
    const checks = [
      Boolean(form.productId?.trim() || form.product?.trim()),
      Number(form.quantity) > 0,
      Boolean(form.unitId?.trim() || form.unit?.trim()),
      Boolean(form.productionDate?.trim()),
      Boolean(form.location?.trim()),
      Boolean(form.gps?.trim()),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form]);

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
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc (*).");
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
        description: msvt
          ? `MSVT: ${msvt}${form.description ? " | " + form.description : ""}`
          : form.description,
      };
      const result = await createBatch.mutateAsync(payload);
      const newBatchId = result.data.id;
      toast.success("Lô hàng đã được khởi tạo thành công trên hệ thống AgriTrace!");
      navigate(`/app/batches/${newBatchId}`);
    } catch (err: any) {
      const serverErrors = err?.response?.data?.errors;
      let msg = err?.response?.data?.message || err?.message || "Không thể tạo lô hàng lúc này. Vui lòng thử lại.";
      if (Array.isArray(serverErrors) && serverErrors.length > 0) {
        msg = serverErrors.map((e: any) => e.message || e.field).join(" | ");
      }
      setError(msg);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none text-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white text-gray-800 shadow-xs font-medium";
  const readOnlyInputClass = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none text-sm bg-gray-50 text-gray-600 font-medium cursor-not-allowed";

  const previewCode = previewBatchCode(form.productName || "", form.productionDate);

  const scrollToSection = (key: Section) => {
    setActiveSection(key);
    document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="pb-10">
      {/* Header Banner */}
      <div className="relative h-44 overflow-hidden" style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)" }}>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-10 bg-white" />
        <div className="absolute right-32 bottom-0 w-24 h-24 rounded-full opacity-10 bg-white" />
        <div className="absolute left-1/2 -bottom-8 w-72 h-72 rounded-full opacity-5 bg-white" />
        <div className="relative z-10 h-full flex items-center px-8">
          <div className="flex-1">
            <button
              onClick={() => navigate("/app/batches")}
              className="flex items-center gap-1.5 text-green-200 hover:text-white text-sm mb-3 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại danh sách Lô hàng
            </button>
            <h1 className="text-white" style={{ fontSize: 26, fontWeight: 800 }}>
              Khởi Tạo Lô Hàng Mới
            </h1>
            <p className="text-green-100 text-sm mt-0.5 opacity-90">
              Khai báo mã lô nông sản — dữ liệu sẽ được mã hóa SHA-256 và ghi vào sổ cái Blockchain
            </p>
          </div>
          <div className="ml-auto flex flex-col items-center gap-2">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
            >
              <Package className="w-8 h-8 text-white" />
            </div>
            {/* Mini completion ring */}
            <div className="text-white text-xs font-bold text-center">
              <div className="text-lg font-extrabold leading-none">{completionScore}%</div>
              <div className="text-[10px] text-green-200">Hoàn thành</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">

          {/* Left: Section Navigator */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl p-3 sticky top-4 border border-gray-100" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400 px-2 mb-2">Các mục thông tin</div>
              {SECTIONS.map(({ key, label, icon: Icon, desc }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => scrollToSection(key)}
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
                  <span>Tiến độ hoàn thành</span>
                  <span className="font-bold" style={{ color: "#2E7D32" }}>
                    {completionScore}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      background: completionScore === 100 ? "#2E7D32" : "linear-gradient(90deg, #43A047, #81C784)",
                      width: `${completionScore}%`,
                    }}
                  />
                </div>
                <div className="mt-3 space-y-1">
                  {[
                    { label: "Sản phẩm", done: Boolean(form.productId || form.product) },
                    { label: "Số lượng & Đơn vị", done: Number(form.quantity) > 0 && Boolean(form.unit || form.unitId) },
                    { label: "Ngày sản xuất", done: Boolean(form.productionDate) },
                    { label: "Địa chỉ trang trại", done: Boolean(form.location) },
                    { label: "Tọa độ GPS", done: Boolean(form.gps) },
                    { label: "Mã số vùng trồng", done: Boolean(msvt) },
                  ].map((check) => (
                    <div key={check.label} className="flex items-center gap-2 text-[11px]">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${check.done ? "bg-green-500" : "bg-gray-200"}`}>
                        {check.done && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className={check.done ? "text-gray-700 font-medium" : "text-gray-400"}>{check.label}</span>
                    </div>
                  ))}
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
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-sm">1. Thông tin Sản phẩm (Product Details)</div>
                    <div className="text-xs text-gray-500">Chọn sản phẩm nông sản và danh mục liên quan</div>
                  </div>
                  {(form.productId || form.product) && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-1.5">
                    <FieldLabel required>Sản phẩm Nông sản</FieldLabel>
                    <ProductSelect
                      value={form.productId || form.product}
                      onChange={(val) => {
                        setForm((curr) => ({ ...curr, productId: val, product: val }));
                      }}
                      onProductSelected={(product) => {
                        handleChange("productName", product.name || "");
                        if (product.categoryName || product.category) {
                          handleChange("category", product.categoryName || product.category);
                        }
                        if (product.unit) handleChange("unit", product.unit);
                        if (product.unitId) handleChange("unitId", product.unitId);
                      }}
                      className={inputClass}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <FieldLabel>Danh mục nông sản</FieldLabel>
                    <input
                      readOnly
                      value={form.category || "Theo sản phẩm đã chọn"}
                      className={readOnlyInputClass}
                      placeholder="Danh mục tự động cập nhật"
                    />
                  </label>

                  {/* Product Image URL */}
                  <div className="md:col-span-2 space-y-1.5">
                    <FieldLabel>URL Hình ảnh sản phẩm (Tùy chọn)</FieldLabel>
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
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-sm">2. Sản xuất &amp; Số lượng (Production &amp; Volume)</div>
                    <div className="text-xs text-gray-500">Quy mô sản xuất, đơn vị tính, ngày khởi tạo và hạn sử dụng</div>
                  </div>
                  {Number(form.quantity) > 0 && (form.unit || form.unitId) && form.productionDate && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-1.5">
                    <FieldLabel required>Số lượng Lô hàng</FieldLabel>
                    <input
                      type="number"
                      min={1}
                      value={form.quantity || ""}
                      onChange={(e) => handleChange("quantity", Number(e.target.value))}
                      className={inputClass}
                      placeholder="Nhập số lượng (vd: 500)"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <FieldLabel required>Đơn vị tính</FieldLabel>
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
                    <FieldLabel required>Ngày bắt đầu sản xuất / Gieo trồng</FieldLabel>
                    <input
                      type="date"
                      value={form.productionDate}
                      onChange={(e) => handleChange("productionDate", e.target.value)}
                      className={inputClass}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <FieldLabel>Hạn sử dụng dự kiến (Expiry Date)</FieldLabel>
                    <input
                      type="date"
                      value={form.expiryDate || ""}
                      onChange={(e) => handleChange("expiryDate", e.target.value)}
                      className={inputClass}
                    />
                  </label>

                  {/* Preview batch code */}
                  {(form.productName || form.productId) && form.productionDate && (
                    <div className="md:col-span-2 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Mã Lô Dự Kiến Hệ Thống Tạo</div>
                        <code className="font-mono text-sm font-bold text-emerald-900">{previewCode}</code>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Origin & Notes */}
              <div id="section-origin" className="bg-white rounded-2xl overflow-hidden border border-gray-100" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-100">
                    <Leaf className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-sm">3. Nguồn gốc Trang trại &amp; Ghi chú (Origin &amp; Notes)</div>
                    <div className="text-xs text-gray-500">Đơn vị chủ quản, mã số vùng trồng và ghi chú bổ sung</div>
                  </div>
                  {form.location && form.gps && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Location Mapping Action Bar */}
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:col-span-2">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Interactive Location Mapping</span>
                      <p className="text-xs text-emerald-600 mt-0.5">Chọn vị trí trên bản đồ tương tác hoặc định vị GPS thiết bị hiện tại</p>
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
                        {detectingGps ? "Đang định vị..." : "Use Device GPS"}
                      </button>
                    </div>
                  </div>

                  <label className="space-y-1.5">
                    <FieldLabel>Đơn vị / Trang trại sản xuất</FieldLabel>
                    <div className="relative flex items-center">
                      <Building className="w-4 h-4 text-gray-400 absolute left-3" />
                      <input
                        readOnly
                        value={form.farm || "Tổ chức hiện tại"}
                        className={`${readOnlyInputClass} pl-9`}
                      />
                    </div>
                  </label>

                  <label className="space-y-1.5">
                    <FieldLabel>Người lập hồ sơ / Chuyên viên</FieldLabel>
                    <div className="relative flex items-center">
                      <UserCheck className="w-4 h-4 text-gray-400 absolute left-3" />
                      <input
                        readOnly
                        value={form.farmer || "Tài khoản hiện tại"}
                        className={`${readOnlyInputClass} pl-9`}
                      />
                    </div>
                  </label>

                  <label className="space-y-1.5 md:col-span-2">
                    <FieldLabel>Địa chỉ Nông trại / Vùng sản xuất (Location Address)</FieldLabel>
                    <div className="relative flex items-center">
                      <MapPin className="w-4 h-4 text-emerald-600 absolute left-3" />
                      <input
                        value={form.location || ""}
                        onChange={(e) => handleChange("location", e.target.value)}
                        className={`${inputClass} pl-9`}
                        placeholder="vd: Xã Đại Lộc, Huyện Hậu Lộc, Thanh Hóa"
                      />
                    </div>
                  </label>

                  <label className="space-y-1.5">
                    <FieldLabel>Vùng canh tác / Khu vực gieo trồng</FieldLabel>
                    <input
                      value={form.productionArea || ""}
                      onChange={(e) => handleChange("productionArea", e.target.value)}
                      className={inputClass}
                      placeholder="vd: Khu vực A - Nông trường 1, Bình Thuận"
                    />
                  </label>

                  {/* MSVT — Mã số vùng trồng (Planting Zone Code per MARD) */}
                  <label className="space-y-1.5">
                    <FieldLabel>
                      <Hash className="w-3 h-3 text-emerald-600" />
                      Mã số vùng trồng (MSVT - Bộ NN&amp;PTNT)
                    </FieldLabel>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-[10px] text-emerald-700 font-bold font-mono">MSVT</span>
                      <input
                        value={msvt}
                        onChange={(e) => setMsvt(e.target.value.toUpperCase())}
                        className={`${inputClass} pl-14 font-mono`}
                        placeholder="VD-BT-2026-001"
                        maxLength={20}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">Mã phân bổ bởi Cục Trồng Trọt — Bộ Nông nghiệp & PTNT Việt Nam</p>
                  </label>

                  <div className="space-y-1.5">
                    <FieldLabel>Tọa độ GPS (Lat, Lng)</FieldLabel>
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
                        <MapPin className="w-3.5 h-3.5" /> Google Maps
                      </button>
                    </div>
                    {form.gps && (
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <CheckCircle className="w-3 h-3 text-green-500" /> Tọa độ đã nhập ({form.gps})
                      </div>
                    )}
                  </div>

                  <label className="md:col-span-2 space-y-1.5">
                    <FieldLabel>Mô tả / Ghi chú điều kiện gieo trồng (Tùy chọn)</FieldLabel>
                    <textarea
                      value={form.description || ""}
                      onChange={(e) => handleChange("description", e.target.value)}
                      className={`${inputClass} min-h-24 resize-none`}
                      placeholder="Nhập mô tả về điều kiện canh tác, giống cây trồng, hoặc các lưu ý khác..."
                    />
                  </label>
                </div>
              </div>

              {/* Section 4: Preview & Confirm */}
              <div id="section-preview" className="bg-white rounded-2xl overflow-hidden border border-gray-100" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-100">
                    <QrCode className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">4. Xem Lại &amp; Xác Nhận Thông Tin Lô Hàng</div>
                    <div className="text-xs text-gray-500">Kiểm tra thông tin trước khi ghi vào sổ cái AgriTrace Blockchain</div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    {/* Left: summary info */}
                    <div className="space-y-2.5">
                      {[
                        { label: "Sản phẩm", value: form.productName || "(chưa chọn)", highlight: !form.productName },
                        { label: "Danh mục", value: form.category || "—" },
                        { label: "Số lượng", value: form.quantity ? `${Number(form.quantity).toLocaleString()} ${form.unit || ""}` : "(chưa nhập)", highlight: !form.quantity },
                        { label: "Ngày sản xuất", value: form.productionDate || "(chưa nhập)", highlight: !form.productionDate },
                        { label: "Hạn sử dụng", value: form.expiryDate || "Không giới hạn" },
                        { label: "Trang trại", value: form.farm || user?.organization || "—" },
                        { label: "Người lập hồ sơ", value: form.farmer || user?.name || "—" },
                        { label: "Địa chỉ", value: form.location || "(chưa nhập)" },
                        { label: "GPS", value: form.gps || "(chưa nhập)" },
                        { label: "MSVT", value: msvt || "(chưa nhập)" },
                      ].map(({ label, value, highlight }) => (
                        <div key={label} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50">
                          <span className="text-gray-500 font-medium">{label}</span>
                          <span className={`font-bold text-right max-w-[60%] truncate ${highlight ? "text-amber-600" : "text-gray-900"}`}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Right: Batch code preview + QR concept */}
                    <div className="flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-green-50 to-emerald-100/50 rounded-2xl p-6 border border-emerald-200/60">
                      <div className="text-center space-y-1">
                        <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Mã Lô Hàng Dự Kiến</div>
                        <code className="text-base font-extrabold font-mono text-green-900 block">
                          {previewCode}
                        </code>
                      </div>

                      {/* Fake QR code visual placeholder */}
                      <div className="w-28 h-28 rounded-2xl bg-white border-2 border-emerald-300 shadow-md flex items-center justify-center p-1.5 relative">
                        <div className="grid grid-cols-5 grid-rows-5 w-full h-full gap-0.5">
                          {Array.from({ length: 25 }, (_, i) => (
                            <div
                              key={i}
                              className="rounded-[1px]"
                              style={{
                                background: [0,1,5,6,7,10,12,14,17,18,19,24,20].includes(i)
                                  ? "#1B5E20"
                                  : [2,3,4,8,11,13,15,16,21,22,23].includes(i)
                                  ? "#E8F5E9"
                                  : "#fff"
                              }}
                            />
                          ))}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center shadow-sm border border-emerald-200">
                            <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-emerald-600 text-center leading-relaxed font-medium">
                        Mã QR ISO/IEC 18004 sẽ được tạo tự động sau khi xác nhận lô hàng
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full font-bold">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        SHA-256 Blockchain Sealed
                      </div>
                    </div>
                  </div>

                  {/* Blockchain audit notice */}
                  <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-100 flex items-start gap-3 text-xs text-blue-800">
                    <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold mb-0.5">Cam kết Minh Bạch Dữ Liệu (Blockchain Immutability)</div>
                      <div className="text-blue-600 leading-relaxed">
                        Sau khi tạo, thông tin lô hàng sẽ được đóng dấu thời gian và mã hóa SHA-256 trên sổ cái AgriTrace — không thể chỉnh sửa hay xóa nhật ký sự kiện (Append-only). Mọi cập nhật đều tạo ra sự kiện mới được ghi nhận đầy đủ.
                      </div>
                    </div>
                  </div>
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
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/app/batches")}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>

                <div className="flex items-center gap-3">
                  {/* Navigate to preview section shortcut */}
                  {activeSection !== "preview" && (
                    <button
                      type="button"
                      onClick={() => scrollToSection("preview")}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-300 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                    >
                      Xem trước lô hàng <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={createBatch.isPending || !isValid}
                    className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 hover:opacity-90 shadow-md shadow-emerald-700/20 active:scale-95"
                    style={{ background: "linear-gradient(135deg, #2E7D32, #388E3C)" }}
                  >
                    <Save className="w-4 h-4" />
                    {createBatch.isPending ? "Đang khởi tạo & mã hoá..." : "Khởi Tạo Lô Hàng"}
                  </button>
                </div>
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
