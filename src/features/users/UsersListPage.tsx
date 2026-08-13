import { useMemo, useState, useCallback } from "react";
import {
  Search,
  Plus,
  Edit2,
  Key,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useAuth } from "../auth/auth.store";
import { useOrganizationsList } from "../organizations/organizations.queries";
import {
  useResetPassword,
  useUpdateUser,
  useToggleStatus,
  useUsers,
} from "./users.queries";
import { usersApi } from "./users.api";
import { useQueryClient } from "@tanstack/react-query";
import {
  filterUsers,
  getOrgTypeOptions,
  getRoleOptions,
  getStatusOptions,
  getStatusSummary,
} from "./users.utils";
import type {
  CreateUserRequest,
  UserItem,
  UserRole,
  UserStatus,
} from "./users.types";
import type { Organization } from "../organizations/organizations.types";
import { useLanguage } from "../../contexts/LanguageContext";
import { SortHeader, sortRows, useColumnSort } from "../../components/common/SortableHeader";
import { translateApiError } from "../../utils/error-translator";

const BANNER_IMG =
  "https://images.unsplash.com/photo-1529304344766-6b537de190f8?w=1400&q=80";

const roleColors: Record<string, { bg: string; color: string }> = {
  ADMIN: { bg: "#E8F5E9", color: "#1B5E20" },
  MANAGER: { bg: "#E3F2FD", color: "#1565C0" },
  STAFF: { bg: "#FFF3E0", color: "#E65100" },
};

const statusConfig: Record<
  string,
  { bg: string; color: string; dot: string }
> = {
  Active: { bg: "#E8F5E9", color: "#2E7D32", dot: "#4CAF50" },
  Inactive: { bg: "#F5F5F5", color: "#757575", dot: "#9E9E9E" },
  Pending: { bg: "#FFF8E1", color: "#FFB300", dot: "#FF9800" },
};

const orgTypeColors: Record<string, { bg: string; color: string }> = {
  FARM: { bg: "#E8F5E9", color: "#1B5E20" },
  PROCESSOR: { bg: "#E3F2FD", color: "#0D47A1" },
  DISTRIBUTOR: { bg: "#FFF3E0", color: "#BF360C" },
  RETAILER: { bg: "#F3E5F5", color: "#4A148C" },
  INSPECTION: { bg: "#E0F7FA", color: "#006064" },
  SYSTEM: { bg: "#FCE4EC", color: "#880E4F" },
};

const emptyUserForm: CreateUserRequest = {
  fullName: "",
  email: "",
  password: "",
  role: "STAFF",
  organization: "",
  organizationId: undefined,
};

function generatePassword(length = 12): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const all = upper + lower + digits;
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  let password = "";
  for (let i = 0; i < length; i++) {
    password += all[array[i] % all.length];
  }
  return password;
}

