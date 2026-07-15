import React, { createContext, useContext, useState, useCallback } from "react";
import { authApi } from "../features/auth/auth.api";
import { setToken, removeToken } from "../lib/api";
import type { User, LoginRequest } from "../features/auth/auth.types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem("agritrace_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authApi.login(data);
    setToken(response.data.accessToken);
    setUser(response.data.user);
    sessionStorage.setItem("agritrace_user", JSON.stringify(response.data.user));
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    removeToken();
    sessionStorage.removeItem("agritrace_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
