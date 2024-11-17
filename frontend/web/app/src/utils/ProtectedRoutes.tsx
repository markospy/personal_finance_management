import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export const ProtectedRoutes = () => {
  const { isAuthenticated } = useAuth();
    console.log('Entrando al protecto de ruta')
    if(!isAuthenticated) {
      console.log('En el protecto de ruta: no logueado')
      return <Navigate to="/login" />;
    }
    console.log('En el protecto de ruta: logueado')
    return <Outlet />;
  };