import { useEffect, useState } from "react";
import { X, FlaskConical, Search, ListFilter, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useBatches } from "../batches/batches.queries";
import { batchesApi } from "../batches/batches.api";
import { QrScannerButton } from "../supply-chain/QrScannerButton";
import { InspectionTypeValues, type InspectionType } from "./inspection.types";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../auth/auth.store";
import { useOrganizationsList } from "../organizations/organizations.queries";

interface InspectionCreateModalProps {
  onClose: () => void;
  onSubmit: (data: {
    batchId: string;
    inspectionType: InspectionType;
    inspectionDate: string;
    notes: string;
    organizationId?: string;
  }) => void;
  isSubmitting?: boolean;
}


export function InspectionCreateModal({ onClose, onSubmit, isSubmitting = false }: InspectionCreateModalProps) {
  const { lang } = useLanguage();
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
    organizationId: "",
  });

  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN" || user?.role === "Admin";
  
  const { data: orgData, isLoading: isLoadingOrgs } = useOrganizationsList(
    { organizationTypeId: "10000000-0000-0000-0000-000000000005" } // INSPECTION org type
  );
  const orgOptions = orgData?.data?.items ?? [];

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
      const msg = err?.message || (lang === "vi" ? 'Lỗi khởi tạo phiếu kiểm định. Vui lòng thử lại.' : 'Failed to create inspection. Please try again.');
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
          // Fallback: Resolve globally via public API
          try {
            const { get } = await import("../../lib/api");
            const publicRes = await get<any>(`/public/trace/code/${q}`);
            if (publicRes.data && publicRes.data.batchId) {
              const byIdRes = await batchesApi.getById(publicRes.data.batchId);
              if (byIdRes.data && byIdRes.data.id) {
                setSearchedBatch(byIdRes.data);
                setForm((prev) => ({ ...prev, batchId: byIdRes.data.id }));
                setDynamicBatches((prev) => [...prev, byIdRes.data]);
                return;
              }
            }
          } catch {
            // Ignore
          }
        }
        setSearchError(lang === "vi" ? `Không tìm thấy Lô hàng có mã hoặc ID "${q}" trên nền tảng AgriTrace.` : `Batch with code or ID "${q}" not found on AgriTrace.`);
      }
    } catch {
      setSearchError(lang === "vi" ? "Không thể tìm kiếm lô hàng lúc này. Vui lòng thử lại." : "Unable to search for batch at this moment. Please try again.");
    } finally {
      setIsSearchingBatch(false);
    }
  };

  const handleQrScan = (result: string) => {
    let scannedId = result.trim();
    if (scannedId.includes("/trace/")) {
      scannedId = scannedId.split("/trace/").pop() || scannedId;
    }
    setSearchQuery(scannedId);

    const found = allBatches.find(
      (b) => b.id.toLowerCase() === scannedId.toLowerCase() || b.batchCode?.toLowerCase() === scannedId.toLowerCase()
    );

    if (found) {
      setSearchedBatch(found);
      setForm((prev) => ({ ...prev, batchId: found.id }));
    } else {
      const newOption = { id: scannedId, batchCode: scannedId, product: lang === "vi" ? "Lô hàng quét từ mã QR" : "Batch scanned from QR code" };
      setSearchedBatch(newOption);
      setDynamicBatches((prev) => [...prev, newOption]);
      setForm((prev) => ({ ...prev, batchId: scannedId }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-2xl p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()} style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div className="flex items-center justify-between mb-5 border-b border-border pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
              <FlaskConical className="w-5 h-5" style={{ color: "#2E7D32" }} />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">{lang === "vi" ? "Lập Phiếu Kiểm Định Mới (QA/QC)" : "Create New Inspection (QA/QC)"}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{lang === "vi" ? "Xác thực lô hàng & ghi nhận đợt kiểm định chất lượng" : "Verify batch & record quality inspection"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-foreground">
                {lang === "vi" ? "Xác thực Lô nông sản (Batch)" : "Verify Batch"} <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setSelectMode(selectMode === "search" ? "dropdown" : "search")}
                className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
              >
                {selectMode === "search" ? (
                  <><ListFilter className="w-3 h-3" /> {lang === "vi" ? "Chọn từ danh sách lô gần đây" : "Select from recent batches"}</>
                ) : (
                  <><Search className="w-3 h-3" /> {lang === "vi" ? "Tra cứu Mã Lô / Quét QR" : "Search Batch / Scan QR"}</>
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
                    placeholder={lang === "vi" ? "Quét mã QR hoặc nhập Mã Lô (vd: RICE-20260112-001)..." : "Scan QR code or enter Batch Code (e.g. RICE-20260112-001)..."}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none transition-all focus:border-green-500 font-medium text-foreground bg-input-background"
                  />
                  <button
                    type="button"
                    onClick={handleSearchBatch}
                    disabled={isSearchingBatch || !searchQuery.trim()}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0"
                  >
                    {isSearchingBatch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    {lang === "vi" ? "Tra cứu" : "Search"}
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
                          {searchedBatch.product || searchedBatch.productName || (lang === "vi" ? "Lô nông sản" : "Agri Batch")} {searchedBatch.farm ? `· ${searchedBatch.farm}` : ""}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 bg-emerald-700 text-white rounded-lg shrink-0">{lang === "vi" ? "Đã xác thực" : "Verified"}</span>
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
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none bg-input-background transition-all focus:border-green-500 font-medium text-foreground disabled:opacity-60"
                    style={{ appearance: "auto" }}
                    required
                  >
                    <option value="">{lang === "vi" ? "-- Chọn lô nông sản cần kiểm định --" : "-- Select batch to inspect --"}</option>
                    {isLoadingBatches ? (
                      <option disabled>{lang === "vi" ? "Đang tải danh sách lô hàng..." : "Loading batch list..."}</option>
                    ) : allBatches.length === 0 ? (
                      <option disabled>{lang === "vi" ? "Chưa có lô hàng nào" : "No batches available"}</option>
                    ) : (
                      allBatches.map((batch) => {
                        const code = batch.batchCode || batch.id.substring(0, 8);
                        const prodName = batch.product || batch.productName || (lang === "vi" ? "Nông sản" : "Agri Product");
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
            <label className="text-sm font-semibold text-foreground mb-1.5 block">
              {lang === "vi" ? "Loại hình kiểm định (Inspection Type)" : "Inspection Type"} <span className="text-red-500">*</span>
            </label>
            <select
              value={form.inspectionType}
              onChange={(e) => setForm({ ...form, inspectionType: Number(e.target.value) as InspectionType })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none bg-input-background transition-all focus:border-green-500 font-medium text-foreground"
              style={{ appearance: "auto" }}
            >
              {InspectionTypeValues.map((t) => (
                <option key={t.value} value={t.value}>{lang === "vi" ? t.label.vi : t.label.en}</option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">
                {lang === "vi" ? "Tổ chức kiểm định (Inspection Organization)" : "Inspection Organization"} <span className="text-red-500">*</span>
              </label>
              <select
                value={form.organizationId}
                onChange={(e) => setForm({ ...form, organizationId: e.target.value })}
                disabled={isLoadingOrgs}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none bg-input-background transition-all focus:border-green-500 font-medium text-foreground disabled:opacity-60"
                style={{ appearance: "auto" }}
                required={isAdmin}
              >
                <option value="">{lang === "vi" ? "-- Chọn tổ chức kiểm định --" : "-- Select inspection organization --"}</option>
                {isLoadingOrgs ? (
                  <option disabled>{lang === "vi" ? "Đang tải..." : "Loading..."}</option>
                ) : (
                  orgOptions.map((org: any) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))
                )}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">
              {lang === "vi" ? "Ngày lấy mẫu / Kiểm tra" : "Inspection Date"} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.inspectionDate}
              onChange={(e) => setForm({ ...form, inspectionDate: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none bg-input-background transition-all focus:border-green-500 font-medium text-foreground"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">{lang === "vi" ? "Ghi chú kiểm định / Điều kiện mẫu" : "Inspection Notes / Sample Conditions"}</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder={lang === "vi" ? "Nhập các ghi chú ban đầu về mẫu thử, điều kiện môi trường..." : "Enter initial notes about sample, environmental conditions..."}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none resize-none transition-all focus:border-green-500 bg-input-background text-foreground"
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
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              {lang === "vi" ? "Hủy bỏ" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 shadow-md shadow-emerald-700/20"
              style={{ background: "linear-gradient(135deg, #2E7D32, #388E3C)" }}
            >
              {isSubmitting ? (lang === "vi" ? "Đang khởi tạo..." : "Creating...") : (lang === "vi" ? "Khởi Tạo Phiếu Kiểm Định" : "Create Inspection")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
