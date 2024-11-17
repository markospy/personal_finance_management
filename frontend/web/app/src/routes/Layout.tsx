/* eslint-disable react-refresh/only-export-components */
import { Outlet, NavLink, useLoaderData } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { getUser } from "../api/user";

export const loader = async () => {
  try {
    const token = window.localStorage.getItem('token') as string;
    const response = await getUser(token); // Llama a la función getUser  directamente
    return response.name || 'Unknown'; // Asegúrate de manejar el caso donde no hay nombre
  } catch {
    return 'Unknown';
  }
};

export function Layout() {
  const { isAuthenticated, logout } = useAuth();
  const user = useLoaderData() as string;

  const logoutAction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    logout()
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow-md w-full">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold md:text-2xl">Personal Finance Management</h1>
          <nav>
            <ul className="flex space-x-4">
              { isAuthenticated ? (
                  <div className="flex gap-6">
                    <span className="font-semibold">{user}</span>
                    <form onSubmit={logoutAction}>
                      <button type="submit">Logout</button>
                    </form>
                  </div>
                ) : (
                  <>
                    <li>
                      <NavLink to={'/login'}>Login</NavLink>
                    </li>
                    <li>
                      <NavLink to={'/register'}>Register</NavLink>
                    </li>
                  </>
                )
              }
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex-grow content-center container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
