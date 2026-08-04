import { useState } from "react";
import { toast } from "sonner";
import { X, Plus, MapPin, LocateFixed, Clock, FlaskConical, Building2 } from "lucide-react";
import { useCreateEventRequest } from "../event-requests/event-requests.queries";
import { useEventTypes } from "../supply-chain/supply-chain.queries";
import { fetchDeviceLocation } from "../../utils/locationUtils";
import { MapPickerModal } from "../../components/common/MapPickerModal";

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
  const [eventTypeId, setEventTypeId] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [locatingDevice, setLocatingDevice] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const { data: eventTypes = [] } = useEventTypes();
  const createMutation = useCreateEventRequest();

  // Filter or prioritize Inspection event types
  const inspectionEventTypes = eventTypes.filter(
    (et) =>
      et.code.includes("INSPECT") ||
      et.code.includes("QA") ||
      et.code.includes("QC") ||
      et.code.includes("TEST") ||
      et.code.includes("HARVEST") ||
      et.code.includes("PROCESS") ||
      et.code.includes("PACKAG")
  );
  const displayEventTypes = inspectionEventTypes.length > 0 ? inspectionEventTypes : eventTypes;

  if (!isOpen) return null;

  const handleGetDeviceLocation = async () => {
    setLocatingDevice(true);
    try {
      const res = await fetchDeviceLocation();
      setLocation(res.locationString);
      toast.success("Đã lấy vị trí GPS thiết bị thành công!");
    } catch (err: any) {
      toast.error(err.message || "Không thể lấy vị trí thiết bị");
    } finally {
      setLocatingDevice(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTypeId) {
      toast.error("Vui lòng chọn loại hình kiểm định cần gửi yêu cầu");
      return;
    }

    try {
      await createMutation.mutateAsync({
        batchId,
        eventTypeId,
        location: location || "Kho nông sản chính",
        description: description || `Yêu cầu kiểm định chất lượng cho lô hàng ${batchCode}`,
      });

      toast.success("Gửi yêu cầu kiểm định thành công! Đã chuyển tới đơn vị QC.");
      onClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Lỗi khi gửi yêu cầu kiểm định");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Gửi Yêu Cầu Kiểm Định Lô Hàng</h3>
              <p className="text-xs text-gray-500 mt-0.5">Mời Đơn vị Kiểm định QA/QC bên thứ 3 đến lấy mẫu & nghiệm thu</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Target Batch Info Card */}
          <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-gray-400 font-semibold uppercase">Lô hàng đăng ký</span>
              <div className="font-bold text-gray-900 text-sm mt-0.5">{batchCode}</div>
              {productName && <div className="text-xs text-emerald-700 font-medium">{productName}</div>}
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px]">
              Mã Lô Xác Thực
            </span>
          </div>

          {/* Event / Inspection Type Selection */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Loại hình / Tiêu chuẩn Kiểm định cần yêu cầu *
            </label>
            <select
              value={eventTypeId}
              onChange={(e) => setEventTypeId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white font-medium"
            >
              <option value="">-- Chọn loại hình kiểm định --</option>
              {displayEventTypes.map((et) => (
                <option key={et.id} value={et.id}>
                  {et.code} - {et.name}
                </option>
              ))}
            </select>
          </div>

          {/* Facility Location */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-gray-700">Địa điểm kho / Nông trại hẹn kiểm tra *</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleGetDeviceLocation}
                  disabled={locatingDevice}
                  className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
                >
                  <LocateFixed className={`w-3 h-3 ${locatingDevice ? "animate-spin" : ""}`} />
                  {locatingDevice ? "Đang định vị..." : "GPS Thiết bị"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  className="text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3 text-blue-600" /> Chọn Bản Đồ
                </button>
              </div>
            </div>
            <input
              type="text"
              placeholder="Ví dụ: Kho nông sản Lâm Đồng - Phường 9, Đà Lạt hoặc chọn trên bản đồ..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Business Justification / Notes */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">Nội dung / Ghi chú cho Đơn vị Kiểm định *</label>
            <textarea
              rows={3}
              required
              placeholder="Ví dụ: Đề nghị đơn vị QC lấy mẫu xét nghiệm dư lượng BVTV và vi sinh E.Coli trước khi đóng gói xuất khẩu..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-5 py-2.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Gửi Yêu Cầu Kiểm Định
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
