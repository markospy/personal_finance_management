import { useForm } from "react-hook-form";
import { useNavigate, Navigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { zodUserIn, UserIn } from "../schemas/user";
import { createUser } from "../api/user";
import { useAuth } from "../context/AuthProvider";
import { getToken } from '../api/auth';
import { useState } from "react";
import { AlertDestructive } from "@/components/custom/Alert";
import { isTokenOut, isUserOut } from "@/utils/guards";



export function CreateUserForm() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(zodUserIn),
  })
  const [ correctUser, setCorrectUser ] = useState<boolean|null>(null)

  function handleChange() {
    setCorrectUser(null)
  }

  const registerAction = async (data: UserIn) => {
    const newUser  = {
      name: data.name,
      email: data.email,
      password: data.password
    };

    const user = await createUser (newUser );
    if(isUserOut(user)) {
      const responseToken = await getToken(user.name, newUser.password);
      if(isTokenOut(responseToken)){
        navigate('/dashboard');
      }
    } else {
      setCorrectUser(false)
    }
  };

  // Si ya está autenticado, redirige
  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace={true} />;
  }

  return (
    <div>
      <div className="max-w-md mx-auto bg-white p-6 mb-2 rounded-lg shadow-md animate-slide-up-fade">
        <h2 className="text-2xl font-bold mb-4">Create User</h2>
        <form onSubmit={handleSubmit(registerAction)}>
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input {...register("name")}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              placeholder="Enter your name"
              onChange={handleChange}/>
            {errors.name && typeof errors.name.message === 'string' && <p className="text-red-400 text-xs">{errors.name.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input {...register("email")}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              placeholder="Enter your email"
              onChange={handleChange}/>
            {errors.email && typeof errors.email.message === 'string' && <p className="text-red-400 text-xs">{errors.email.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input {...register("password")}
              type="password"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              placeholder="Enter your password"
              onChange={handleChange}/>
            {errors.password && typeof errors.password.message === 'string' && <p className="text-red-400 text-xs">{errors.password.message}</p>}
          </div>
          <input type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded mt-4 border-b-2 border-blue-950  hover:border-blue-700" />
        </form>
      </div>
      {correctUser===false && <AlertDestructive msg="User already exists" className="max-w-md mx-auto bg-red-50"/>}
    </div>
  );
}