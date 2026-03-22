import api from "@/api";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { Transaction } from "@clara/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateTransactionCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, categoryKey }: { id: string; categoryKey: string }) => {
      const res = await api.patch(API_ENDPOINTS.TRANSACTIONS_UPDATE_CATEGORY(id), { categoryKey });
      return res.data as Transaction;
    },
    onMutate: async ({ id, categoryKey }) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });
      const previous = queryClient.getQueryData<Transaction[]>(["transactions"]);
      queryClient.setQueryData<Transaction[]>(["transactions"], (old = []) =>
        old.map((t) => (t.id === id ? { ...t, categoryKey } : t))
      );
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["transactions"], context.previous);
      }
    },
  });
}
