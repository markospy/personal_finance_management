import { TransactionIn, TransactionOut, TransactionUpdate } from "../schemas/transaction";
import { ErrorResponse  } from "@/schemas/error";
import { AxiosError } from 'axios';
import { axi } from "./axiosConfig";

interface MetaTransactions {
  "totalTransactions": number,
  "totalPages": number,
  "pageCurrent": number,
  "sizePage": number,
  "transactions": TransactionOut[],
}



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
    return response.data; // Devuelve los datos de la respuesta
  })
  .catch((error: AxiosError) => {
    const detail: {detail: string} = error.response?.data as {detail: string};
    throw new Error(`${detail.detail}`)
  });
};

export const getTransaction = (token: string, id: number): Promise<TransactionOut | ErrorResponse> => {
  return axi.get('/transactions/' + id, { headers: { 'Authorization': `Bearer ${token}` } })
  .then(response => {
    console.log(response.status);
    return response.data; // Devuelve los datos de la respuesta
  })
  .catch((error: AxiosError) => {
    const status = error.response?.status || 500; // Valor por defecto
    const msg = error.message;

    // Retornar un objeto de error
    return {
      status,
      msg
    };
  });
};

export const getTransactions = (token:string, page:number=0, sizePage:number=10): Promise<MetaTransactions> => {
  return axi.get(`/transactions?page=${page}&size_page=${sizePage}`, { headers: { 'Authorization': `Bearer ${token}` } })
  .then(response => {
    console.log(response.status);
    return response.data; // Devuelve los datos de la respuesta
  })
  .catch((error: AxiosError) => {
    const status = error.response?.status || 500; // Valor por defecto
    const msg = error.message;
    console.log(msg)
    // Retornar un objeto de error
    return {
      status,
      msg
    };
  });
};

export const getTransactionsByAccount = (token: string, accountId: number): Promise<TransactionOut[] | ErrorResponse> => {
  return axi.get(`/transactions/by-account/${accountId}`, { headers: { 'Authorization': `Bearer ${token}` } })
  .then(response => {
    console.log(response.status);
    return response.data; // Devuelve los datos de la respuesta
  })
  .catch((error: AxiosError) => {
    const status = error.response?.status || 500; // Valor por defecto
    const msg = error.message;

    // Retornar un objeto de error
    return {
      status,
      msg
    };
  });
};

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
    return response.data; // Devuelve los datos de la respuesta
  })
  .catch((error: AxiosError) => {
    const detail: {detail: string} = error.response?.data as {detail: string};
    throw new Error(`${detail.detail}`)
  });
};

export const deleteTransaction = (token: string, id: number): Promise<TransactionOut> => {
  return axi.delete('/transactions/' + id,
    { headers: { 'Authorization': `Bearer ${token}` } })
  .then(response => {
    console.log(response.status);
    return response.data; // Devuelve los datos de la respuesta
  })
  .catch((error: AxiosError) => {
    const detail: {detail: string} = error.response?.data as {detail: string};
    throw new Error(`${detail.detail}`)
  });
};