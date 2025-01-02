import { AccountsCategories } from "@/routes/Report";
import { Card, CardContent } from "../ui/card";
import { TransactionModal } from "./TransactionModal";
import { QueryClient } from "@tanstack/react-query";
import { AccountForm, newAccount } from "./AccountModal";
import { CirclePlus, CreditCard, Currency } from "lucide-react";
import { useState } from "react";
import Tippy from '@tippyjs/react'; // Asegúrate de que Tippy.js esté instalado
import { Link } from "react-router-dom";
import { useNewAccount } from "@/hooks/useNewAccount";

interface Props {
  data: AccountsCategories;
  queryClient: QueryClient;
}

interface Currency {
  currency: string;
  total: number;
}

export default function AccountsSummary({ data, queryClient }:Props ) {
  const [lookForm, setLookForm] = useState(false);
  const addAccountMutation = useNewAccount(queryClient);

  const currencies: Currency[] = [];

  if (data.accounts) {
    data.accounts.forEach((account) => {
      const currency = currencies.find(item => account.currency === item.currency);
      if (currency) {
        currency.total += account.balance;
      } else {
        currencies.push({ currency: account.currency, total: account.balance });
      }
    });
  }

  return (
    <Card className="mx-auto w-full max-w-4xl h-fit">
      <CardContent className="pt-6">
        <div className="flex justify-end items-end gap-12 m-0 w-full">
          <Link to="/accounts/">
            <Tippy content="See accounts" placement="bottom-end" className="font-medium text-blue-500 text-xs">
              <CreditCard
                className="text-blue-500 hover:text-blue-700 cursor-pointer focus:outline-none"
              />
            </Tippy>
          </Link>
          <Tippy content="Add account" placement="bottom-end" className="font-medium text-blue-500 text-xs">
            <CirclePlus
              className="text-blue-500 hover:text-blue-700 cursor-pointer focus:outline-none"
              onClick={() => setLookForm(true)}
            />
          </Tippy>
        </div>
        {lookForm && <AccountForm
          queryClient={queryClient}
          viewHandler={setLookForm}
          action="Add"
          mutation={addAccountMutation}
          dataProvider={newAccount}
        />}
        <div className="space-y-8 text-center animate-blurred-fade-in">
          <p className="w-full font-medium text-base text-center text-gray-500">Current Balance by Currency</p>
          <div className="flex justify-around">
            {currencies.map(currency => (
              <div key={currency.currency} className="flex items-baseline gap-2 mb-8">
                <h2 className="font-bold text-3xl">${currency.total}</h2>
                <h3 className="font-medium text-base">{currency.currency}</h3>
              </div>
            ))}
          </div>
        </div>
        <TransactionModal data={data} queryClient={queryClient} />
      </CardContent>
    </Card>
  );
};