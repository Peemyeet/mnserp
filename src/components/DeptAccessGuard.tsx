import { Navigate, Outlet, useLocation } from "react-router-dom";
import { canAccessPath, defaultHomePath } from "../auth/deptAccess";
import { useAuth } from "../context/AuthContext";

/** บังคับให้เข้าได้เฉพาะเส้นทางที่สอดคล้องกับแผนกของผู้ใช้ */
export function DeptAccessGuard() {
  const { user } = useAuth();
  const location = useLocation();

  if (user != null && !canAccessPath(user, location.pathname)) {
    return (
      <Navigate to={defaultHomePath(user)} replace state={{ accessDenied: true }} />
    );
  }

  return <Outlet />;
}
