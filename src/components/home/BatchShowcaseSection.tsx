import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle, MapPin, ArrowRight, QrCode, Award, ShieldCheck,
  Calendar, Info, ExternalLink, Activity, Leaf, Eye, X, ChevronRight, Lock
} from "lucide-react";

interface BatchShowcaseSectionProps {
  lang?: "vi" | "en";
}

export interface DetailedProductItem {
  id: string;
  code: string;
  nameVi: string;
  nameEn: string;
  category: "grain" | "fruit" | "coffee";
  locationVi: string;
  locationEn: string;
  farmNameVi: string;
  farmNameEn: string;
  farmGps: string;
  plantingZoneCode: string;
  harvestDate: string;
  labTestScore: number;
  standard: "VietGAP" | "GlobalGAP" | "Organic";
  blockchainHash: string;
  scans: string;
  image: string;
  descriptionVi: string;
  descriptionEn: string;
  retailers: string[];
}

const FEATURED_PRODUCTS: DetailedProductItem[] = [
  {
    id: "1",
    code: "RICE-20260112-001",
    nameVi: "Gạo ST25 Sóc Trăng Hữu Cơ",
    nameEn: "ST25 Organic Rice Sóc Trăng",
    category: "grain",
    locationVi: "Huyện Mỹ Xuyên, Sóc Trăng",
    locationEn: "Mỹ Xuyên, Sóc Trăng",
    farmNameVi: "HTX Nông Nghiệp Hữu Cơ Mỹ Xuyên",
    farmNameEn: "Mỹ Xuyên Organic Agriculture Cooperative",
    farmGps: "9.5982° N, 105.9719° E",
    plantingZoneCode: "MSVT-ST-2026-089",
    harvestDate: "12/01/2026",
    labTestScore: 99,
    standard: "Organic",
    blockchainHash: "0x8f7a...3c29e1",
    scans: "14,280",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80",
    descriptionVi: "Gạo ST25 đạt giải nhất Gạo ngon nhất thế giới, canh tác theo mô hình lúa - tôm vi sinh không hóa chất bảo vệ thực vật tại vùng ven biển Sóc Trăng.",
    descriptionEn: "World's Best Rice ST25 cultivated using eco-friendly shrimp-rice rotation with zero synthetic pesticides in coastal Sóc Trăng.",
    retailers: ["WinMart+", "Co.opmart", "Aeon Vietnam"],
  },
  {
    id: "2",
    code: "COFFEE-20260110-001",
    nameVi: "Cà Phê Arabica Đắk Lắk Special",
    nameEn: "Đắk Lắk Arabica Coffee Special",
    category: "coffee",
    locationVi: "Buôn Ma Thuột, Đắk Lắk",
    locationEn: "Buôn Ma Thuột, Đắk Lắk",
    farmNameVi: "Nông Trường Cà Phê Cao Nguyên Buôn Ma Thuột",
    farmNameEn: "Buôn Ma Thuột Highland Coffee Estate",
    farmGps: "12.6667° N, 108.0500° E",
    plantingZoneCode: "MSVT-DL-2026-042",
    harvestDate: "10/01/2026",
    labTestScore: 97,
    standard: "GlobalGAP",
    blockchainHash: "0x4b1e...8a90d4",
    scans: "18,920",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80",
    descriptionVi: "Hạt cà phê Arabica trồng ở độ cao 1,500m so với mực nước biển, thu hoạch chín tay 100% và chế biến ướt theo chuẩn UTZ & GlobalGAP.",
    descriptionEn: "Highland Arabica beans grown at 1,500m elevation, 100% hand-picked ripe cherries processed under UTZ & GlobalGAP standards.",
    retailers: ["Lotte Mart", "Aeon Vietnam", "WinCommerce"],
  },
  {
    id: "3",
    code: "DRAGONFRUIT-20260108-001",
    nameVi: "Thanh Long Ruột Đỏ Bình Thuận",
    nameEn: "Bình Thuận Red Dragon Fruit",
    category: "fruit",
    locationVi: "Hàm Thuận Nam, Bình Thuận",
    locationEn: "Hàm Thuận Nam, Bình Thuận",
    farmNameVi: "Trang Trại Thanh Long Công Nghệ Cao Bình Thuận",
    farmNameEn: "Bình Thuận Hi-Tech Dragon Fruit Farm",
    farmGps: "10.9333° N, 108.1000° E",
    plantingZoneCode: "MSVT-BT-2026-115",
    harvestDate: "08/01/2026",
    labTestScore: 98,
    standard: "GlobalGAP",
    blockchainHash: "0x12c9...7b41f8",
    scans: "21,400",
    image: "https://images.unsplash.com/photo-1527325678964-54921646f988?w=600&q=80",
    descriptionVi: "Thanh long ruột đỏ ngọt đậm, thụ phấn tự nhiên và chiếu đèn sinh học tiết kiệm năng lượng, đủ điều kiện xuất khẩu thị trường Nhật Bản & Châu Âu.",
    descriptionEn: "Premium red-flesh dragon fruit naturally pollinated under LED bio-lighting, qualified for export to Japanese & EU markets.",
    retailers: ["Big C / GO!", "Bách Hóa Xanh", "Co.opmart"],
  },
  {
    id: "4",
    code: "TOMATO-20260105-001",
    nameVi: "Cà Chua Hữu Cơ Đà Lạt",
    nameEn: "Organic Tomato Đà Lạt",
    category: "fruit",
    locationVi: "TP. Đà Lạt, Lâm Đồng",
    locationEn: "Đà Lạt City, Lâm Đồng",
    farmNameVi: "Nông Trại Sinh Thái Đà Lạt EcoFarm",
    farmNameEn: "Đà Lạt EcoFarm Organic Reserve",
    farmGps: "11.9404° N, 108.4583° E",
    plantingZoneCode: "MSVT-LD-2026-019",
    harvestDate: "05/01/2026",
    labTestScore: 100,
    standard: "VietGAP",
    blockchainHash: "0x9d3f...2e10a6",
    scans: "9,850",
    image: "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=600&q=80",
    descriptionVi: "Cà chua cherry công nghệ nhà kính Hà Lan, tưới nhỏ giọt kiểm soát vi chất tự động, kiểm nghiệm dư lượng hóa chất 0.00%.",
    descriptionEn: "Dutch greenhouse cherry tomatoes with automated hydroponic drip irrigation, certified 0.00% chemical residue.",
    retailers: ["WinMart+", "Bách Hóa Xanh", "Lotte Mart"],
  },
];

