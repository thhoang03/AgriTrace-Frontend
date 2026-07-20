import type { AxiosRequestConfig } from "axios";
import { users } from "../data";
import type { UserItem } from "../../features/users/users.types";
import type { MockResponse } from "../utils";
import { ok } from "../utils";

type MockHandler = (config: AxiosRequestConfig) => MockResponse<unknown>;

function filterUsers(list: UserItem[], config: AxiosRequestConfig): UserItem[] {
  const { search, role, status } = config.params || {};
  let result = [...list];
  if (role) result = result.filter((u) => u.role === role);
  if (status && status !== "All") result = result.filter((u) => u.status === status);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q),
    );
  }
  return result;
}

export const userHandlers: Record<string, MockHandler> = {
  "GET /users": (config) => ok(filterUsers(users, config)),

  "GET /users/:id": (config) => {
    const id = config.url?.split("/").pop() ?? "";
    const user = users.find((u) => u.id === id);
    if (!user) return { data: null, message: "Not found", status: 404 };
    return ok(user);
  },

  "POST /users": (config) =>
    ok({ ...config.data, id: "USR-00" + (users.length + 1), status: "Active" } as UserItem),

  "PUT /users/:id": (config) => ok({ ...config.data, id: config.url?.split("/").pop() } as UserItem),

  "DELETE /users/:id": () => ok(null),

  "POST /users/:id/reset-password": () => ok(null),
};
