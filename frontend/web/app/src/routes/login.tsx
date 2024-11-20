/* eslint-disable react-refresh/only-export-components */
import { Navigate, useNavigate } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { getToken } from '../api/auth';
import { useAuth } from "../context/AuthProvider";

export type userCache = {
  id: number,
  name: string,
  email: string,
  password: string,
}

export const loader = (queryClient: QueryClient) => () => {
    const data = queryClient.getQueryData(['me']);
    if(data) {
      return data
    }
    return null
};


export function LoginForm() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const loginAction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget);
      const username = formData.get('username') as string;
      const password = formData.get('password') as string;
      // Espera a que la promesa se resuelva
      const response = await getToken(username, password);

      // Realiza el login
      await login(response.access_token);

      // Ahora navega a la ruta protegida
      navigate('/protected');
    } catch (error) {
      const typedError = error as Error; // Casting a Error
      console.error('Error al intentar autenticarse:', typedError);
    }
  };

  // Si ya está autenticado, redirige
  if (isAuthenticated) {
    return <Navigate to='/protected' replace={true} />;
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={loginAction}>
        <div className="mb-4">
          <label className="block text-gray-700">Username</label>
          <input name='username' className="w-full p-2 border border-gray-300 rounded mt-1" placeholder='Enter your username'/>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input name='password' type='password' className="w-full p-2 border border-gray-300 rounded mt-1" placeholder='Enter your password'/>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded mt-4">
          Login
        </button>
      </form>
    </div>
  );
}