import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Button } from '@/Components/ui/button';
import { AccessControlMenuModule } from '@/types/access-control';

interface MenuVisibilitySettingsProps {
  modules: AccessControlMenuModule[];
  selectedModuleKeys: string[];
  onToggleModule: (moduleKey: string, checked: boolean) => void;
  onSave: () => void;
  disabled?: boolean;
  saving?: boolean;
}

export function MenuVisibilitySettings({
  modules,
  selectedModuleKeys,
  onToggleModule,
  onSave,
  disabled = false,
  saving = false,
}: MenuVisibilitySettingsProps) {
  const selectedSet = new Set(selectedModuleKeys);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Módulos Visíveis no Menu</CardTitle>
        <CardDescription>
          Controla quais os módulos apresentados na sidebar esquerda após autenticação.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <label
              key={module.key}
              className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <Checkbox
                checked={selectedSet.has(module.key)}
                onCheckedChange={(checked) => onToggleModule(module.key, checked === true)}
                disabled={disabled}
              />
              <span>{module.label}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave} disabled={disabled || saving}>
            {saving ? 'Guardar...' : 'Guardar menu'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}