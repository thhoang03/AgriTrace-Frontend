import { Navigate, Outlet } from "react-router";
import { useAuth } from "./auth.store";
import type { UserRole } from "./permissions";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/app/profile" replace />;
  }
  return <Outlet />;
}
