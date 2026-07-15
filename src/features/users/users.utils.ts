import type { UserFilters, UserItem, UserStatus } from "./users.types";

export function filterUsers(users: UserItem[], filters?: UserFilters) {
  const search = filters?.search?.trim().toLowerCase() ?? "";
  const role = filters?.role;
  const status = filters?.status;

  return users.filter((user) => {
    const matchesSearch =
      !search ||
      user.fullName.toLowerCase().includes(search) ||
      user.username.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search);

    const matchesRole = !role || role === "All" || user.role === role;
    const matchesStatus = !status || status === "All" || user.status === status;

    return matchesSearch && matchesRole && matchesStatus;
  });
}

export function getRoleOptions(users: UserItem[]) {
  return Array.from(new Set(users.map((user) => user.role))).sort();
}

export function getStatusOptions() {
  return ["All", "Active", "Inactive", "Pending"] as const;
}

export function getStatusSummary(users: UserItem[]) {
  return {
    Active: users.filter((user) => user.status === "Active").length,
    Inactive: users.filter((user) => user.status === "Inactive").length,
    Pending: users.filter((user) => user.status === "Pending").length,
  } satisfies Record<Exclude<UserStatus, "All">, number>;
}
