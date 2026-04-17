import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { LandingPageSettings } from '@/Components/Configuracoes/Permissions/LandingPageSettings';
import { MenuVisibilitySettings } from '@/Components/Configuracoes/Permissions/MenuVisibilitySettings';
import { PermissionTree } from '@/Components/Configuracoes/Permissions/PermissionTree';
import { useUserTypeAccessControl } from '@/hooks/useUserTypeAccessControl';
import {
  buildPermissionsPayload,
  createEmptyPermissionSelectionState,
  createPermissionNodeMap,
  mapPermissionsToSelectionState,
  orderModuleKeys,
  togglePermissionBranch,
} from '@/lib/access-control';
import { AccessControlBootstrap, PermissionSelectionState } from '@/types/access-control';

interface UserType {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

interface UserTypePermissionSettingsProps {
  userTypes: UserType[];
  bootstrap: AccessControlBootstrap;
}

export function UserTypePermissionSettings({ userTypes, bootstrap }: UserTypePermissionSettingsProps) {
  const [selectedUserTypeId, setSelectedUserTypeId] = useState<string | null>(
    bootstrap.defaultSelectedUserTypeId ?? userTypes[0]?.id ?? null,
  );

  const { settings, isLoading, savingSection, saveLandingPage, saveMenuModules, savePermissions } =
    useUserTypeAccessControl(selectedUserTypeId, bootstrap.initialSettingsByUserType);

  const orderedModuleKeys = useMemo(
    () => bootstrap.menuModules.map((module) => module.key),
    [bootstrap.menuModules],
  );
  const nodeMap = useMemo(
    () => createPermissionNodeMap(bootstrap.permissionTree),
    [bootstrap.permissionTree],
  );

  const [menuModuleKeys, setMenuModuleKeys] = useState<string[]>([]);
  const [landingModuleKey, setLandingModuleKey] = useState('');
  const [basePageKey, setBasePageKey] = useState('');
  const [selectionState, setSelectionState] = useState<PermissionSelectionState>(
    createEmptyPermissionSelectionState(),
  );
  const currentUserTypeCode = settings?.userType.codigo ?? null;

  const getAvailableBasePages = (moduleKey: string) => {
    const module = bootstrap.landingPages.find((item) => item.module_key === moduleKey);
    const basePages = module?.base_pages ?? [];

    if (currentUserTypeCode === 'atleta' && moduleKey === 'membros') {
      return basePages.filter((page) => page.key === 'membros_ficha_propria');
    }

    if ((currentUserTypeCode === 'encarregado_educacao' || currentUserTypeCode === 'encarregado') && moduleKey === 'membros') {
      return basePages.filter((page) => page.key === 'membros_educando_principal');
    }

    return basePages;
  };

  useEffect(() => {
    if (!settings) {
      setMenuModuleKeys([]);
      setLandingModuleKey('');
      setBasePageKey('');
      setSelectionState(createEmptyPermissionSelectionState());
      return;
    }

    setMenuModuleKeys(settings.menuModuleKeys);
    setLandingModuleKey(settings.landingPage.landing_module_key);
    setBasePageKey(settings.landingPage.base_page_key);
    setSelectionState(mapPermissionsToSelectionState(settings.permissions));
  }, [settings]);

  useEffect(() => {
    if (!landingModuleKey) {
      return;
    }

    const availableBasePages = getAvailableBasePages(landingModuleKey);

    if (availableBasePages.length === 0) {
      return;
    }

    if (!availableBasePages.some((page) => page.key === basePageKey)) {
      setBasePageKey(availableBasePages[0].key);
    }
  }, [landingModuleKey, basePageKey, currentUserTypeCode]);

  const handleLandingModuleChange = (moduleKey: string) => {
    const availableBasePages = getAvailableBasePages(moduleKey);

    setLandingModuleKey(moduleKey);
    setBasePageKey(availableBasePages[0]?.key ?? '');
  };

  const handleToggleMenuModule = (moduleKey: string, checked: boolean) => {
    setMenuModuleKeys((currentKeys) => {
      const nextKeys = checked
        ? [...currentKeys, moduleKey]
        : currentKeys.filter((currentKey) => currentKey !== moduleKey);

      return orderModuleKeys(Array.from(new Set(nextKeys)), orderedModuleKeys);
    });
  };

  const handleTogglePermission = (
    capability: keyof PermissionSelectionState,
    nodeId: string,
    checked: boolean,
  ) => {
    setSelectionState((currentState) => ({
      ...currentState,
      [capability]: togglePermissionBranch(currentState[capability], nodeId, checked, nodeMap),
    }));
  };

  const handleSaveLandingPage = async () => {
    if (!selectedUserTypeId || !landingModuleKey || !basePageKey) {
      return;
    }

    await saveLandingPage(landingModuleKey, basePageKey);
    toast.success('Entrada inicial guardada com sucesso.');
  };

  const handleSaveMenuModules = async () => {
    if (!selectedUserTypeId) {
      return;
    }

    await saveMenuModules(menuModuleKeys);
    toast.success('Visibilidade do menu atualizada.');
  };

  const handleSavePermissions = async () => {
    if (!selectedUserTypeId) {
      return;
    }

    await savePermissions(buildPermissionsPayload(selectionState));
    toast.success('Permissões guardadas com sucesso.');
  };

  if (userTypes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Permissões por Tipo de Utilizador</CardTitle>
          <CardDescription>Crie primeiro um tipo de utilizador para configurar acessos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck size={20} />
                Permissões por Tipo de Utilizador
              </CardTitle>
              <CardDescription>
                Gestão real de menu, landing page e permissões em árvore com persistência por tipo de utilizador.
              </CardDescription>
            </div>
            <Badge variant="secondary">{isLoading ? 'A carregar' : 'Ligado à API'}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-[minmax(0,320px)_1fr] md:items-end">
            <div className="space-y-2">
              <Label>Tipo de utilizador</Label>
              <Select value={selectedUserTypeId ?? undefined} onValueChange={setSelectedUserTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {userTypes.map((userType) => (
                    <SelectItem key={userType.id} value={userType.id}>
                      {userType.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              {settings?.userType.descricao || 'Sem descrição definida para este tipo de utilizador.'}
            </div>
          </div>
        </CardContent>
      </Card>

      <LandingPageSettings
        landingPages={bootstrap.landingPages}
        selectedModuleKey={landingModuleKey}
        selectedBasePageKey={basePageKey}
        currentUserTypeCode={currentUserTypeCode}
        onModuleChange={handleLandingModuleChange}
        onBasePageChange={setBasePageKey}
        onSave={handleSaveLandingPage}
        disabled={!selectedUserTypeId || isLoading}
        saving={savingSection === 'landing'}
      />

      <MenuVisibilitySettings
        modules={bootstrap.menuModules}
        selectedModuleKeys={menuModuleKeys}
        onToggleModule={handleToggleMenuModule}
        onSave={handleSaveMenuModules}
        disabled={!selectedUserTypeId || isLoading}
        saving={savingSection === 'menu'}
      />

      <div className="space-y-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold">Árvores de Permissões</h3>
            <p className="text-sm text-muted-foreground">
              Cada seleção aplica-se em cascata ao ramo selecionado. Os três níveis são independentes.
            </p>
          </div>
          <Button onClick={handleSavePermissions} disabled={!selectedUserTypeId || isLoading || savingSection === 'permissions'}>
            {savingSection === 'permissions' ? 'Guardar...' : 'Guardar permissões'}
          </Button>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <PermissionTree
            title="Visualizar"
            description="Controla o que pode ser consultado e aberto na interface."
            nodes={bootstrap.permissionTree}
            selectedIds={selectionState.view}
            onToggleNode={(nodeId, checked) => handleTogglePermission('view', nodeId, checked)}
          />

          <PermissionTree
            title="Editar"
            description="Controla alterações de registos, tabs e campos."
            nodes={bootstrap.permissionTree}
            selectedIds={selectionState.edit}
            onToggleNode={(nodeId, checked) => handleTogglePermission('edit', nodeId, checked)}
          />

          <PermissionTree
            title="Apagar"
            description="Controla ações destrutivas e remoção de dados."
            nodes={bootstrap.permissionTree}
            selectedIds={selectionState.delete}
            onToggleNode={(nodeId, checked) => handleTogglePermission('delete', nodeId, checked)}
          />
        </div>
      </div>
    </div>
  );
}