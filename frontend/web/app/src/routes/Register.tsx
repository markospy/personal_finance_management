import { useForm } from "react-hook-form";
import { useNavigate, Navigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { zodUserIn } from "../schemas/user";
import { createUser } from "../api/user";
import { useAuth } from "../context/AuthProvider";
import { getToken } from '../api/auth';


export function CreateUserForm() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const { register, formState: { errors } } = useForm({
    resolver: zodResolver(zodUserIn),
  })

  const registerAction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget); // Obtiene los datos del formulario
      const newUser = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password')  as string
      };

      const user = await createUser(newUser);
      const responseToken = await getToken(user.name, newUser.password);
      login(responseToken.access_token)
      navigate('/dashboard');
    } catch (error) {
      const typedError = error as Error; // Casting a Error
      console.error('Error al intentar registrarse:', typedError);
    }
  };

  // Si ya está autenticado, redirige
  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace={true} />;
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create User</h2>
      <form onSubmit={registerAction}>
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input {...register("name")} className="w-full p-2 border border-gray-300 rounded mt-1" placeholder="Enter your name"/>
          {errors.name && typeof errors.name.message === 'string' && <p className="text-red-500">{errors.name.message}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input {...register("email")} className="w-full p-2 border border-gray-300 rounded mt-
          1" placeholder="Enter your email"/>
          {errors.email && typeof errors.email.message === 'string' && <p className="text-red-500">{errors.email.message}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input {...register("password")} type="password" className="w-full p-2 border border-gray-300 rounded mt-1" placeholder="Enter your password"/>
          {errors.password && typeof errors.password.message === 'string' && <p className="text-red-500">{errors.password.message}</p>}
        </div>
        <input type="submit" className="w-full bg-blue-600 text-white p-2 rounded mt-4" />
      </form>
    </div>
  );
}