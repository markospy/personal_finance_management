import { MonthlyExpenses, MonthlyIncomes, MonthlySumary } from "@/api/statistic";
import { AccountOut } from "@/schemas/account";
import { CategoryOut } from "@/schemas/category";
import { ErrorResponse } from "@/schemas/error";

export const isMonthlySummary = (summary: MonthlySumary | ErrorResponse | false): summary is MonthlySumary => {
  return (
    typeof summary === 'object' &&
    'totalExpenses' in summary && typeof summary.totalExpenses === 'number' &&
    'totalIncomes' in summary && typeof summary.totalIncomes === 'number'
  );
};

export const isMonthlyIncomes = (incomes: MonthlyIncomes[] | ErrorResponse | false): incomes is MonthlyIncomes[] => {
  return (
    Array.isArray(incomes) &&
    incomes.every(income =>
    typeof income === 'object' &&
    'categoryId' in income && typeof income.categoryId === 'number' &&
    'categoryName' in income && typeof income.categoryName === 'string' &&
    'totalAmount' in income && typeof income.totalAmount === 'number'
    )
  );
};

export const isMonthlyExpenses = (expenses: MonthlyExpenses[] | ErrorResponse | false): expenses is MonthlyExpenses[] => {
  return (
    Array.isArray(expenses) &&
    expenses.every(expense =>
    typeof expense === 'object' &&
    'categoryId' in expense && typeof expense.categoryId === 'number' &&
    'categoryName' in expense && typeof expense.categoryName === 'string' &&
    'totalAmount' in expense && typeof expense.totalAmount === 'number'
    )
  );
};

export const isAccount = (accounts: AccountOut[] | ErrorResponse): accounts is AccountOut[] => {
  return (
    Array.isArray(accounts) &&
    accounts.every(account =>
    typeof account === 'object' &&
    'currency' in account && (typeof account.currency === 'string') &&
    'balance' in account && (typeof account.balance === 'number') &&
    'name' in account && (typeof account.name === 'string') &&
    'id' in account && (typeof account.id === 'number') &&
    'userId' in account && (typeof account.userId === 'number')
    )
  );
};

export const isCategory = (categories: CategoryOut[] | ErrorResponse): categories is CategoryOut[] => {
  return (
    Array.isArray(categories) &&
    categories.every(category =>
    typeof category === 'object' &&
    'type' in category && (typeof category.type === 'string') &&
    'id' in category && (typeof category.id === 'number') &&
    'name' in category && (typeof category.name === 'string') &&
    'isGlobal' in category && (typeof category.isGlobal === 'boolean') &&
    'userId' in category && (typeof category.userId === 'number' || category.userId === null)
    )
  );
};