import { QueryClient } from "@tanstack/react-query";

export interface NewDataProps{
    queryClient?: QueryClient;
    token: string;
    data: FormData
  }