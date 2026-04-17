import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { AccessControlLandingModule } from '@/types/access-control';

interface LandingPageSettingsProps {
  landingPages: AccessControlLandingModule[];
  selectedModuleKey: string;
  selectedBasePageKey: string;
  onModuleChange: (moduleKey: string) => void;
  onBasePageChange: (basePageKey: string) => void;
  onSave: () => void;
  disabled?: boolean;
  saving?: boolean;
}

export function LandingPageSettings({
  landingPages,
  selectedModuleKey,
  selectedBasePageKey,
  onModuleChange,
  onBasePageChange,
  onSave,
  disabled = false,
  saving = false,
}: LandingPageSettingsProps) {
  const selectedModule = landingPages.find((module) => module.module_key === selectedModuleKey) ?? landingPages[0];
  const basePages = selectedModule?.base_pages ?? [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Entrada por Tipo de Utilizador</CardTitle>
        <CardDescription>
          Define o módulo de entrada e a página base a usar no pós-login para o tipo selecionado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <Label>Landing page</Label>
            <Select value={selectedModuleKey} onValueChange={onModuleChange} disabled={disabled}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar módulo" />
              </SelectTrigger>
              <SelectContent>
                {landingPages.map((module) => (
                  <SelectItem key={module.module_key} value={module.module_key}>
                    {module.module_label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Página base</Label>
            <Select value={selectedBasePageKey} onValueChange={onBasePageChange} disabled={disabled}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar página" />
              </SelectTrigger>
              <SelectContent>
                {basePages.map((page) => (
                  <SelectItem key={page.key} value={page.key}>
                    {page.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={onSave} disabled={disabled || saving} className="w-full md:w-auto">
              {saving ? 'Guardar...' : 'Guardar entrada'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}