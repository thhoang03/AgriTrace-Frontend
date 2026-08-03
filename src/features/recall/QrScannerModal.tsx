import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, Upload, X, QrCode, CheckCircle2, AlertCircle } from "lucide-react";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedText: string) => void;
}

export function QrScannerModal({ isOpen, onClose, onScanSuccess }: QrScannerModalProps) {
  const [activeTab, setActiveTab] = useState<"camera" | "file">("camera");
  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setScannedResult(null);
      setErrorMsg("");
      return;
    }

    if (activeTab === "camera") {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    setErrorMsg("");
    setScanning(true);

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("camera-qr-reader-container");
      }

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          handleScannedData(decodedText);
        },
        () => {
          // ignore scan errors per frame
        }
      );
    } catch (err: any) {
      console.warn("Unable to start camera scanner", err);
      setErrorMsg("Unable to access camera. Please grant camera permission or upload a QR image.");
      setScanning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (e) {
        console.error("Error stopping QR scanner", e);
      }
    }
    setScanning(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg("");
    try {
      const html5Qr = new Html5Qrcode("file-qr-reader-container");
      const decodedText = await html5Qr.scanFile(file, false);
      try {
        await html5Qr.clear();
      } catch (e) {
        // ignore clear error
      }
      handleScannedData(decodedText);
    } catch (err) {
      console.error("QR File parse error", err);
      setErrorMsg("Could not detect QR code in image. Please choose a clearer QR code image.");
    }
  };

  const handleScannedData = (text: string) => {
    setScannedResult(text);
    stopCamera();
  };

  const handleConfirm = () => {
    if (scannedResult) {
      onScanSuccess(scannedResult);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        {/* Hidden Container for File QR Processing */}
        <div id="file-qr-reader-container" className="hidden" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-red-700 to-red-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Scan Batch QR Code</h3>
              <p className="text-xs text-red-100">Scan camera or upload QR image to locate batch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 p-1.5 gap-1.5">
          <button
            onClick={() => {
              setScannedResult(null);
              setActiveTab("camera");
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === "camera"
                ? "bg-white text-red-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Camera className="w-4 h-4" /> Live Camera Scan
          </button>
          <button
            onClick={() => {
              setScannedResult(null);
              setActiveTab("file");
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === "file"
                ? "bg-white text-red-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Upload className="w-4 h-4" /> Upload QR Image
          </button>
        </div>

        {/* Scanner View Area */}
        <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[300px] bg-gray-950/5 relative">
          <div className={`relative w-full max-w-xs h-[260px] rounded-2xl overflow-hidden shadow-inner bg-black flex items-center justify-center border-2 border-red-500/30 ${activeTab === "camera" ? "block" : "hidden"}`}>
            <div id="camera-qr-reader-container" className="w-full h-full" />
            {!scannedResult && scanning && (
              <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-dashed border-red-500 rounded-xl animate-pulse flex items-center justify-center">
                  <div className="w-full h-0.5 bg-red-500/80 shadow-[0_0_8px_#ef4444] animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {activeTab === "file" && (
            <div className="w-full max-w-xs text-center flex flex-col items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-full p-8 border-2 border-dashed border-red-200 rounded-2xl bg-white flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs text-gray-500">Supports PNG, JPG, JPEG formats containing QR code</div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Upload className="w-4 h-4" /> Select Image File
                </button>
              </div>
            </div>
          )}

          {scannedResult && (
            <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-900 text-sm w-full max-w-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-green-800">
                <CheckCircle2 className="w-5 h-5 text-green-600" /> Scanned Successfully:
              </div>
              <div className="font-mono bg-white p-2.5 rounded-lg border border-green-200 text-xs break-all select-all text-gray-800 font-semibold">
                {scannedResult}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 w-full max-w-xs">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-white flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {scannedResult ? (
            <button
              onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-md hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)" }}
            >
              <CheckCircle2 className="w-4 h-4" /> Use Scanned Code
            </button>
          ) : (
            <button
              onClick={() => {
                setScannedResult(null);
                setErrorMsg("");
                if (activeTab === "camera") startCamera();
                else fileInputRef.current?.click();
              }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" /> Rescan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
