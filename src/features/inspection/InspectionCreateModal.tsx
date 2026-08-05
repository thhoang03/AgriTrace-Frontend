import { useEffect, useState } from "react";
import { X, FlaskConical, Search, ListFilter, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useBatches } from "../batches/batches.queries";
import { batchesApi } from "../batches/batches.api";
import { QrScannerButton } from "../supply-chain/QrScannerButton";
import { InspectionTypeValues, type InspectionType } from "./inspection.types";

interface InspectionCreateModalProps {
  onClose: () => void;
  onSubmit: (data: {
    batchId: string;
    inspectionType: InspectionType;
    inspectionDate: string;
    notes: string;
  }) => void;
  isSubmitting?: boolean;
}

export function InspectionCreateModal({ onClose, onSubmit, isSubmitting = false }: InspectionCreateModalProps) {
  const { data: batchesData, isLoading: isLoadingBatches } = useBatches({ limit: 100 });
  const batchOptions = (batchesData?.data ?? []).filter((batch) => !!batch.id);

  const [selectMode, setSelectMode] = useState<"search" | "dropdown">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchingBatch, setIsSearchingBatch] = useState(false);
  const [searchedBatch, setSearchedBatch] = useState<any | null>(null);
  const [searchError, setSearchError] = useState("");

  const [form, setForm] = useState({
    batchId: "",
    inspectionType: 1 as InspectionType,
    inspectionDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [dynamicBatches, setDynamicBatches] = useState<Array<{ id: string; batchCode?: string; product?: string; farm?: string }>>([]);

  useEffect(() => {
    if (!form.batchId && batchOptions.length > 0) {
      const first = batchOptions[0];
      setForm((prev) => ({ ...prev, batchId: first.id }));
      setSearchedBatch(first);
    }
  }, [batchOptions, form.batchId]);

  const [errorMessage, setErrorMessage] = useState<string>('');

  const allBatches = [...batchOptions, ...dynamicBatches.filter(d => !batchOptions.some(b => b.id === d.id))];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.batchId.trim()) return;
    try {
      await onSubmit(form);
      setErrorMessage('');
    } catch (err: any) {
      const msg = err?.message || 'Lỗi khởi tạo phiếu kiểm định. Vui lòng thử lại.';
      setErrorMessage(msg);
    }
  };

  const handleSearchBatch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingBatch(true);
    setSearchError("");
    setSearchedBatch(null);

    try {
      const q = searchQuery.trim();
      const matchedLocal = allBatches.find(
        (b) => b.id.toLowerCase() === q.toLowerCase() || b.batchCode?.toLowerCase() === q.toLowerCase()
      );

      if (matchedLocal) {
        setSearchedBatch(matchedLocal);
        setForm((prev) => ({ ...prev, batchId: matchedLocal.id }));
        return;
      }

      const res = await batchesApi.getAll({ search: q, limit: 10 });
      if (res.data && res.data.length > 0) {
        const match = res.data[0];
        setSearchedBatch(match);
        setForm((prev) => ({ ...prev, batchId: match.id }));
        setDynamicBatches((prev) => [...prev, match]);
      } else {
        try {
          const byIdRes = await batchesApi.getById(q);
          if (byIdRes.data && byIdRes.data.id) {
            setSearchedBatch(byIdRes.data);
            setForm((prev) => ({ ...prev, batchId: byIdRes.data.id }));
            setDynamicBatches((prev) => [...prev, byIdRes.data]);
            return;
          }
        } catch {
          // Ignore
        }
        setSearchError(`Không tìm thấy Lô hàng có mã hoặc ID "${q}" trên nền tảng AgriTrace.`);
      }
    } catch {
      setSearchError("Không thể tìm kiếm lô hàng lúc này. Vui lòng thử lại.");
    } finally {
      setIsSearchingBatch(false);
    }
  };

  const handleQrScan = (result: string) => {
    const match = result.match(/\/public\/trace\/(.+)/);
    const scannedId = match ? match[1] : result;
    setSearchQuery(scannedId);

    const found = allBatches.find(
      (b) => b.id.toLowerCase() === scannedId.toLowerCase() || b.batchCode?.toLowerCase() === scannedId.toLowerCase()
    );

    if (found) {
      setSearchedBatch(found);
      setForm((prev) => ({ ...prev, batchId: found.id }));
    } else {
      const newOption = { id: scannedId, batchCode: scannedId, product: "Lô hàng quét từ mã QR" };
      setSearchedBatch(newOption);
      setDynamicBatches((prev) => [...prev, newOption]);
      setForm((prev) => ({ ...prev, batchId: scannedId }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()} style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#E8F5E9" }}>
              <FlaskConical className="w-5 h-5" style={{ color: "#2E7D32" }} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Lập Phiếu Kiểm Định Mới (QA/QC)</h3>
              <p className="text-xs text-gray-500 mt-0.5">Xác thực lô hàng & ghi nhận đợt kiểm định chất lượng</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Xác thực Lô nông sản (Batch) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setSelectMode(selectMode === "search" ? "dropdown" : "search")}
                className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
              >
                {selectMode === "search" ? (
                  <><ListFilter className="w-3 h-3" /> Chọn từ danh sách lô gần đây</>
                ) : (
                  <><Search className="w-3 h-3" /> Tra cứu Mã Lô / Quét QR</>
                )}
              </button>
            </div>

            {selectMode === "search" ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearchBatch(); } }}
                    placeholder="Quét mã QR hoặc nhập Mã Lô (vd: RICE-20260112-001)..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-500 font-medium text-gray-800 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleSearchBatch}
                    disabled={isSearchingBatch || !searchQuery.trim()}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0"
                  >
                    {isSearchingBatch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Tra cứu
                  </button>
                  <QrScannerButton onScan={handleQrScan} />
                </div>

                {searchedBatch && (
                  <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-xl flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-emerald-950 truncate">
                          {searchedBatch.batchCode || searchedBatch.id}
                        </div>
                        <div className="text-xs text-emerald-700 truncate mt-0.5 font-medium">
                          {searchedBatch.product || searchedBatch.productName || "Lô nông sản"} {searchedBatch.farm ? `· ${searchedBatch.farm}` : ""}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 bg-emerald-700 text-white rounded-lg shrink-0">Đã xác thực</span>
                  </div>
                )}

                {searchError && (
                  <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {searchError}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex gap-2">
                  <select
                    value={form.batchId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setForm({ ...form, batchId: selectedId });
                      const matched = allBatches.find(b => b.id === selectedId);
                      if (matched) setSearchedBatch(matched);
                    }}
                    disabled={isLoadingBatches}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white transition-all focus:border-green-500 font-medium text-gray-800 disabled:opacity-60"
                    style={{ appearance: "auto" }}
                    required
                  >
                    <option value="">-- Chọn lô nông sản cần kiểm định --</option>
                    {isLoadingBatches ? (
                      <option disabled>Đang tải danh sách lô hàng...</option>
                    ) : allBatches.length === 0 ? (
                      <option disabled>Chưa có lô hàng nào</option>
                    ) : (
                      allBatches.map((batch) => {
                        const code = batch.batchCode || batch.id.substring(0, 8);
                        const prodName = batch.product || batch.productName || "Nông sản";
                        const farmName = batch.farm ? ` (${batch.farm})` : "";
                        return (
                          <option key={batch.id} value={batch.id}>
                            {code} · {prodName}{farmName}
                          </option>
                        );
                      })
                    )}
                  </select>
                  <QrScannerButton onScan={handleQrScan} />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Loại hình kiểm định (Inspection Type) <span className="text-red-500">*</span>
            </label>
            <select
              value={form.inspectionType}
              onChange={(e) => setForm({ ...form, inspectionType: Number(e.target.value) as InspectionType })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white transition-all focus:border-green-500 font-medium text-gray-800"
              style={{ appearance: "auto" }}
            >
              {InspectionTypeValues.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Ngày lấy mẫu / Kiểm tra <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.inspectionDate}
              onChange={(e) => setForm({ ...form, inspectionDate: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white transition-all focus:border-green-500 font-medium text-gray-800"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Ghi chú kiểm định / Điều kiện mẫu</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Nhập các ghi chú ban đầu về mẫu thử, điều kiện môi trường..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none transition-all focus:border-green-500 bg-gray-50 text-gray-800"
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 shadow-md shadow-emerald-700/20"
              style={{ background: "linear-gradient(135deg, #2E7D32, #388E3C)" }}
            >
              {isSubmitting ? "Đang khởi tạo..." : "Khởi Tạo Phiếu Kiểm Định"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
