import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface Prova {
  id: string;
  name: string;
  distance?: number;
  stroke?: string;
  gender?: 'M' | 'F' | 'Mixed';
  age_group?: string;
  datetime?: string;
  competition_id?: string;
  [key: string]: any;
}

export function useProvas() {
  return useQuery<Prova[]>({
    queryKey: ['provas'],
    queryFn: async () => {
      const response = await axios.get('/api/provas');
      return response.data;
    },
    initialData: [],
  });
}

export function useProva(id: string | undefined) {
  return useQuery<Prova>({
    queryKey: ['provas', id],
    queryFn: async () => {
      const response = await axios.get(`/api/provas/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateProva() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prova: Partial<Prova>) => {
      const response = await axios.post('/api/provas', prova);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provas'] });
    },
  });
}

export function useUpdateProva() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Prova> & { id: string }) => {
      const response = await axios.put(`/api/provas/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['provas'] });
      queryClient.invalidateQueries({ queryKey: ['provas', data.id] });
    },
  });
}

export function useDeleteProva() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/provas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provas'] });
    },
  });
}
