import { Card } from '@/components/ui/card';
import { MegaphoneSimple, ShareNetwork, EnvelopeSimple, ChartLine } from '@phosphor-icons/react';

export function MarketingView() {
  return (
    <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-7xl space-y-2 sm:space-y-3">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Comunicação</h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          Campanhas, redes sociais e comunicação com membros
        </p>
      </div>

      <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
        <Card className="p-2.5 sm:p-3 cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
          <div className="flex flex-col items-center text-center gap-1.5">
            <div className="p-1.5 rounded-lg bg-blue-50">
              <MegaphoneSimple className="text-blue-600" size={18} weight="bold" />
            </div>
            <div>
              <h3 className="font-semibold text-xs sm:text-sm">Campanhas</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Planeamento e execução
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-2.5 sm:p-3 cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
          <div className="flex flex-col items-center text-center gap-1.5">
            <div className="p-1.5 rounded-lg bg-green-50">
              <ShareNetwork className="text-green-600" size={18} weight="bold" />
            </div>
            <div>
              <h3 className="font-semibold text-xs sm:text-sm">Redes Sociais</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Gestão de conteúdo
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-2.5 sm:p-3 cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
          <div className="flex flex-col items-center text-center gap-1.5">
            <div className="p-1.5 rounded-lg bg-purple-50">
              <EnvelopeSimple className="text-purple-600" size={18} weight="bold" />
            </div>
            <div>
              <h3 className="font-semibold text-xs sm:text-sm">Email Marketing</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Comunicação direta
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-2.5 sm:p-3 cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
          <div className="flex flex-col items-center text-center gap-1.5">
            <div className="p-1.5 rounded-lg bg-orange-50">
              <ChartLine className="text-orange-600" size={18} weight="bold" />
            </div>
            <div>
              <h3 className="font-semibold text-xs sm:text-sm">Análise</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Métricas e feedback
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="text-center text-muted-foreground">
          <MegaphoneSimple className="mx-auto mb-2" size={36} weight="thin" />
          <p className="font-medium text-sm">Módulo de marketing e comunicação</p>
          <p className="mt-0.5 text-xs">Funcionalidades detalhadas serão implementadas</p>
        </div>
      </Card>
    </div>
  );
}
