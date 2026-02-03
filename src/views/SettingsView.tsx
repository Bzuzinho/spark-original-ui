import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash, FloppyDisk, Database } from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import type { User, CentroCusto } from '@/lib/types';

interface AgeGroup {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
}

interface UserType {
  id: string;
  name: string;
  description: string;
}

interface Permission {
  id: string;
  userTypeId: string;
  module: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface Article {
  id: string;
  code: string;
  name: string;
  price: number;
  category: string;
}

interface Supplier {
  id: string;
  name: string;
  nif: string;
  email: string;
  phone: string;
  address: string;
  category: string;
}

interface MonthlyFee {
  id: string;
  name: string;
  amount: number;
  ageGroupId: string;
}

interface Prova {
  id: string;
  name: string;
  distancia: number;
  unidade: 'metros' | 'quilometros';
  modalidade: string;
}

interface ClubInfo {
  name: string;
  nif: string;
  address: string;
  phone: string;
  email: string;
}

interface NotificationPreferences {
  emailNotifications: boolean;
  paymentAlerts: boolean;
  activityAlerts: boolean;
}

export function SettingsView() {
  const [ageGroups, setAgeGroups] = useKV<AgeGroup[]>('settings-age-groups', []);
  const [userTypes, setUserTypes] = useKV<UserType[]>('settings-user-types', []);
  const [permissions, setPermissions] = useKV<Permission[]>('settings-permissions', []);
  const [articles, setArticles] = useKV<Article[]>('settings-articles', []);
  const [suppliers, setSuppliers] = useKV<Supplier[]>('settings-suppliers', []);
  const [monthlyFees, setMonthlyFees] = useKV<MonthlyFee[]>('settings-monthly-fees', []);
  const [provas, setProvas] = useKV<Prova[]>('settings-provas', []);
  const [costCenters, setCostCenters] = useKV<CentroCusto[]>('club-centros-custo', []);
  const [clubInfo, setClubInfo] = useKV<ClubInfo>('settings-club-info', {
    name: '',
    nif: '',
    address: '',
    phone: '',
    email: ''
  });
  const [notificationPrefs, setNotificationPrefs] = useKV<NotificationPreferences>('settings-notification-prefs', {
    emailNotifications: true,
    paymentAlerts: true,
    activityAlerts: true
  });
  
  const [users] = useKV<User[]>('club-users', []);
  const [dbKeys, setDbKeys] = useState<string[]>([]);
  const [showDbDialog, setShowDbDialog] = useState(false);

  const [editingItem, setEditingItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('general');
  const [clubFormData, setClubFormData] = useState<ClubInfo>({
    name: '',
    nif: '',
    address: '',
    phone: '',
    email: ''
  });

  const handleSaveAgeGroup = (data: Partial<AgeGroup>) => {
    if (editingItem?.id) {
      setAgeGroups((current) =>
        (current || []).map((item) => (item.id === editingItem.id ? { ...item, ...data } : item))
      );
      toast.success('Escalão atualizado com sucesso');
    } else {
      setAgeGroups((current) => [...(current || []), { id: Date.now().toString(), ...data } as AgeGroup]);
      toast.success('Escalão adicionado com sucesso');
    }
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleDeleteAgeGroup = (id: string) => {
    setAgeGroups((current) => (current || []).filter((item) => item.id !== id));
    toast.success('Escalão removido com sucesso');
  };

  const handleSaveUserType = (data: Partial<UserType>) => {
    if (editingItem?.id) {
      setUserTypes((current) =>
        (current || []).map((item) => (item.id === editingItem.id ? { ...item, ...data } : item))
      );
      toast.success('Tipo de utilizador atualizado com sucesso');
    } else {
      setUserTypes((current) => [...(current || []), { id: Date.now().toString(), ...data } as UserType]);
      toast.success('Tipo de utilizador adicionado com sucesso');
    }
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleDeleteUserType = (id: string) => {
    setUserTypes((current) => (current || []).filter((item) => item.id !== id));
    toast.success('Tipo de utilizador removido com sucesso');
  };

  const handleSavePermission = (data: Partial<Permission>) => {
    if (editingItem?.id) {
      setPermissions((current) =>
        (current || []).map((item) => (item.id === editingItem.id ? { ...item, ...data } : item))
      );
      toast.success('Permissão atualizada com sucesso');
    } else {
      setPermissions((current) => [...(current || []), { id: Date.now().toString(), ...data } as Permission]);
      toast.success('Permissão adicionada com sucesso');
    }
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleDeletePermission = (id: string) => {
    setPermissions((current) => (current || []).filter((item) => item.id !== id));
    toast.success('Permissão removida com sucesso');
  };

  const handleSaveArticle = (data: Partial<Article>) => {
    if (editingItem?.id) {
      setArticles((current) =>
        (current || []).map((item) => (item.id === editingItem.id ? { ...item, ...data } : item))
      );
      toast.success('Artigo atualizado com sucesso');
    } else {
      setArticles((current) => [...(current || []), { id: Date.now().toString(), ...data } as Article]);
      toast.success('Artigo adicionado com sucesso');
    }
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleDeleteArticle = (id: string) => {
    setArticles((current) => (current || []).filter((item) => item.id !== id));
    toast.success('Artigo removido com sucesso');
  };

  const handleSaveMonthlyFee = (data: Partial<MonthlyFee>) => {
    if (editingItem?.id) {
      setMonthlyFees((current) =>
        (current || []).map((item) => (item.id === editingItem.id ? { ...item, ...data } : item))
      );
      toast.success('Mensalidade atualizada com sucesso');
    } else {
      setMonthlyFees((current) => [...(current || []), { id: Date.now().toString(), ...data } as MonthlyFee]);
      toast.success('Mensalidade adicionada com sucesso');
    }
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleDeleteMonthlyFee = (id: string) => {
    setMonthlyFees((current) => (current || []).filter((item) => item.id !== id));
    toast.success('Mensalidade removida com sucesso');
  };

  const handleSaveCostCenter = (data: Partial<CentroCusto>) => {
    if (editingItem?.id) {
      setCostCenters((current) =>
        (current || []).map((item) => (item.id === editingItem.id ? { ...item, ...data } : item))
      );
      toast.success('Centro de custos atualizado com sucesso');
    } else {
      const newCostCenter: CentroCusto = {
        id: crypto.randomUUID(),
        nome: data.nome || '',
        tipo: data.tipo || 'departamento',
        descricao: data.descricao,
        orcamento: data.orcamento,
        ativo: data.ativo !== undefined ? data.ativo : true,
        created_at: new Date().toISOString(),
      };
      setCostCenters((current) => [...(current || []), newCostCenter]);
      toast.success('Centro de custos adicionado com sucesso');
    }
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleDeleteCostCenter = (id: string) => {
    setCostCenters((current) => (current || []).filter((item) => item.id !== id));
    toast.success('Centro de custos removido com sucesso');
  };

  const handleSaveProva = (data: Partial<Prova>) => {
    if (editingItem?.id) {
      setProvas((current) =>
        (current || []).map((item) => (item.id === editingItem.id ? { ...item, ...data } : item))
      );
      toast.success('Prova atualizada com sucesso');
    } else {
      setProvas((current) => [...(current || []), { id: crypto.randomUUID(), ...data } as Prova]);
      toast.success('Prova adicionada com sucesso');
    }
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleDeleteProva = (id: string) => {
    setProvas((current) => (current || []).filter((item) => item.id !== id));
    toast.success('Prova removida com sucesso');
  };

  const handleSaveSupplier = (data: Partial<Supplier>) => {
    if (editingItem?.id) {
      setSuppliers((current) =>
        (current || []).map((item) => (item.id === editingItem.id ? { ...item, ...data } : item))
      );
      toast.success('Fornecedor atualizado com sucesso');
    } else {
      setSuppliers((current) => [...(current || []), { id: crypto.randomUUID(), ...data } as Supplier]);
      toast.success('Fornecedor adicionado com sucesso');
    }
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers((current) => (current || []).filter((item) => item.id !== id));
    toast.success('Fornecedor removido com sucesso');
  };

  const handleSaveClubInfo = () => {
    setClubInfo(clubFormData);
    toast.success('Informações do clube atualizadas com sucesso');
  };

  const handleClubFormChange = (field: keyof ClubInfo, value: string) => {
    setClubFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationToggle = (field: keyof NotificationPreferences) => {
    setNotificationPrefs((current) => {
      const currentPrefs = current || {
        emailNotifications: true,
        paymentAlerts: true,
        activityAlerts: true
      };
      return {
        ...currentPrefs,
        [field]: !currentPrefs[field]
      };
    });
  };

  useEffect(() => {
    if (clubInfo) {
      setClubFormData(clubInfo);
    }
  }, [clubInfo]);

  const handleViewDatabase = async () => {
    const keys = await window.spark.kv.keys();
    setDbKeys(keys);
    setShowDbDialog(true);
  };

  const handleExportUsers = async () => {
    const usersData = await window.spark.kv.get<User[]>('club-users');
    const dataStr = JSON.stringify(usersData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-backup-${new Date().toISOString()}.json`;
    link.click();
    toast.success('Dados exportados com sucesso');
  };

  const openEditDialog = (item: any, type: string) => {
    setEditingItem({ ...item, type });
    setDialogOpen(true);
  };

  const openAddDialog = (type: string) => {
    setEditingItem({ type });
    setDialogOpen(true);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerir definições do sistema</p>
        </div>
        {currentTab === 'club' && (
          <Button onClick={handleSaveClubInfo} size="sm">
            <FloppyDisk className="mr-2" size={16} />
            Guardar Alterações
          </Button>
        )}
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <div className="w-full overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto sm:grid sm:w-full sm:grid-cols-6 h-9 text-sm min-w-full sm:min-w-0">
            <TabsTrigger value="general" className="text-sm whitespace-nowrap px-3 sm:px-2">Geral</TabsTrigger>
            <TabsTrigger value="club" className="text-sm whitespace-nowrap px-3 sm:px-2">Clube</TabsTrigger>
            <TabsTrigger value="financial" className="text-sm whitespace-nowrap px-3 sm:px-2">Financeiro</TabsTrigger>
            <TabsTrigger value="logistics" className="text-sm whitespace-nowrap px-3 sm:px-2">Logística</TabsTrigger>
            <TabsTrigger value="notifications" className="text-sm whitespace-nowrap px-3 sm:px-2">Notificações</TabsTrigger>
            <TabsTrigger value="database" className="text-sm whitespace-nowrap px-3 sm:px-2">Base de Dados</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="mt-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Escalões</CardTitle>
                <CardDescription className="text-sm">Gerir os escalões etários do clube</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-3">
                  <Button onClick={() => openAddDialog('age-group')} size="sm">
                    <Plus className="mr-2" size={16} />
                    Adicionar Escalão
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Idade Mínima</TableHead>
                      <TableHead>Idade Máxima</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(ageGroups || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Nenhum escalão cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      (ageGroups || []).map((group) => (
                        <TableRow key={group.id}>
                          <TableCell className="font-medium">{group.name}</TableCell>
                          <TableCell>{group.minAge} anos</TableCell>
                          <TableCell>{group.maxAge} anos</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(group, 'age-group')}
                              >
                                <Pencil />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteAgeGroup(group.id)}
                              >
                                <Trash />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Tipos de Utilizador</CardTitle>
                <CardDescription className="text-sm">Gerir os tipos de utilizadores do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-3">
                  <Button onClick={() => openAddDialog('user-type')} size="sm">
                    <Plus className="mr-2" size={16} />
                    Adicionar Tipo
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(userTypes || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Nenhum tipo de utilizador cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      (userTypes || []).map((type) => (
                        <TableRow key={type.id}>
                          <TableCell className="font-medium">{type.name}</TableCell>
                          <TableCell>{type.description}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(type, 'user-type')}
                              >
                                <Pencil />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteUserType(type.id)}
                              >
                                <Trash />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Permissões por Tipo de Utilizador</CardTitle>
                <CardDescription className="text-sm">Definir permissões de acesso para cada tipo de utilizador</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-3">
                  <Button onClick={() => openAddDialog('permission')} size="sm">
                    <Plus className="mr-2" size={16} />
                    Adicionar Permissão
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo de Utilizador</TableHead>
                      <TableHead>Módulo</TableHead>
                      <TableHead>Ver</TableHead>
                      <TableHead>Editar</TableHead>
                      <TableHead>Eliminar</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(permissions || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Nenhuma permissão cadastrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      (permissions || []).map((perm) => {
                        const userType = (userTypes || []).find((t) => t.id === perm.userTypeId);
                        return (
                          <TableRow key={perm.id}>
                            <TableCell className="font-medium">{userType?.name || 'N/A'}</TableCell>
                            <TableCell>{perm.module}</TableCell>
                            <TableCell>{perm.canView ? '✓' : '✗'}</TableCell>
                            <TableCell>{perm.canEdit ? '✓' : '✗'}</TableCell>
                            <TableCell>{perm.canDelete ? '✓' : '✗'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(perm, 'permission')}
                                >
                                  <Pencil />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeletePermission(perm.id)}
                                >
                                  <Trash />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Provas</CardTitle>
                <CardDescription className="text-sm">Gerir as provas disponíveis para registar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-3">
                  <Button onClick={() => openAddDialog('prova')} size="sm">
                    <Plus className="mr-2" size={16} />
                    Adicionar Prova
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Distância</TableHead>
                      <TableHead>Modalidade</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(provas || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Nenhuma prova cadastrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      (provas || []).map((prova) => (
                        <TableRow key={prova.id}>
                          <TableCell className="font-medium">{prova.name}</TableCell>
                          <TableCell>
                            {prova.distancia} {prova.unidade === 'metros' ? 'm' : 'km'}
                          </TableCell>
                          <TableCell>{prova.modalidade}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(prova, 'prova')}
                              >
                                <Pencil />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteProva(prova.id)}
                              >
                                <Trash />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="club" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Informações do Clube</CardTitle>
              <CardDescription className="text-sm">Dados da associação e clube</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="club-name">Nome do Clube</Label>
                <Input
                  id="club-name"
                  placeholder="Nome do Clube de Natação"
                  value={clubFormData.name || clubInfo?.name || ''}
                  onChange={(e) => handleClubFormChange('name', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="club-nif">NIF</Label>
                <Input
                  id="club-nif"
                  placeholder="Número de Identificação Fiscal"
                  value={clubFormData.nif || clubInfo?.nif || ''}
                  onChange={(e) => handleClubFormChange('nif', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="club-address">Morada</Label>
                <Input
                  id="club-address"
                  placeholder="Morada do clube"
                  value={clubFormData.address || clubInfo?.address || ''}
                  onChange={(e) => handleClubFormChange('address', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="club-phone">Telefone</Label>
                <Input
                  id="club-phone"
                  placeholder="+351 ..."
                  value={clubFormData.phone || clubInfo?.phone || ''}
                  onChange={(e) => handleClubFormChange('phone', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="club-email">Email</Label>
                <Input
                  id="club-email"
                  type="email"
                  placeholder="contacto@clube.pt"
                  value={clubFormData.email || clubInfo?.email || ''}
                  onChange={(e) => handleClubFormChange('email', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="mt-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Mensalidades</CardTitle>
                <CardDescription className="text-sm">Gerir os valores das mensalidades por escalão</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-3">
                  <Button onClick={() => openAddDialog('monthly-fee')} size="sm">
                    <Plus className="mr-2" size={16} />
                    Adicionar Mensalidade
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Escalão</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(monthlyFees || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Nenhuma mensalidade cadastrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      (monthlyFees || []).map((fee) => {
                        const ageGroup = (ageGroups || []).find((g) => g.id === fee.ageGroupId);
                        return (
                          <TableRow key={fee.id}>
                            <TableCell className="font-medium">{fee.name}</TableCell>
                            <TableCell>{ageGroup?.name || 'N/A'}</TableCell>
                            <TableCell>€{fee.amount.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(fee, 'monthly-fee')}
                                >
                                  <Pencil />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteMonthlyFee(fee.id)}
                                >
                                  <Trash />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Centros de Custos</CardTitle>
                <CardDescription className="text-sm">Gerir os centros de custos para controle financeiro</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-3">
                  <Button onClick={() => openAddDialog('cost-center')} size="sm">
                    <Plus className="mr-2" size={16} />
                    Adicionar Centro de Custos
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(costCenters || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Nenhum centro de custos cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      (costCenters || []).map((center) => (
                        <TableRow key={center.id}>
                          <TableCell className="font-medium">{center.nome}</TableCell>
                          <TableCell>{center.tipo}</TableCell>
                          <TableCell>{center.descricao || '-'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(center, 'cost-center')}
                              >
                                <Pencil />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteCostCenter(center.id)}
                              >
                                <Trash />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logistics" className="mt-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Artigos</CardTitle>
                <CardDescription className="text-sm">Gerir o catálogo de artigos do clube</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-3">
                  <Button onClick={() => openAddDialog('article')} size="sm">
                    <Plus className="mr-2" size={16} />
                    Adicionar Artigo
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(articles || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Nenhum artigo cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      (articles || []).map((article) => (
                        <TableRow key={article.id}>
                          <TableCell className="font-medium">{article.code}</TableCell>
                          <TableCell>{article.name}</TableCell>
                          <TableCell>{article.category}</TableCell>
                          <TableCell>€{article.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(article, 'article')}
                              >
                                <Pencil />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteArticle(article.id)}
                              >
                                <Trash />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Fornecedores</CardTitle>
                <CardDescription className="text-sm">Gerir fornecedores e parceiros do clube</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-3">
                  <Button onClick={() => openAddDialog('supplier')} size="sm">
                    <Plus className="mr-2" size={16} />
                    Adicionar Fornecedor
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>NIF</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(suppliers || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Nenhum fornecedor cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      (suppliers || []).map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell className="font-medium">{supplier.name}</TableCell>
                          <TableCell>{supplier.nif}</TableCell>
                          <TableCell>{supplier.email}</TableCell>
                          <TableCell>{supplier.phone}</TableCell>
                          <TableCell>{supplier.category}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(supplier, 'supplier')}
                              >
                                <Pencil />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteSupplier(supplier.id)}
                              >
                                <Trash />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Preferências de Notificações</CardTitle>
              <CardDescription className="text-sm">Gerir notificações por email e SMS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-base font-medium">
                    Notificações por Email
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações por email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notificationPrefs?.emailNotifications ?? true}
                  onCheckedChange={() => handleNotificationToggle('emailNotifications')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="payment-alerts" className="text-base font-medium">
                    Alertas de Pagamentos
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre novos pagamentos
                  </p>
                </div>
                <Switch
                  id="payment-alerts"
                  checked={notificationPrefs?.paymentAlerts ?? true}
                  onCheckedChange={() => handleNotificationToggle('paymentAlerts')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="activity-alerts" className="text-base font-medium">
                    Alertas de Atividades
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre novas atividades
                  </p>
                </div>
                <Switch
                  id="activity-alerts"
                  checked={notificationPrefs?.activityAlerts ?? true}
                  onCheckedChange={() => handleNotificationToggle('activityAlerts')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="mt-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Utilizadores na Base de Dados</CardTitle>
                <CardDescription className="text-sm">
                  Verificação da persistência dos dados de utilizadores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <Button onClick={handleViewDatabase} size="sm">
                    <Database className="mr-2" size={16} />
                    Ver Todas as Chaves
                  </Button>
                  <Button onClick={handleExportUsers} variant="outline" size="sm">
                    <FloppyDisk className="mr-2" size={16} />
                    Exportar Utilizadores
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">
                      Total de utilizadores: {(users || []).length}
                    </Label>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nº Sócio</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Perfil</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(users || []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            Nenhum utilizador encontrado na base de dados
                          </TableCell>
                        </TableRow>
                      ) : (
                        (users || []).map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.numero_socio}</TableCell>
                            <TableCell>{user.nome_completo}</TableCell>
                            <TableCell>{user.email_utilizador}</TableCell>
                            <TableCell>{user.perfil}</TableCell>
                            <TableCell>{user.estado}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showDbDialog} onOpenChange={setShowDbDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chaves na Base de Dados</DialogTitle>
            <DialogDescription>
              Total de {dbKeys.length} chaves armazenadas
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <ul className="space-y-1 text-sm font-mono">
              {dbKeys.map((key) => (
                <li key={key} className="p-2 bg-muted rounded">
                  {key}
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      <EditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingItem={editingItem}
        onSave={{
          'age-group': handleSaveAgeGroup,
          'user-type': handleSaveUserType,
          'permission': handleSavePermission,
          'article': handleSaveArticle,
          'supplier': handleSaveSupplier,
          'monthly-fee': handleSaveMonthlyFee,
          'cost-center': handleSaveCostCenter,
          'prova': handleSaveProva,
        }}
        userTypes={userTypes || []}
        ageGroups={ageGroups || []}
      />
    </div>
  );
}

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: any;
  onSave: Record<string, (data: any) => void>;
  userTypes: UserType[];
  ageGroups: AgeGroup[];
}

function EditDialog({ open, onOpenChange, editingItem, onSave, userTypes, ageGroups }: EditDialogProps) {
  const [formData, setFormData] = useState<any>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem?.type && onSave[editingItem.type]) {
      onSave[editingItem.type](formData);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  if (!editingItem) return null;

  const isEditing = !!editingItem.id;
  const type = editingItem.type;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar' : 'Adicionar'}{' '}
              {type === 'age-group' && 'Escalão'}
              {type === 'user-type' && 'Tipo de Utilizador'}
              {type === 'permission' && 'Permissão'}
              {type === 'article' && 'Artigo'}
              {type === 'supplier' && 'Fornecedor'}
              {type === 'monthly-fee' && 'Mensalidade'}
              {type === 'cost-center' && 'Centro de Custos'}
              {type === 'prova' && 'Prova'}
            </DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para{' '}
              {isEditing ? 'atualizar' : 'adicionar'} o registo.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {type === 'age-group' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    defaultValue={editingItem.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="minAge">Idade Mínima</Label>
                    <Input
                      id="minAge"
                      type="number"
                      defaultValue={editingItem.minAge}
                      onChange={(e) => handleChange('minAge', parseInt(e.target.value))}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="maxAge">Idade Máxima</Label>
                    <Input
                      id="maxAge"
                      type="number"
                      defaultValue={editingItem.maxAge}
                      onChange={(e) => handleChange('maxAge', parseInt(e.target.value))}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {type === 'user-type' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    defaultValue={editingItem.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    defaultValue={editingItem.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {type === 'permission' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="userTypeId">Tipo de Utilizador</Label>
                  <select
                    id="userTypeId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    defaultValue={editingItem.userTypeId}
                    onChange={(e) => handleChange('userTypeId', e.target.value)}
                    required
                  >
                    <option value="">Selecione...</option>
                    {userTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="module">Módulo</Label>
                  <Input
                    id="module"
                    defaultValue={editingItem.module}
                    onChange={(e) => handleChange('module', e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="canView"
                      defaultChecked={editingItem.canView}
                      onChange={(e) => handleChange('canView', e.target.checked)}
                    />
                    <Label htmlFor="canView">Ver</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="canEdit"
                      defaultChecked={editingItem.canEdit}
                      onChange={(e) => handleChange('canEdit', e.target.checked)}
                    />
                    <Label htmlFor="canEdit">Editar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="canDelete"
                      defaultChecked={editingItem.canDelete}
                      onChange={(e) => handleChange('canDelete', e.target.checked)}
                    />
                    <Label htmlFor="canDelete">Eliminar</Label>
                  </div>
                </div>
              </>
            )}

            {type === 'article' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    defaultValue={editingItem.code}
                    onChange={(e) => handleChange('code', e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    defaultValue={editingItem.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    defaultValue={editingItem.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Preço (€)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    defaultValue={editingItem.price}
                    onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                    required
                  />
                </div>
              </>
            )}

            {type === 'supplier' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    defaultValue={editingItem.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nif">NIF</Label>
                  <Input
                    id="nif"
                    defaultValue={editingItem.nif}
                    onChange={(e) => handleChange('nif', e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={editingItem.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    defaultValue={editingItem.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Morada</Label>
                  <Input
                    id="address"
                    defaultValue={editingItem.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    placeholder="Ex: Material desportivo, Equipamento, Serviços"
                    defaultValue={editingItem.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {type === 'monthly-fee' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    defaultValue={editingItem.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ageGroupId">Escalão</Label>
                  <select
                    id="ageGroupId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    defaultValue={editingItem.ageGroupId}
                    onChange={(e) => handleChange('ageGroupId', e.target.value)}
                    required
                  >
                    <option value="">Selecione...</option>
                    {ageGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Valor (€)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    defaultValue={editingItem.amount}
                    onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
                    required
                  />
                </div>
              </>
            )}

            {type === 'cost-center' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    defaultValue={editingItem.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select 
                    defaultValue={editingItem.tipo || 'departamento'} 
                    onValueChange={(v) => handleChange('tipo', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equipa">Equipa</SelectItem>
                      <SelectItem value="departamento">Departamento</SelectItem>
                      <SelectItem value="pessoa">Pessoa</SelectItem>
                      <SelectItem value="projeto">Projeto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    defaultValue={editingItem.descricao}
                    onChange={(e) => handleChange('descricao', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="orcamento">Orçamento (€)</Label>
                  <Input
                    id="orcamento"
                    type="number"
                    step="0.01"
                    defaultValue={editingItem.orcamento}
                    onChange={(e) => handleChange('orcamento', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </>
            )}

            {type === 'prova' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome da Prova</Label>
                  <Input
                    id="name"
                    defaultValue={editingItem.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="modalidade">Modalidade</Label>
                  <Input
                    id="modalidade"
                    placeholder="Ex: Natação, Atletismo, etc."
                    defaultValue={editingItem.modalidade}
                    onChange={(e) => handleChange('modalidade', e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="distancia">Distância</Label>
                    <Input
                      id="distancia"
                      type="number"
                      step="0.01"
                      defaultValue={editingItem.distancia}
                      onChange={(e) => handleChange('distancia', parseFloat(e.target.value))}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unidade">Unidade</Label>
                    <Select 
                      defaultValue={editingItem.unidade || 'metros'} 
                      onValueChange={(v) => handleChange('unidade', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metros">Metros</SelectItem>
                        <SelectItem value="quilometros">Quilómetros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <FloppyDisk className="mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
