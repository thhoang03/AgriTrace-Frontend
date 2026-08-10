import React from "react";
import { Store, CheckCircle, ShieldCheck, ArrowUpRight, Award, Building2 } from "lucide-react";

interface DistributorLogosSectionProps {
  onSelectPartner: (partnerName: string) => void;
  lang?: "vi" | "en";
}

interface DistributorItem {
  key: string;
  name: string;
  shortName: string;
  taglineVi: string;
  taglineEn: string;
  storesVi: string;
  storesEn: string;
  badgeVi: string;
  badgeEn: string;
  brandColor: string;
  bgLight: string;
  borderHover: string;
  logoSvg: React.ReactNode;
}

const DISTRIBUTORS: DistributorItem[] = [
  {
    key: "WinMart+",
    name: "WinMart+ / WinCommerce",
    shortName: "WinMart+",
    taglineVi: "Chuỗi siêu thị tiện lợi số 1 Việt Nam",
    taglineEn: "Vietnam's #1 Retail Convenience Chain",
    storesVi: "3,500+ Điểm Bán Toàn Quốc",
    storesEn: "3,500+ Stores Nationwide",
    badgeVi: "Bạch Kim - 100% QR Code",
    badgeEn: "Platinum - 100% QR Compliant",
    brandColor: "#D32F2F",
    bgLight: "#FFEBEE",
    borderHover: "hover:border-red-400",
    logoSvg: (
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center font-black text-sm tracking-tighter shadow-md">
        WIN<span className="text-emerald-300">+</span>
      </div>
    ),
  },
  {
    key: "Co.opmart",
    name: "Co.opmart (Saigon Co.op)",
    shortName: "Co.opmart",
    taglineVi: "Hệ thống siêu thị Hợp tác xã Việt Nam",
    taglineEn: "Vietnam Cooperative Retail Supermarket",
    storesVi: "800+ Siêu Thị & Đại Siêu Thị",
    storesEn: "800+ Supermarkets & Outlets",
    badgeVi: "Liên Kết HTX Nông Nghiệp",
    badgeEn: "Co-op Farm Partnership",
    brandColor: "#1976D2",
    bgLight: "#E3F2FD",
    borderHover: "hover:border-blue-400",
    logoSvg: (
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center font-extrabold text-xs shadow-md">
        co.op
      </div>
    ),
  },
  {
    key: "Aeon Vietnam",
    name: "Aeon Mall Vietnam",
    shortName: "AEON Mall",
    taglineVi: "Tập đoàn bán lẻ tiêu chuẩn Nhật Bản",
    taglineEn: "Japanese Retail Quality Standards",
    storesVi: "7 Trung Tâm Thương Mại Lớn",
    storesEn: "7 Major Shopping Malls",
    badgeVi: "Tiêu Chuẩn Chất Lượng Nhật",
    badgeEn: "Japanese Quality Standard",
    brandColor: "#8E24AA",
    bgLight: "#F3E5F5",
    borderHover: "hover:border-purple-400",
    logoSvg: (
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-700 to-purple-900 text-white flex items-center justify-center font-black text-xs tracking-widest shadow-md">
        AEON
      </div>
    ),
  },
  {
    key: "Big C / GO!",
    name: "GO! / Big C (Central Retail)",
    shortName: "GO! / Big C",
    taglineVi: "Đại siêu thị tiêu dùng toàn quốc",
    taglineEn: "National Hypermarket Network",
    storesVi: "40+ Đại Siêu Thị Hàng Đầu",
    storesEn: "40+ GO! Hypermarkets",
    badgeVi: "Cam Kết Giá Rẻ & An Toàn",
    badgeEn: "Low Price & Food Safety",
    brandColor: "#E65100",
    bgLight: "#FFF3E0",
    borderHover: "hover:border-orange-400",
    logoSvg: (
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center font-black text-sm shadow-md">
        GO!
      </div>
    ),
  },
  {
    key: "Lotte Mart",
    name: "Lotte Mart Vietnam",
    shortName: "LOTTE Mart",
    taglineVi: "Chuỗi bán lẻ cao cấp Hàn Quốc",
    taglineEn: "Korean Premium Supermarket",
    storesVi: "16 Trung Tâm Thương Mại Cao Cấp",
    storesEn: "16 Premium Outlets",
    badgeVi: "Xác Thực Sổ Cái Blockchain",
    badgeEn: "Blockchain Audit Certified",
    brandColor: "#D32F2F",
    bgLight: "#FFEBEE",
    borderHover: "hover:border-red-400",
    logoSvg: (
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-700 to-rose-900 text-white flex items-center justify-center font-black text-[11px] shadow-md">
        LOTTE
      </div>
    ),
  },
  {
    key: "Bách Hóa Xanh",
    name: "Bách Hóa Xanh (MWG)",
    shortName: "Bách Hóa Xanh",
    taglineVi: "Chuỗi cửa hàng thực phẩm tươi sống 24h",
    taglineEn: "Fresh Food Outlets Within 24h",
    storesVi: "1,700+ Cửa Hàng Thực Phẩm Tươi",
    storesEn: "1,700+ Fresh Outlets",
    badgeVi: "Nhật Ký Thu Hoạch Tươi 24h",
    badgeEn: "Daily Harvest Verified",
    brandColor: "#2E7D32",
    bgLight: "#E8F5E9",
    borderHover: "hover:border-emerald-400",
    logoSvg: (
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-800 text-white flex items-center justify-center font-black text-[10px] uppercase shadow-md">
        BHX
      </div>
    ),
  },
];

