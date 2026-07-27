import { describe, expect, it } from "vitest";
import { filterUsers, getRoleOptions, getStatusSummary } from "./users.utils";
import type { UserItem } from "./users.types";

const mockUsers: UserItem[] = [
  {
    id: "1",
    avatar: "",
    username: "admin",
    fullName: "Nguyễn Văn A",
    organization: "Green Farm",
    role: "Administrator",
    status: "Active",
    phone: "0900000001",
    email: "admin@agri.vn",
  },
  {
    id: "2",
    avatar: "",
    username: "farmer",
    fullName: "Trần Thị B",
    organization: "Green Farm",
    role: "Farmer",
    status: "Pending",
    phone: "0900000002",
    email: "farmer@agri.vn",
  },
];

describe("users utils", () => {
  it("filters by search, role and status", () => {
    const result = filterUsers(mockUsers, { search: "tran", role: "Farmer", status: "Pending" });
    expect(result).toHaveLength(1);
    expect(result[0].username).toBe("farmer");
  });

  it("collects role options and status summary", () => {
    expect(getRoleOptions(mockUsers)).toEqual(["Administrator", "Farmer"]);
    expect(getStatusSummary(mockUsers)).toEqual({ Active: 1, Inactive: 0, Pending: 1 });
  });
});
