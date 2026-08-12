import { useState } from "react";
import { toast } from "sonner";
import { X, Plus, MapPin, LocateFixed, FlaskConical, Building2 } from "lucide-react";
import { useRequestInspection } from "../inspection/inspection.queries";
import { InspectionTypeValues } from "../inspection/inspection.types";
import { fetchDeviceLocation } from "../../utils/locationUtils";
import { MapPickerModal } from "../../components/common/MapPickerModal";
import { useOrganizationsList } from "../organizations/organizations.queries";
import { useLanguage } from "../../contexts/LanguageContext";

interface BatchInspectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  batchCode: string;
  productName?: string;
  onSuccess?: () => void;
}

export function BatchInspectionRequestModal({
  isOpen,
  onClose,
  batchId,
  batchCode,
  productName,
  onSuccess,
}: BatchInspectionRequestModalProps) {
  const { lang } = useLanguage();
  const [inspectionType, setInspectionType] = useState<number | "">("");
  const [targetOrganizationId, setTargetOrganizationId] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [locatingDevice, setLocatingDevice] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const requestMutation = useRequestInspection();
  
  const { data: orgsData, isLoading: isLoadingOrgs } = useOrganizationsList({
    organizationTypeId: "10000000-0000-0000-0000-000000000005",
    status: "ACTIVE",
    pageSize: 100,
  });

  const displayOrgs = orgsData?.data?.items || orgsData?.items || [];

  if (!isOpen) return null;

  const handleGetDeviceLocation = async () => {
    setLocatingDevice(true);
    try {
      const res = await fetchDeviceLocation();
      setLocation(res.locationString);
      toast.success(
        lang === "vi"
          ? "Đã lấy vị trí GPS thiết bị thành công!"
          : "Device GPS location fetched successfully!"
      );
    } catch (err: any) {
      toast.error(
        err.message ||
          (lang === "vi" ? "Không thể lấy vị trí thiết bị" : "Failed to get device location")
      );
    } finally {
      setLocatingDevice(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inspectionType === "") {
      toast.error(
        lang === "vi"
          ? "Vui lòng chọn loại hình kiểm định cần gửi yêu cầu"
          : "Please select an inspection type"
      );
      return;
    }
    if (!targetOrganizationId) {
      toast.error(
        lang === "vi"
          ? "Vui lòng chọn tổ chức kiểm định"
          : "Please select an inspection organization"
      );
      return;
    }

    try {
      await requestMutation.mutateAsync({
        batchId,
        targetOrganizationId,
        inspectionType: Number(inspectionType) as any,
        notes: description ||
          (lang === "vi"
            ? `Yêu cầu kiểm định chất lượng cho lô hàng ${batchCode}`
            : `Quality inspection request for batch ${batchCode}`) +
          (location ? ` (Địa điểm: ${location})` : ""),
      });

      toast.success(
        lang === "vi"
          ? "Gửi yêu cầu kiểm định thành công! Đã chuyển tới đơn vị QC."
          : "Inspection request submitted successfully! Forwarded to QC unit."
      );
      onClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          (lang === "vi" ? "Lỗi khi gửi yêu cầu kiểm định" : "Failed to submit inspection request")
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 border border-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">
                {lang === "vi" ? "Gửi Yêu Cầu Kiểm Định Lô Hàng" : "Submit Quality Inspection Request"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lang === "vi"
                  ? "Mời Đơn vị Kiểm định QA/QC bên thứ 3 đến lấy mẫu & nghiệm thu"
                  : "Invite 3rd-party QA/QC Inspection organization to sample & inspect"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Batch Info Card */}
          <div className="bg-muted/80 p-3.5 rounded-2xl border border-border flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                {lang === "vi" ? "Lô hàng đăng ký" : "Registered Batch"}
              </span>
              <div className="font-bold text-foreground text-sm mt-0.5">{batchCode}</div>
              {productName && <div className="text-xs text-emerald-700 font-medium">{productName}</div>}
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs">
              {lang === "vi" ? "Mã Lô Xác Thực" : "Verified Batch Code"}
            </span>
          </div>

          {/* Event / Inspection Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              {lang === "vi"
                ? "Loại hình / Tiêu chuẩn Kiểm định cần yêu cầu *"
                : "Inspection Type / Quality Standard Required *"}
            </label>
            <select
              value={inspectionType}
              onChange={(e) => setInspectionType(e.target.value ? Number(e.target.value) : "")}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-input-background text-sm font-medium text-foreground"
            >
              <option value="">
                {lang === "vi" ? "-- Chọn loại hình kiểm định --" : "-- Select inspection type --"}
              </option>
              {InspectionTypeValues.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label[lang as "vi" | "en" || "vi"]}
                </option>
              ))}
            </select>
          </div>

          {/* Target Organization Selection */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              {lang === "vi"
                ? "Đơn vị Kiểm định QA/QC (Inspection) *"
                : "QA/QC Inspection Organization *"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Building2 className="w-4 h-4 text-emerald-600" />
              </div>
              <select
                value={targetOrganizationId}
                onChange={(e) => setTargetOrganizationId(e.target.value)}
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-input-background text-sm font-medium text-foreground"
              >
                <option value="">
                  {isLoadingOrgs ? (lang === "vi" ? "-- Đang tải --" : "-- Loading --") : (lang === "vi" ? "-- Chọn tổ chức kiểm định --" : "-- Select inspection organization --")}
                </option>
                {displayOrgs.map((org: any) => (
                  <option key={org.id} value={org.id}>
                    {org.name} {org.address ? `- ${org.address}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Facility Location */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
              <label className="text-sm font-semibold text-foreground">
                {lang === "vi"
                  ? "Địa điểm kho / Nông trại hẹn kiểm tra *"
                  : "Inspection Location / Farm Address *"}
              </label>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleGetDeviceLocation}
                  disabled={locatingDevice}
                  className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  <LocateFixed className={`w-3.5 h-3.5 ${locatingDevice ? "animate-spin" : ""}`} />
                  {locatingDevice
                    ? lang === "vi"
                      ? "Đang định vị..."
                      : "Locating..."
                    : lang === "vi"
                    ? "GPS Thiết bị"
                    : "Device GPS"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {lang === "vi" ? "Chọn Bản Đồ" : "Select on Map"}
                </button>
              </div>
            </div>
            <input
              type="text"
              placeholder={
                lang === "vi"
                  ? "Ví dụ: Kho nông sản Lâm Đồng - Phường 9, Đà Lạt hoặc chọn trên bản đồ..."
                  : "E.g., Lam Dong Agri Warehouse - Ward 9, Da Lat or select on map..."
              }
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium text-foreground"
            />
          </div>

          {/* Business Justification / Notes */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              {lang === "vi"
                ? "Nội dung / Ghi chú cho Đơn vị Kiểm định *"
                : "Request Content / Notes for Inspection Unit *"}
            </label>
            <textarea
              rows={3}
              required
              placeholder={
                lang === "vi"
                  ? "Ví dụ: Đề nghị đơn vị QC lấy mẫu xét nghiệm dư lượng BVTV và vi sinh E.Coli trước khi đóng gói xuất khẩu..."
                  : "E.g., Request QC unit to test pesticide residues & E.Coli before export packaging..."
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium text-foreground"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted rounded-xl transition-colors"
            >
              {lang === "vi" ? "Hủy bỏ" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={requestMutation.isPending}
              className="px-5 py-2.5 text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {requestMutation.isPending
                ? lang === "vi"
                  ? "Đang gửi..."
                  : "Submitting..."
                : lang === "vi"
                ? "Gửi Yêu Cầu Kiểm Định"
                : "Submit Request"}
            </button>
          </div>
        </form>
      </div>

      {/* Map Picker Modal */}
      <MapPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onSelectLocation={(loc) => setLocation(loc)}
        initialLocation={location}
      />
    </div>
  );
}
