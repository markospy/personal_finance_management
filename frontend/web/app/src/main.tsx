import { StrictMode } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import ErrorPage from "./error-page";
import { Layout } from './routes/Layout'
import { LoginForm } from './routes/LogIn'
import { DashboardCenter } from './routes/Dashboard'
import { CreateUserForm } from './routes/Register'
import { ReportMain, loader as loaderSumary } from './routes/Report'
import { action as newAccount} from './components/custom/AccountModal'

import { ProtectedRoutes } from './utils/ProtectedRoutes'
import { AuthProvider } from './context/AuthProvider'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout queryClient={queryClient} />,
    errorElement: <ErrorPage />,
    children:[{
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/login",
          element: <LoginForm />,
        },
        {
          path: "/register",
          element: <CreateUserForm />,
        },
        {
          element: <ProtectedRoutes />,
          children: [
            {
              element: <DashboardCenter />,
              children: [
                {
                  path: "/dashboard",
                  element: <ReportMain queryClient={queryClient}/>,
                  loader: loaderSumary(queryClient),
                },
                {
                  path: "/account/new-account",
                  action: newAccount(queryClient),
                },
              ]
            },
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
