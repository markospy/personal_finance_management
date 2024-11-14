import { Outlet, NavLink } from "react-router-dom";

export function Home() {

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow-md w-full">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold md:text-2xl">Personal Finance Management</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <NavLink to={'login'}>Login</NavLink>
              </li>
              <li>
                <NavLink to={'register'}>Register</NavLink>
              </li>
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
