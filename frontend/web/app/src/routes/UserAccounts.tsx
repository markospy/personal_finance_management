import { Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import currencies from '@/utils/currencies'

// Definimos un tipo para nuestras cuentas
type Account = {
  id: string
  name: string
  balance: number
  currency: string
}

// Función auxiliar para obtener el icono de la moneda
const getCurrencyIcon = (currency: string) => {
  const coin = currencies.currencies.find(coin => coin.codigo === currency);
  return coin ? coin?.simbolo : undefined;
}

export default function UserAccounts() {
  // Simulamos algunas cuentas de usuario
  const accounts: Account[] = [
    { id: '1', name: 'Cuenta Corriente', balance: 5000, currency: 'USD' },
    { id: '2', name: 'Cuenta de Ahorros', balance: 10000, currency: 'EUR' },
    { id: '3', name: 'Inversiones', balance: 15000, currency: 'GBP' },
  ]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Accounts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {account.name}
              </CardTitle>
              {console.log(getCurrencyIcon(account.currency))}
              <p>{getCurrencyIcon(account.currency) || account.currency}</p>
            </CardHeader>
            <CardContent className='w-full'>
              <div>
                <div className="text-2xl font-bold">
                  {account.balance.toLocaleString(undefined, {
                    style: 'currency',
                    currency: account.currency,
                  })}
                </div>
                <div className='w-full flex flex-row justify-between'>
                  <p className="text-xs text-muted-foreground">
                    Current balance
                  </p>
                  <Trash2 className='text-red-600 size-4 hover:cursor-pointer'/>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}