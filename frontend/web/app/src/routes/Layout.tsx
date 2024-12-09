import { Outlet, NavLink, useNavigation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { QueryClient } from "@tanstack/react-query";
import GlobalSpinner from "@/components/custom/GlobalSpinner";

export function Layout({queryClient}:{queryClient: QueryClient}) {
  const { isAuthenticated, logout, user } = useAuth();
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  const logoutAction = async () => {
    queryClient.removeQueries()
    logout()
  }

  return (
    <div className="min-h-screen w-full bg-blue-50 flex flex-col">
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
        {isNavigating && <GlobalSpinner />}
        <Outlet />
      </main>
    </div>
  );
}
