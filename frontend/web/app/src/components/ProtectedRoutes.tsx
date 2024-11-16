import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export const ProtectedRoutes = () => {
  const { isAuthenticated } = useAuth();

    if(!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return <Outlet />;
  };