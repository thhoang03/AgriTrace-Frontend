import { describe, expect, it } from "vitest";
import { filterUsers, getRoleOptions, getStatusSummary } from "./users.utils";
import type { UserItem } from "./users.types";

const mockUsers: UserItem[] = [
  {
    id: "1",
    avatar: "",
    fullName: "Nguyễn Văn A",
    organization: "Green Farm",
    role: "ADMIN",
    status: "Active",
    phone: "0900000001",
    email: "admin@agri.vn",
  },
  {
    id: "2",
    avatar: "",
    fullName: "Trần Thị B",
    organization: "Green Farm",
    role: "STAFF",
    status: "Pending",
    phone: "0900000002",
    email: "farmer@agri.vn",
  },
];

describe("users utils", () => {
  it("filters by search, role and status", () => {
    const result = filterUsers(mockUsers, { search: "tran", role: "STAFF", status: "Pending" });
    expect(result).toHaveLength(1);
    expect(result[0].email).toBe("farmer@agri.vn");
  });

  it("collects role options and status summary", () => {
    expect(getRoleOptions(mockUsers)).toEqual(["ADMIN", "STAFF"]);
    expect(getStatusSummary(mockUsers)).toEqual({ Active: 1, Inactive: 0, Pending: 1 });
  });
});