export function UsersListPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";
  const { lang } = useLanguage();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "All">("All");
  const [orgTypeFilter, setOrgTypeFilter] = useState<string | "All">("All");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "All">("All");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<CreateUserRequest>(emptyUserForm);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  interface Alert { type: "success" | "error"; message: string; }
  const [alert, setAlert] = useState<Alert | null>(null);

  const showAlert = (type: Alert["type"], message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3000);
  };

  const getApiErrorMessage = (err: unknown) => {
    const raw = (err as any)?.response?.data?.message || (err as any)?.message || "An error occurred";
    return translateApiError(raw, lang);
  };

  const { data, isLoading, isError } = useUsers({
    search,
    role: roleFilter === "All" ? undefined : roleFilter,
    orgType: orgTypeFilter === "All" ? undefined : orgTypeFilter,
    status: statusFilter === "All" ? undefined : statusFilter,
    page,
    limit: perPage,
  });

  const updateUser = useUpdateUser();
  const toggleStatus = useToggleStatus();
  const resetPassword = useResetPassword();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);

  const { data: orgsData } = useOrganizationsList();
  const organizations = useMemo<Organization[]>(
    () => orgsData?.data?.items ?? [],
    [orgsData]
  );

  const users = useMemo(() => data?.data?.items ?? [], [data]);
  const filtered = useMemo(
    () => filterUsers(users, { search, role: roleFilter, orgType: orgTypeFilter, status: statusFilter }),
    [users, search, roleFilter, orgTypeFilter, statusFilter]
  );

  const { sort, toggle } = useColumnSort();

  const userSortValue = (u: UserItem, key: string): string | number | boolean => {
    switch (key) {
      case "name": return u.fullName;
      case "organization": return u.organization;
      case "orgType": return u.organizationType;
      case "role": return u.role;
      case "status": return u.status;
      case "contact": return u.phone;
      default: return "";
    }
  };

  const sortedUsers = sortRows(filtered, sort, (u) =>
    userSortValue(u, sort?.key ?? ""),
  );
  const roles = ["All", ...getRoleOptions(users)];
  const orgTypes = ["All", ...getOrgTypeOptions(users)];
  const statuses = getStatusOptions();
  const summary = useMemo(() => getStatusSummary(users), [users]);

  const totalCount = data?.data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / perPage);

  const activeFilterCount =
    (roleFilter !== "All" ? 1 : 0) +
    (orgTypeFilter !== "All" ? 1 : 0) +
    (statusFilter !== "All" ? 1 : 0);

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("All");
    setOrgTypeFilter("All");
    setStatusFilter("All");
    setPage(1);
    setShowFilters(false);
  };

  const handleCreateUser = async () => {
    if (!form.fullName || !form.email || !form.password)
      return;
    try {

      setCreating(true);
      await usersApi.create(form as any);
      qc.invalidateQueries({ queryKey: ["users"] });
      setForm(emptyUserForm);
      setShowAdd(false);
      showAlert("success", lang === "vi" ? `Tạo người dùng "${form.fullName}" thành công` : `User "${form.fullName}" created successfully`);
    } catch (e: any) {
      showAlert("error", getApiErrorMessage(e));
    } finally {
      setCreating(false);
    }
  };

  const handleAutoGeneratePassword = useCallback(() => {
    setForm((prev) => ({ ...prev, password: generatePassword() }));
  }, []);

