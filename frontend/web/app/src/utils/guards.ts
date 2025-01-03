import { TokenOut } from "@/api/auth";
import { MonthlyExpenses, MonthlyIncomes, MonthlySumary } from "@/api/statistic";
import { AccountOut } from "@/schemas/account";
import { CategoryOut } from "@/schemas/category";
import { ErrorResponse } from "@/schemas/error";
import { TransactionOut } from "@/schemas/transaction";
import { UserOut } from "@/schemas/user";

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

export const isTransaction = (transactions: TransactionOut[] | ErrorResponse): transactions is TransactionOut[] => {
  return (
    Array.isArray(transactions) &&
    transactions.every(transaction =>
    typeof transaction === 'object' &&
    'id' in transaction && (typeof transaction.id === 'number') &&
    'category_id' in transaction && (typeof transaction.category_id === 'number') &&
    'account_id' in transaction && (typeof transaction.account_id === 'number') &&
    'amount' in transaction && (typeof transaction.amount === 'number') &&
    'date' in transaction && (typeof transaction.date === 'string') &&
    'comments' in transaction && (typeof transaction.comments === 'string' || transaction.comments === undefined)
    )
  );
};

export function isUserOut(user: unknown): user is UserOut {
  return (
    typeof user === 'object' &&
    user !== null &&
    'id' in user && typeof (user as UserOut).id === 'number' &&
    'name' in user && typeof (user as UserOut).name === 'string' &&
    'email' in user && typeof (user as UserOut).email === 'string'
  );
}

export function isTokenOut(token: TokenOut | ErrorResponse): token is TokenOut {
  return (
      typeof token === 'object' &&
      token !== null &&
      'access_token' in token && typeof token.access_token === 'string' &&
      'token_type' in token && typeof token.token_type === 'string'
  );
}