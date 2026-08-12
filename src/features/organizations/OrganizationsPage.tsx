import { useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  ToggleLeft,
  ToggleRight,
  X,
  Building2,
  Eye,
  CheckCircle,
  AlertCircle,
  Users,
  Package,
  Mail,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { organizationsApi } from "./organizations.api";
import { useOrganizationsList } from "./organizations.queries";
import { useAuth } from "../../features/auth/auth.store";
import { useOrganizationTypes } from "../../features/organizationTypes/organizationType.queries";
import { useProductsList } from "../products/products.queries";
import { useUsers } from "../users/users.queries";
import type { Organization } from "./organizations.types";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  SortHeader,
  sortRows,
  useColumnSort,
} from "../../components/common/SortableHeader";

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  FARM: { bg: "#E8F5E9", color: "#1B5E20" },
  PROCESSOR: { bg: "#E3F2FD", color: "#1565C0" },
  DISTRIBUTOR: { bg: "#F3E5F5", color: "#6A1B9A" },
  RETAILER: { bg: "#E0F2F1", color: "#004D40" },
  INSPECTION: { bg: "#FFF9C4", color: "#F57F17" },
  SYSTEM: { bg: "#EDE7F6", color: "#4A148C" },
};

const ORG_TYPES = [
  "FARM",
  "PROCESSOR",
  "DISTRIBUTOR",
  "RETAILER",
  "INSPECTION",
  "SYSTEM",
];
const ORG_TYPE_OPTIONS = [
  { code: "FARM", name: "Farm", id: "10000000-0000-0000-0000-000000000001" },
  {
    code: "PROCESSOR",
    name: "Processor",
    id: "10000000-0000-0000-0000-000000000002",
  },
  {
    code: "DISTRIBUTOR",
    name: "Distributor",
    id: "10000000-0000-0000-0000-000000000003",
  },
  {
    code: "RETAILER",
    name: "Retailer",
    id: "10000000-0000-0000-0000-000000000004",
  },
  {
    code: "INSPECTION",
    name: "Inspection",
    id: "10000000-0000-0000-0000-000000000005",
  },
];
const EMPTY_FORM = {
  name: "",
  organizationTypeId: "10000000-0000-0000-0000-000000000001",
  type: "FARM",
  address: "",
};

interface Alert {
  type: "success" | "error";
  message: string;
}

