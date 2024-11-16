/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, PropsWithChildren, useContext, useEffect } from 'react';
import { getUser  } from "../api/user";
import { UserOut } from '../schemas/user';

// Crear el contexto
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AuthContext = createContext<any>(null);

// Proveedor del contexto
export const AuthProvider =  ({ children }: PropsWithChildren) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser ] = useState<UserOut | null>(null);

  const existingUser  = async () => {
      const token = localStorage.getItem('token');
      if (token) {
          const userData = await getUser (token);
          return userData;
      }
      return null;
  };

  useEffect(() => {
      const checkExistingUser  = async () => {
          const userData = await existingUser ();
          setUser(userData);
          setIsAuthenticated(!!userData);
      };
      checkExistingUser ();
  }, []);

  const login = async (token: string) => {
      localStorage.setItem('token', token);
      const userData = await getUser (token);
      setIsAuthenticated(true);
      setUser(userData);
  };

  const logout = () => {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
  };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook para usar el contexto
export const useAuth = () => {
    return useContext(AuthContext);
};