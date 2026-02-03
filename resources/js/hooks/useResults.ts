import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface ResultProva {
  id: string;
  athlete_id: string;
  event_id?: string;
  event_name: string;
  race: string;
  location?: string;
  date: string;
  pool?: 'piscina_25m' | 'piscina_50m' | 'aguas_abertas';
  final_time: string;
  [key: string]: any;
}

interface UseResultsFilters {
  athlete_id?: string;
  event_id?: string;
}

export function useResults(filters?: UseResultsFilters) {
  return useQuery<ResultProva[]>({
    queryKey: ['results', filters],
    queryFn: async () => {
      const response = await axios.get('/api/results', { params: filters });
      return response.data;
    },
    initialData: [],
  });
}

export function useResult(id: string | undefined) {
  return useQuery<ResultProva>({
    queryKey: ['results', id],
    queryFn: async () => {
      const response = await axios.get(`/api/results/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (result: Partial<ResultProva>) => {
      const response = await axios.post('/api/results', result);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
    },
  });
}

export function useUpdateResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ResultProva> & { id: string }) => {
      const response = await axios.put(`/api/results/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      queryClient.invalidateQueries({ queryKey: ['results', data.id] });
    },
  });
}

export function useDeleteResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/results/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
    },
  });
}
