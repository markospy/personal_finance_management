import { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";

export const ProtectedRoutes = () => {
  const isTokenExpired = useContext(AuthContext);

    if(isTokenExpired) {
      return <Navigate to="/login" />;
    }
    return <Outlet />;
  };