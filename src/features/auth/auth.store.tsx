import React, { createContext, useContext, useState, useCallback } from "react";
import { authApi } from "./auth.api";
import { setToken, removeToken } from "../../lib/api";
import type { User, LoginRequest } from "./auth.types";
import type { OrganizationType } from "./permissions";
import { adaptApiRoleToCanonical, inferOrganizationTypeFromApiRole } from "../../types/mapping";
import { canAccessRoute, canCreateEvent } from "./permissions";

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  canAccessRoute: typeof canAccessRoute;
  canCreateEvent: typeof canCreateEvent;
}

const AuthContext = createContext<AuthContextType | null>(null);

function normalizeUser(legacyUser: any): User {
  const canonicalRole = adaptApiRoleToCanonical(legacyUser?.role || "STAFF");

  let orgType: OrganizationType | undefined;
  orgType = inferOrganizationTypeFromApiRole(
    legacyUser?.role || "",
    typeof window !== "undefined" ? localStorage.getItem("agritrace_token") : null,
    legacyUser?.organizationType
  );

  if (!orgType) {
    try {
      const profile = authApi.getProfile();
      const profileData = profile as any;
      orgType = inferOrganizationTypeFromApiRole(
        legacyUser?.role || "",
        null,
        profileData?.organizationType
      );
    } catch {
      // Ignore profile fetch errors
    }
  }

  return {
    id: String(legacyUser?.id ?? ""),
    name: legacyUser?.name ?? "",
    email: legacyUser?.email ?? "",
    phone: legacyUser?.phone ?? "",
    role: canonicalRole,
    organizationType: orgType,
    organizationName: legacyUser?.organizationName ?? legacyUser?.organization ?? "",
    avatar: legacyUser?.avatar ?? "",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem("agritrace_user");
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      return normalizeUser(parsed);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const loginRequest: LoginRequest = { email, password };
      const res = await authApi.login(loginRequest);
      const normalized = normalizeUser(res.user);
      setUser(normalized);
      setToken(res.accessToken);
      sessionStorage.setItem("agritrace_user", JSON.stringify(normalized));
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    setUser(null);
    removeToken();
    sessionStorage.removeItem("agritrace_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout, loading, canAccessRoute, canCreateEvent }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
