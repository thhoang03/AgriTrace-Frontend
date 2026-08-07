import { useState } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  X,
  Building2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { organizationsApi } from "./organizations.api";
import { useOrganizationsList } from "./organizations.queries";
import type { Organization } from "./organizations.types";
import { useLanguage } from "../../contexts/LanguageContext";
import { SortHeader, sortRows, useColumnSort } from "../../components/common/SortableHeader";

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  FARM: { bg: "#E8F5E9", color: "#1B5E20" },
  PROCESSOR: { bg: "#E3F2FD", color: "#1565C0" },
  DISTRIBUTOR: { bg: "#F3E5F5", color: "#6A1B9A" },
  RETAILER:    { bg: "#E0F2F1", color: "#004D40" },
  INSPECTION:  { bg: "#FFF9C4", color: "#F57F17" },
  SYSTEM:      { bg: "#EDE7F6", color: "#4A148C" },
};

interface Alert {
  type: "success" | "error";
  message: string;
}

export function OrganizationApprovalsPage() {
  const { lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [actionOrgId, setActionOrgId] = useState<string | null>(null);
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingOrg, setRejectingOrg] = useState<Organization | null>(null);

  // Fetch only PENDING organizations
  const { data: orgData, isLoading, refetch } = useOrganizationsList({
    search: search || undefined,
    status: "PENDING",
    page,
    pageSize: perPage,
  });

  const orgs = orgData?.data?.items ?? [];
  const totalCount = orgData?.data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / perPage);

  const { sort, toggle } = useColumnSort();

  const organizationSortValue = (o: Organization, key: string): string | number | boolean => {
    switch (key) {
      case "name": return o.name;
      case "type": return o.type;
      case "address": return o.address ?? "";
      default: return "";
    }
  };

  const sortedOrgs = sortRows(orgs, sort, (o) =>
    organizationSortValue(o, sort?.key ?? ""),
  );

  const showAlert = (type: Alert["type"], message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleApprove = async (org: Organization) => {
    if (actionOrgId) return;
    setActionOrgId(String(org.organizationId));
    try {
      await organizationsApi.approve(org.organizationId);
      refetch();
      showAlert("success", lang === "vi" ? `"${org.name}" đã được phê duyệt.` : `"${org.name}" has been approved.`);
    } catch (e: any) {
      showAlert("error", lang === "vi" ? (e.message || "Không thể phê duyệt tổ chức.") : (e.message || "Failed to approve organization."));
    } finally {
      setActionOrgId(null);
    }
  };

  const openRejectModal = (org: Organization) => {
    setRejectingOrg(org);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectingOrg || actionOrgId) return;
    setActionOrgId(String(rejectingOrg.organizationId));
    try {
      await organizationsApi.reject(rejectingOrg.organizationId, rejectReason);
      refetch();
      showAlert("success", lang === "vi" ? `"${rejectingOrg.name}" đã bị từ chối.` : `"${rejectingOrg.name}" has been rejected.`);
      setShowRejectModal(false);
    } catch (e: any) {
      showAlert("error", lang === "vi" ? (e.message || "Không thể từ chối tổ chức.") : (e.message || "Failed to reject organization."));
    } finally {
      setActionOrgId(null);
      setRejectingOrg(null);
    }
  };

  return (
    <div className="pb-8">
      {/* Alert */}
      {alert && (
        <div
          className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${alert.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}
        >
          {alert.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          )}
          {alert.message}
        </div>
      )}

      {/* Header */}
      <div
        className="relative h-36 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #66BB6A 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 h-full flex items-center px-8 justify-between">
          <div>
            <h1 className="text-white" style={{ fontSize: 24, fontWeight: 700 }}>
              {lang === "vi" ? "Duyệt Tổ Chức" : "Organization Approvals"}
            </h1>
            <p className="text-green-100 text-sm mt-1">
              {lang === "vi" ? "Xét duyệt các tổ chức đăng ký tham gia hệ thống" : "Review organizations applying to join the system"}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="font-bold text-white" style={{ fontSize: 20 }}>
                {totalCount}
              </div>
              <div className="text-green-200 text-xs">{lang === "vi" ? "CHỜ DUYỆT" : "PENDING"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-10">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 mb-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-48 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={lang === "vi" ? "Tìm kiếm tổ chức..." : "Search organizations..."}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
                style={{ background: "#F8FAF8" }}
              />
              {search && (
                <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {lang === "vi" ? `Hiển thị ${orgs.length} tổ chức chờ duyệt` : `Showing ${orgs.length} pending organizations`}
            </span>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              {lang === "vi" ? "Đang tải dữ liệu..." : "Loading..."}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "#F8FAF8" }}>
                      <SortHeader label={lang === "vi" ? "TỔ CHỨC" : "Organization"} sortKey="name" sort={sort} onSort={toggle} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap" />
                      <SortHeader label={lang === "vi" ? "LOẠI HÌNH" : "Type"} sortKey="type" sort={sort} onSort={toggle} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap" />
                      <SortHeader label={lang === "vi" ? "ĐỊA CHỈ" : "Address"} sortKey="address" sort={sort} onSort={toggle} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap" />
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{lang === "vi" ? "THAO TÁC" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sortedOrgs.map((org) => {
                      const typeCfg = TYPE_COLORS[org.type] || { bg: "#F5F5F5", color: "#666" };
                      return (
                        <tr key={org.organizationId} className="hover:bg-green-50/20 transition-colors group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: typeCfg.bg }}>
                                <Building2 className="w-4 h-4" style={{ color: typeCfg.color }} />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{org.name}</div>
                                <div className="text-xs text-gray-400">ID: {org.organizationId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: typeCfg.bg, color: typeCfg.color }}>
                              {org.type}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm text-gray-700">{org.address || "—"}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApprove(org)}
                                disabled={actionOrgId === String(org.organizationId)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                                {lang === "vi" ? "Duyệt" : "Approve"}
                              </button>
                              <button
                                onClick={() => openRejectModal(org)}
                                disabled={actionOrgId === String(org.organizationId)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                <XCircle className="w-4 h-4" />
                                {lang === "vi" ? "Từ chối" : "Reject"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {orgs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Building2 className="w-10 h-10 mb-3 opacity-30" />
                    <p className="text-sm">{lang === "vi" ? "Không có tổ chức nào chờ duyệt" : "No pending organizations"}</p>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <div className="text-sm text-gray-500">
                    Showing {totalCount === 0 ? 0 : ((page - 1) * perPage) + 1} to {Math.min(page * perPage, totalCount)} of {totalCount} organizations
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">Rows/page</label>
                    <select
                      value={perPage}
                      onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                      className="px-2 py-1 rounded-lg border border-gray-200 text-sm outline-none bg-white"
                    >
                      {[5, 10, 20, 50].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {[page - 1, page, page + 1].filter((p) => p > 1 && p < totalPages).map((p) => (
                    <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${p === page ? "text-white" : "text-gray-600 hover:bg-gray-50 border-gray-200"}`} style={p === page ? { background: "#2E7D32", borderColor: "#2E7D32" } : {}}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">
                {lang === "vi" ? "Từ chối tổ chức" : "Reject Organization"}
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {lang === "vi" 
                  ? `Bạn sắp từ chối yêu cầu đăng ký của "${rejectingOrg?.name}". Vui lòng nhập lý do (không bắt buộc):` 
                  : `You are about to reject the registration of "${rejectingOrg?.name}". Please enter a reason (optional):`}
              </p>
              <div>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400"
                  style={{ background: "#F8FAF8", minHeight: "100px" }}
                  placeholder={lang === "vi" ? "Lý do từ chối..." : "Reason for rejection..."}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {lang === "vi" ? "Hủy" : "Cancel"}
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionOrgId !== null}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
                >
                  {lang === "vi" ? "Xác nhận từ chối" : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
