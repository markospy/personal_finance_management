/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, PropsWithChildren, useContext, useEffect } from 'react';
import { getUser  } from "../api/user";
import { UserOut } from '@/schemas/user';

// Crear el contexto
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AuthContext = createContext<any>(null);

// Proveedor del contexto
export const AuthProvider =  ({ children }: PropsWithChildren) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser ] = useState<UserOut | null>(null);
  const [loading, setLoading] = useState(true);

  const existingUser  = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await getUser(token);
          return userData
        } catch (error) {
          console.log('Error al obtener el usuario', (error as Error).message)
          return null
        }
      }
      return null;
  };

  useEffect(() => {
      const checkExistingUser  = async () => {
          const userData = await existingUser ();
          setIsAuthenticated(!!userData);
          setUser(userData);
          setLoading(false);
      };
      checkExistingUser ();
  }, []);

  const login = async (token: string) => {
      localStorage.setItem('token', token);
       const userData =  await existingUser()
      setIsAuthenticated(true);
      setUser(userData);
      setLoading(false);
  };

  const logout = () => {
      localStorage.removeItem('token');
      setUser (null);
      setLoading(false);
      setIsAuthenticated(false);
  };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, loading, user }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook para usar el contexto
export const useAuth = () => {
    return useContext(AuthContext);
};