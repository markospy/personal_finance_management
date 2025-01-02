import { TransactionIn, TransactionOut, TransactionUpdate } from "../schemas/transaction";
import { ErrorResponse  } from "@/schemas/error";
import { AxiosError } from 'axios';
import { axi } from "./axiosConfig";

interface PaginedTransactions {
  "totalTransactions": number,
  "totalPages": number,
  "pageCurrent": number,
  "sizePage": number,
  "transactions": TransactionOut[],
}

// Create a new transaction.
export const createTransaction = (token: string, transaction: TransactionIn): Promise<TransactionOut> => {
  return axi.post('/transactions/', {
    "category_id": transaction.category_id,
    "account_id": transaction.account_id,
    "amount": transaction.amount,
    "date": transaction.date,
    "comments": transaction.comments,
  }, { headers: { 'Authorization': `Bearer ${token}` } })
  .then(response => {
    console.log(response.status);
    return response.data;
  })
  .catch((error: AxiosError) => {
    const detail: {detail: string} = error.response?.data as {detail: string};
    throw new Error(`${detail.detail}`)
  });
};


// Get a transaction.
export const getTransaction = (token: string, id: number): Promise<TransactionOut | ErrorResponse> => {
  return axi.get(`/transactions/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
  .then(response => {
    console.log(response.status);
    return response.data;
  })
  .catch((error: AxiosError) => {
    const status = error.response?.status || 500;
    const msg = error.message;


    return {
      status,
      msg
    };
  });
};

// Get all transactions.
export const getTransactions = (token:string, page:number=0, sizePage:number=10): Promise<PaginedTransactions> => {
  return axi.get(`/transactions?page=${page}&size_page=${sizePage}`, { headers: { 'Authorization': `Bearer ${token}` } })
  .then(response => {
    console.log(response.status);
    return response.data;
  })
  .catch((error: AxiosError) => {
    const status = error.response?.status || 500;
    const msg = error.message;
    console.log(msg)

    return {
      status,
      msg
    };
  });
};

// Obtains the transactions corresponding to a given account.
export const getTransactionsByAccount = (token: string, accountId: number): Promise<TransactionOut[] | ErrorResponse> => {
  return axi.get(`/transactions/by-account/${accountId}`, { headers: { 'Authorization': `Bearer ${token}` } })
  .then(response => {
    console.log(response.status);
    return response.data;
  })
  .catch((error: AxiosError) => {
    const status = error.response?.status || 500;
    const msg = error.message;

    return {
      status,
      msg
    };
  });
};

// Update a transaction.
export const updateTransaction = (token: string, id: number, transaction: TransactionUpdate): Promise<TransactionOut> => {
  return axi.put('/transactions/' + id, {
    "category_id": transaction.category_id,
    "account_id": transaction.account_id,
    "amount": transaction.amount,
    "date": transaction.date,
    "comments": transaction.comments,
  }, { headers: { 'Authorization': `Bearer ${token}` } })
  .then(response => {
    console.log(response.status);
    return response.data;
  })
  .catch((error: AxiosError) => {
    const detail: {detail: string} = error.response?.data as {detail: string};
    throw new Error(`${detail.detail}`)
  });
};

// Eliminates a transaction.
export const deleteTransaction = (token: string, id: number): Promise<TransactionOut> => {
  return axi.delete('/transactions/' + id,
    { headers: { 'Authorization': `Bearer ${token}` } })
  .then(response => {
    console.log(response.status);
    return response.data;
  })
  .catch((error: AxiosError) => {
    const detail: {detail: string} = error.response?.data as {detail: string};
    throw new Error(`${detail.detail}`)
  });
};