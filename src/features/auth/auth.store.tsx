import React, { useState, useCallback } from "react";
import { authApi } from "./auth.api";
import { setToken, removeToken } from "../../lib/api";
import type { User, LoginRequest } from "../../types/mapping";
import { adaptLoginRequestToNew } from "../../types/mapping";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem("agritrace_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (username: string, password: string, role?: string) => {
    setLoading(true);
    try {
      // Convert legacy login params to new LoginRequest format
      const loginRequest: LoginRequest = adaptLoginRequestToNew({ username, password, role });
      const res = await authApi.login(loginRequest);
      // authApi.login now returns adapted response directly: { user, accessToken, refreshToken }
      setUser(res.user);
      setToken(res.accessToken);
      sessionStorage.setItem("agritrace_user", JSON.stringify(res.user));
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
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}


