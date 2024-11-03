import './App.css'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { useState } from 'react';
import { getUser } from './api/user'
import { userOut } from './schemas/user';


const queryClient = new QueryClient()

function App() {

  const [user, setUser] = useState<userOut|null>(null); // Estado para almacenar la información del usuario
  const [error, setError] = useState<string|null>(null); // Estado para manejar errores

  const handleGetUser  = () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJKb2UgRG9lIiwic2NvcGVzIjpbInVzZXIiXSwiZXhwIjoxNzMwNjcwMTE3fQ.oDMBjXX3J6MXy-Tt62CVJjefrl5g3UIoodh_-f70l5Q'

    getUser(token)
      .then(userData => {
        setUser(userData); // Almacena la información del usuario en el estado
        setError(null); // Resetea el error si la llamada fue exitosa
      })
      .catch(err => {
        console.error('Error al obtener el usuario:', err);
        setError(`Error al obtener el usuario. ${err}`); // Almacena el error en el estado
      });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <h1>Hello, world!</h1>
      <button onClick={handleGetUser}>VER USUARIO</button>
      {error && <h2>{error}</h2>} {/* Muestra el error si existe */}
      {user && <h2>{user.name}</h2>} {/* Muestra el nombre del usuario si existe */}
      {user && <h2>{user.email}</h2>} {/* Muestra el nombre del usuario si existe */}
      {user && <h2>{user.id}</h2>} {/* Muestra el nombre del usuario si existe */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
