import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export function Layout() {
  const { isAuthenticated, logout, user } = useAuth();

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
                    <span className="font-semibold">{user.name}</span>
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
