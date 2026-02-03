import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface EventAttendance {
  id: string;
  event_id: string;
  user_id: string;
  status: 'present' | 'absent' | 'excused' | 'late';
  arrival_time?: string;
  notes?: string;
  registered_by?: string;
  registered_at?: string;
  [key: string]: any;
}

interface UseAttendancesFilters {
  event_id?: string;
  user_id?: string;
}

export function useEventAttendances(filters?: UseAttendancesFilters) {
  return useQuery<EventAttendance[]>({
    queryKey: ['event-attendances', filters],
    queryFn: async () => {
      const response = await axios.get('/api/event-attendances', { params: filters });
      return response.data;
    },
    initialData: [],
  });
}

export function useEventAttendance(id: string | undefined) {
  return useQuery<EventAttendance>({
    queryKey: ['event-attendances', id],
    queryFn: async () => {
      const response = await axios.get(`/api/event-attendances/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateEventAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attendance: Partial<EventAttendance>) => {
      const response = await axios.post('/api/event-attendances', attendance);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-attendances'] });
    },
  });
}

export function useUpdateEventAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<EventAttendance> & { id: string }) => {
      const response = await axios.put(`/api/event-attendances/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event-attendances'] });
      queryClient.invalidateQueries({ queryKey: ['event-attendances', data.id] });
    },
  });
}

export function useDeleteEventAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/event-attendances/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-attendances'] });
    },
  });
}
