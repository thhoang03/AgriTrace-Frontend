import React from "react";
import { X, CheckCircle, ShieldCheck, Cpu, Award, ExternalLink, ArrowRight } from "lucide-react";

export interface FeatureDetail {
  id: string;
  titleVi: string;
  titleEn: string;
  subtitleVi: string;
  subtitleEn: string;
  iconName: string;
  color: string;
  bg: string;
  descriptionVi: string;
  descriptionEn: string;
  highlightsVi: string[];
  highlightsEn: string[];
  techStackVi: string[];
  techStackEn: string[];
  certificationsVi: string[];
  certificationsEn: string[];
}

export const FEATURE_DETAILS: Record<string, FeatureDetail> = {
  "QR Verification": {
    id: "qr-verification",
    titleVi: "Mã QR Xác Thực Nguồn Gốc & Chuẩn ISO/IEC",
    titleEn: "ISO/IEC Compliant Traceability QR Verification",
    subtitleVi: "Công nghệ mã hóa QR chuẩn quốc gia, chống giả mạo tuyệt đối",
    subtitleEn: "National standard QR encryption with zero fraud guarantee",
    iconName: "QrCode",
    color: "#2E7D32",
    bg: "#E8F5E9",
    descriptionVi: "Mỗi lô hàng nông sản được cấp một mã QR duy nhất mã hoá theo chuẩn ISO/IEC 18004. Người tiêu dùng và đơn vị thu mua chỉ cần quét mã bằng điện thoại để xem toàn bộ lịch sử thu hoạch, vận chuyển và chứng nhận chất lượng.",
    descriptionEn: "Every agricultural batch is assigned a unique QR code encoded under ISO/IEC 18004 standards. Consumers and buyers simply scan using any smartphone camera to inspect harvest history, transport logs, and lab quality certificates.",
    highlightsVi: [
      "Quét trực tiếp qua camera thiết bị mà không cần cài đặt ứng dụng phụ",
      "Mã hoá chữ ký số chống sao chép và giả mạo mã QR",
      "Định vị chính xác toạ độ GPS vùng trồng và thông tin hộ nông dân",
      "Lưu trữ dữ liệu bất biến trên sổ cái Blockchain"
    ],
    highlightsEn: [
      "Instant camera scan without requiring extra mobile apps",
      "Digital signature cryptography preventing QR cloning & forgery",
      "Geospatial GPS farm coordinates & registered farmer metadata",
      "Immutable record keeping on distributed Blockchain ledger"
    ],
    techStackVi: ["Mã hoá ISO/IEC 18004", "Algorand/Hyperledger Ledger", "RESTful Public API", "W3C Verifiable Credentials"],
    techStackEn: ["ISO/IEC 18004 Encoding", "Algorand/Hyperledger Ledger", "RESTful Public API", "W3C Verifiable Credentials"],
    certificationsVi: ["Chứng nhận an toàn VietGAP", "Tiêu chuẩn GlobalGAP", "ISO 22000:2018"],
    certificationsEn: ["VietGAP Safety Standard", "GlobalGAP Accredited", "ISO 22000:2018"]
  },
  "Supply Chain": {
    id: "supply-chain",
    titleVi: "Minh Bạch Chuỗi Cung Ứng Nông Sản",
    titleEn: "End-to-End Supply Chain Transparency",
    subtitleVi: "Theo dõi thời gian thực từ trang trại đến bàn ăn",
    subtitleEn: "Real-time tracking from farm harvest to retail shelf",
    iconName: "TrendingUp",
    color: "#1976D2",
    bg: "#E3F2FD",
    descriptionVi: "Hệ thống ghi nhận liên tục thông tin từ các mắt xích: Nông dân -> Cơ sở chế biến -> Đơn vị logistics -> Siêu thị/Điểm bán. Giúp phát hiện sớm nguy cơ vi phạm vệ sinh an toàn thực phẩm và tối ưu hoá chuỗi cung ứng.",
    descriptionEn: "Continuous audit logging across all supply chain actors: Farmers -> Processors -> Logistics Providers -> Retailers. Facilitates immediate contamination isolation and optimizes distribution efficiency.",
    highlightsVi: [
      "Cập nhật trạng thái lô hàng thời gian thực qua IoT và ứng dụng di động",
      "Giám sát nhiệt độ, độ ẩm quá trình lưu kho và vận chuyển (Cold Chain)",
      "Cảnh báo thông minh khi có sự cố phát sinh hoặc nguy cơ thu hồi",
      "Quản lý tách / gộp lô hàng (Split & Merge) linh hoạt"
    ],
    highlightsEn: [
      "Real-time status updates via IoT sensors & mobile apps",
      "Cold chain temperature & humidity monitoring logs",
      "Automated alerts for safety breaches or recall risks",
      "Dynamic batch splitting & merging traceability mechanics"
    ],
    techStackVi: ["GS1 EPCIS Standard", "IoT Cold Chain Sensors", "Real-time Event Stream", "GeoJSON Mapping"],
    techStackEn: ["GS1 EPCIS Standard", "IoT Cold Chain Sensors", "Real-time Event Stream", "GeoJSON Mapping"],
    certificationsVi: ["Chuỗi cung ứng bền vững", "Tiêu chuẩn GS1 Quốc tế", "Truy xuất nguồn gốc MARD"],
    certificationsEn: ["Sustainable Supply Chain", "GS1 International Standard", "MARD Official Traceability"]
  },
  "Quality Certificate": {
    id: "quality-certificate",
    titleVi: "Chứng Nhận Chất Lượng Số Đã Xác Minh",
    titleEn: "Verified Digital Quality Certificates",
    subtitleVi: "Tích hợp chứng thư số VietGAP, GlobalGAP & kiểm nghiệm phòng lab",
    subtitleEn: "Integrated digital certificates for VietGAP, GlobalGAP & accredited labs",
    iconName: "Award",
    color: "#F57C00",
    bg: "#FFF3E0",
    descriptionVi: "Toàn bộ kết quả thử nghiệm dư lượng thuốc bảo vệ thực vật, chỉ tiêu vi sinh và chứng nhận VietGAP được liên kết trực tiếp với mã lô. Đảm bảo tính xác thực 100% nhờ hệ thống xác thực chữ ký số chuyên dùng.",
    descriptionEn: "All pesticide residue test results, microbiological metrics, and VietGAP accreditations are directly cryptographic linked to batch IDs. Guarantees 100% authenticity backed by government digital signature infrastructure.",
    highlightsVi: [
      "Liên kết trực tiếp với các phòng kiểm nghiệm đạt chuẩn ISO/IEC 17025",
      "Xác thực tính hợp lệ của chứng nhận VietGAP / Organnic thời gian thực",
      "Đính kèm tài liệu PDF chứng thư số có thể tải về và in ấn",
      "Ngăn chặn việc sử dụng chứng nhận giả hoặc hết hạn"
    ],
    highlightsEn: [
      "Direct link with ISO/IEC 17025 accredited testing laboratories",
      "Real-time validation of VietGAP & Organic certificate status",
      "Downloadable and printable digital PDF certificates",
      "Prevents usage of expired or forged quality paperwork"
    ],
    techStackVi: ["PKI Digital Signatures", "PDF/A Archival Format", "SHA-256 Hash Verification", "Lab LMS API Integration"],
    techStackEn: ["PKI Digital Signatures", "PDF/A Archival Format", "SHA-256 Hash Verification", "Lab LMS API Integration"],
    certificationsVi: ["VietGAP Nông nghiệp", "Hữu cơ Vietnam Organic", "HACCP & GMP Certified"],
    certificationsEn: ["VietGAP Agriculture", "Vietnam Organic Standards", "HACCP & GMP Certified"]
  },
  "Government Verified": {
    id: "government-verified",
    titleVi: "Xác Thực Bởi Bộ Nông Nghiệp & PTNT",
    titleEn: "Ministry of Agriculture & Rural Development Verified",
    subtitleVi: "Nền tảng chính thức do chính phủ bảo trợ và quản lý dữ liệu",
    subtitleEn: "Official state platform backed by government digital infrastructure",
    iconName: "Shield",
    color: "#7B1FA2",
    bg: "#F3E5F5",
    descriptionVi: "AgriTrace Vietnam là hệ thống do Bộ Nông nghiệp & Phát triển Nông thôn xây dựng nhằm bảo vệ quyền lợi người tiêu dùng, nâng cao giá trị nông sản Việt Nam khi xuất khẩu ra thị trường quốc tế.",
    descriptionEn: "AgriTrace Vietnam is developed under the auspices of the Ministry of Agriculture & Rural Development of Vietnam, protecting consumer rights and elevating Vietnam's agricultural export value globally.",
    highlightsVi: [
      "Tích hợp hệ thống quản lý mã số vùng trồng chính thức của Bộ NN&PTNT",
      "Báo cáo và kết xuất dữ liệu phục vụ thanh tra an toàn thực phẩm",
      "Hỗ trợ doanh nghiệp làm thủ tục hải quan và xuất khẩu nông sản",
      "Bảo mật thông tin doanh nghiệp theo tiêu chuẩn ISO 27001"
    ],
    highlightsEn: [
      "Integrated with MARD official planting area code registry",
      "Automated inspection reports for food safety authorities",
      "Streamlined customs clearance documentation for agricultural export",
      "Enterprise security compliance adhering to ISO 27001"
    ],
    techStackVi: ["MARD Government Gateway", "National Single Window", "ISO 27001 Security", "Government PKI CA"],
    techStackEn: ["MARD Government Gateway", "National Single Window", "ISO 27001 Security", "Government PKI CA"],
    certificationsVi: ["Cổng thông tin QG", "Chứng nhận ISO 27001", "Chữ ký số Chính phủ (VGCA)"],
    certificationsEn: ["National Data Portal", "ISO 27001 Security", "Government PKI (VGCA)"]
  }
};

