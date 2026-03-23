import api from '@/api';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { useQuery } from '@tanstack/react-query';

export type Category = {
  id: string;
  key: string;
  name: string;
  color: string | null;
};

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get(API_ENDPOINTS.CATEGORIES);
      return res.data as Category[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
