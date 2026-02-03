import { useEffect, useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { 
  ShoppingCart,
  Package,
  TrendUp,
  Warning,
  CurrencyCircleDollar,
  Users
} from '@phosphor-icons/react';

interface Artigo {
  id: string;
  nome: string;
  preco: number;
  stock: number;
  stock_minimo: number;
  ativo: boolean;
}

interface Encomenda {
  id: string;
  atleta_id: string;
  artigo_id: string;
  quantidade: number;
  valor: number;
  local_entrega: string;
  estado: 'pendente' | 'processada' | 'entregue' | 'cancelada';
  data_encomenda: string;
}

interface Fornecedor {
  id: string;
  nome: string;
  ativo: boolean;
}

export function LojaDashboard() {
  const [artigos] = useKV<Artigo[]>('club-artigos', []);
  const [encomendas] = useKV<Encomenda[]>('club-encomendas', []);
  const [fornecedores] = useKV<Fornecedor[]>('club-fornecedores', []);

  const [stats, setStats] = useState({
    totalArtigos: 0,
    artigosAtivos: 0,
    artigosBaixoStock: 0,
    totalEncomendas: 0,
    encomendasPendentes: 0,
    encomendasProcessadas: 0,
    valorTotalEncomendas: 0,
    fornecedoresAtivos: 0,
  });

  useEffect(() => {
    const calcularStats = () => {
      const artigosList = artigos || [];
      const encomendasList = encomendas || [];
      const fornecedoresList = fornecedores || [];

      const totalArtigos = artigosList.length;
      const artigosAtivos = artigosList.filter(a => a.ativo).length;
      const artigosBaixoStock = artigosList.filter(a => a.stock <= a.stock_minimo).length;

      const totalEncomendas = encomendasList.length;
      const encomendasPendentes = encomendasList.filter(e => e.estado === 'pendente').length;
      const encomendasProcessadas = encomendasList.filter(e => e.estado === 'processada').length;
      const valorTotalEncomendas = encomendasList
        .filter(e => e.estado !== 'cancelada')
        .reduce((sum, e) => sum + e.valor, 0);

      const fornecedoresAtivos = fornecedoresList.filter(f => f.ativo).length;

      setStats({
        totalArtigos,
        artigosAtivos,
        artigosBaixoStock,
        totalEncomendas,
        encomendasPendentes,
        encomendasProcessadas,
        valorTotalEncomendas,
        fornecedoresAtivos,
      });
    };

    calcularStats();
  }, [artigos, encomendas, fornecedores]);

  const mainStats = [
    {
      title: 'Total de Artigos',
      value: stats.totalArtigos,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Artigos Ativos',
      value: stats.artigosAtivos,
      icon: TrendUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Baixo Stock',
      value: stats.artigosBaixoStock,
      icon: Warning,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Total Encomendas',
      value: stats.totalEncomendas,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Encomendas Pendentes',
      value: stats.encomendasPendentes,
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Processadas',
      value: stats.encomendasProcessadas,
      icon: TrendUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Valor Total Encomendas',
      value: `€${stats.valorTotalEncomendas.toFixed(2)}`,
      icon: CurrencyCircleDollar,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      title: 'Fornecedores Ativos',
      value: stats.fornecedoresAtivos,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="p-3 border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium leading-tight truncate">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-2 rounded-lg shrink-0`}>
                  <Icon size={20} weight="duotone" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
