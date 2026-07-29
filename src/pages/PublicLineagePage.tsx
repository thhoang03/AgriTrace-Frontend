import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft, GitBranch, Leaf, Box, Layers, Download, Share2,
  CheckCircle, ArrowRight, RefreshCw, Sparkles, AlertTriangle
} from "lucide-react";
import { useBatchLineage } from "../features/public-trace/public-trace.queries";
import { toast } from "sonner";

export function PublicLineagePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState<"en" | "vi">("en");
  const { data, isLoading, isError, refetch } = useBatchLineage(id);
  const trace = data?.data;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(lang === "vi" ? "Đã chép liên kết cây phả hệ!" : "Lineage tree link copied!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-3xl bg-green-100 flex items-center justify-center text-green-700 animate-bounce mb-4">
          <GitBranch className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-gray-800 text-lg">
          {lang === "vi" ? "Đang tải cây phả hệ tách/gộp lô..." : "Building batch genealogy lineage tree..."}
        </h3>
      </div>
    );
  }

  if (isError || !trace) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100 space-y-5">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="font-extrabold text-gray-900 text-xl">
            {lang === "vi" ? "Không tìm thấy dữ liệu cây phả hệ" : "Lineage Record Not Found"}
          </h2>
          <p className="text-xs text-gray-500">
            {lang === "vi" ? `Không tìm thấy phả hệ lô hàng "${id}".` : `No genealogy recorded for batch "${id}".`}
          </p>
          <button
            onClick={() => navigate(`/trace/${id}`)}
            className="w-full py-3 rounded-xl bg-green-700 text-white font-bold text-xs"
          >
            {lang === "vi" ? "Quay lại trang truy xuất" : "Back to Trace Page"}
          </button>
        </div>
      </div>
    );
  }

  const nodes = trace.lineage || [];

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-gray-900 pb-16">
      {/* Header Bar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/trace/${id}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-green-800 text-xs font-semibold px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-green-50 border border-gray-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === "vi" ? "Trở về Lô Hàng" : "Back to Trace"}</span>
            </button>
            <div className="h-5 w-[1px] bg-gray-200 hidden sm:block" />
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-8 h-8 rounded-xl bg-green-700 flex items-center justify-center text-white">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-gray-900 text-base hidden sm:inline">AgriTrace Vietnam</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as "en" | "vi")}
              className="text-xs font-semibold border border-gray-200 rounded-xl px-2.5 py-1.5 outline-none bg-gray-50 hover:bg-white transition-colors cursor-pointer"
            >
              <option value="en">🇬🇧 EN</option>
              <option value="vi">🇻🇳 VI</option>
            </select>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-green-900 to-emerald-950 text-white rounded-3xl p-8 shadow-xl border border-white/10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-green-200 text-xs font-bold backdrop-blur">
              <GitBranch className="w-4 h-4 text-amber-300" />
              <span>{lang === "vi" ? "Cơ Sở Dữ Liệu Phả Hệ Lô Hàng" : "Batch Genealogy Ledger Tree"}</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              {lang === "vi" ? "Sơ Đồ Phả Hệ Tách & Gộp Lô Nông Sản" : "Batch Lineage Split & Merge Genealogy Tree"}
            </h1>
            <p className="text-green-100 text-sm max-w-xl">
              {lang === "vi"
                ? `Minh bạch 100% lịch sử tách gộp của mã lô gốc ${id}`
                : `100% transparent split and merge genealogy tree for root batch ID ${id}`}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/15 text-center min-w-[200px] z-10">
            <div className="text-xs text-green-200">{lang === "vi" ? "Mắt xích liên quan" : "Total Connected Nodes"}</div>
            <div className="text-3xl font-extrabold text-white mt-1">{nodes.length}</div>
            <div className="text-[10px] text-green-300 mt-1">Blockchain Audit Secured</div>
          </div>
        </div>

        {/* Genealogy Tree List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <Layers className="w-5 h-5 text-green-700" />
              {lang === "vi" ? "Cây Cấu Trúc Lô Hàng" : "Genealogy Lineage Tree Nodes"}
            </h3>
            <button
              onClick={() => refetch()}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{lang === "vi" ? "Tải lại" : "Refresh"}</span>
            </button>
          </div>

          <div className="space-y-4 relative pl-6 before:absolute before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-green-200">
            {nodes.map((item, idx) => (
              <div key={idx} className="relative pl-8 group">
                <div className="absolute left-6 top-5 w-5 h-0.5 bg-green-300" />
                <div className="absolute left-4 top-[18px] w-4 h-4 rounded-full bg-green-700 border-2 border-white shadow-sm" />

                <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-green-600 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-green-800 text-sm bg-green-50 px-2.5 py-0.5 rounded border border-green-200">
                        {item.batchCode}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {item.eventTypeCode || "BATCH"}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 pt-1">
                      {lang === "vi" ? "Số lượng lô:" : "Node Quantity:"}{" "}
                      <span className="font-bold text-gray-900">{item.quantity} {item.unitCode || "KG"}</span>
                    </div>

                    {item.parentBatchId && (
                      <div className="text-[11px] text-gray-400 font-mono">
                        Parent ID: {item.parentBatchId}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/trace/${item.batchId}`)}
                    className="px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm self-start sm:self-auto"
                  >
                    <span>{lang === "vi" ? "Chi Tiết Lô" : "Inspect Batch"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
