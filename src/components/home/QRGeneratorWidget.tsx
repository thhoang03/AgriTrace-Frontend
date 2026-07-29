import React, { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { QrCode, Download, ExternalLink, Sparkles, CheckCircle, Copy } from "lucide-react";
import { toast } from "sonner";

interface QRGeneratorWidgetProps {
  lang?: "vi" | "en";
}

export const QRGeneratorWidget: React.FC<QRGeneratorWidgetProps> = ({ lang = "en" }) => {
  const navigate = useNavigate();
  const [batchCode, setBatchCode] = useState("BTH-2024-001");
  const [productName, setProductName] = useState(lang === "vi" ? "Gạo ST25 Sóc Trăng Premium" : "ST25 Premium Jasmine Rice");
  const [copied, setCopied] = useState(false);

  const qrUrl = `https://agritrace.vn/trace/${encodeURIComponent(batchCode.trim() || "BTH-2024-001")}`;
  // Generate QR Code image via reliable public QR API service with high resolution
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUrl)}&color=1B5E20&bg=ffffff`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    toast.success(lang === "vi" ? "Đã chép liên kết truy xuất!" : "Traceability link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestVerify = () => {
    toast.info(lang === "vi" ? `Đang chuyển tới trang xác minh mã ${batchCode}...` : `Redirecting to trace page for ${batchCode}...`);
    navigate(`/trace/${batchCode.trim()}`);
  };

  return (
    <section className="py-16 px-6 bg-gradient-to-br from-green-900 via-green-800 to-emerald-950 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Description */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-green-200 text-xs font-semibold backdrop-blur border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === "vi" ? "Công Cụ Tạo QR Truy Xuất Thử Nghiệm" : "Live Traceability QR Generator Tool"}</span>
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
                ? "Dành cho bà con nông dân, hợp tác xã và doanh nghiệp: Thử nghiệm ngay việc tạo mã QR truy xuất nguồn gốc chuẩn quốc gia để in trực tiếp lên bao bì sản phẩm."
                : "Designed for farmers, cooperatives & food exporters: Instantly create and preview national traceability QR codes for direct packaging print."}
            </p>

            {/* Input Controls */}
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-green-200 mb-1">
                    {lang === "vi" ? "Mã Số Lô Hàng (Batch ID)" : "Batch ID / Code"}
                  </label>
                  <input
                    type="text"
                    value={batchCode}
                    onChange={(e) => setBatchCode(e.target.value)}
                    placeholder="e.g. BTH-2024-001"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 text-gray-900 text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-green-200 mb-1">
                    {lang === "vi" ? "Tên Sản Phẩm Nông Nghiệp" : "Agricultural Product Name"}
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Rice ST25"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 text-gray-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>

              {/* Sample Selector Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-green-200">{lang === "vi" ? "Mẫu nhanh:" : "Quick samples:"}</span>
                {[
                  { code: "BTH-2024-001", name: "Gạo ST25 Sóc Trăng" },
                  { code: "BTH-2024-002", name: "Xoài Cát Chu Đồng Tháp" },
                  { code: "BTH-2024-004", name: "Thanh Long Bình Thuận" },
                ].map((s) => (
                  <button
                    key={s.code}
                    onClick={() => {
                      setBatchCode(s.code);
                      setProductName(s.name);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-mono transition-colors"
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
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-[11px] font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  ISO 18004
                </span>
              </div>

              <div className="text-xs font-bold uppercase tracking-wider text-green-700 mb-2">
                AgriTrace Vietnam QR
              </div>

              {/* QR Image Box */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100 my-3 inline-block shadow-inner">
                <img
                  src={qrImageUrl}
                  alt={`QR for ${batchCode}`}
                  className="w-48 h-48 mx-auto rounded-lg shadow-sm"
                />
              </div>

              <div className="font-bold text-gray-900 text-base line-clamp-1">{productName}</div>
              <div className="font-mono text-xs text-green-700 font-bold mt-0.5">{batchCode}</div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  onClick={handleCopyLink}
                  className="py-2.5 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? (lang === "vi" ? "Đã Chép!" : "Copied!") : (lang === "vi" ? "Chép Link" : "Copy Link")}
                </button>

                <button
                  onClick={handleTestVerify}
                  className="py-2.5 px-3 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {lang === "vi" ? "Xác Minh Ngay" : "Verify Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
