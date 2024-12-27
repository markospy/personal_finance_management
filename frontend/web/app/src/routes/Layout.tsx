import { Outlet, NavLink, useNavigation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { QueryClient } from "@tanstack/react-query";
import GlobalSpinner from "@/components/custom/GlobalSpinner";
import { LogIn, LogOut, UserRoundPlus } from "lucide-react";
import Tippy from "@tippyjs/react";
import { Toaster } from "@/components/ui/toaster"

export function Layout({queryClient}:{queryClient: QueryClient}) {
  const { isAuthenticated, logout, user } = useAuth();
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  const logoutAction = async () => {
    queryClient.removeQueries()
    logout()
  }

  return (
    <div className="flex flex-col bg-blue-50 w-full min-h-screen">
      <header className="bg-blue-600 shadow-md p-4 w-full text-white">
        <div className="flex justify-between items-center mx-auto container">
          <h1 className="font-bold text-xl md:text-2xl">Personal Finance Management</h1>
          <nav>
            <ul className="flex space-x-16">
              { isAuthenticated ? (
                  <div className="flex gap-6">
                    <span className="font-semibold">{user.name}</span>
                    <form onSubmit={logoutAction}>
                      <button type="submit">
                        <Tippy content="Logout" placement="bottom" className="font-medium text-white text-xs">
                          <LogOut className="focus:outline-none"/>
                        </Tippy>
                      </button>
                    </form>
                  </div>
                ) : (
                  <>
                    <li>
                      <NavLink to={'/login'}>
                        <Tippy content="Login" placement="left" className="font-medium text-white text-xs">
                          <LogIn className="focus:outline-none"/>
                        </Tippy>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to={'/register'}>
                        <Tippy content="Register" placement="left" className="font-medium text-white text-xs">
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
      <main className="flex-grow content-center mx-auto p-4 container">
        {isNavigating && <GlobalSpinner />}
        <Outlet />
        <Toaster />
      </main>
    </div>
  );
}
