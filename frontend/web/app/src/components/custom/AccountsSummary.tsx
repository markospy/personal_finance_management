import { AccountsCategories } from "@/routes/Report";
import { Card, CardContent } from "../ui/card";
import { TransactionModal } from "./TransactionModal";
import { QueryClient } from "@tanstack/react-query";
import { AccountForm, newAccount } from "./AccountModal";
import { CirclePlus, CreditCard } from "lucide-react";
import { useState } from "react";
import Tippy from '@tippyjs/react'; // Asegúrate de que Tippy.js esté instalado
import { Link } from "react-router-dom";
import { useNewAccount } from "@/hooks/useNewAccount";

export default function AccountsSummary({ data, queryClient }: { data: AccountsCategories, queryClient: QueryClient }) {
  const [lookForm, setLookForm] = useState(false);
  const addAccountMutation = useNewAccount(queryClient);
  let balance: number = 0;

  if (data.accounts) {
    data.accounts.forEach((account) => balance += account.balance);
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
        <div className="text-center animate-blurred-fade-in">
          <p className="w-full font-medium text-base text-center text-gray-500">Current Balance</p>
          <h2 className="font-bold text-3xl">${balance}</h2>
        </div>
        <TransactionModal data={data} queryClient={queryClient} />
      </CardContent>
    </Card>
  );
};