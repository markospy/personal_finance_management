import { QueryClient } from "@tanstack/react-query";

export interface NewDataProps{
    queryClient?: QueryClient;
    accountId?: number;
    token: string;
    data: FormData
  }