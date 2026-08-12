import React from "react";
import { ShieldCheck, QrCode, Lock, FileCheck, CheckCircle2, Award, Cpu, Globe2 } from "lucide-react";

interface NationalStandardsSectionProps {
  lang?: "vi" | "en";
}

export const NationalStandardsSection: React.FC<NationalStandardsSectionProps> = ({ lang = "en" }) => {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white via-emerald-50/40 to-slate-50 relative overflow-hidden border-t border-gray-100">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
            {lang === "vi" ? "Bảo Chứng Quốc Gia" : "Official Government Accreditation"}
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
            {lang === "vi" ? (
              <>
                Hệ Thống Tiêu Chuẩn Truy Xuất Nguồn Gốc <br />
                <span className="text-green-700">Đạt Chuẩn Quốc Tế ISO & Chữ Ký Số</span>
              </>
            ) : (
              <>
                National Agricultural Traceability Standard <br />
                <span className="text-green-700">ISO Certified & Digital Signatures</span>
              </>
            )}
          </h2>
          <p className="text-gray-500 mt-3 text-sm leading-relaxed">
            {lang === "vi"
              ? "AgriTrace Vietnam ứng dụng đồng bộ 4 trụ cột công nghệ và pháp lý để bảo vệ thương hiệu nông sản Việt Nam trên thị trường nội địa và quốc tế."
              : "AgriTrace Vietnam combines 4 core technology & legal pillars to safeguard Vietnamese produce brands in domestic and international markets."}
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: QrCode,
              code: "ISO/IEC 18004",
              titleVi: "Mã QR Quốc Gia Tương Thích",
              titleEn: "Compatible National QR Standard",
              descVi: "Mã hóa cấu trúc dữ liệu URL chuẩn hóa quốc gia, quét được bằng mọi ứng dụng Camera, Zalo và Scanner chuyên dụng.",
              descEn: "Standardized QR data encoding compatible with default iOS/Android cameras, Zalo, and dedicated logistics scanners.",
              color: "#2E7D32",
              bg: "#E8F5E9",
            },
            {
              icon: Lock,
              code: "SHA-256 LEDGER",
              titleVi: "Mã Băm Sổ Cái Bất Biến",
              titleEn: "Immutable Blockchain Ledger",
              descVi: "Mỗi sự kiện thu hoạch, kiểm định phòng lab, vận chuyển lạnh được đóng dấu thời gian (timestamp) và khóa mã băm.",
              descEn: "Harvest logs, lab test records, and cold-chain events are timestamped and cryptographically linked with SHA-256 hashes.",
              color: "#1976D2",
              bg: "#E3F2FD",
            },
            {
              icon: FileCheck,
              code: "MSVT / PUC CODE",
              titleVi: "Mã Số Vùng Trồng Chính Thức",
              titleEn: "Official Planting Zone Code",
              descVi: "Liên kết dữ liệu định danh vùng trồng (Planting Unit Code) cấp bởi Cục Trồng Trọt & Cục Bảo vệ Thực vật.",
              descEn: "Directly mapped to Planting Unit Codes (PUC) issued by the Department of Crop Production for export tracing.",
              color: "#F57C00",
              bg: "#FFF3E0",
            },
            {
              icon: ShieldCheck,
              code: "MARD CERTIFICATE",
              titleVi: "Chữ Ký Số Bộ NN&PTNT",
              titleEn: "MARD Government Signature",
              descVi: "Dữ liệu được xác thực pháp lý điện tử, ngăn chặn triệt để hành vi giả mạo chứng thư VietGAP / GlobalGAP.",
              descEn: "Digitally signed by accredited government authorities to strictly prevent fraudulent VietGAP / GlobalGAP claims.",
              color: "#7B1FA2",
              bg: "#F3E5F5",
            },
          ].map(({ icon: Icon, code, titleVi, titleEn, descVi, descEn, color, bg }) => (
            <div
              key={code}
              className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: bg }}>
                    <Icon style={{ color, width: 24, height: 24 }} />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                    {code}
                  </span>
                </div>

                <h3 className="font-extrabold text-gray-900 text-base mb-2 group-hover:text-green-700 transition-colors">
                  {lang === "vi" ? titleVi : titleEn}
                </h3>

                <p className="text-gray-500 text-xs leading-relaxed">
                  {lang === "vi" ? descVi : descEn}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] font-bold text-green-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{lang === "vi" ? "Đã kiểm định 100%" : "100% System Verified"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
