import React, { createContext, useContext, useState, useCallback } from "react";
import { authApi } from "./auth.api";
import { setToken, removeToken, setRefreshToken, removeRefreshToken } from "../../lib/api";
import { queryClient } from "../../app/query-client";
import type { User, LoginRequest } from "./auth.types";
import type { OrganizationType } from "./permissions";
import { adaptApiRoleToCanonical, inferOrganizationTypeFromApiRole } from "../../types/mapping";
import { canAccessRoute, canCreateEvent } from "./permissions";

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
  loading: boolean;
  mustChangePassword: boolean;
  clearMustChangePassword: () => void;
  canAccessRoute: typeof canAccessRoute;
  canCreateEvent: typeof canCreateEvent;
}

const AuthContext = createContext<AuthContextType | null>(null);

function normalizeUser(legacyUser: any): User {
  const canonicalRole = adaptApiRoleToCanonical(legacyUser?.role || "STAFF");

  let orgType: OrganizationType | undefined = legacyUser?.organizationType;
  if (!orgType) {
    orgType = inferOrganizationTypeFromApiRole(
      legacyUser?.role || "",
      typeof window !== "undefined" ? localStorage.getItem("agritrace_token") : null,
      legacyUser?.organizationType
    );
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
  const [mustChangePassword, setMustChangePassword] = useState(() => {
    return sessionStorage.getItem("agritrace_must_change_password") === "true";
  });

  const updateUser = useCallback((partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...partial };
      sessionStorage.setItem("agritrace_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const loginRequest: LoginRequest = { email, password };
      const res = await authApi.login(loginRequest);
      const normalized = normalizeUser(res.user);
      normalized.mustChangePassword = res.mustChangePassword;
      setUser(normalized);
      setToken(res.accessToken);
      if (res.refreshToken) setRefreshToken(res.refreshToken);
      sessionStorage.setItem("agritrace_user", JSON.stringify(normalized));
      if (res.mustChangePassword) {
        setMustChangePassword(true);
        sessionStorage.setItem("agritrace_must_change_password", "true");
      }
      return res.mustChangePassword ?? false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: any) => {
    setLoading(true);
    try {
      await authApi.register(data);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMustChangePassword = useCallback(() => {
    setMustChangePassword(false);
    sessionStorage.removeItem("agritrace_must_change_password");
  }, []);

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    setUser(null);
    removeToken();
    removeRefreshToken();
    sessionStorage.removeItem("agritrace_user");
    sessionStorage.removeItem("agritrace_must_change_password");
    queryClient.clear();
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isLoggedIn: !!user, login, register, logout, updateUser, loading,
      mustChangePassword, clearMustChangePassword,
      canAccessRoute, canCreateEvent
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
