import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface AgeGroup {
  id: string;
  nome: string;
  descricao?: string;
  idade_minima: number;
  idade_maxima: number;
  ano_minimo?: number;
  ano_maximo?: number;
  sexo?: 'masculino' | 'feminino' | 'misto';
  ativo: boolean;
}

export function useAgeGroups() {
  return useQuery<AgeGroup[]>({
    queryKey: ['age-groups'],
    queryFn: async () => {
      const response = await axios.get('/api/age-groups');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
