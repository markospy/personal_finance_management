import { Outlet, NavLink, useNavigation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { QueryClient } from "@tanstack/react-query";
import GlobalSpinner from "@/components/custom/GlobalSpinner";
import { LogIn, LogOut, UserRoundPlus } from "lucide-react";
import Tippy from "@tippyjs/react";

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
            <ul className="flex space-x-16">
              { isAuthenticated ? (
                  <div className="flex gap-6">
                    <span className="font-semibold">{user.name}</span>
                    <form onSubmit={logoutAction}>
                      <button type="submit">
                        <Tippy content="Logout" placement="right" className="text-white font-medium text-xs">
                          <LogOut className="focus:outline-none"/>
                        </Tippy>
                      </button>
                    </form>
                  </div>
                ) : (
                  <>
                    <li>
                      <NavLink to={'/login'}>
                        <Tippy content="Login" placement="left" className="text-white font-medium text-xs">
                          <LogIn className="focus:outline-none"/>
                        </Tippy>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to={'/register'}>
                        <Tippy content="Register" placement="left" className="text-white font-medium text-xs">
                          <UserRoundPlus className="focus:outline-none"/>
                        </Tippy>
                      </NavLink>
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
