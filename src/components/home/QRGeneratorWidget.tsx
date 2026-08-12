import React, { useState } from "react";
import { useNavigate } from "react-router";
import { QrCode, Download, ExternalLink, Sparkles, CheckCircle, Copy, RefreshCw, Printer, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface QRGeneratorWidgetProps {
  lang?: "vi" | "en";
}

export const QRGeneratorWidget: React.FC<QRGeneratorWidgetProps> = ({ lang = "en" }) => {
  const navigate = useNavigate();
  const [batchCode, setBatchCode] = useState("RICE-20260112-001");
  const [productName, setProductName] = useState(lang === "vi" ? "Gạo ST25 Sóc Trăng" : "ST25 Organic Rice");
  const [farmName, setFarmName] = useState(lang === "vi" ? "HTX Nông Nghiệp Mỹ Xuyên" : "Mỹ Xuyên Organic Coop");
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const cleanBatchCode = batchCode.trim() || "RICE-20260112-001";
  const qrUrl = `${window.location.origin}/trace/${encodeURIComponent(cleanBatchCode)}`;

  // High-res QR Code API generator
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}&color=1B5E20&bg=ffffff&margin=10`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    toast.success(lang === "vi" ? "Đã sao chép liên kết truy xuất mã QR!" : "Traceability QR link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = async () => {
    setIsDownloading(true);
    try {
      toast.info(lang === "vi" ? "Đang chuẩn bị tải file ảnh QR độ phân giải cao..." : "Preparing high-res QR image download...");
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `AgriTrace_QR_${cleanBatchCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success(lang === "vi" ? `Đã tải ảnh QR (${cleanBatchCode}.png) về máy!` : `Downloaded QR image (${cleanBatchCode}.png)!`);
    } catch {
      toast.error(lang === "vi" ? "Không thể tải ảnh QR trực tiếp. Vui lòng lưu ảnh bằng chuột phải." : "Failed to download image directly.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGenerateRandomCode = () => {
    const prefixes = ["RICE", "COFFEE", "MANGO", "DRAGONFRUIT", "TEA", "TOMATO"];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSeq = String(Math.floor(Math.random() * 899) + 100);
    const newCode = `${randomPrefix}-${dateStr}-${randomSeq}`;
    setBatchCode(newCode);
    toast.success(lang === "vi" ? `Đã tự động tạo mã lô mới: ${newCode}` : `Generated new batch code: ${newCode}`);
  };

  const handleTestVerify = () => {
    toast.info(lang === "vi" ? `Đang chuyển tới trang truy xuất nguồn gốc cho mã ${cleanBatchCode}...` : `Navigating to trace page for ${cleanBatchCode}...`);
    navigate(`/trace/${cleanBatchCode}`);
  };

  return (
    <section className="py-16 px-6 bg-gradient-to-br from-green-900 via-green-800 to-emerald-950 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Description & Interactive Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-green-200 text-xs font-semibold backdrop-blur border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === "vi" ? "Công Cụ Tạo QR Truy Xuất Thử Nghiệm Tức Thì" : "Live Traceability QR Generator Tool"}</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {lang === "vi" ? (
                <>
                  Tạo Mã QR Định Danh Nông Sản <br />
                  <span className="text-green-300">Trong 3 Giây Cho Trang Trại</span>
                </>
              ) : (
                <>
                  Generate Agricultural Trace QR <br />
                  <span className="text-green-300">In 3 Seconds For Your Farm</span>
                </>
              )}
            </h2>

            <p className="text-green-100/90 text-sm lg:text-base leading-relaxed max-w-xl">
              {lang === "vi"
                ? "Dành cho bà con nông dân, hợp tác xã và doanh nghiệp: Nhập thông tin sản phẩm để xem trước và tải ngay mã QR chuẩn ISO/IEC 18004 để in trực tiếp lên bao bì nông sản."
                : "Designed for farmers, cooperatives & food exporters: Instantly create, preview, and download ISO/IEC 18004 national traceability QR codes for direct packaging print."}
            </p>

            {/* Input Controls Form */}
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 space-y-4 shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-green-200">
                      {lang === "vi" ? "Mã Số Lô Hàng (Batch ID)" : "Batch ID / Code"}
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateRandomCode}
                      className="text-[11px] text-amber-300 hover:underline font-medium flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {lang === "vi" ? "Sinh mã mới" : "Auto generate"}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={batchCode}
                    onChange={(e) => setBatchCode(e.target.value)}
                    placeholder="e.g. RICE-20260112-001"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-green-200 mb-1">
                    {lang === "vi" ? "Tên Sản Phẩm Nông Nghiệp" : "Agricultural Product Name"}
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Gạo ST25"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-green-200 mb-1">
                  {lang === "vi" ? "Tên Nông Trại / Hợp Tác Xã" : "Farm / Cooperative Name"}
                </label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="e.g. HTX Nông Nghiệp Mỹ Xuyên"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
                />
              </div>

              {/* Sample Selector Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/10">
                <span className="text-xs text-green-200 font-semibold">{lang === "vi" ? "Mẫu nhanh:" : "Quick samples:"}</span>
                {[
                  { code: "RICE-20260112-001", name: "Gạo ST25 Sóc Trăng", farm: "HTX Nông Nghiệp Mỹ Xuyên" },
                  { code: "COFFEE-20260110-001", name: "Cà Phê Arabica Đắk Lắk", farm: "Nông Trường Buôn Ma Thuột" },
                  { code: "DRAGONFRUIT-20260108-001", name: "Thanh Long Ruột Đỏ", farm: "Trang Trại Bình Thuận" },
                ].map((s) => (
                  <button
                    key={s.code}
                    onClick={() => {
                      setBatchCode(s.code);
                      setProductName(s.name);
                      setFarmName(s.farm);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-mono transition-colors border border-white/10"
                  >
                    {s.code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Live QR Card Preview */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="bg-white rounded-3xl p-6 text-gray-900 shadow-2xl border border-white/20 w-full max-w-sm text-center relative group">
              {/* ISO Stamp */}
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  ISO 18004
                </span>
              </div>

              <div className="text-xs font-extrabold uppercase tracking-wider text-green-800 mb-1">
                AgriTrace National QR
              </div>
              <div className="text-[11px] text-gray-400 font-medium line-clamp-1">{farmName}</div>

              {/* QR Image Frame */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100 my-3 inline-block shadow-inner relative">
                <img
                  src={qrImageUrl}
                  alt={`QR for ${cleanBatchCode}`}
                  className="w-48 h-48 mx-auto rounded-lg shadow-sm"
                />
                <div className="text-[10px] font-mono text-gray-400 mt-1">
                  AgriTrace • Blockchain Signature
                </div>
              </div>

              {/* Product & Batch Label */}
              <div className="font-extrabold text-gray-900 text-base line-clamp-1">{productName}</div>
              <div className="font-mono text-xs text-green-700 font-bold mt-0.5">{cleanBatchCode}</div>

              {/* Action Buttons */}
              <div className="space-y-2 mt-4">
                <button
                  onClick={handleDownloadQR}
                  disabled={isDownloading}
                  className="w-full py-2.5 px-4 rounded-xl bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>{lang === "vi" ? "Tải Mã QR In Bao Bì (PNG)" : "Download Packaging QR (PNG)"}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="py-2 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                    <span>{copied ? (lang === "vi" ? "Đã Chép!" : "Copied!") : (lang === "vi" ? "Chép Link" : "Copy Link")}</span>
                  </button>

                  <button
                    onClick={handleTestVerify}
                    className="py-2 px-3 rounded-xl border border-green-200 bg-green-50/60 hover:bg-green-100 text-green-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{lang === "vi" ? "Xác Minh" : "Verify Now"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
