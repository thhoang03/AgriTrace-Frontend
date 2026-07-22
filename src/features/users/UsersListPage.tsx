import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Key,
  Shield,
  X,
  Filter,
  Loader2,
} from "lucide-react";
import {
  useCreateUser,
  useDeleteUser,
  useResetPassword,
  useUpdateUser,
  useUsers,
} from "./users.queries";
import {
  filterUsers,
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

const BANNER_IMG =
  "https://images.unsplash.com/photo-1529304344766-6b537de190f8?w=1400&q=80";

const roleColors: Record<string, { bg: string; color: string }> = {
  Administrator: { bg: "#E8F5E9", color: "#1B5E20" },
  Farmer: { bg: "#FFF3E0", color: "#E65100" },
  Processor: { bg: "#E3F2FD", color: "#1565C0" },
  Distributor: { bg: "#F3E5F5", color: "#6A1B9A" },
  Retailer: { bg: "#E0F2F1", color: "#004D40" },
  Inspector: { bg: "#FFF9C4", color: "#F57F17" },
};

const statusConfig: Record<
  string,
  { bg: string; color: string; dot: string }
> = {
  Active: { bg: "#E8F5E9", color: "#2E7D32", dot: "#4CAF50" },
  Inactive: { bg: "#F5F5F5", color: "#757575", dot: "#9E9E9E" },
  Pending: { bg: "#FFF9C4", color: "#F57F17", dot: "#FFC107" },
};

const emptyUserForm: CreateUserRequest = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  phone: "",
  role: "Farmer",
  organization: "",
};

export function UsersListPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "All">("All");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "All">("All");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<CreateUserRequest>(emptyUserForm);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const { data, isLoading, isError } = useUsers({
    search,
    role: roleFilter === "All" ? undefined : roleFilter,
    status: statusFilter === "All" ? undefined : statusFilter,
  });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser(selectedUser?.id ?? "");
  const deleteUser = useDeleteUser();
  const resetPassword = useResetPassword();

  const users = useMemo(() => data?.data?.items ?? [], [data]);
  const filtered = useMemo(
    () => filterUsers(users, { search, role: roleFilter, status: statusFilter }),
    [users, search, roleFilter, statusFilter]
  );
  const roles = ["All", ...getRoleOptions(users)];
  const statuses = getStatusOptions();
  const summary = useMemo(() => getStatusSummary(users), [users]);

  const handleCreateUser = async () => {
    if (!form.fullName || !form.username || !form.email || !form.password)
      return;
    await createUser.mutateAsync(form);
    setForm(emptyUserForm);
    setShowAdd(false);
  };

  const handleResetPassword = async (user: UserItem) => {
    const password = window.prompt(
      `Set a new password for ${user.fullName}`
    );
    if (!password) return;
    await resetPassword.mutateAsync({ id: user.id, newPassword: password });
  };

  const handleDelete = async (user: UserItem) => {
    if (!window.confirm(`Delete ${user.fullName}?`)) return;
    await deleteUser.mutateAsync(user.id);
  };

  const handleStatusToggle = async (user: UserItem) => {
    const nextStatus = user.status === "Active" ? "Inactive" : "Active";
    await updateUser.mutateAsync({ status: nextStatus });
  };

  return (
    <div className="pb-8">
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
              User Management
            </h1>
            <p className="text-green-100 text-sm mt-1">
              Manage platform users, roles, and permissions
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
                <div className="text-green-200 text-xs">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-10">
        {/* Filter Bar */}
        <div
          className="bg-white rounded-2xl p-4 mb-5"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-48 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
                style={{ background: "#F8FAF8" }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value as UserRole | "All")
                }
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white"
              >
                {roles.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as UserStatus | "All")
                }
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white"
              >
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ background: "#2E7D32" }}
            >
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>
        </div>

        {/* Table */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <span className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium text-gray-800">
                {filtered.length}
              </span>{" "}
              users
            </span>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-gray-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                users...
              </div>
            ) : isError ? (
              <div className="py-10 text-center text-red-500">
                Unable to load users right now.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#F8FAF8" }}>
                    {[
                      "User",
                      "Organization",
                      "Role",
                      "Status",
                      "Contact",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((user) => {
                    const roleCfg = roleColors[user.role] || {
                      bg: "#F5F5F5",
                      color: "#666",
                    };
                    const staCfg = statusConfig[user.status];
                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-green-50/20 transition-colors group"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar}
                              alt={user.fullName}
                              className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100"
                            />
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {user.fullName}
                              </div>
                              <div className="text-xs text-gray-400">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm text-gray-700 max-w-40 truncate">
                            {user.organization}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{
                              background: roleCfg.bg,
                              color: roleCfg.color,
                            }}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleStatusToggle(user)}
                            className="flex items-center gap-2"
                            title="Toggle account status"
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: staCfg.dot }}
                            />
                            <span
                              className="text-sm"
                              style={{ color: staCfg.color }}
                            >
                              {user.status}
                            </span>
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm text-gray-700">
                            {user.phone}
                          </div>
                          <div className="text-xs text-gray-400">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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
                              className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-500 transition-colors"
                              title="Assign Role"
                            >
                              <Shield className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      </div>

      {/* Modal Add User */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">Add New User</h3>
              <button
                onClick={() => setShowAdd(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Full Name
                  </label>
                  <input
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
                    style={{ background: "#F8FAF8" }}
                    placeholder="Nguyễn Văn X"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Username
                  </label>
                  <input
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
                    style={{ background: "#F8FAF8" }}
                    placeholder="user_name"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
                  style={{ background: "#F8FAF8" }}
                  placeholder="email@org.vn"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Password
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
                  style={{ background: "#F8FAF8" }}
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        role: e.target.value as CreateUserRequest["role"],
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white"
                  >
                    {[
                      "Farmer",
                      "Processor",
                      "Distributor",
                      "Retailer",
                      "Inspector",
                      "Administrator",
                    ].map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Phone
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
                    style={{ background: "#F8FAF8" }}
                    placeholder="+84 900 000 000"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Organization
                </label>
                <input
                  value={form.organization}
                  onChange={(e) =>
                    setForm({ ...form, organization: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
                  style={{ background: "#F8FAF8" }}
                  placeholder="Organization name"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90"
                  style={{ background: "#2E7D32" }}
                >
                  {createUser.isPending ? "Saving..." : "Add User"}
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
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">Edit User</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
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
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
                  style={{ background: "#F8FAF8" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Role
                  </label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        role: e.target.value as UserRole,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white"
                  >
                    {[
                      "Farmer",
                      "Processor",
                      "Distributor",
                      "Retailer",
                      "Inspector",
                      "Administrator",
                    ].map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
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
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white"
                  >
                    {(["Active", "Inactive", "Pending"] as const).map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await updateUser.mutateAsync({
                      fullName: selectedUser.fullName,
                      role: selectedUser.role,
                      status: selectedUser.status,
                    });
                    setSelectedUser(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90"
                  style={{ background: "#2E7D32" }}
                >
                  {updateUser.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}