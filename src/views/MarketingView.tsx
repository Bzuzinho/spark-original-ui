import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MegaphoneSimple, ShareNetwork, EnvelopeSimple, ChartLine, Users, TrendUp, PaperPlaneRight } from '@phosphor-icons/react';

export function MarketingView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users] = useKV<any[]>('club-users', []);
  const [sponsors] = useKV<any[]>('club-sponsors', []);

  const [stats, setStats] = useState({
    totalMembros: 0,
    membrosAtivos: 0,
    patrocinadores: 0,
    taxaEngajamento: 0,
  });

  useEffect(() => {
    const calcularStats = () => {
      const usersArray = users || [];
      const totalMembros = usersArray.length;
      const membrosAtivos = usersArray.filter(u => u.estado === 'ativo').length;
      const sponsorsArray = sponsors || [];
      const patrocinadores = sponsorsArray.filter(s => s.ativo).length;
      const taxaEngajamento = totalMembros > 0 ? Math.round((membrosAtivos / totalMembros) * 100) : 0;

      setStats({
        totalMembros,
        membrosAtivos,
        patrocinadores,
        taxaEngajamento,
      });
    };

    calcularStats();
  }, [users, sponsors]);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-7xl space-y-3 sm:space-y-4">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Marketing</h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          Campanhas, redes sociais e crescimento
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto gap-1">
          <TabsTrigger value="dashboard" className="text-xs px-2 py-1.5">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="campanhas" className="text-xs px-2 py-1.5">
            Campanhas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-3 space-y-4">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-3 sm:p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Membros</p>
                  <p className="text-xl sm:text-2xl font-bold mt-1">{stats.totalMembros}</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-50">
                  <Users className="text-blue-600" size={20} weight="bold" />
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Membros Ativos</p>
                  <p className="text-xl sm:text-2xl font-bold mt-1">{stats.membrosAtivos}</p>
                </div>
                <div className="p-2 rounded-lg bg-green-50">
                  <TrendUp className="text-green-600" size={20} weight="bold" />
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Patrocinadores</p>
                  <p className="text-xl sm:text-2xl font-bold mt-1">{stats.patrocinadores}</p>
                </div>
                <div className="p-2 rounded-lg bg-purple-50">
                  <MegaphoneSimple className="text-purple-600" size={20} weight="bold" />
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Taxa Engajamento</p>
                  <p className="text-xl sm:text-2xl font-bold mt-1">{stats.taxaEngajamento}%</p>
                </div>
                <div className="p-2 rounded-lg bg-orange-50">
                  <ChartLine className="text-orange-600" size={20} weight="bold" />
                </div>
              </div>
            </Card>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShareNetwork size={20} className="text-primary" weight="bold" />
              <h3 className="text-sm font-semibold">Canais de Comunicação</h3>
            </div>
            
            <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
              <Card className="p-2.5 sm:p-3 cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                <div className="flex flex-col items-center text-center gap-1.5">
                  <div className="p-1.5 rounded-lg bg-blue-50">
                    <EnvelopeSimple className="text-blue-600" size={18} weight="bold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs sm:text-sm">Email</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Newsletter & Avisos
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-2.5 sm:p-3 cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                <div className="flex flex-col items-center text-center gap-1.5">
                  <div className="p-1.5 rounded-lg bg-pink-50">
                    <ShareNetwork className="text-pink-600" size={18} weight="bold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs sm:text-sm">Instagram</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Posts & Stories
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-2.5 sm:p-3 cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                <div className="flex flex-col items-center text-center gap-1.5">
                  <div className="p-1.5 rounded-lg bg-blue-100">
                    <ShareNetwork className="text-blue-700" size={18} weight="bold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs sm:text-sm">Facebook</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Eventos & Notícias
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-2.5 sm:p-3 cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                <div className="flex flex-col items-center text-center gap-1.5">
                  <div className="p-1.5 rounded-lg bg-red-50">
                    <PaperPlaneRight className="text-red-600" size={18} weight="bold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs sm:text-sm">Website</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Blog & Conteúdo
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <ChartLine size={20} className="text-primary" weight="bold" />
              <h3 className="text-sm font-semibold">Métricas de Crescimento</h3>
            </div>
            
            <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
              <Card className="p-4">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Este Mês</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Novos membros:</span>
                      <span className="text-sm font-bold text-green-600">-</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Taxa retenção:</span>
                      <span className="text-sm font-bold text-blue-600">-</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Campanhas Ativas</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Em execução:</span>
                      <span className="text-sm font-bold text-purple-600">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Alcance total:</span>
                      <span className="text-sm font-bold text-orange-600">-</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Engajamento</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Taxa abertura:</span>
                      <span className="text-sm font-bold text-blue-600">-</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Cliques:</span>
                      <span className="text-sm font-bold text-green-600">-</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="campanhas" className="mt-3">
          <Card className="p-4 sm:p-5">
            <div className="text-center text-muted-foreground">
              <MegaphoneSimple className="mx-auto mb-2" size={36} weight="thin" />
              <p className="font-medium text-sm">Gestão de Campanhas</p>
              <p className="mt-0.5 text-xs">Funcionalidades de campanhas serão implementadas em breve</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