export function OrganizationsPage() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const isAdmin = user?.role === "ADMIN";
  const isManager = user?.role === "MANAGER";
  const { data: orgTypes = [], isLoading: typesLoading } =
    useOrganizationTypes();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Organization | null>(null);
  const [detail, setDetail] = useState<Organization | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState<Alert | null>(null);
  const [togglingOrgId, setTogglingOrgId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const selectedTypeId =
    typeFilter === "All"
      ? undefined
      : orgTypes.find((t) => t.code.toUpperCase() === typeFilter.toUpperCase())
          ?.id;

  const {
    data: orgData,
    isLoading,
    refetch,
  } = useOrganizationsList({
    search: search || undefined,
    status: statusFilter === "All" ? undefined : statusFilter,
    organizationTypeId: selectedTypeId,
    page,
    pageSize: perPage,
  });

  const { data: allOrgData } = useOrganizationsList({ pageSize: 1000 });
  const allOrgs = allOrgData?.data?.items ?? [];
  const activeCount = allOrgs.filter((o) => o.status === "ACTIVE").length;
  const inactiveCount = allOrgs.filter((o) => o.status === "INACTIVE").length;

  const orgs = orgData?.data?.items ?? [];
  const totalCount = orgData?.data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / perPage);

  const { sort, toggle } = useColumnSort();

  const organizationSortValue = (
    o: Organization,
    key: string,
  ): string | number | boolean => {
    switch (key) {
      case "name":
        return o.name;
      case "type":
        return o.type;
      case "address":
        return o.address ?? "";
      case "status":
        return o.status;
      default:
        return "";
    }
  };

  const sortedOrgs = sortRows(orgs, sort, (o) =>
    organizationSortValue(o, sort?.key ?? ""),
  );

  const showAlert = (type: Alert["type"], message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3000);
  };

  const activeFilterCount =
    (typeFilter !== "All" ? 1 : 0) + (statusFilter !== "All" ? 1 : 0);

  const handleResetFilters = () => {
    setSearch("");
    setTypeFilter("All");
    setStatusFilter("All");
    setPage(1);
    setShowFilters(false);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, organizationTypeId: orgTypes[0]?.id ?? "" });
    setError("");
    setShowModal(true);
  };
  const openEdit = (org: Organization) => {
    setEditing(org);
    const matched = ORG_TYPE_OPTIONS.find(
      (t) => t.code.toUpperCase() === org.type?.toUpperCase(),
    );
    setForm({
      name: org.name,
      organizationTypeId:
        matched?.id ||
        org.organizationTypeId ||
        "10000000-0000-0000-0000-000000000001",
      type: org.type || "FARM",
      address: org.address,
    });
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (
      !form.name.trim() ||
      !form.address.trim() ||
      !form.organizationTypeId.trim()
    ) {
      setError("Please fill in all required fields");
      return;
    }
    setSaving(true);
    setError("");
    const selectedTypeCode =
      orgTypes.find((t) => t.id === form.organizationTypeId)?.code ?? "";
    try {
      if (editing) {
        await organizationsApi.update(editing.organizationId, {
          name: form.name,
          organizationTypeId: form.organizationTypeId,
          address: form.address,
        });
        showAlert("success", `"${form.name}" updated successfully`);
      } else {
        const res = await organizationsApi.create({
          name: form.name,
          organizationTypeId: form.organizationTypeId,
          address: form.address,
        });
        showAlert("success", `"${form.name}" added successfully`);
      }
      refetch();
      setShowModal(false);
    } catch (e: any) {
      setError(e.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (org: Organization) => {
    const newStatus = org.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    // Optimistic update ngay lập tức
    queryClient.setQueriesData<any>(
      { queryKey: ["organizations", "list"] },
      (old: any) => {
        if (!old?.data?.items) return old;
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.map((o: any) =>
              o.organizationId === org.organizationId
                ? { ...o, status: newStatus }
                : o,
            ),
          },
        };
      },
    );
    if (detail?.organizationId === org.organizationId)
      setDetail({ ...detail, status: newStatus });

    try {
      await organizationsApi.updateStatus(org.organizationId, {
        status: newStatus,
      });
      showAlert(
        newStatus === "ACTIVE" ? "success" : "error",
        `"${org.name}" has been ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`,
      );
    } catch (e: any) {
      // Rollback nếu API lỗi
      queryClient.setQueriesData<any>(
        { queryKey: ["organizations", "list"] },
        (old: any) => {
          if (!old?.data?.items) return old;
          return {
            ...old,
            data: {
              ...old.data,
              items: old.data.items.map((o: any) =>
                o.organizationId === org.organizationId
                  ? { ...o, status: org.status }
                  : o,
              ),
            },
          };
        },
      );
      if (detail?.organizationId === org.organizationId)
        setDetail({ ...detail, status: org.status });
      showAlert(
        "error",
        e?.response?.data?.message || e?.message || "Failed to update status",
      );
    }
  };

  const handleInviteStaff = async () => {
    if (!inviteEmail.trim()) {
      showAlert("error", "Please enter an email address");
      return;
    }
    if (!detail) return;
    setInviting(true);
    setError("");
    try {
      await organizationsApi.inviteStaff(
        detail.organizationId,
        inviteEmail.trim(),
      );
      showAlert("success", `Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setShowInviteModal(false);
    } catch (e: any) {
      setError(e.message || "Failed to send invitation");
    } finally {
      setInviting(false);
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
          background:
            "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #66BB6A 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 80%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 h-full flex items-center px-8 justify-between">
          <div>
            <h1
              className="text-white"
              style={{ fontSize: 24, fontWeight: 700 }}
            >
              {lang === "vi"
                ? "Quản Lý Tổ Chức & Đơn Vị"
                : "Organization Management"}
            </h1>
            <p className="text-green-100 text-sm mt-1">
              {lang === "vi"
                ? "Quản lý danh sách các tổ chức, doanh nghiệp trong chuỗi cung ứng"
                : "Manage organizations in the supply chain"}
            </p>
          </div>
          <div className="flex items-center gap-6">
            {(["ACTIVE", "INACTIVE"] as const).map((s) => (
              <div key={s} className="text-center">
                <div className="font-bold text-white" style={{ fontSize: 20 }}>
                  {s === "ACTIVE" ? activeCount : inactiveCount}
                </div>
                <div className="text-green-200 text-xs">
                  {s === "ACTIVE"
                    ? lang === "vi"
                      ? "HOẠT ĐỘNG"
                      : "ACTIVE"
                    : lang === "vi"
                      ? "NGƯNG ĐỘNG"
                      : "INACTIVE"}
                </div>
              </div>
            ))}
            <div className="text-center">
              <div className="font-bold text-white" style={{ fontSize: 20 }}>
                {totalCount}
              </div>
              <div className="text-green-200 text-xs">
                {lang === "vi" ? "TỔNG CỘNG" : "TOTAL"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-10">
        {/* Filters */}
        <div
          className="bg-card rounded-2xl p-4 mb-5"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-48 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={
                  lang === "vi"
                    ? "Tìm kiếm tổ chức..."
                    : "Search organizations..."
                }
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm outline-none bg-input-background"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? "text-white" : "text-muted-foreground border-border hover:bg-muted"}`}
              style={
                showFilters
                  ? { background: "#2E7D32", border: "1px solid #2E7D32" }
                  : {}
              }
            >
              <SlidersHorizontal className="w-4 h-4" />
              {lang === "vi" ? "Bộ Lọc" : "Filters"}
              {activeFilterCount > 0 && (
                <span
                  className="w-5 h-5 rounded-full text-xs flex items-center justify-center"
                  style={{
                    background: showFilters
                      ? "rgba(255,255,255,0.2)"
                      : "#2E7D32",
                    color: "white",
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
            {!isManager && (
              <button
                onClick={openAdd}
                className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                style={{ background: "#2E7D32" }}
              >
                <Plus className="w-4 h-4" />{" "}
                {lang === "vi" ? "Thêm Tổ Chức" : "Add Organization"}
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none bg-input-background"
                  >
                    <option value="All">All</option>
                    {orgTypes.map((t) => (
                      <option key={t.id} value={t.code}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none bg-input-background"
                  >
                    {["All", "ACTIVE", "INACTIVE"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-2 w-full justify-center px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div
          className="bg-card rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {lang === "vi"
                ? `Hiển thị ${orgs.length} tổ chức`
                : `Showing ${orgs.length} organizations`}
            </span>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
              {lang === "vi" ? "Đang tải dữ liệu..." : "Loading..."}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <SortHeader
                        label={lang === "vi" ? "TỔ CHỨC" : "Organization"}
                        sortKey="name"
                        sort={sort}
                        onSort={toggle}
                        className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                      />
                      <SortHeader
                        label={lang === "vi" ? "LOẠI HÌNH" : "Type"}
                        sortKey="type"
                        sort={sort}
                        onSort={toggle}
                        className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                      />
                      <SortHeader
                        label={lang === "vi" ? "ĐỊA CHỈ" : "Address"}
                        sortKey="address"
                        sort={sort}
                        onSort={toggle}
                        className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                      />
                      <SortHeader
                        label={lang === "vi" ? "TRẠNG THÁI" : "Status"}
                        sortKey="status"
                        sort={sort}
                        onSort={toggle}
                        className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                      />
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        {lang === "vi" ? "THAO TÁC" : "Actions"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sortedOrgs.map((org) => {
                      const typeCfg = TYPE_COLORS[org.type] || {
                        bg: "#F5F5F5",
                        color: "#666",
                      };
                      const isActive = org.status?.toUpperCase() === "ACTIVE";
                      return (
                        <tr
                          key={org.organizationId}
                          className="hover:bg-green-50/20 transition-colors group"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: typeCfg.bg }}
                              >
                                <Building2
                                  className="w-4 h-4"
                                  style={{ color: typeCfg.color }}
                                />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-foreground">
                                  {org.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ID: {org.organizationId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className="px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={{
                                background: typeCfg.bg,
                                color: typeCfg.color,
                              }}
                            >
                              {org.type}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm text-muted-foreground">
                              {org.address || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isActive
                                ? "text-green-700"
                                : "text-gray-600"
                                }`}
                              style={{ background: isActive ? "#E8F5E9" : "#F5F5F5" }}
                            >
                              {isActive ? (lang === "vi" ? "Hoạt động" : "Active") : (lang === "vi" ? "Ngưng hoạt động" : "Inactive")}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1 transition-opacity">
                              <button
                                onClick={() => setDetail(org)}
                                className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                                title="View Detail"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEdit(org)}
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(org)}
                                disabled={
                                  togglingOrgId === String(org.organizationId)
                                }
                                className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isActive ? "hover:bg-red-50 text-red-400" : "hover:bg-green-50 text-green-500"}`}
                                title={isActive ? "Deactivate" : "Activate"}
                              >
                                {togglingOrgId ===
                                String(org.organizationId) ? (
                                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                                ) : isActive ? (
                                  <ToggleRight className="w-3.5 h-3.5" />
                                ) : (
                                  <ToggleLeft className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {orgs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Building2 className="w-10 h-10 mb-3 opacity-30" />
                    <p className="text-sm">No organizations found</p>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {totalCount === 0 ? 0 : (page - 1) * perPage + 1} to{" "}
                    {Math.min(page * perPage, totalCount)} of {totalCount}{" "}
                    organizations
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground">Rows/page</label>
                    <select
                      value={perPage}
                      onChange={(e) => {
                        setPerPage(Number(e.target.value));
                        setPage(1);
                      }}
                      className="px-2 py-1 rounded-lg border border-border text-sm outline-none bg-input-background"
                    >
                      {[5, 10, 20, 50].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Previous"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {page > 1 && (
                    <>
                      <button
                        onClick={() => setPage(1)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${page === 1 ? "text-white" : "text-muted-foreground hover:bg-muted border-border"}`}
                        style={
                          page === 1
                            ? { background: "#2E7D32", borderColor: "#2E7D32" }
                            : {}
                        }
                      >
                        1
                      </button>
                      {page > 2 && (
                        <span className="px-1 text-muted-foreground text-sm">…</span>
                      )}
                    </>
                  )}
                  {[page - 1, page, page + 1]
                    .filter((p) => p > 1 && p < totalPages)
                    .map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${p === page ? "text-white" : "text-muted-foreground hover:bg-muted border-border"}`}
                        style={
                          p === page
                            ? { background: "#2E7D32", borderColor: "#2E7D32" }
                            : {}
                        }
                      >
                        {p}
                      </button>
                    ))}
                  {page < totalPages && (
                    <>
                      {page < totalPages - 1 && (
                        <span className="px-1 text-muted-foreground text-sm">…</span>
                      )}
                      <button
                        onClick={() => setPage(totalPages)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${page === totalPages ? "text-white" : "text-muted-foreground hover:bg-muted border-border"}`}
                        style={
                          page === totalPages
                            ? { background: "#2E7D32", borderColor: "#2E7D32" }
                            : {}
                        }
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="bg-card rounded-2xl p-6 max-w-md w-full"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground">
                {editing ? "Edit Organization" : "Add Organization"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-muted"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Organization Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-green-400 bg-input-background"
                  placeholder="Organization Name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Type
                </label>
                <select
                  value={form.organizationTypeId}
                  onChange={(e) => {
                    const matched = ORG_TYPE_OPTIONS.find(
                      (t) => t.id === e.target.value,
                    );
                    setForm({
                      ...form,
                      organizationTypeId: e.target.value,
                      type: matched?.code || "FARM",
                    });
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none bg-input-background focus:border-green-400"
                >
                  {ORG_TYPE_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.code}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Address
                </label>
                <input
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-green-400 bg-input-background"
                  placeholder="Address"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                  style={{ background: "#2E7D32" }}
                >
                  {saving
                    ? "Saving..."
                    : editing
                      ? "Save Changes"
                      : "Add Organization"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <OrganizationDetailModal
          detail={detail}
          onClose={() => setDetail(null)}
          onEdit={(org) => openEdit(org)}
          onToggleStatus={(org) => handleToggleStatus(org)}
          onInvite={() => setShowInviteModal(true)}
          isManager={isManager}
          isAdmin={isAdmin}
        />
      )}

      {/* Invite Staff Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="bg-card rounded-2xl p-6 max-w-md w-full"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "#E3F2FD" }}
                >
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-bold text-foreground">Invite Staff</h3>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1.5 rounded-lg hover:bg-muted"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Send an invitation to a new staff member for{" "}
                <strong>{detail?.name}</strong>.
              </p>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="staff@example.com"
                  className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-green-400 bg-input-background"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setError("");
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteStaff}
                  disabled={inviting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                  style={{ background: "#2E7D32" }}
                >
                  {inviting ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrganizationDetailModal({
  detail,
  onClose,
  onEdit,
  onToggleStatus,
  onInvite,
  isManager,
  isAdmin,
}: {
  detail: any;
  onClose: () => void;
  onEdit: (org: any) => void;
  onToggleStatus: (org: any) => void;
  onInvite: () => void;
  isManager: boolean;
  isAdmin: boolean;
}) {
  const orgIdStr = String(detail.organizationId || detail.id || "");
  const { data: productsData, isLoading: loadingProducts } = useProductsList({
    organizationId: orgIdStr,
    pageSize: 100,
  });
  const { data: usersData, isLoading: loadingUsers } = useUsers({ limit: 100 });

  const rawProducts = productsData?.data?.items ?? [];
  const matchingProducts = rawProducts.filter(
    (p) =>
      p.organizationId === orgIdStr ||
      (p.organizationName && p.organizationName.toLowerCase() === detail.name.toLowerCase())
  );
  const productCount = productsData?.data?.totalCount ?? matchingProducts.length;

  const rawUsers = usersData?.data?.items ?? [];
  const matchingMembers = rawUsers.filter(
    (u: any) =>
      u.organizationId === orgIdStr ||
      (u.organization && u.organization.toLowerCase() === detail.name.toLowerCase())
  );
  const memberCount = matchingMembers.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
        <div className="p-5" style={{ background: "linear-gradient(135deg, #1B5E20, #2E7D32)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/15">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{detail.name}</h3>
                <p className="text-green-200 text-xs font-mono">ID: {detail.organizationId || detail.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {[
            { label: "Type", value: detail.type },
            { label: "Address", value: detail.address || "N/A" },
            { label: "Status", value: detail.status },
          ].map(({ label, value }) => {
            const isStatus = label === "Status";
            const isActive = value === "ACTIVE";
            const typeCfg = TYPE_COLORS[value] || null;
            return (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-400">{label}</span>
                {isStatus ? (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: isActive ? "#4CAF50" : "#9E9E9E" }} />
                    <span className="text-sm font-medium" style={{ color: isActive ? "#2E7D32" : "#757575" }}>{value}</span>
                  </div>
                ) : typeCfg ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: typeCfg.bg, color: typeCfg.color }}>
                    {value}
                  </span>
                ) : (
                  <span className="text-sm font-medium text-gray-800">{value}</span>
                )}
              </div>
            );
          })}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {/* Members Section */}
            <div className="rounded-xl p-3.5 bg-gray-50 border border-gray-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold">Members</span>
                </div>
                <span className="text-xs font-bold text-blue-700 px-2 py-0.5 bg-blue-100 rounded-full">
                  {loadingUsers ? "..." : memberCount}
                </span>
              </div>
              {loadingUsers ? (
                <p className="text-xs text-gray-400 animate-pulse">Loading members...</p>
              ) : matchingMembers.length > 0 ? (
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
                  {matchingMembers.map((m: any) => (
                    <span key={m.id} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white text-gray-800 border border-gray-200 shadow-2xs">
                      {m.fullName || m.email}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No members assigned.</p>
              )}
              {isManager && (
                <button
                  onClick={onInvite}
                  className="w-full mt-1.5 text-xs font-semibold text-green-700 hover:text-green-900 bg-white border border-green-200 py-1.5 rounded-lg flex items-center justify-center gap-1 shadow-2xs"
                >
                  <Mail className="w-3.5 h-3.5" /> Invite Staff
                </button>
              )}
            </div>

            {/* Products Section */}
            <div className="rounded-xl p-3.5 bg-gray-50 border border-gray-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <Package className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold">Products</span>
                </div>
                <span className="text-xs font-bold text-green-700 px-2 py-0.5 bg-green-100 rounded-full">
                  {loadingProducts ? "..." : productCount}
                </span>
              </div>
              {loadingProducts ? (
                <p className="text-xs text-gray-400 animate-pulse">Loading products...</p>
              ) : matchingProducts.length > 0 ? (
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
                  {matchingProducts.map((p) => (
                    <span key={p.id} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white text-gray-800 border border-gray-200 shadow-2xs">
                      {p.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No products registered.</p>
              )}
            </div>
          </div>

          {(isAdmin || isManager) && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { onClose(); onEdit(detail); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => onToggleStatus(detail)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${detail.status === "ACTIVE" ? "bg-red-50 text-red-600 hover:bg-red-100" : "text-white hover:opacity-90"}`}
                style={detail.status !== "ACTIVE" ? { background: "#2E7D32" } : {}}
              >
                {detail.status === "ACTIVE" ? <><ToggleRight className="w-4 h-4" /> Deactivate</> : <><ToggleLeft className="w-4 h-4" /> Activate</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
