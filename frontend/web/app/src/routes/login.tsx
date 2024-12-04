/* eslint-disable react-refresh/only-export-components */
import { Navigate, useNavigate } from 'react-router-dom';
import { getToken } from '../api/auth';
import { useAuth } from "../context/AuthProvider";
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { LockKeyholeOpen } from "lucide-react"

export type userCache = {
  id: number,
  name: string,
  email: string,
  password: string,
}


export function LoginForm() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<boolean>(false)

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
      navigate('/dashboard');
    } catch (error) {
      setError(true)
      const typedError = error as Error; // Casting a Error
      console.error('Error al intentar autenticarse:', typedError);
    }
  };

  // Si ya está autenticado, redirige
  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace={true} />;
  }

  const handleChange = () => {
    setError(false)
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md animate-slide-up-fade">
      <div className='flex justify-between'>
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && 
        <div className='text-red-500 font-normal'>
          <span>Nombre de usuario </span>
          <br />
          <span>o contraseña incorrecta.</span>
        </div>}
      </div>
      <form onSubmit={loginAction}>
        <div className="mb-4">
          <Label>Username</Label>
          <Input onChange={handleChange} name='username' placeholder='Enter your username' />
        </div>
        <div className="mb-4">
          <Label>Password</Label>
          <Input onChange={handleChange} name='password' type='password' placeholder='Enter your password' />
        </div>
        <Button variant="default" type="submit" className="w-full mt-4">
          <LockKeyholeOpen /> LOGIN
        </Button>
      </form>
    </div>
  );
}