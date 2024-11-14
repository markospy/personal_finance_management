/* eslint-disable react-refresh/only-export-components */
import { QueryClient } from '@tanstack/react-query';
import { useForm, FieldValues } from "react-hook-form";
import { useSubmit, redirect, ActionFunctionArgs } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { zodUserIn } from "../schemas/user";
import { createUser } from "../api/user";

export const action = (queryClient: QueryClient) => async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData()
    const newUser = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password')
    };

    const user = await createUser(newUser);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    !!user && queryClient.setQueryData(['me'], {...user, password: formData.get('password')})

    return redirect('/login')
  }


export function CreateUserForm() {

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(zodUserIn),
  })
  const submit = useSubmit();

  const onSubmit = (data: FieldValues) => submit(data, { method: "post", action: "/register" })

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create User</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input {...register("name")} className="w-full p-2 border border-gray-300 rounded mt-1" placeholder="Enter your name"/>
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input {...register("email")} className="w-full p-2 border border-gray-300 rounded mt-1" placeholder="Enter your email"/>
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input {...register("password")} type="password" className="w-full p-2 border border-gray-300 rounded mt-1" placeholder="Enter your password"/>
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        </div>
        <input type="submit" className="w-full bg-blue-600 text-white p-2 rounded mt-4" />
      </form>
    </div>
  );
}