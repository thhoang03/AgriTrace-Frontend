import React from "react";
import { X, CheckCircle, MapPin, Award, ExternalLink, Building2, Store } from "lucide-react";

export interface PartnerDetail {
  name: string;
  typeVi: string;
  typeEn: string;
  verifiedProducts: number;
  storesVi: string;
  storesEn: string;
  standardVi: string;
  standardEn: string;
  descriptionVi: string;
  descriptionEn: string;
  logoColor: string;
}

export const PARTNER_DETAILS: Record<string, PartnerDetail> = {
  "VinMart+": {
    name: "VinMart+ / WinMart+",
    typeVi: "Chuỗi siêu thị tiện lợi hàng đầu",
    typeEn: "Leading Convenience Supermarket Chain",
    verifiedProducts: 12450,
    storesVi: "3,500+ điểm bán toàn quốc",
    storesEn: "3,500+ retail stores nationwide",
    standardVi: "Tiêu chuẩn VietGAP & An toàn sinh học",
    standardEn: "VietGAP & Biosafety Standards",
    descriptionVi: "Hệ thống bán lẻ WinMart+ tích hợp 100% mã QR AgriTrace cho các mặt hàng rau củ quả tươi sống, đảm bảo nguồn gốc rõ ràng từ nông trại Việt.",
    descriptionEn: "WinMart+ retail chain integrates 100% AgriTrace QR codes across fresh produce lines, guaranteeing clear farm origin across Vietnam.",
    logoColor: "#D32F2F",
  },
  "Co.opmart": {
    name: "Co.opmart (Saigon Co.op)",
    typeVi: "Hệ thống bán lẻ HTX Việt Nam",
    typeEn: "Vietnam Cooperative Retail Supermarket",
    verifiedProducts: 18900,
    storesVi: "800+ siêu thị và đại siêu thị",
    storesEn: "800+ hypermarkets & stores",
    standardVi: "Nông nghiệp Hữu cơ & VietGAP",
    standardEn: "Organic Agriculture & VietGAP",
    descriptionVi: "Co.opmart tiên phong liên kết trực tiếp với các Hợp tác xã Nông nghiệp, áp dụng mã QR minh bạch trên hệ thống toàn quốc.",
    descriptionEn: "Co.opmart pioneers direct linkages with Agricultural Cooperatives, employing transparent QR traceability nationwide.",
    logoColor: "#1976D2",
  },
  "Aeon Vietnam": {
    name: "Aeon Vietnam",
    typeVi: "Tập đoàn bán lẻ Nhật Bản",
    typeEn: "Japanese Retail Group",
    verifiedProducts: 9600,
    storesVi: "7 trung tâm thương mại lớn",
    storesEn: "7 major shopping malls & centers",
    standardVi: "Tiêu chuẩn Nhật Bản & GlobalGAP",
    standardEn: "Japanese Quality & GlobalGAP",
    descriptionVi: "Aeon Mall áp dụng tiêu chuẩn kiểm soát chất lượng Nhật Bản, kiểm tra và xác nhận mã băm Blockchain AgriTrace cho 100% nông sản tươi.",
    descriptionEn: "Aeon Mall enforces Japanese quality control standards, verifying AgriTrace Blockchain hashes for 100% fresh agricultural items.",
    logoColor: "#8E24AA",
  },
  "Big C / GO!": {
    name: "Big C / GO! (Central Retail)",
    typeVi: "Đại siêu thị tiêu dùng toàn quốc",
    typeEn: "National Hypermarket Chain",
    verifiedProducts: 15300,
    storesVi: "40+ đại siêu thị GO! & Big C",
    storesEn: "40+ GO! & Big C hypermarkets",
    standardVi: "VietGAP & HACCP An toàn thực phẩm",
    standardEn: "VietGAP & Food Safety HACCP",
    descriptionVi: "Đại siêu thị GO! thúc đẩy tiêu thụ nông sản Việt bằng cách quét mã QR hiển thị ngay chứng thư kiểm nghiệm chất lượng.",
    descriptionEn: "GO! hypermarkets boost Vietnamese produce consumption by enabling instant QR code lab inspection certificate verification.",
    logoColor: "#E65100",
  },
  "Lotte Mart": {
    name: "Lotte Mart Vietnam",
    typeVi: "Chuỗi siêu thị quốc tế Hàn Quốc",
    typeEn: "Korean International Supermarket",
    verifiedProducts: 8200,
    storesVi: "16 trung tâm thương mại cao cấp",
    storesEn: "16 premium shopping centers",
    standardVi: "Tiêu chuẩn An toàn Quốc tế",
    standardEn: "International Safety Accreditation",
    descriptionVi: "Lotte Mart hợp tác với Cổng nông nghiệp số AgriTrace để cung cấp thông tin minh bạch từ trang trại đến kệ hàng cho người tiêu dùng.",
    descriptionEn: "Lotte Mart partners with AgriTrace portal to provide complete farm-to-shelf transparency for retail consumers.",
    logoColor: "#D32F2F",
  },
  "Bách Hóa Xanh": {
    name: "Bách Hóa Xanh (MWG)",
    typeVi: "Chuỗi cửa hàng thực phẩm tươi sống",
    typeEn: "Fresh Food Supermarket Network",
    verifiedProducts: 21400,
    storesVi: "1,700+ cửa hàng thực phẩm",
    storesEn: "1,700+ fresh food outlets",
    standardVi: "VietGAP & Kiểm nghiệm 100% lô",
    standardEn: "VietGAP & 100% Batch Inspection",
    descriptionVi: "Bách Hóa Xanh cập nhật nhật ký thu hoạch tươi hằng ngày qua ứng dụng AgriTrace, bảo đảm rau củ quả đến tay người tiêu dùng trong 24h.",
    descriptionEn: "Bách Hóa Xanh updates daily harvest logs via AgriTrace apps, guaranteeing fresh produce reaches households within 24 hours.",
    logoColor: "#2E7D32",
  },
  "WinCommerce": {
    name: "WinCommerce",
    typeVi: "Doanh nghiệp bán lẻ số 1 Việt Nam",
    typeEn: "#1 Retail Enterprise in Vietnam",
    verifiedProducts: 29800,
    storesVi: "Toàn bộ hệ thống WinMart & WinMart+",
    storesEn: "Entire WinMart & WinMart+ network",
    standardVi: "Chuỗi cung ứng khép kín WinEco",
    standardEn: "Closed-loop Supply Chain WinEco",
    descriptionVi: "WinCommerce tích hợp toàn bộ chuỗi nông trường WinEco vào hệ thống AgriTrace Vietnam, số hóa 100% mã định danh vùng trồng.",
    descriptionEn: "WinCommerce integrates all WinEco farms into AgriTrace Vietnam, digitizing 100% of planting area codes.",
    logoColor: "#1B5E20",
  }
};

