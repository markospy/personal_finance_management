import { PieChartCustom } from '@/components/custom/PieChart';
import { CardInfo } from './financial-sumary';

interface ChartsInfo {
  data: object[];
  title: string[];
  label: string[];
  dataKey: string[];
  nameKey: string[];
}

export function Charts ({data, title, label, dataKey, nameKey}: ChartsInfo) {

  let balance = 0;
  if (data[0]) {
    Object.values(data[0]).map(account => balance += account.balance);
  };
  const balanceAccount = balance ? `$${balance}` : `$0`;
  const incomesTotal = data[1].totalIncomes ? data[1].totalIncomes : 0;
  const expensesTotal = data[1].totalExpenses ? data[1].totalExpenses : 0;
  const netBalance = `$${incomesTotal - expensesTotal}`

  return (
    <div className="flex flex-row gap-4 mb-4">
        <div className='flex flex-col gap-4'>
          <CardInfo title="Total Balance of Accounts" data={balanceAccount} />
          <CardInfo title="Income - Expenses" data={netBalance} />
        </div>
        <div className='flex flex-row gap-4'>
        { Object.keys(data[2]).length && (
          <PieChartCustom
            title={title[0]}
            label={label[0]}
            dataKey={dataKey[0]}
            nameKey={nameKey[0]}
            chartData={data[2]}
          />
        )}
        { Object.keys(data[3]).length != 0 && (
          <PieChartCustom
            title={title[1]}
            label={label[1]}
            dataKey={dataKey[1]}
            nameKey={nameKey[1]}
            chartData={data[3]}
          />
        )}
      </div>
    </div>
  );
}