import { AccountsCategories } from "@/routes/Report";
import { Card, CardContent } from "../ui/card";
import { TransactionModal } from "./TransactionModal";
import { QueryClient } from "@tanstack/react-query";
import { AccountForm } from "./AccountModal";
import { CirclePlus, CreditCard } from "lucide-react";
import { useState } from "react";
import Tippy from '@tippyjs/react'; // Asegúrate de que Tippy.js esté instalado
import { Link } from "react-router-dom";

export default function AccountsSummary({ data, queryClient }: { data: AccountsCategories, queryClient: QueryClient }) {
  const [lookForm, setLookForm] = useState(false);
  let balance: number = 0;

  if (data.accounts) {
    data.accounts.forEach((account) => balance += account.balance);
  }

  return (
    <Card className="w-full h-fit max-w-4xl mx-auto">
      <CardContent className="pt-6">
        <div className="w-full flex justify-end items-end gap-12 m-0">
          <Link to="/accounts/">
            <Tippy content="See accounts" placement="bottom-end" className="text-blue-500 font-medium text-xs">
              <CreditCard
                className="focus:outline-none text-blue-500 cursor-pointer hover:text-blue-700"
              />
            </Tippy>
          </Link>
          <Tippy content="Add account" placement="bottom-end" className="text-blue-500 font-medium text-xs">
            <CirclePlus
              className="focus:outline-none text-blue-500 cursor-pointer hover:text-blue-700"
              onClick={() => setLookForm(true)}
            />
          </Tippy>
        </div>
        {lookForm && <AccountForm queryClient={queryClient} viewHandler={setLookForm} />}
        <div className="text-center animate-blurred-fade-in">
          <p className="text-lg font-medium text-gray-500 w-full text-center">Balance</p>
          <h2 className="text-3xl font-bold">${balance}</h2>
        </div>
        <TransactionModal data={data} queryClient={queryClient} />
      </CardContent>
    </Card>
  );
};