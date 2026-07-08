import { Navigate, Outlet } from "react-router";
import { useAuth } from "./auth.store";

export function ProtectedRoute() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}
