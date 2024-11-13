import { StrictMode } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import ErrorPage from "./error-page";
import { Home } from './routes/home'
import { LoginForm, loader as loaderUser } from './routes/login'
import { CreateUserForm, action as actionRegister } from './routes/register-user'


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
          loader: loaderUser(queryClient)
        },
        {
          path: "/register",
          element: <CreateUserForm />,
          action: actionRegister(queryClient),
        }
      ]
    }]
  },
]);


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
