import { MonthlyExpenses, MonthlyIncomes, MonthlySumary } from "@/api/statistic";
import { AccountOut } from "@/schemas/account";
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
    typeof accounts === 'object' &&
    'accounts' in accounts &&
    'currency' in accounts && (typeof accounts.currency === 'string') &&
    'balance' in accounts && (typeof accounts.balance === 'number') &&
    'name' in accounts && (typeof accounts.name === 'string') &&
    'id' in accounts && (typeof accounts.id === 'number') &&
    'userId' in accounts && (typeof accounts.userId === 'number')
);
};