export const BatchShowcaseSection: React.FC<BatchShowcaseSectionProps> = ({ lang = "en" }) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<DetailedProductItem | null>(null);

  const filteredProducts = activeCategory === "all"
    ? FEATURED_PRODUCTS
    : FEATURED_PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <section className="py-20 px-6 bg-white border-t border-gray-100 relative">
      <div className="max-w-7xl mx-auto">
        {/* Real-time Ledger Activity Ticker Banner */}
        <div className="mb-10 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-900 via-green-800 to-emerald-950 text-white shadow-lg border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="font-bold uppercase tracking-wider text-emerald-300">
              {lang === "vi" ? "Sổ Cái Blockchain Trực Tuyến:" : "Live Blockchain Ledger:"}
            </span>
            <span className="text-green-100 font-mono hidden sm:inline">
              {lang === "vi"
                ? "Lô RICE-20260112-001 vừa được siêu thị WinMart+ xác minh nguồn gốc (Xác thực 100%)"
                : "Batch RICE-20260112-001 verified at WinMart+ (100% Authentic)"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-green-200">
            <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-emerald-400" /> Hash SHA-256</span>
            <span className="bg-white/15 px-2.5 py-1 rounded-full font-semibold">{lang === "vi" ? "Đã Khóa Sổ" : "Block #4,920,118"}</span>
          </div>
        </div>

        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800 uppercase tracking-wider">
              {lang === "vi" ? "Sản Phẩm Tiêu Biểu" : "Featured Verified Batches"}
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-gray-900 tracking-tight">
              {lang === "vi" ? "Nông Sản Đã Xác Thực Nguồn Gốc Quốc Gia" : "Government Verified Agricultural Products"}
            </h2>
            <p className="text-gray-500 mt-2 text-sm max-w-xl">
              {lang === "vi"
                ? "Khám phá các lô hàng nông sản Việt Nam đạt chuẩn chất lượng xuất khẩu với minh bạch thông tin trang trại, mã số vùng trồng và chứng nhận kiểm định."
                : "Explore verified Vietnamese agricultural products with complete farm origin transparency, GPS planting codes, and accredited lab test certificates."}
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
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group relative"
            >
              {/* Product Image Box */}
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={p.image}
                  alt={lang === "vi" ? p.nameVi : p.nameEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                
                {/* Standard Badge */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600/95 text-white text-[11px] font-bold backdrop-blur shadow-sm">
                    {p.standard}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-black/40 text-green-200 text-[10px] font-mono font-bold backdrop-blur">
                    Score: {p.labTestScore}%
                  </span>
                </div>

                {/* QR Code Mini Preview - visible on hover */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-lg p-1 flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(window.location.origin + "/trace/" + p.code)}&color=1B5E20&bg=ffffff`}
                      alt={`QR ${p.code}`}
                      className="w-full h-full rounded"
                    />
                  </div>
                </div>

                {/* Verification Badge - visible when not hovered */}
                <div className="absolute top-3 right-3 group-hover:opacity-0 transition-opacity duration-300">
                  <div className="w-8 h-8 rounded-full bg-white/90 text-green-700 flex items-center justify-center backdrop-blur shadow-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </div>

                {/* Batch Code Overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <span className="font-mono bg-black/60 px-2 py-0.5 rounded backdrop-blur font-semibold text-[10px] truncate max-w-[70%]">
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
                  
                  {/* Origin Farm Info */}
                  <div className="text-xs text-gray-600 font-medium mt-1 line-clamp-1">
                    🏡 {lang === "vi" ? p.farmNameVi : p.farmNameEn}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    <span className="truncate">{lang === "vi" ? p.locationVi : p.locationEn}</span>
                  </div>

                  {/* Planting Zone Code & Harvest */}
                  <div className="mt-3 pt-2.5 border-t border-gray-100 grid grid-cols-2 gap-1 text-[11px] text-gray-500">
                    <div>
                      <span className="text-gray-400">{lang === "vi" ? "Thu hoạch:" : "Harvest:"}</span>
                      <div className="font-semibold text-gray-800">{p.harvestDate}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">{lang === "vi" ? "Mã vùng trồng:" : "Zone code:"}</span>
                      <div className="font-mono font-bold text-green-800 truncate">{p.plantingZoneCode}</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Preview Origin Info + Trace Link */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setSelectedProduct(p)}
                    className="py-2 px-3 rounded-xl border border-gray-200 hover:border-green-600 hover:bg-green-50/50 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                  >
                    <Info className="w-3.5 h-3.5 text-green-600" />
                    <span>{lang === "vi" ? "Thông tin" : "Origin Info"}</span>
                  </button>

                  <button
                    onClick={() => navigate(`/trace/${p.code}`)}
                    className="py-2 px-3 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-sm"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{lang === "vi" ? "Truy xuất" : "Trace"}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Verified Origin Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Header with Product Image */}
            <div className="relative h-44 overflow-hidden bg-gray-900">
              <img src={selectedProduct.image} alt={selectedProduct.nameVi} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="px-2.5 py-0.5 rounded-full bg-green-600 text-white text-[11px] font-bold">
                  {selectedProduct.standard} Verified
                </span>
                <h3 className="text-xl font-extrabold mt-1">
                  {lang === "vi" ? selectedProduct.nameVi : selectedProduct.nameEn}
                </h3>
                <div className="text-xs text-green-200 font-mono mt-0.5">{selectedProduct.code}</div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-gray-700 flex-1">
              <div className="p-3.5 bg-green-50/70 rounded-2xl border border-green-100 leading-relaxed">
                {lang === "vi" ? selectedProduct.descriptionVi : selectedProduct.descriptionEn}
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="text-gray-400 text-[10px] font-bold uppercase">{lang === "vi" ? "Trang trại xuất xứ" : "Origin Farm"}</div>
                  <div className="font-bold text-gray-900 mt-0.5">{lang === "vi" ? selectedProduct.farmNameVi : selectedProduct.farmNameEn}</div>
                </div>

                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="text-gray-400 text-[10px] font-bold uppercase">{lang === "vi" ? "Mã số vùng trồng" : "Planting Zone Code"}</div>
                  <div className="font-mono font-bold text-green-700 mt-0.5">{selectedProduct.plantingZoneCode}</div>
                </div>

                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="text-gray-400 text-[10px] font-bold uppercase">{lang === "vi" ? "Tọa độ GPS" : "GPS Location"}</div>
                  <div className="font-mono font-semibold text-gray-800 mt-0.5">{selectedProduct.farmGps}</div>
                </div>

                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="text-gray-400 text-[10px] font-bold uppercase">{lang === "vi" ? "Điểm kiểm định chất lượng" : "Quality Test Score"}</div>
                  <div className="font-bold text-emerald-700 text-sm mt-0.5">{selectedProduct.labTestScore}/100 (Đạt tiêu chuẩn)</div>
                </div>
              </div>

              {/* Retail Distributors */}
              <div className="pt-2">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {lang === "vi" ? "Kênh phân phối siêu thị đối tác:" : "Retail Distribution Partners:"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.retailers.map((r) => (
                    <span key={r} className="px-3 py-1 rounded-xl bg-gray-100 text-gray-800 text-xs font-semibold">
                      🛒 {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <div className="text-[11px] font-mono text-gray-400">
                Hash: {selectedProduct.blockchainHash}
              </div>

              <button
                onClick={() => {
                  setSelectedProduct(null);
                  navigate(`/trace/${selectedProduct.code}`);
                }}
                className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{lang === "vi" ? "Xem Nhật Ký Blockchain" : "View Blockchain Ledger"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
