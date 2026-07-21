import type { AxiosRequestConfig } from "axios";
import { users } from "../data";
import type { User, UserRole } from "../../features/auth/auth.types";
import type { MockResponse } from "../utils";
import { ok } from "../utils";

type MockHandler = (config: AxiosRequestConfig) => MockResponse<unknown>;

function toUser(item: typeof users[0], roleOverride?: UserRole): User {
  return {
    id: item.id,
    name: item.fullName,
    username: item.username,
    email: item.email,
    phone: item.phone,
    role: (roleOverride ?? item.role) as UserRole,
    organization: item.organization,
    avatar: item.avatar,
  };
}

export const authHandlers: Record<string, MockHandler> = {
  "POST /auth/login": (config) => {
    const body = config.data as { username?: string; role?: string } | undefined;
    const role = body?.role as UserRole | undefined;
    return ok({ user: toUser(users[0], role), accessToken: "mock-access-token", refreshToken: "mock-refresh-token" });
  },

  "POST /auth/logout": () => ok(null),

  "GET /auth/profile": () => ok(toUser(users[0])),

  "POST /auth/refresh-token": () => ok({ accessToken: "mock-refreshed-token" }),
};
