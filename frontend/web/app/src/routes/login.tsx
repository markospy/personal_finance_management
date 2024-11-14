import { Form, useLoaderData, ActionFunctionArgs } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { getToken } from '../api/token';

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

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    // Espera a que se resuelva la promesa de formData
    const formData = await request.formData();

    // Obtén los valores de username y password
    const username = formData.get('username');
    const password = formData.get('password');
    // Llama a la función getToken con los valores obtenidos

    await getToken(username, password);

    // Aquí puedes manejar la respuesta o el redireccionamiento
    return { success: true }; // O cualquier otra respuesta que necesites
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error al obtener el token:', error);
    return { success: false, error: error.message }; // Manejo de errores
  }
};

export function LoginForm() {
  const user = useLoaderData() as userCache | null;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <Form method='post' action='/login'>
        <div className="mb-4">
          <label className="block text-gray-700">Username</label>
          <input name='username' className="w-full p-2 border border-gray-300 rounded mt-1" value={user?.name && user?.name} placeholder='Enter your username'/>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input name='password' type='password' className="w-full p-2 border border-gray-300 rounded mt-1" value={user?.password && user?.password} placeholder='Enter your password'/>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded mt-4">
          Login
        </button>
      </Form>
    </div>
  );
}