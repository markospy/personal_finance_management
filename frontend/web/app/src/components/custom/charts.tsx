import { PieChartCustom } from '@/components/custom/PieChart';
import { CardInfo } from './financial-sumary';
import { TransactionModal } from './TransactionModal';
import { AccountForm } from './AccountModal';

interface ChartsInfo {
  data: object;
  title: string[];
  label: string[];
  dataKey: string[];
  nameKey: string[];
}

export function Charts ({data, title, label, dataKey, nameKey}: ChartsInfo) {

  let balance = 0;
  if (data.accounts) {
    Object.values(data.accounts).map(account => balance += account.balance);
  };
  const balanceAccount = balance ? `$${balance}` : `$0`;
  const incomesTotal = data.summary?.totalIncomes ? data.summary?.totalIncomes : 0;
  const expensesTotal = data.summary?.totalExpenses ? data.summary?.totalExpenses : 0;
  const netBalance = `$${incomesTotal - expensesTotal}`

  return (
    <div className="flex flex-row gap-2 mb-4">
        <div className='flex flex-col gap-2'>
          <CardInfo title="Total Balance of Accounts" data={balanceAccount} />
          <CardInfo title="Income - Expenses" data={netBalance} />
          <TransactionModal data={data} />
          <AccountForm data={data} />
        </div>
        <div className='flex flex-row gap-4'>
        { Object.keys(data.summaryExpenses).length && (
          <PieChartCustom
            title={title[0]}
            label={label[0]}
            dataKey={dataKey[0]}
            nameKey={nameKey[0]}
            chartData={data.summaryExpenses}
          />
        )}
        { Object.keys(data.summaryIncomes).length != 0 && (
          <PieChartCustom
            title={title[1]}
            label={label[1]}
            dataKey={dataKey[1]}
            nameKey={nameKey[1]}
            chartData={data.summaryIncomes}
          />
        )}
      </div>
    </div>
  );
}