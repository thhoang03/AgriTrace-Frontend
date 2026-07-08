import React, { createContext, useContext, useState } from "react";

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
  login: (username: string, password: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const mockUser: User = {
  id: "USR-001",
  name: "Nguyễn Văn An",
  username: "admin",
  email: "nguyenvanan@agritrace.gov.vn",
  phone: "+84 901 234 567",
  role: "Administrator",
  organization: "Ministry of Agriculture and Rural Development",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem("agritrace_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (_username: string, _password: string, role: string) => {
    const u = { ...mockUser, role: role as User["role"] };
    setUser(u);
    sessionStorage.setItem("agritrace_user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("agritrace_user");
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
