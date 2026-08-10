import React from "react";
import { X, CheckCircle, MapPin, Award, ExternalLink, Building2, Store, FileText, Phone, ShieldCheck, Calendar } from "lucide-react";

export interface PartnerDetail {
  name: string;
  typeVi: string;
  typeEn: string;
  verifiedProducts: number;
  storesVi: string;
  storesEn: string;
  regionBreakdownVi: string;
  regionBreakdownEn: string;
  standardVi: string;
  standardEn: string;
  contractCode: string;
  hotline: string;
  auditDate: string;
  certifiedCategoriesVi: string[];
  certifiedCategoriesEn: string[];
  descriptionVi: string;
  descriptionEn: string;
  logoColor: string;
}

export const PARTNER_DETAILS: Record<string, PartnerDetail> = {
  "VinMart+": {
    name: "WinMart+ / WinCommerce (Masan Group)",
    typeVi: "Chuỗi siêu thị tiện lợi số 1 Việt Nam",
    typeEn: "#1 Convenience Supermarket Chain in Vietnam",
    verifiedProducts: 12450,
    storesVi: "3,500+ điểm bán trên 63 tỉnh thành",
    storesEn: "3,500+ retail stores across 63 provinces",
    regionBreakdownVi: "Miền Bắc: 1,600+ • Miền Trung: 700+ • Miền Nam: 1,200+",
    regionBreakdownEn: "North: 1,600+ • Central: 700+ • South: 1,200+",
    standardVi: "Tiêu chuẩn WinEco, VietGAP & An toàn sinh học",
    standardEn: "WinEco Standard, VietGAP & Biosafety",
    contractCode: "MARD-WCM-2026/HD-091",
    hotline: "1800 6968",
    auditDate: "15/01/2026",
    certifiedCategoriesVi: ["Rau củ WinEco", "Gạo ST25 Sóc Trăng", "Trái cây Việt Nam"],
    certifiedCategoriesEn: ["WinEco Vegetables", "ST25 Organic Rice", "Vietnamese Fresh Fruit"],
    descriptionVi: "WinCommerce kết nối 100% nông trường WinEco và các HTX nông nghiệp Việt Nam vào sổ cái AgriTrace, áp dụng mã QR minh bạch từ thu hoạch đến kệ siêu thị.",
    descriptionEn: "WinCommerce connects 100% of WinEco farms and Vietnamese agricultural co-ops to the AgriTrace ledger, applying transparent QR codes from farm to shelf.",
    logoColor: "#D32F2F",
  },
  "Co.opmart": {
    name: "Co.opmart (Liên Hiệp HTX Thương Mại TP.HCM)",
    typeVi: "Hệ thống bán lẻ Hợp tác xã lớn nhất Việt Nam",
    typeEn: "Largest Cooperative Retail Supermarket in Vietnam",
    verifiedProducts: 18900,
    storesVi: "800+ siêu thị, Co.opXtra & Co.op Food",
    storesEn: "800+ hypermarkets, Co.opXtra & Food stores",
    regionBreakdownVi: "TP.HCM & Miền Nam: 550+ • Miền Trung: 150+ • Miền Bắc: 100+",
    regionBreakdownEn: "HCMC & South: 550+ • Central: 150+ • North: 100+",
    standardVi: "Nông nghiệp Hữu cơ, VietGAP & Tiêu chuẩn Xanh",
    standardEn: "Organic Agriculture, VietGAP & Green Standards",
    contractCode: "MARD-SGCOOP-2026/HD-044",
    hotline: "1900 5555 68",
    auditDate: "10/01/2026",
    certifiedCategoriesVi: ["Lúa gạo hữu cơ", "Rau củ an toàn HTX", "Thủy hải sản đạt chuẩn"],
    certifiedCategoriesEn: ["Organic Rice", "Co-op Safe Vegetables", "Verified Seafood"],
    descriptionVi: "Saigon Co.op là đơn vị tiên phong bao tiêu nông sản Hợp tác xã, tích hợp mã QR AgriTrace giúp người tiêu dùng tra cứu nguồn gốc nông trại chỉ bằng 1 lượt quét.",
    descriptionEn: "Saigon Co.op guarantees off-take for agricultural co-ops, integrating AgriTrace QR codes for instant 1-scan farm origin lookup.",
    logoColor: "#0054A6",
  },
  "Aeon Vietnam": {
    name: "Aeon Mall Vietnam (AEON Group Japan)",
    typeVi: "Tập đoàn bán lẻ tiêu chuẩn Nhật Bản",
    typeEn: "Japanese Supermarket & Retail Corporation",
    verifiedProducts: 9600,
    storesVi: "7 trung tâm thương mại lớn & AEON MaxValu",
    storesEn: "7 major shopping malls & AEON MaxValu centers",
    regionBreakdownVi: "Hà Nội: 2 TTM • TP.HCM & Bình Dương: 4 TTM • Hải Phòng: 1 TTM",
    regionBreakdownEn: "Hanoi: 2 Malls • HCMC & Binh Duong: 4 Malls • Hai Phong: 1 Mall",
    standardVi: "Tiêu chuẩn Kiểm định Nhật Bản & GlobalGAP",
    standardEn: "Japanese Quality Standard & GlobalGAP",
    contractCode: "MARD-AEON-2026/HD-118",
    hotline: "1800 888 886",
    auditDate: "18/01/2026",
    certifiedCategoriesVi: ["Cà phê Arabica", "Trái cây xuất khẩu", "Rau củ công nghệ cao"],
    certifiedCategoriesEn: ["Highland Arabica", "Export Quality Fruit", "Hi-Tech Greenhouse Produce"],
    descriptionVi: "AEON Vietnam áp dụng quy trình kiểm soát an toàn thực phẩm khắt khe theo chuẩn Nhật Bản, xác thực mã băm SHA-256 trên nền tảng AgriTrace.",
    descriptionEn: "AEON Vietnam enforces strict Japanese food safety audit protocols, verifying SHA-256 hashes on the AgriTrace platform.",
    logoColor: "#90278E",
  },
  "Big C / GO!": {
    name: "GO! / Big C (Central Retail Thailand)",
    typeVi: "Đại siêu thị tiêu dùng toàn quốc",
    typeEn: "National Hypermarket Chain",
    verifiedProducts: 15300,
    storesVi: "40+ đại siêu thị GO! & Big C",
    storesEn: "40+ GO! & Big C hypermarkets",
    regionBreakdownVi: "Miền Bắc: 15 TTM • Miền Trung: 10 TTM • Miền Nam: 15 TTM",
    regionBreakdownEn: "North: 15 Malls • Central: 10 Malls • South: 15 Malls",
    standardVi: "VietGAP & HACCP An toàn thực phẩm quốc tế",
    standardEn: "VietGAP & International HACCP Safety",
    contractCode: "MARD-CRC-2026/HD-077",
    hotline: "1900 1880",
    auditDate: "12/01/2026",
    certifiedCategoriesVi: ["Thanh long Bình Thuận", "Xoài Cát Chu", "Nông sản vùng miền"],
    certifiedCategoriesEn: ["Red Dragon Fruit", "Cat Chu Mango", "Regional Specialties"],
    descriptionVi: "Central Retail thúc đẩy dự án 'Mỗi Xã Một Sản Phẩm (OCOP)', đưa mã QR AgriTrace lên 100% bao bì nông sản Việt Nam phân phối tại chuỗi đại siêu thị GO!.",
    descriptionEn: "Central Retail drives OCOP regional product initiatives, featuring AgriTrace QR codes on 100% of produce distributed across GO! hypermarkets.",
    logoColor: "#E30613",
  },
  "Lotte Mart": {
    name: "Lotte Mart Vietnam (LOTTE Group Korea)",
    typeVi: "Chuỗi đại siêu thị Hàn Quốc cao cấp",
    typeEn: "Korean Premium Hypermarket Network",
    verifiedProducts: 8200,
    storesVi: "16 trung tâm thương mại tại các thành phố lớn",
    storesEn: "16 premium shopping centers in major cities",
    regionBreakdownVi: "Hà Nội: 3 TTM • Đà Nẵng: 1 TTM • TP.HCM & Cần Thơ: 12 TTM",
    regionBreakdownEn: "Hanoi: 3 Malls • Da Nang: 1 Mall • HCMC & Can Tho: 12 Malls",
    standardVi: "Tiêu chuẩn An toàn Thực phẩm Quốc tế",
    standardEn: "International Food Safety Accreditation",
    contractCode: "MARD-LOTTE-2026/HD-032",
    hotline: "1900 636 500",
    auditDate: "20/01/2026",
    certifiedCategoriesVi: ["Cà chua hữu cơ", "Cà phê specialty", "Nông sản Đà Lạt"],
    certifiedCategoriesEn: ["Organic Cherry Tomatoes", "Specialty Coffee", "Đà Lạt Greenhouse Produce"],
    descriptionVi: "Lotte Mart liên kết dữ liệu với Cổng nông nghiệp số AgriTrace để cung cấp chứng thư kiểm định chất lượng tức thì cho người tiêu dùng Hàn Quốc & Việt Nam.",
    descriptionEn: "Lotte Mart integrates digital ledgers with AgriTrace to deliver instant lab certificate verification for Korean & Vietnamese shoppers.",
    logoColor: "#ED1C24",
  },
  "Bách Hóa Xanh": {
    name: "Bách Hóa Xanh (Tập đoàn Thế Giới Di Động - MWG)",
    typeVi: "Chuỗi cửa hàng thực phẩm tươi sống hàng đầu",
    typeEn: "Leading Fresh Food Supermarket Network",
    verifiedProducts: 21400,
    storesVi: "1,700+ cửa hàng thực phẩm tại Miền Nam & Miền Trung",
    storesEn: "1,700+ fresh outlets in Southern & Central Vietnam",
    regionBreakdownVi: "TP.HCM: 800+ • Đông Nam Bộ: 450+ • Tây Nam Bộ & Miền Trung: 450+",
    regionBreakdownEn: "HCMC: 800+ • SE Region: 450+ • Mekong Delta & Central: 450+",
    standardVi: "VietGAP & Nhật ký thu hoạch tươi 24h",
    standardEn: "VietGAP & 24h Daily Harvest Tracking",
    contractCode: "MARD-BHX-2026/HD-155",
    hotline: "1900 1908",
    auditDate: "05/01/2026",
    certifiedCategoriesVi: ["Rau củ Đà Lạt tươi 24h", "Trái cây Miền Tây", "Gạo lúa tôm Sóc Trăng"],
    certifiedCategoriesEn: ["Daily 24h Fresh Vegetables", "Mekong Fruit", "Shrimp-Rice Organic Grain"],
    descriptionVi: "Bách Hóa Xanh cập nhật nhật ký thu hoạch hằng ngày lên nền tảng AgriTrace, đảm bảo nông sản từ vườn đến cửa hàng trong 24 giờ với minh bạch mã định danh.",
    descriptionEn: "Bách Hóa Xanh logs daily harvest records to AgriTrace, guaranteeing fresh farm produce reaches neighborhood stores within 24 hours.",
    logoColor: "#007A33",
  },
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
    regionBreakdownVi: "Toàn quốc",
    regionBreakdownEn: "Nationwide",
    standardVi: "Tiêu chuẩn VietGAP & An Toàn Thực Phẩm",
    standardEn: "VietGAP & Food Safety Standards",
    contractCode: "MARD-AGRI-2026/HD-001",
    hotline: "1800 1234",
    auditDate: "01/01/2026",
    certifiedCategoriesVi: ["Nông sản Việt Nam xác thực"],
    certifiedCategoriesEn: ["Verified Vietnamese Agriculture"],
    descriptionVi: "Đối tác phân phối nông sản Việt Nam đã được xác thực chính thức bởi Bộ Nông nghiệp & Phát triển Nông thôn.",
    descriptionEn: "Verified distribution partner officially backed by the Ministry of Agriculture & Rural Development of Vietnam.",
    logoColor: "#1B5E20",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header with Custom Brand Gradient */}
        <div className="p-6 text-white relative shadow-md" style={{ background: `linear-gradient(135deg, ${data.logoColor} 0%, #1B5E20 100%)` }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur border border-white/20">
              {lang === "vi" ? data.typeVi : data.typeEn}
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-white leading-tight">{data.name}</h3>
          
          <div className="mt-2 flex items-center gap-3 text-xs text-white/90">
            <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-amber-300" /> {data.contractCode}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-emerald-300" /> {data.auditDate}</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Description */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-gray-700 leading-relaxed">
            {lang === "vi" ? data.descriptionVi : data.descriptionEn}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-100">
              <div className="text-emerald-800 text-[10px] uppercase font-extrabold tracking-wider">{lang === "vi" ? "Sản phẩm xác thực" : "Verified Products"}</div>
              <div className="text-xl font-extrabold text-emerald-950 mt-0.5">{data.verifiedProducts.toLocaleString()}+</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">{lang === "vi" ? "Đã khóa mã SHA-256" : "SHA-256 Immutable"}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100">
              <div className="text-blue-800 text-[10px] uppercase font-extrabold tracking-wider">{lang === "vi" ? "Hotline Hỗ Trợ" : "Support Hotline"}</div>
              <div className="text-base font-extrabold text-blue-950 mt-1 flex items-center gap-1">
                <Phone className="w-4 h-4 text-blue-700" />
                {data.hotline}
              </div>
              <div className="text-[10px] text-blue-700 font-semibold mt-0.5">{lang === "vi" ? "Tổng đài miễn cước" : "Toll-Free Customer Support"}</div>
            </div>
          </div>

          {/* Outlets & Regional Coverage */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="font-bold text-gray-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              <span>{lang === "vi" ? data.storesVi : data.storesEn}</span>
            </div>
            <div className="text-[11px] text-gray-500 font-medium">
              📍 {lang === "vi" ? data.regionBreakdownVi : data.regionBreakdownEn}
            </div>
          </div>

          {/* Certified Categories */}
          <div>
            <div className="font-bold text-gray-600 text-[11px] uppercase tracking-wider mb-2">
              {lang === "vi" ? "Danh mục nông sản đạt chuẩn:" : "Certified Agriculture Lines:"}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(lang === "vi" ? data.certifiedCategoriesVi : data.certifiedCategoriesEn).map((cat) => (
                <span key={cat} className="px-2.5 py-1 rounded-xl bg-green-100/70 text-green-900 font-semibold text-[11px] border border-green-200">
                  🌱 {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Quality Standards Stamp */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center gap-3">
            <Award className="w-6 h-6 text-amber-700 shrink-0" />
            <div>
              <div className="font-bold text-amber-950 text-xs">{lang === "vi" ? "Tiêu Chuẩn Đăng Ký:" : "Accreditation:"}</div>
              <div className="text-[11px] font-semibold text-amber-900">{lang === "vi" ? data.standardVi : data.standardEn}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-green-800 font-bold">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>{lang === "vi" ? "Đối Tác Đã Xác Minh MARD" : "MARD Official Verified Partner"}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
          >
            {lang === "vi" ? "Đóng" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
