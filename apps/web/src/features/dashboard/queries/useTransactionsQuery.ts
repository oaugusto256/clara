import api from "@/api";
import { useQuery } from "@tanstack/react-query";

export function useTransactionsQuery() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await api.get("/transactions");
      return res.data;
    },
  });
}