interface FeatureModalProps {
  featureKey: string | null;
  onClose: () => void;
  lang?: "vi" | "en";
}

export const FeatureModal: React.FC<FeatureModalProps> = ({ featureKey, onClose, lang = "en" }) => {
  if (!featureKey || !FEATURE_DETAILS[featureKey]) return null;

  const data = FEATURE_DETAILS[featureKey];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="p-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${data.color} 0%, #1B5E20 100%)` }}>
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 text-white pointer-events-none">
            <ShieldCheck className="w-64 h-64" />
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-semibold mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>{lang === "vi" ? "Tính năng cốt lõi nền tảng" : "Core Platform Feature"}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-1">
            {lang === "vi" ? data.titleVi : data.titleEn}
          </h2>
          <p className="text-green-100 text-sm font-medium">
            {lang === "vi" ? data.subtitleVi : data.subtitleEn}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main overview */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <p className="text-gray-700 text-sm leading-relaxed">
              {lang === "vi" ? data.descriptionVi : data.descriptionEn}
            </p>
          </div>

          {/* Highlights checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-700" />
              {lang === "vi" ? "Đặc điểm nổi bật & Lợi ích" : "Key Highlights & Benefits"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(lang === "vi" ? data.highlightsVi : data.highlightsEn).map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-xs font-medium text-gray-800 leading-snug">{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech stack & Standards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-slate-700" />
                {lang === "vi" ? "Công nghệ & Tiêu chuẩn" : "Tech Stack & Standards"}
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {(lang === "vi" ? data.techStackVi : data.techStackEn).map((tech, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
              <h5 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2.5 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-700" />
                {lang === "vi" ? "Chứng nhận & Đáp ứng" : "Accreditations & Compliance"}
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {(lang === "vi" ? data.certificationsVi : data.certificationsEn).map((cert, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-900 text-[11px] font-semibold">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {lang === "vi" ? "Hệ thống AgriTrace VN 2026" : "AgriTrace VN Platform 2026"}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
          >
            <span>{lang === "vi" ? "Đóng cửa sổ" : "Close Window"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
