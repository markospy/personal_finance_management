import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getUser } from "../api/user";


export const ProtectedRoutes = () => {
    const [token, setToken] = useState<string|null>(window.localStorage.getItem('jwt'))

    if(token) {
      const usuario =getUser(token)
      if (!usuario) {
        return <Navigate to="/login" />;
      }
    } else {
      return <Navigate to="/login" />;
    }

    return <Outlet />;
  };