const handleResetPassword = async (user: UserItem) => {
  const password = window.prompt(
    lang === "vi" ? `Đặt mật khẩu mới cho ${user.fullName}` : `Set a new password for ${user.fullName}`
  );
  if (!password) return;
  try {
    await resetPassword.mutateAsync({ id: user.id, newPassword: password });
    showAlert("success", lang === "vi" ? `Đặt lại mật khẩu cho "${user.fullName}" thành công` : `Password reset for "${user.fullName}" successfully`);
  } catch (e: any) {
    showAlert("error", getApiErrorMessage(e));
  }
};

  const handleStatusToggle = async (user: UserItem) => {
    const nextStatus = user.status === "Active" ? "Inactive" : "Active";
    const confirmMsg = lang === "vi"
      ? `Bạn có chắc muốn ${nextStatus === "Active" ? "kích hoạt" : "vô hiệu hóa"} người dùng "${user.fullName}"?`
      : `Are you sure you want to ${nextStatus === "Active" ? "activate" : "deactivate"} user "${user.fullName}"?`;
    if (!confirm(confirmMsg)) return;
    try {
      await toggleStatus.mutateAsync({ id: user.id, isActive: nextStatus === "Active" });
      showAlert(
        "success",
        lang === "vi"
          ? `"${user.fullName}" đã được ${nextStatus === "Active" ? "kích hoạt" : "vô hiệu hóa"}`
          : `"${user.fullName}" has been ${nextStatus === "Active" ? "activated" : "deactivated"}`
      );
    } catch (e: any) {
      showAlert("error", getApiErrorMessage(e));
    }
  };

  return (
    <div className="pb-8">
      {/* Alert */}
      {alert && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${alert.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {alert.type === "success"
            ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
          {alert.message}
        </div>
      )}

      {/* Banner */}
      <div className="relative h-36 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BANNER_IMG})` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(27,94,32,0.9) 0%, rgba(46,125,50,0.6) 100%)",
          }}
        />
        <div className="relative z-10 h-full flex items-center px-8 justify-between">
          <div>
            <h1
              className="text-white"
              style={{ fontSize: 24, fontWeight: 700 }}
            >
              {lang === "vi" ? "Quản Lý Người Dùng" : "User Management"}
            </h1>
            <p className="text-green-100 text-sm mt-1">
              {lang === "vi" ? "Quản lý tài khoản, phân quyền và vai trò người dùng trong hệ thống" : "Manage platform users, roles, and permissions"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {(["Active", "Inactive", "Pending"] as const).map((s) => (
              <div key={s} className="text-center">
                <div
                  className="font-bold text-white"
                  style={{ fontSize: 20 }}
                >
                  {summary[s]}
                </div>
                <div className="text-green-200 text-xs">
                  {s === "Active" ? (lang === "vi" ? "HOẠT ĐỘNG" : "Active") : s === "Inactive" ? (lang === "vi" ? "NGƯNG ĐỘNG" : "Inactive") : (lang === "vi" ? "CHỜ DUYỆT" : "Pending")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-10">
        {/* Filter Bar */}
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
                maxLength={199}
                onChange={(e) => { setSearch(e.target.value.slice(0, 199)); setPage(1); }}
                placeholder={lang === "vi" ? "Tìm kiếm người dùng..." : "Search users..."}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm outline-none bg-input-background"
              />
              {search && (
                <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? "text-white" : "text-muted-foreground border-border hover:bg-muted"}`}
              style={showFilters ? { background: "#2E7D32", border: "1px solid #2E7D32" } : {}}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {lang === "vi" ? "Bộ Lọc" : "Filters"}
              {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center" style={{ background: showFilters ? "rgba(255,255,255,0.2)" : "#2E7D32", color: "white" }}>{activeFilterCount}</span>}
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ background: "#2E7D32" }}
            >
              <Plus className="w-4 h-4" /> {lang === "vi" ? "Thêm Người Dùng" : "Add User"}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Role</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value as UserRole | "All");
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none bg-input-background"
                  >
                    {roles.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Org. Type</label>
                  <select
                    value={orgTypeFilter}
                    onChange={(e) => {
                      setOrgTypeFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none bg-input-background"
                  >
                    {orgTypes.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as UserStatus | "All");
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none bg-input-background"
                  >
                    {statuses.map((s) => (
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
          <div className="px-6 py-4 border-b border-border">
            <span className="text-sm text-muted-foreground">
              {lang === "vi" ? `Hiển thị ${filtered.length} người dùng` : `Showing ${filtered.length} users`}
            </span>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {lang === "vi" ? "Đang tải dữ liệu người dùng..." : "Loading users..."}
              </div>
            ) : isError ? (
              <div className="py-10 text-center text-destructive">
                {lang === "vi" ? "Không thể tải dữ liệu người dùng." : "Unable to load users right now."}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/60 border-b border-border">
                    <SortHeader label={lang === "vi" ? "Người Dùng" : "User"} sortKey="name" sort={sort} onSort={toggle} className="px-4 py-2.5 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest whitespace-nowrap min-w-[220px]" />
                    <SortHeader label={lang === "vi" ? "Tổ Chức" : "Organization"} sortKey="organization" sort={sort} onSort={toggle} className="px-4 py-2.5 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest whitespace-nowrap min-w-[140px]" />
                    <SortHeader label={lang === "vi" ? "Loại Đơn Vị" : "Org. Type"} sortKey="orgType" sort={sort} onSort={toggle} className="px-4 py-2.5 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest whitespace-nowrap min-w-[110px]" />
                    <SortHeader label={lang === "vi" ? "Vai Trò" : "Role"} sortKey="role" sort={sort} onSort={toggle} className="px-4 py-2.5 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest whitespace-nowrap min-w-[100px]" />
                    <SortHeader label={lang === "vi" ? "Trạng Thái" : "Status"} sortKey="status" sort={sort} onSort={toggle} className="px-4 py-2.5 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest whitespace-nowrap min-w-[110px]" />
                    <SortHeader label={lang === "vi" ? "Liên Hệ" : "Contact"} sortKey="contact" sort={sort} onSort={toggle} className="px-4 py-2.5 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest whitespace-nowrap min-w-[180px]" />
                    <th className="text-right px-4 py-2.5 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest whitespace-nowrap min-w-[110px]">{lang === "vi" ? "Thao Tác" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedUsers.map((user) => {
                    const roleCfg = roleColors[user.role.toUpperCase()] || {
                      bg: "#F5F5F5",
                      color: "#666",
                    };
                    const staCfg = statusConfig[user.status];
                    const encodedName = encodeURIComponent(user.fullName);
                    const apiUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&rounded=true&size=128`;
                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-green-50/20 transition-colors group"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={apiUrl}
                              alt={user.fullName}
                              className="w-9 h-9 rounded-full object-cover ring-2 ring-border"
                            />
                            <div>
                              <div className="text-sm font-semibold text-foreground">
                                {user.fullName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-sm text-muted-foreground max-w-40 truncate">
                            {user.organization || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                           <span
                             className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                             style={{
                               backgroundColor: (orgTypeColors[user.organizationType.toUpperCase()] || { bg: "#F5F5F5", color: "#666" }).bg,
                               color: (orgTypeColors[user.organizationType.toUpperCase()] || { bg: "#F5F5F5", color: "#666" }).color,
                             }}
                           >
                             {user.organizationType || "—"}
                           </span>
                         </td>
                         <td className="px-4 py-3.5">
                           <span
                             className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                             style={{
                               backgroundColor: roleCfg.bg,
                               color: roleCfg.color,
                             }}
                           >
                             {user.role}
                           </span>
                         </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => handleStatusToggle(user)}
                            className="flex items-center gap-2 whitespace-nowrap"
                            title="Toggle account status"
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: staCfg.dot }}
                            />
                            <span
                              className="text-sm font-medium"
                              style={{ color: staCfg.color }}
                            >
                              {user.status}
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {user.phone || "—"}
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-100 transition-opacity">
                             <button
                               onClick={() => setSelectedUser(user)}
                               className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                               title="Edit"
                             >
                               <Edit2 className="w-3.5 h-3.5" />
                             </button>
                             <button
                               onClick={() => handleResetPassword(user)}
                               className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-colors"
                               title="Reset Password"
                             >
                               <Key className="w-3.5 h-3.5" />
                             </button>
                              <button
                                onClick={() => handleStatusToggle(user)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                   user.status === "Active" 
                                    ? "hover:bg-red-50 text-red-400" 
                                    : "hover:bg-green-50 text-green-500"
                                }`}
                                title={user.status === "Active" ? "Deactivate" : "Activate"}
                              >
                                {user.status === "Active" ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                              </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {totalCount === 0 ? 0 : ((page - 1) * perPage) + 1} to {Math.min(page * perPage, totalCount)} of {totalCount} users
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Rows/page</label>
                <select
                  value={perPage}
                  onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                  className="px-2 py-1 rounded-lg border border-border text-sm outline-none bg-input-background"
                >
                  {[5, 10, 20, 50].map((n) => (
                    <option key={n} value={n}>{n}</option>
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
                    style={page === 1 ? { background: "#2E7D32", borderColor: "#2E7D32" } : {}}
                  >
                    1
                  </button>
                  {page > 2 && <span className="px-1 text-muted-foreground text-sm">…</span>}
                </>
              )}
              {[page - 1, page, page + 1].filter((p) => p > 1 && p < totalPages).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${p === page ? "text-white" : "text-muted-foreground hover:bg-muted border-border"}`}
                  style={p === page ? { background: "#2E7D32", borderColor: "#2E7D32" } : {}}
                >
                  {p}
                </button>
              ))}
              {page < totalPages && (
                <>
                  {page < totalPages - 1 && <span className="px-1 text-muted-foreground text-sm">…</span>}
                  <button
                    onClick={() => setPage(totalPages)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${page === totalPages ? "text-white" : "text-muted-foreground hover:bg-muted border-border"}`}
                    style={page === totalPages ? { background: "#2E7D32", borderColor: "#2E7D32" } : {}}
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
        </div>
      </div>

      {/* Modal Add User */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="bg-card rounded-2xl p-6 max-w-md w-full"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground">
                {isAdmin ? "Add New User" : "Mời nhân viên mới (Invite Staff)"}
              </h3>
              <button
                onClick={() => setShowAdd(false)}
                className="p-1.5 rounded-lg hover:bg-muted"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none bg-input-background"
                  placeholder="Nguyễn Văn X"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none bg-input-background"
                  placeholder="email@org.vn"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Mật khẩu khởi tạo <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="flex-1 px-3 py-2.5 rounded-xl border border-border text-sm outline-none bg-input-background"
                    placeholder="Tối thiểu 6 ký tự"
                  />
                  <button
                    type="button"
                    onClick={handleAutoGeneratePassword}
                    className="px-3 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted flex items-center gap-1.5"
                    title="Tự động tạo mật khẩu"
                  >
                    <Sparkles className="w-4 h-4" />
                    Tạo
                  </button>
                </div>
              </div>

              {/* ADMIN: Organization + Role */}
              {isAdmin ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Tổ chức (Organization) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.organizationId ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, organizationId: e.target.value || undefined })
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none bg-input-background"
                    >
                      <option value="">-- Chọn tổ chức --</option>
                      {organizations.map((org) => (
                        <option key={org.organizationId} value={String(org.organizationId)}>
                          {org.name} ({org.type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Vai trò (Role) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.role}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          role: e.target.value as CreateUserRequest["role"],
                        })
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none bg-input-background"
                    >
                      <option value="MANAGER">MANAGER</option>
                      <option value="STAFF">STAFF</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  {/* MANAGER: Org read-only + Role fixed */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Tổ chức (Organization)
                    </label>
                    <div className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-muted-foreground bg-muted">
                      {currentUser?.organizationName || "—"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Vai trò (Role)
                    </label>
                    <div className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-muted-foreground bg-muted">
                      STAFF
                    </div>
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90"
                  style={{ background: "#2E7D32" }}
                >

                  {creating ? "Saving..." : isAdmin ? "Add User" : "Invite Staff"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit User */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="bg-card rounded-2xl p-6 max-w-md w-full"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground">Edit User</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg hover:bg-muted"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Full Name
                </label>
                <input
                  value={selectedUser.fullName}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      fullName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none bg-input-background"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Role
                  </label>
                  {!isAdmin || selectedUser.role.toUpperCase() === "ADMIN" ? (
                    <div
                      className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-muted text-muted-foreground cursor-not-allowed"
                      title={!isAdmin ? (lang === "vi" ? "Chỉ Admin mới có quyền thay đổi vai trò" : "Only Admin can change roles") : (lang === "vi" ? "Không thể thay đổi vai trò Admin" : "Cannot change Admin role")}
                    >
                      {selectedUser.role.toUpperCase()}
                      <span className="ml-2 text-xs opacity-60">🔒</span>
                    </div>
                  ) : (
                    <select
                      value={selectedUser.role}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          role: e.target.value as UserRole,
                        })
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none bg-input-background"
                    >
                      {["MANAGER", "STAFF"].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Status
                  </label>
                  <select
                    value={selectedUser.status}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        status: e.target.value as UserItem["status"],
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none bg-input-background"
                  >
            {(["Active", "Inactive"] as const).map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Organization
                </label>
                <input
                  value={selectedUser.organization}
                  onChange={(e) => setSelectedUser({ ...selectedUser, organization: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none bg-input-background"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                  <button
                  onClick={async () => {
                    try {
                      await updateUser.mutateAsync({
                        id: selectedUser.id,
                        data: {
                          fullName: selectedUser.fullName,
                          role: selectedUser.role,
                          status: selectedUser.status,
                          phone: selectedUser.phone,
                          organization: selectedUser.organization,
                        },
                      });
                      showAlert("success", lang === "vi" ? `Cập nhật "${selectedUser.fullName}" thành công` : `User "${selectedUser.fullName}" updated successfully`);
                      setSelectedUser(null);
                    } catch (e: any) {
                      showAlert("error", getApiErrorMessage(e));
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90"
                  style={{ background: "#2E7D32" }}
                >
                  {updateUser.status === 'pending' ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
