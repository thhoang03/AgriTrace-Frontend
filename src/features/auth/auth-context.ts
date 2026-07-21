import { createContext } from "react";
import type { User } from "../../types/mapping";

export interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);
