import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  location?: string;
  location_details?: string;
  type: string;
  tipo_config_id?: string;
  pool_type?: 'piscina_25m' | 'piscina_50m' | 'aguas_abertas';
  visibility?: 'public' | 'private' | 'members';
  eligible_age_groups?: string[];
  transport_required?: boolean;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  [key: string]: any;
}

interface UseEventsFilters {
  type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * Hook to fetch all events with optional filters
 */
export function useEvents(filters?: UseEventsFilters) {
  return useQuery<Event[]>({
    queryKey: ['events', filters],
    queryFn: async () => {
      const response = await axios.get('/api/events', { params: filters });
      return response.data;
    },
    initialData: [],
  });
}

/**
 * Hook to fetch a single event by ID
 */
export function useEvent(id: string | undefined) {
  return useQuery<Event>({
    queryKey: ['events', id],
    queryFn: async () => {
      const response = await axios.get(`/api/events/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: Partial<Event>) => {
      const response = await axios.post('/api/events', event);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

/**
 * Hook to update an existing event
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Event> & { id: string }) => {
      const response = await axios.put(`/api/events/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', data.id] });
    },
  });
}

/**
 * Hook to delete an event
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