export const DistributorLogosSection: React.FC<DistributorLogosSectionProps> = ({
  onSelectPartner,
  lang = "en",
}) => {
  return (
    <section id="partners" className="py-20 px-6 border-t border-gray-100 bg-slate-50/60 relative overflow-hidden">
      {/* Background Accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-green-200/20 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-green-100 text-green-800 uppercase tracking-wider">
            {lang === "vi" ? "Mạng Lưới Phân Phối Quốc Gia" : "Nationwide Retail Partners"}
          </span>
          <h2 className="mt-3 text-gray-900 text-3xl font-extrabold tracking-tight">
            {lang === "vi"
              ? "Được Hơn 8,000+ Điểm Bán Siêu Thị Tin Dùng"
              : "Trusted by 8,000+ Supermarket & Retail Outlets"}
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            {lang === "vi"
              ? "Các tập đoàn bán lẻ và chuỗi siêu thị hàng đầu Việt Nam tích hợp mã QR AgriTrace để công khai nhật ký nguồn gốc nông sản tới người tiêu dùng."
              : "Leading Vietnamese retail corporations integrate AgriTrace QR codes to provide full farm-to-shelf origin transparency for consumers."}
          </p>
        </div>

        {/* Distributor Brand Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DISTRIBUTORS.map((distributor) => (
            <div
              key={distributor.key}
              onClick={() => onSelectPartner(distributor.key)}
              className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col justify-between ${distributor.borderHover}`}
            >
              <div>
                {/* Header with Logo + Badge */}
                <div className="flex items-start justify-between mb-4">
                  {distributor.logoSvg}
                  
                  <span
                    className="px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs"
                    style={{ background: distributor.bgLight, color: distributor.brandColor }}
                  >
                    {lang === "vi" ? distributor.badgeVi : distributor.badgeEn}
                  </span>
                </div>

                {/* Distributor Name & Tagline */}
                <h3 className="font-extrabold text-gray-900 text-lg group-hover:text-green-700 transition-colors flex items-center gap-1.5">
                  <span>{distributor.name}</span>
                </h3>

                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                  {lang === "vi" ? distributor.taglineVi : distributor.taglineEn}
                </p>
              </div>

              {/* Retail Outlet Metric & Click Action */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                  <Store className="w-4 h-4 text-green-700" />
                  <span>{lang === "vi" ? distributor.storesVi : distributor.storesEn}</span>
                </div>

                <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-green-700 group-hover:text-white text-gray-600 flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Verification Guarantee Footer */}
        <div className="mt-12 p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">
                {lang === "vi" ? "Tiêu Chuẩn Phân Phối Chuẩn Quốc Gia" : "National Agricultural Distribution Standard"}
              </div>
              <div className="text-gray-500 text-xs mt-0.5">
                {lang === "vi"
                  ? "100% sản phẩm phân phối qua các siêu thị đối tác đều có chữ ký số của Bộ NN&PTNT."
                  : "100% of products distributed through partner retailers carry digital signatures verified by MARD."}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 px-4 py-2.5 rounded-xl border border-green-100 shrink-0">
            <CheckCircle className="w-4 h-4" />
            <span>ISO/IEC 18004 Certified</span>
          </div>
        </div>
      </div>
    </section>
  );
};
