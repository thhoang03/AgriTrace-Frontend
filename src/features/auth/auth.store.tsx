import React, { createContext, useContext, useState } from "react";
import { authService, LoginResponse } from "../services/authService";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: "Administrator" | "Farmer" | "Processor" | "Distributor" | "Retailer" | "Inspector";
  organization: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapApiUser(data: LoginResponse["user"]): User {
  return {
    id: String(data.userId),
    name: data.fullName,
    username: data.email,
    email: data.email,
    phone: "",
    role: data.role as User["role"],
    organization: data.organizationName,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName)}&background=2E7D32&color=fff`,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem("agritrace_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    sessionStorage.setItem("agritrace_auth", JSON.stringify({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    }));
    const u = mapApiUser(data.user);
    setUser(u);
    sessionStorage.setItem("agritrace_user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("agritrace_user");
    sessionStorage.removeItem("agritrace_auth");
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
