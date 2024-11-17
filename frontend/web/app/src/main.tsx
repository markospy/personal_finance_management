import { StrictMode } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import ErrorPage from "./error-page";
import { Layout, loader as userLayout } from './routes/Layout'
import { LoginForm, loader as loaderUser } from './routes/Login'
import { CreateUserForm } from './routes/Register'
import { ProtectedRoutes } from './utils/ProtectedRoutes'
import { AuthProvider } from './context/AuthProvider'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    loader: userLayout,
    errorElement: <ErrorPage />,
    children:[{
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/login",
          element: <LoginForm />,
          loader: loaderUser(queryClient),
        },
        {
          path: "/register",
          element: <CreateUserForm />,
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