interface PartnerModalProps {
  partnerName: string | null;
  onClose: () => void;
  lang?: "vi" | "en";
}

export const PartnerModal: React.FC<PartnerModalProps> = ({ partnerName, onClose, lang = "en" }) => {
  if (!partnerName) return null;

  const data = PARTNER_DETAILS[partnerName] || {
    name: partnerName,
    typeVi: "Đối tác bán lẻ uy tín",
    typeEn: "Verified Retail Partner",
    verifiedProducts: 5000,
    storesVi: "Hệ thống phân phối toàn quốc",
    storesEn: "Nationwide distribution network",
    standardVi: "Tiêu chuẩn VietGAP",
    standardEn: "VietGAP Standards",
    descriptionVi: "Đối tác phân phối nông sản Việt Nam đã được xác thực bởi Bộ Nông nghiệp & Phát triển Nông thôn.",
    descriptionEn: "Verified distribution partner backed by the Ministry of Agriculture & Rural Development of Vietnam.",
    logoColor: "#2E7D32"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 text-white relative" style={{ background: `linear-gradient(135deg, ${data.logoColor} 0%, #1B5E20 100%)` }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white mb-3 backdrop-blur shadow-sm">
            <Store className="w-6 h-6" />
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur">
            {lang === "vi" ? data.typeVi : data.typeEn}
          </span>
          <h3 className="text-2xl font-extrabold text-white mt-1">{data.name}</h3>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-700 leading-relaxed">
            {lang === "vi" ? data.descriptionVi : data.descriptionEn}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-green-50 border border-green-100">
              <div className="text-gray-400 text-[10px] uppercase font-bold">{lang === "vi" ? "Sản phẩm xác thực" : "Verified Products"}</div>
              <div className="text-xl font-extrabold text-green-900 mt-0.5">{data.verifiedProducts.toLocaleString()}+</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100">
              <div className="text-gray-400 text-[10px] uppercase font-bold">{lang === "vi" ? "Quy mô cửa hàng" : "Store Outlets"}</div>
              <div className="text-xs font-bold text-blue-900 mt-1">{lang === "vi" ? data.storesVi : data.storesEn}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <Award className="w-4 h-4 text-amber-700" />
              <span>{lang === "vi" ? "Tiêu chuẩn cam kết" : "Quality Standard"}</span>
            </div>
            <div className="text-xs font-semibold text-gray-800">{lang === "vi" ? data.standardVi : data.standardEn}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>{lang === "vi" ? "Đối tác xác minh AgriTrace" : "AgriTrace Certified Partner"}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-bold shadow-md"
          >
            {lang === "vi" ? "Đóng" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
