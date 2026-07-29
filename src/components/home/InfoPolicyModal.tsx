import React from "react";
import { X, ShieldCheck, FileText, Code2, HelpCircle, CheckCircle, ExternalLink } from "lucide-react";

interface InfoPolicyModalProps {
  modalType: string | null;
  onClose: () => void;
  lang?: "vi" | "en";
}

export const InfoPolicyModal: React.FC<InfoPolicyModalProps> = ({ modalType, onClose, lang = "en" }) => {
  if (!modalType) return null;

  const getContent = () => {
    switch (modalType) {
      case "Privacy Policy":
      case "Chính sách bảo mật":
        return {
          icon: ShieldCheck,
          titleVi: "Chính Sách Bảo Mật Dữ Liệu Nông Nghiệp Quốc Gia",
          titleEn: "National Agricultural Data Privacy Policy",
          tagVi: "Quy định số 45/2024/NĐ-CP",
          tagEn: "Decree No. 45/2024/ND-CP",
          bodyVi: (
            <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
              <p>
                Bộ Nông nghiệp & Phát triển Nông thôn Việt Nam cam kết bảo vệ dữ liệu cá nhân, thông tin vùng trồng và bí mật kinh doanh của các doanh nghiệp, hợp tác xã và nông dân tham gia hệ thống AgriTrace.
              </p>
              <h5 className="font-bold text-gray-800 text-sm">1. Thu thập & Sử dụng dữ liệu</h5>
              <p>
                Dữ liệu vùng trồng, nhật ký canh tác và thông tin kiểm nghiệm chỉ được sử dụng cho mục đích truy xuất nguồn gốc, cấp chứng thư nông sản và kiểm soát an toàn thực phẩm theo quy định pháp luật.
              </p>
              <h5 className="font-bold text-gray-800 text-sm">2. An toàn dữ liệu Blockchain</h5>
              <p>
                Các giao dịch mã hoá chữ ký số trên Blockchain được bảo mật bằng tiêu chuẩn mã hóa AES-256 & SHA-256, đảm bảo không thể bị can thiệp bởi bên thứ ba.
              </p>
            </div>
          ),
          bodyEn: (
            <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
              <p>
                The Ministry of Agriculture & Rural Development of Vietnam strictly safeguards personal data, planting coordinates, and business secrets of all registered farms, cooperatives, and enterprises.
              </p>
              <h5 className="font-bold text-gray-800 text-sm">1. Data Collection & Purpose</h5>
              <p>
                Agricultural metadata and digital logs are strictly utilized for traceability verification, quality certification, and official food safety inspections.
              </p>
              <h5 className="font-bold text-gray-800 text-sm">2. Blockchain Security Encryption</h5>
              <p>
                All cryptographic signatures recorded on the ledger follow AES-256 and SHA-256 standards, preventing unauthorized third-party tampering.
              </p>
            </div>
          )
        };

      case "Terms of Service":
      case "Điều khoản sử dụng":
        return {
          icon: FileText,
          titleVi: "Điều Khoản Sử Dụng Nền Tảng AgriTrace",
          titleEn: "AgriTrace Platform Terms of Service",
          tagVi: "Quy định mã định danh GS1/ISO",
          tagEn: "GS1/ISO Identifier Standards",
          bodyVi: (
            <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
              <p>
                Khi truy cập và khai thác dữ liệu trên Cổng thông tin Truy xuất Nông sản AgriTrace Vietnam, người dùng và các bên liên quan đồng ý tuân thủ các quy định dưới đây:
              </p>
              <h5 className="font-bold text-gray-800 text-sm">1. Trách nhiệm của chủ lô hàng</h5>
              <p>
                Chủ cơ sở sản xuất chịu trách nhiệm pháp lý 100% về tính chính xác của dữ liệu nhật ký canh tác, số lượng nông sản và mã số vùng trồng được đăng ký trên hệ thống.
              </p>
              <h5 className="font-bold text-gray-800 text-sm">2. Xử lý vi phạm</h5>
              <p>
                Mọi hành vi gian lận mã QR, cung cấp thông tin sai lệch về tiêu chuẩn VietGAP/GlobalGAP sẽ bị hủy mã số định danh và xử lý theo quy định của Bộ NN&PTNT.
              </p>
            </div>
          ),
          bodyEn: (
            <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
              <p>
                By accessing AgriTrace Vietnam public ledger, users and supply chain stakeholders agree to abide by national digital traceability protocols:
              </p>
              <h5 className="font-bold text-gray-800 text-sm">1. Stakeholder Responsibility</h5>
              <p>
                Producers hold sole legal responsibility for the integrity of recorded farming logs, harvest quantities, and registered plant codes.
              </p>
              <h5 className="font-bold text-gray-800 text-sm">2. Fraud Compliance & Enforcement</h5>
              <p>
                Any deliberate QR falsification or fraudulent accreditation reporting will trigger immediate identifier revocation and legal regulatory action.
              </p>
            </div>
          )
        };

      case "API Documentation":
      case "Tài liệu API":
        return {
          icon: Code2,
          titleVi: "Tài Liệu Tích Hợp API Nông Nghiệp Số",
          titleEn: "AgriTrace REST & GraphQL API Docs",
          tagVi: "OpenAPI v3.0 Specification",
          tagEn: "OpenAPI v3.0 Specification",
          bodyVi: (
            <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
              <p>
                AgriTrace cung cấp hệ thống Open API hỗ trợ các phần mềm ERP, hệ thống quản lý siêu thị và cổng dịch vụ công tích hợp dữ liệu truy xuất tức thì.
              </p>
              <div className="p-3 bg-gray-900 text-green-400 font-mono text-[11px] rounded-xl overflow-x-auto">
                <div>GET /api/v1/public/trace/&#123;batchCode&#125;</div>
                <div>Authorization: Bearer &lt;API_KEY&gt;</div>
                <div className="text-gray-400 mt-1">// Returns JSON response with complete blockchain audit trail</div>
              </div>
              <p>
                Các đơn vị đối tác có thể gửi yêu cầu cấp API Key chính thức thông qua cổng hỗ trợ kỹ thuật Cục Trồng trọt.
              </p>
            </div>
          ),
          bodyEn: (
            <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
              <p>
                AgriTrace provides developer Open APIs enabling enterprise ERPs, retail POS networks, and customs portals to query digital traceability data programmatically.
              </p>
              <div className="p-3 bg-gray-900 text-green-400 font-mono text-[11px] rounded-xl overflow-x-auto">
                <div>GET /api/v1/public/trace/&#123;batchCode&#125;</div>
                <div>Authorization: Bearer &lt;API_KEY&gt;</div>
                <div className="text-gray-400 mt-1">// Returns JSON response with complete blockchain audit trail</div>
              </div>
              <p>
                Integration partners can apply for official enterprise API Keys via the MARD Technical Developer Portal.
              </p>
            </div>
          )
        };

      default:
        return {
          icon: HelpCircle,
          titleVi: "Trung Tâm Hỗ Trợ & Giải Đáp AgriTrace",
          titleEn: "AgriTrace Support & Help Center",
          tagVi: "Tổng đài 1800-6868 (Miễn phí)",
          tagEn: "Toll-Free 1800-6868",
          bodyVi: (
            <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
              <p>
                Bạn cần trợ giúp về việc quét mã QR, cấp lại mã số lô hàng hoặc hướng dẫn đăng ký tài khoản doanh nghiệp?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="font-bold text-green-800 mb-1">Hotline Kỹ Thuật</div>
                  <div>1800 6868 (8:00 - 17:30 Hàng ngày)</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="font-bold text-blue-800 mb-1">Email Hỗ Trợ</div>
                  <div>agritrace@mard.gov.vn</div>
                </div>
              </div>
            </div>
          ),
          bodyEn: (
            <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
              <p>
                Need assistance with QR code verification, batch registration, or enterprise onboarding?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="font-bold text-green-800 mb-1">Technical Hotline</div>
                  <div>1800 6868 (8:00 AM - 5:30 PM Daily)</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="font-bold text-blue-800 mb-1">Support Email</div>
                  <div>agritrace@mard.gov.vn</div>
                </div>
              </div>
            </div>
          )
        };
    }
  };

  const content = getContent();
  const Icon = content.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-green-800 to-green-700 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-medium mb-2 backdrop-blur">
            <Icon className="w-3.5 h-3.5" />
            <span>{lang === "vi" ? content.tagVi : content.tagEn}</span>
          </div>
          <h3 className="text-xl font-bold">{lang === "vi" ? content.titleVi : content.titleEn}</h3>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {lang === "vi" ? content.bodyVi : content.bodyEn}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>{lang === "vi" ? "Thông tin chính thức từ Bộ NN&PTNT" : "Official MARD Publication"}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-semibold"
          >
            {lang === "vi" ? "Đã hiểu" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
