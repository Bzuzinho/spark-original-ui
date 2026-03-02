import { useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import { Switch } from '@/Components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { UserCircle, MapPin, Phone, Briefcase } from 'lucide-react';

interface PersonalTabProps {
  user: any;
  onChange: (field: string, value: any) => void;
  isAdmin: boolean;
  allUsers: any[];
  userTypes?: Array<{ id: string; name: string; description: string }>;
  onNavigateToUser?: (userId: string) => void;
}

const extractDateString = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value?.date && typeof value.date === 'string') return value.date;
  if (value instanceof Date) return value.toISOString();
  return '';
};

const getUserAge = (birthDate: string): number | null => {
  if (!birthDate) return null;
  const normalized = birthDate.includes('T') ? birthDate.split('T')[0] : birthDate;
  const today = new Date();
  const birth = new Date(normalized);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const formatDateForInput = (value?: any): string => {
  const raw = extractDateString(value);
  if (!raw) return '';
  if (raw.includes('T')) return raw.split('T')[0];
  if (raw.includes(' ')) return raw.split(' ')[0];
  return raw;
};

export function PersonalTab({ user, allUsers, onChange, isAdmin, userTypes = [], onNavigateToUser }: PersonalTabProps) {
  const page = usePage();
  const resolvedUserTypes = userTypes.length > 0
    ? userTypes
    : ((page.props as any)?.userTypes || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        onChange('foto_perfil', result);
        toast.success('Foto de perfil atualizada!');
      }
    };
    reader.onerror = () => {
      toast.error('Erro ao carregar a imagem');
    };
    reader.readAsDataURL(file);
    
    if (event.target) {
      event.target.value = '';
    }
  };

  const availableGuardians = allUsers.filter(u => {
    if (u.id === user.id) return false;
    if (!u.tipo_membro || !Array.isArray(u.tipo_membro)) return false;
    
    return u.tipo_membro.some((tipo: string) => {
      const normalized = tipo.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\s_-]+/g, '_');
      
      return normalized.includes('encarregado') && normalized.includes('educacao');
    });
  });

  const isMinorUser = (candidate: any): boolean => {
    if (candidate?.menor === true) return true;
    const birthDate = formatDateForInput(candidate?.data_nascimento);
    const age = birthDate ? getUserAge(birthDate) : null;
    return age !== null && age < 18;
  };

  const availableAthletes = allUsers.filter(u => {
    if (u.id === user.id) return false;
    return isMinorUser(u);
  });

  const isGuardian = user.tipo_membro?.some((tipo: string) => {
    const normalized = tipo.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\s_-]+/g, '_');
    return normalized.includes('encarregado') && normalized.includes('educacao');
  }) || false;

  const normalizedBirthDate = formatDateForInput(user.data_nascimento);
  const userAge = normalizedBirthDate ? getUserAge(normalizedBirthDate) : null;

  return (
    <div className="space-y-1">
      {/* Linha 1: Perfil e Tipo de Membro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
        {/* Perfil e Dados Básicos */}
        <Card className="p-2">
          <div className="flex gap-2">
            <div className="flex flex-col items-center gap-1">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.foto_perfil} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(user.nome_completo || 'U')}
                </AvatarFallback>
              </Avatar>
              {isAdmin && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm" 
                    onClick={handleUploadClick}
                    className="h-6 text-xs"
                  >
                    Upload
                  </Button>
                </>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div>
                <Label htmlFor="nome_completo" className="text-xs">Nome Completo *</Label>
                <Input
                  id="nome_completo"
                  value={user.nome_completo}
                  onChange={(e) => onChange('nome_completo', e.target.value)}
                  disabled={!isAdmin}
                  className="h-7 text-xs bg-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div>
                  <Label htmlFor="numero_socio" className="text-xs">Nº Sócio</Label>
                  <Input
                    id="numero_socio"
                    value={user.numero_socio}
                    disabled
                    className="h-7 text-xs bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="nif" className="text-xs">NIF</Label>
                  <Input
                    id="nif"
                    value={user.nif || ''}
                    onChange={(e) => onChange('nif', e.target.value)}
                    disabled={!isAdmin}
                    className="h-7 text-xs bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="cc" className="text-xs">CC</Label>
                  <Input
                    id="cc"
                    value={user.cc || ''}
                    onChange={(e) => onChange('cc', e.target.value)}
                    disabled={!isAdmin}
                    className="h-7 text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tipo de Membro */}
        <Card className="p-2">
          <h3 className="text-xs font-semibold mb-1">Tipo de Membro *</h3>
          <div className="grid grid-cols-3 gap-2">
            {/* Coluna 1 e 2: Checkboxes dos tipos */}
            <div className="col-span-2 grid grid-cols-2 gap-x-2 gap-y-0.5">
              {resolvedUserTypes && resolvedUserTypes.length > 0 ? (
                resolvedUserTypes.map((tipo) => {
                  const displayName = tipo?.nome || tipo?.name || '';
                  const typeMapping: Record<string, string> = {
                    'Atleta': 'atleta',
                    'Encarregado de Educação': 'encarregado_educacao',
                    'Treinador': 'treinador',
                    'Dirigente': 'dirigente',
                    'Sócio': 'socio',
                    'Funcionario': 'funcionario',
                    'Funcionário': 'funcionario',
                  };
                  const normalizedName = displayName
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/\s+/g, '_');
                  const tipoValue = typeMapping[displayName] || normalizedName;

                  return (
                    <div key={tipo.id} className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        id={`tipo_${tipo.id}`}
                        checked={user.tipo_membro?.includes(tipoValue as any) || false}
                        onChange={(e) => {
                          const currentTypes = user.tipo_membro || [];
                          if (e.target.checked) {
                            onChange('tipo_membro', [...currentTypes, tipoValue]);
                          } else {
                            onChange('tipo_membro', currentTypes.filter((t: string) => t !== tipoValue));
                          }
                        }}
                        disabled={!isAdmin}
                        className="h-3 w-3 rounded"
                      />
                      <Label htmlFor={`tipo_${tipo.id}`} className="font-normal cursor-pointer text-xs">
                        {displayName || 'Tipo'}
                      </Label>
                    </div>
                  );
                })
              ) : (
                <p className="col-span-2 text-xs text-muted-foreground">Nenhum tipo configurado</p>
              )}
            </div>

            {/* Coluna 3: Menor de Idade */}
            <div className="flex items-start">
              <div className="flex flex-col items-center justify-between p-1.5 border rounded bg-slate-50 h-full w-full">
                <div className="text-center">
                  <Label htmlFor="menor" className="text-xs block">Menor de Idade</Label>
                  <p className="text-xs text-muted-foreground leading-tight">Ativa campos de encarregado</p>
                </div>
                <Switch
                  id="menor"
                  checked={user.menor}
                  onCheckedChange={(checked) => onChange('menor', checked)}
                  disabled={!isAdmin}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Linha 2: Informações Pessoais, Localização e Contacto */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
        {/* Informações Pessoais */}
        <Card className="p-2">
          <h3 className="text-xs font-semibold mb-1 flex items-center gap-1">
            <UserCircle size={14} />
            Informações Pessoais
          </h3>
          <div className="grid grid-cols-2 gap-1">
            <div>
              <Label htmlFor="data_nascimento" className="text-xs">Data Nascimento {userAge !== null && `(${userAge}a)`}</Label>
              <Input
                id="data_nascimento"
                type="date"
                value={normalizedBirthDate}
                onChange={(e) => onChange('data_nascimento', e.target.value)}
                disabled={!isAdmin}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="h-7 text-xs bg-white"
              />
            </div>
            <div>
              <Label htmlFor="nacionalidade" className="text-xs">Nacionalidade</Label>
              <Input
                id="nacionalidade"
                value={user.nacionalidade || ''}
                onChange={(e) => onChange('nacionalidade', e.target.value)}
                disabled={!isAdmin}
                placeholder="Portuguesa"
                className="h-7 text-xs bg-white"
              />
            </div>

            <div>
              <Label htmlFor="estado_civil" className="text-xs">Est. Civil</Label>
              <Select
                value={user.estado_civil || undefined}
                onValueChange={(value) => onChange('estado_civil', value)}
                disabled={!isAdmin}
              >
                <SelectTrigger id="estado_civil" className="h-7 text-xs bg-white">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solteiro">Solteiro/a</SelectItem>
                  <SelectItem value="casado">Casado/a</SelectItem>
                  <SelectItem value="divorciado">Divorciado/a</SelectItem>
                  <SelectItem value="viuvo">Viúvo/a</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Sexo</Label>
              <RadioGroup
                value={user.sexo}
                onValueChange={(value) => onChange('sexo', value)}
                className="flex gap-2 pt-1"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="masculino" id="masculino" className="h-3 w-3" />
                  <Label htmlFor="masculino" className="text-xs">M</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="feminino" id="feminino" className="h-3 w-3" />
                  <Label htmlFor="feminino" className="text-xs">F</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="col-span-2">
              <Label className="text-xs">Estado</Label>
              <RadioGroup
                value={user.estado}
                onValueChange={(value) => onChange('estado', value)}
                className="flex gap-2 mt-1"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="ativo" id="ativo" className="h-3 w-3" />
                  <Label htmlFor="ativo" className="text-xs">Ativo</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="inativo" id="inativo" className="h-3 w-3" />
                  <Label htmlFor="inativo" className="text-xs">Inativo</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="suspenso" id="suspenso" className="h-3 w-3" />
                  <Label htmlFor="suspenso" className="text-xs">Suspenso</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </Card>

        {/* Localização */}
        <Card className="p-2">
          <h3 className="text-xs font-semibold mb-1 flex items-center gap-1">
            <MapPin size={14} />
            Localização
          </h3>
          <div className="grid grid-cols-2 gap-1">
            <div className="col-span-2">
              <Label htmlFor="morada" className="text-xs">Morada</Label>
              <Input
                id="morada"
                value={user.morada || ''}
                onChange={(e) => onChange('morada', e.target.value)}
                disabled={!isAdmin}
                className="h-7 text-xs bg-white"
              />
            </div>
            <div>
              <Label htmlFor="codigo_postal" className="text-xs">Cód. Postal</Label>
              <Input
                id="codigo_postal"
                value={user.codigo_postal || ''}
                onChange={(e) => onChange('codigo_postal', e.target.value)}
                disabled={!isAdmin}
                className="h-7 text-xs bg-white"
              />
            </div>
            <div>
              <Label htmlFor="localidade" className="text-xs">Localidade</Label>
              <Input
                id="localidade"
                value={user.localidade || ''}
                onChange={(e) => onChange('localidade', e.target.value)}
                disabled={!isAdmin}
                className="h-7 text-xs bg-white"
              />
            </div>
          </div>
        </Card>

        {/* Contacto */}
        <Card className="p-2">
          <h3 className="text-xs font-semibold mb-1 flex items-center gap-1">
            <Phone size={14} />
            Contacto
          </h3>
          <div className="grid grid-cols-2 gap-1">
            <div>
              <Label htmlFor="contacto_telefonico" className="text-xs">Telefone</Label>
              <Input
                id="contacto_telefonico"
                value={user.contacto_telefonico || ''}
                onChange={(e) => onChange('contacto_telefonico', e.target.value)}
                disabled={!isAdmin}
                className="h-7 text-xs bg-white"
              />
            </div>
            <div>
              <Label htmlFor="email_secundario" className="text-xs">Email Secundário</Label>
              <Input
                id="email_secundario"
                type="email"
                value={user.email_secundario || ''}
                onChange={(e) => onChange('email_secundario', e.target.value)}
                disabled={!isAdmin}
                className="h-7 text-xs bg-white"
              />
            </div>
            <div>
              <Label htmlFor="numero_irmaos" className="text-xs">Nº Irmãos</Label>
              <Input
                id="numero_irmaos"
                type="number"
                value={user.numero_irmaos || ''}
                onChange={(e) => onChange('numero_irmaos', parseInt(e.target.value) || 0)}
                disabled={!isAdmin}
                min="0"
                className="h-7 text-xs bg-white"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Linha 3: Profissão e Educação + Relações Familiares */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
        {/* Profissão e Educação */}
        <Card className="p-2">
          <h3 className="text-xs font-semibold mb-1 flex items-center gap-1">
            <Briefcase size={14} />
            Profissão e Educação
          </h3>
          <div className="space-y-1">
            <div>
              <Label htmlFor="ocupacao" className="text-xs">Ocupação</Label>
              <Input
                id="ocupacao"
                value={user.ocupacao || ''}
                onChange={(e) => onChange('ocupacao', e.target.value)}
                disabled={!isAdmin}
                className="h-7 text-xs bg-white"
              />
            </div>
            <div>
              <Label htmlFor="empresa" className="text-xs">Empresa</Label>
              <Input
                id="empresa"
                value={user.empresa || ''}
                onChange={(e) => onChange('empresa', e.target.value)}
                disabled={!isAdmin}
                className="h-7 text-xs bg-white"
              />
            </div>
            <div>
              <Label htmlFor="escola" className="text-xs">Escola</Label>
              <Input
                id="escola"
                value={user.escola || ''}
                onChange={(e) => onChange('escola', e.target.value)}
                disabled={!isAdmin}
                className="h-7 text-xs bg-white"
              />
            </div>
          </div>
        </Card>

        {/* Relações Familiares */}
        <div className="space-y-1">
          {/* Encarregado de Educação */}
          {user.menor && (
            <Card className="p-2">
              <h3 className="text-xs font-semibold mb-1">Encarregado de Educação</h3>
              {isAdmin && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs mb-1"
                  onClick={() => {
                    const currentGuardians = user.encarregado_educacao || [];
                    if (availableGuardians.length > 0) {
                      const firstAvailable = availableGuardians.find(
                        (g: any) => !currentGuardians.includes(g.id)
                      );
                      if (firstAvailable) {
                        onChange('encarregado_educacao', [...currentGuardians, firstAvailable.id]);
                        toast.success('Encarregado adicionado');
                      }
                    }
                  }}
                >
                  + Adicionar
                </Button>
              )}
              
              {user.encarregado_educacao && user.encarregado_educacao.length > 0 ? (
                <div className="space-y-1">
                  {user.encarregado_educacao.map((guardianId: string, index: number) => {
                    const guardian = allUsers.find((u: any) => u.id === guardianId);
                    return guardian ? (
                      <div key={guardianId} className="flex items-center justify-between p-2 border rounded text-xs">
                        <span>{guardian.nome_completo}</span>
                        {isAdmin && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => {
                              const currentGuardians = user.encarregado_educacao || [];
                              onChange('encarregado_educacao', currentGuardians.filter((_: string, i: number) => i !== index));
                            }}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Nenhum encarregado associado</p>
              )}
            </Card>
          )}

          {/* Educandos */}
          {isGuardian && (
            <Card className="p-2">
              <h3 className="text-xs font-semibold mb-1">Educandos</h3>
              {isAdmin && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs mb-1"
                  onClick={() => {
                    const currentEducandos = user.educandos || [];
                    if (availableAthletes.length > 0) {
                      const firstAvailable = availableAthletes.find(
                        (a: any) => !currentEducandos.includes(a.id)
                      );
                      if (firstAvailable) {
                        onChange('educandos', [...currentEducandos, firstAvailable.id]);
                        toast.success('Educando adicionado');
                      }
                    }
                  }}
                >
                  + Adicionar
                </Button>
              )}
              
              {user.educandos && user.educandos.length > 0 ? (
                <div className="space-y-1">
                  {user.educandos.map((educandoId: string, index: number) => {
                    const educando = allUsers.find((u: any) => u.id === educandoId);
                    return educando ? (
                      <div key={educandoId} className="flex items-center justify-between p-2 border rounded text-xs">
                        <span>{educando.nome_completo}</span>
                        {isAdmin && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => {
                              const currentEducandos = user.educandos || [];
                              onChange('educandos', currentEducandos.filter((_: string, i: number) => i !== index));
                            }}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Nenhum educando associado</p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
