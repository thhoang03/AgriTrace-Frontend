import { useEffect, useRef, useState } from "react";
import { ScanLine, X, Camera } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerButtonProps {
  onScan: (result: string) => void;
  className?: string;
}

export function QrScannerButton({ onScan, className = "" }: QrScannerButtonProps) {
  const [open, setOpen] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
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
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
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
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h4 className="font-semibold text-gray-900 text-sm">Scan Batch QR Code</h4>
              <button onClick={() => { stopScanner(); setOpen(false); }} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div id={containerIdRef.current} style={{ width: "100%", minHeight: 300 }} />
            <p className="text-xs text-gray-400 text-center py-2">Point camera at a batch QR code</p>
          </div>
        </div>
      )}
    </>
  );
}