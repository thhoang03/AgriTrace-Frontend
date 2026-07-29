import React, { useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircle, MapPin, ArrowRight, ShieldCheck, QrCode, Search, Award } from "lucide-react";

interface BatchShowcaseSectionProps {
  lang?: "vi" | "en";
}

interface ProductItem {
  id: string;
  code: string;
  nameVi: string;
  nameEn: string;
  category: "grain" | "fruit" | "coffee";
  locationVi: string;
  locationEn: string;
  standard: "VietGAP" | "GlobalGAP" | "Organic";
  scans: string;
  image: string;
}

const FEATURED_PRODUCTS: ProductItem[] = [
  {
    id: "1",
    code: "BTH-2024-001",
    nameVi: "Gạo ST25 Sóc Trăng Hữu Cơ",
    nameEn: "ST25 Organic Rice Sóc Trăng",
    category: "grain",
    locationVi: "Huyện Mỹ Xuyên, Sóc Trăng",
    locationEn: "Mỹ Xuyên, Sóc Trăng",
    standard: "Organic",
    scans: "14,280",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80",
  },
  {
    id: "2",
    code: "BTH-2024-002",
    nameVi: "Xoài Cát Chu Cao Lãnh",
    nameEn: "Cao Lãnh Cat Chu Mango",
    category: "fruit",
    locationVi: "TP. Cao Lãnh, Đồng Tháp",
    locationEn: "Cao Lãnh City, Đồng Tháp",
    standard: "VietGAP",
    scans: "9,850",
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80",
  },
  {
    id: "3",
    code: "BTH-2024-004",
    nameVi: "Thanh Long Ruột Đỏ Bình Thuận",
    nameEn: "Bình Thuận Red Dragon Fruit",
    category: "fruit",
    locationVi: "Hàm Thuận Nam, Bình Thuận",
    locationEn: "Hàm Thuận Nam, Bình Thuận",
    standard: "GlobalGAP",
    scans: "21,400",
    image: "https://images.unsplash.com/photo-1527325678964-54921646f988?w=600&q=80",
  },
  {
    id: "4",
    code: "BTH-2024-005",
    nameVi: "Cà Phê Arabica Đắk Lắk Special",
    nameEn: "Đắk Lắk Arabica Coffee Special",
    category: "coffee",
    locationVi: "Buôn Ma Thuột, Đắk Lắk",
    locationEn: "Buôn Ma Thuột, Đắk Lắk",
    standard: "GlobalGAP",
    scans: "18,920",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80",
  },
];

export const BatchShowcaseSection: React.FC<BatchShowcaseSectionProps> = ({ lang = "en" }) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredProducts = activeCategory === "all"
    ? FEATURED_PRODUCTS
    : FEATURED_PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <section className="py-20 px-6 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800 uppercase tracking-wider">
              {lang === "vi" ? "Sản Phẩm Tiêu Biểu" : "Featured Verified Batches"}
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-gray-900 tracking-tight">
              {lang === "vi" ? "Nông Sản Đã Xác Thực Quốc Gia" : "Government Verified Agricultural Products"}
            </h2>
            <p className="text-gray-500 mt-2 text-sm max-w-xl">
              {lang === "vi"
                ? "Khám phá các lô hàng nông sản Việt Nam đạt chuẩn chất lượng xuất khẩu được bảo chứng trên sổ cái Blockchain."
                : "Explore verified Vietnamese agricultural products adhering to export quality standards on the blockchain ledger."}
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl self-start md:self-auto">
            {[
              { id: "all", labelVi: "Tất cả", labelEn: "All" },
              { id: "grain", labelVi: "Lúa gạo", labelEn: "Rice & Grains" },
              { id: "fruit", labelVi: "Trái cây", labelEn: "Fruits" },
              { id: "coffee", labelVi: "Cà phê", labelEn: "Coffee" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === tab.id
                    ? "bg-white text-green-800 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {lang === "vi" ? tab.labelVi : tab.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
            >
              {/* Product Image Box */}
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={p.image}
                  alt={lang === "vi" ? p.nameVi : p.nameEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Standard Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-[11px] font-bold backdrop-blur shadow-sm">
                    {p.standard}
                  </span>
                </div>

                {/* Verification Badge */}
                <div className="absolute top-3 right-3">
                  <div className="w-8 h-8 rounded-full bg-white/90 text-green-700 flex items-center justify-center backdrop-blur shadow-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </div>

                {/* Batch Code Overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <span className="font-mono bg-black/50 px-2 py-0.5 rounded backdrop-blur font-semibold">
                    {p.code}
                  </span>
                  <span className="text-[11px] text-green-200">{p.scans} scans</span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-green-700 transition-colors">
                    {lang === "vi" ? p.nameVi : p.nameEn}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    <span className="truncate">{lang === "vi" ? p.locationVi : p.locationEn}</span>
                  </div>
                </div>

                {/* View Trace Button */}
                <button
                  onClick={() => navigate(`/trace/${p.code}`)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gray-50 group-hover:bg-green-700 text-gray-700 group-hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{lang === "vi" ? "Truy Xuất Nguồn Gốc" : "Trace Product"}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
