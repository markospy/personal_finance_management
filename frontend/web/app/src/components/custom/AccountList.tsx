import { PencilLine, Plus, Trash2 } from 'lucide-react'; // Asegúrate de tener estas importaciones correctas
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import currencies from '@/utils/currencies'
import { AccountOut } from '@/schemas/account';

interface Props {
  accounts: AccountOut[];
  selectAccount: (account:AccountOut) => void;
  setLookFormUpdater: (value: boolean) => void;
  setLookFormAdd: (value: boolean) => void;
  setLookConfirm: (value: boolean) => void;
  showConfirm: boolean;
}

export const AccountsList = ({ accounts, selectAccount, setLookFormUpdater, setLookFormAdd, setLookConfirm, showConfirm }: Props) => {

  // Función auxiliar para obtener el icono de la moneda
  const getCurrencyIcon = (currency: string) => {
      const coin = currencies.currencies.find(coin => coin.codigo === currency);
      return coin ? coin?.simbolo : undefined;
  }

  return (
    <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-6">
      {accounts.map((account) => (
        <Card key={account.id}>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="flex items-center gap-8 font-medium text-sm">
              {account.name}
              <PencilLine
                className={`hover:text-blue-500 cursor-pointer size-5 ${showConfirm && 'cursor-not-allowed hover:text-black'}`}
                onClick={() => {
                  setLookFormUpdater(true);
                  selectAccount({
                    id: account.id,
                    name: account.name,
                    currency: account.currency,
                    balance: account.balance,
                    userId: account.userId
                  });
                }}
              />
            </CardTitle>
            <p>{getCurrencyIcon(account.currency) || account.currency}</p>
          </CardHeader>
          <CardContent className='w-full'>
            <div>
              <div className="font-bold text-2xl">
                {account.balance.toLocaleString(undefined, {
                  style: 'currency',
                  currency: account.currency,
                })}
              </div>
              <div className='flex flex-row justify-between w-full'>
                <p className="text-muted-foreground text-xs">
                  Current balance
                </p>
                <Trash2
                  onClick={() => {
                    if (!showConfirm) {
                      setLookConfirm(true);
                      selectAccount({
                        id: account.id,
                        name: account.name,
                        currency: account.currency,
                        balance: account.balance,
                        userId: account.userId
                      });
                    }
                  }}
                  className={`text-red-600 cursor-pointer size-4 ${showConfirm && 'cursor-not-allowed'}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Card className='cursor-pointer' onClick={()=>setLookFormAdd(true)}>
        <CardContent className='flex justify-center items-center hover:shadow-lg p-6 w-full h-full'>
          <Plus className='text-gray-300 size-16'/>
        </CardContent>
      </Card>
    </div>
  );
};