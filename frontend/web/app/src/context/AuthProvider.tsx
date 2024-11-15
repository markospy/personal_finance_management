import { createContext, useState, useEffect, PropsWithChildren } from 'react';
import { getUser  } from "../api/user";

export const AuthContext = createContext(false);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [tokenExpired, setTokenExpired] = useState<boolean>(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = window.localStorage.getItem('jwt');
      if (token) {
        const usuario = await getUser(token);
        setTokenExpired(!usuario); // true si el token ha expirado
      } else {
        setTokenExpired(true); // No hay token
      }
    };

    checkToken();
  }, []);

  return (
    <AuthContext.Provider value={tokenExpired}>
      { children }
    </AuthContext.Provider>
  );
};