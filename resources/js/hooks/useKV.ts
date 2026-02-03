import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface UseKVOptions {
  scope?: 'global' | 'user';
}

/**
 * Hook compatível com Spark useKV, mas usando backend Laravel
 * 
 * @example
 * const [users, setUsers] = useKV<User[]>('club-users', []);
 * setUsers(prev => [...prev, newUser]); // Salva no Laravel
 */
export function useKV<T>(
  key: string,
  defaultValue: T,
  options: UseKVOptions = {}
): [T, (value: T | ((prev: T) => T)) => void] {
  const { scope = 'global' } = options;
  const queryClient = useQueryClient();

  // Fetch data from Laravel API
  const { data } = useQuery<T>({
    queryKey: ['kv', key, scope],
    queryFn: async () => {
      const response = await axios.get(`/api/kv/${key}`, {
        params: { scope },
      });
      return response.data.value ?? defaultValue;
    },
    initialData: defaultValue,
  });

  // Mutation to save data
  const mutation = useMutation({
    mutationFn: async (newValue: T) => {
      await axios.put(`/api/kv/${key}`, {
        value: newValue,
        scope,
      });
    },
    onMutate: async (newValue) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['kv', key, scope] });
      const previousValue = queryClient.getQueryData<T>(['kv', key, scope]);
      queryClient.setQueryData(['kv', key, scope], newValue);
      return { previousValue };
    },
    onError: (err, newValue, context) => {
      // Rollback on error
      if (context?.previousValue) {
        queryClient.setQueryData(['kv', key, scope], context.previousValue);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['kv', key, scope] });
    },
  });

  // Setter function (compatible with Spark API)
  const setValue = (value: T | ((prev: T) => T)) => {
    const currentValue = queryClient.getQueryData<T>(['kv', key, scope]) ?? defaultValue;
    const newValue = typeof value === 'function' 
      ? (value as (prev: T) => T)(currentValue)
      : value;
    
    mutation.mutate(newValue);
  };

  return [data ?? defaultValue, setValue];
}

export default useKV;
