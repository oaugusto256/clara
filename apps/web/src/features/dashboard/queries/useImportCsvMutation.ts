import api from "@/api";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useImportCsvMutation({
  onSuccess,
  onError,
  onSettled,
}: {
  onSuccess?: (data: any) => void;
  onError?: (err: any) => void;
  onSettled?: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (csvText: string) => {
      const res = await api.post(API_ENDPOINTS.IMPORT_CSV, csvText, {
        headers: { "Content-Type": "text/csv" },
      });

      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onSuccess?.(data);
    },
    onError,
    onSettled,
  });
}
