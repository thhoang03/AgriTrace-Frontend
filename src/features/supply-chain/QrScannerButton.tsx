import { useEffect, useRef, useState } from "react";
import { ScanLine, X, Upload, Image as ImageIcon } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerButtonProps {
  onScan: (result: string) => void;
  className?: string;
}

export function QrScannerButton({ onScan, className = "" }: QrScannerButtonProps) {
  const [open, setOpen] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isScanningFile, setIsScanningFile] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const containerIdRef = useRef("qr-scanner-" + Math.random().toString(36).slice(2, 8));

  const stopScanner = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
      scannerRef.current?.clear();
    } catch {}
    scannerRef.current = null;
  };

  const startScanner = async () => {
    await new Promise((r) => setTimeout(r, 100));
    try {
      const scanner = new Html5Qrcode(containerIdRef.current);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
          stopScanner().then(() => setOpen(false));
        },
        () => {},
      );
    } catch (err) {
      console.error("QR scanner error:", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError(null);
    setIsScanningFile(true);
    try {
      await stopScanner();
      const html5QrCode = new Html5Qrcode(containerIdRef.current);
      const decodedText = await html5QrCode.scanFile(file, false);
      onScan(decodedText);
      setOpen(false);
    } catch (err: any) {
      console.error("QR image scan error:", err);
      setFileError("Không tìm thấy mã QR trong ảnh. Vui lòng chọn ảnh khác.");
    } finally {
      setIsScanningFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    if (open) {
      setFileError(null);
      startScanner();
    }
    return () => { stopScanner(); };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className || "flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-green-400 transition-colors"}
        title="Scan QR code"
      >
        <ScanLine className="w-4 h-4" /> Scan QR
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden flex flex-col" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                <ScanLine className="w-4 h-4 text-emerald-600" />
                Scan / Upload Batch QR
              </h4>
              <button onClick={() => { stopScanner(); setOpen(false); }} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <div id={containerIdRef.current} style={{ width: "100%", minHeight: 280 }} />

            <div className="p-3 bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanningFile}
                className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Upload className="w-4 h-4" />
                {isScanningFile ? "Đang đọc mã QR từ ảnh..." : "Chọn ảnh QR từ thiết bị"}
              </button>
              {fileError ? (
                <p className="text-[11px] text-rose-500 text-center font-medium mt-0.5">{fileError}</p>
              ) : (
                <p className="text-[11px] text-gray-400 text-center">Hoặc hướng Camera vào mã QR của lô hàng</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}