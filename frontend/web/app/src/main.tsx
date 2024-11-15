import { StrictMode } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import ErrorPage from "./error-page";
import { Home } from './routes/Layout'
import { LoginForm, loader as loaderUser, action as actionLogin } from './routes/Login'
import { CreateUserForm, action as actionRegister } from './routes/Register'
import { ProtectedRoutes } from './components/ProtectedRoutes'
import { AuthProvider } from './context/AuthProvider'
import { action as logoutUser } from './routes/Layout'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />,
    children:[{
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/login",
          element: <LoginForm />,
          loader: loaderUser(queryClient),
          action: actionLogin,
        },
        {
          path: "/register",
          element: <CreateUserForm />,
          action: actionRegister(queryClient),
        },
        {
          path: "/logout",
          action: logoutUser,
        },
        {
          element: <ProtectedRoutes />, // Aquí agregas tu componente de rutas protegidas
          path: "/protected",
          children: [
            {index: true, element: <h1>USUARIO LOGUEADO</h1>},
          ],
        },
      ]
    }]
  },
]);


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <>
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={false} />
        </>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
