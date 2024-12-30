import { QueryClient } from "@tanstack/react-query";

export interface NewDataProps{
    queryClient?: QueryClient;
    id?: number;
    token: string;
    data: FormData
  }