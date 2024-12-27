import { useEffect, useState } from "react";
import { codes } from 'currency-codes-ts';
import { QueryClient } from "@tanstack/react-query";
import { Input, SelectCurrency } from "./Inputs";
import { WrapperForms } from "./WrapperForms";
import { ButtonShowForm } from "./ShowForm";
import { Wallet } from "lucide-react";
import { useNewAccount } from "@/hooks/useNewAccount";
import { NewDataProps } from "@/schemas/utils";
import { AccountIn } from "@/schemas/account";

const newAccount = async ({token, data}: NewDataProps) => {
  const account: {token: string, account: AccountIn} = {
    token: token,
    account : {
      currency: data.get('currency') as string,
      balance: parseFloat(data.get('balance') as string),
      name: data.get('name') as string
    }
  }
  return account;
}
export function AccountForm({ queryClient, viewHandler }: { queryClient: QueryClient, viewHandler: (isLook: boolean) => void }) {
  const currencies = codes();

  const mutation = useNewAccount(queryClient)

  // Efecto para cerrar el modal cuando la mutación es exitosa
  useEffect(() => {
    if (mutation.isSuccess) {
      viewHandler(false);
    }
  }, [mutation.isSuccess, viewHandler]);

  return (
      <WrapperForms
      title="Add Account"
      mutation={mutation}
      dataProvider={newAccount}
      onClick={() => viewHandler(false)}
      queryClient={queryClient}
    >
      <>
        <Input title="Account Name" name="name" type="text" placeholder="Account name" required={true} />
        <SelectCurrency title="Currency" name="currency" options={currencies} placeholder="Account currency" />
        <Input title="Balance" name="balance" type="number" placeholder="Account amount" required={true} />
      </>
    </ WrapperForms>
  )
}

export function AccountAdd({ queryClient }: { queryClient: QueryClient }) {
  const [isOpen, setIsOpen] = useState(false);


  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <ButtonShowForm title="Add Accounts" onClick={() => setIsOpen(true)}>
        <Wallet />
      </ButtonShowForm>

      {isOpen && <AccountForm queryClient={queryClient} viewHandler={setIsOpen}/>}
    </div>
  );
}