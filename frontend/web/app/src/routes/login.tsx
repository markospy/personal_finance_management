import { useLoaderData } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';

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
  const user = useLoaderData() as userCache | null;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form>
        <div className="mb-4">
          <label className="block text-gray-700">Username</label>
          <input className="w-full p-2 border border-gray-300 rounded mt-1" value={user?.name && user?.name} placeholder='Enter your username'/>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input type='password' className="w-full p-2 border border-gray-300 rounded mt-1" value={user?.password && user?.password} placeholder='Enter your password'/>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded mt-4">
          Login
        </button>
      </form>
    </div>
  );
}