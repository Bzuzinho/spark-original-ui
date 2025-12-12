import { useRef, useEffect } from 'react';
import { User } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload } from '@phosphor-icons/react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { getUserAge } from '@/lib/user-helpers';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';

interface PersonalTabProps {
  user: User;
  allUsers: User[];
  onChange: (field: keyof User, value: any) => void;
  isAdmin: boolean;
  onNavigateToUser?: (userId: string) => void;
}

export function PersonalTab({ user, allUsers, onChange, isAdmin, onNavigateToUser }: PersonalTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userTypes] = useKV<Array<{ id: string; name: string; description: string }>>('settings-user-types', []);

  useEffect(() => {
    console.log('🔄 [PersonalTab] Renderizando com usuário:', user.nome_completo, user.id);
    console.log('🔍 [PersonalTab] Educandos:', user.educandos);
    console.log('🔍 [PersonalTab] Encarregados:', user.encarregado_educacao);
  }, [user.id, user.nome_completo, user.educandos, user.encarregado_educacao]);

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

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem válido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange('foto_perfil', result);
      toast.success('Foto de perfil atualizada!');
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
    
    return u.tipo_membro.some(tipo => {
      const normalized = tipo.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\s_-]+/g, '_');
      
      return normalized.includes('encarregado') && normalized.includes('educacao');
    });
  });

  const availableAthletes = allUsers.filter(u => {
    if (u.id === user.id) return false;
    return u.menor;
  });

  const isAtleta = user.tipo_membro.includes('atleta');
  const isGuardian = user.tipo_membro.some(tipo => {
    const normalized = tipo.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\s_-]+/g, '_');
    return normalized.includes('encarregado') && normalized.includes('educacao');
  });

  useEffect(() => {
    console.log('🔍 [PersonalTab] isGuardian:', isGuardian, 'tipo_membro:', user.tipo_membro);
  }, [isGuardian, user.tipo_membro]);

  const userAge = user.data_nascimento ? getUserAge(user.data_nascimento) : null;

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row items-start gap-2">
        <div className="flex flex-col items-center gap-1">
          <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
            <AvatarImage src={user.foto_perfil} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm sm:text-lg">
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
                aria-label="Upload profile picture"
              />
              <Button 
                type="button"
                variant="outline" 
                size="sm" 
                onClick={handleUploadClick}
                className="h-6 text-xs px-1.5"
              >
                <Upload className="mr-1" size={12} />
                Upload
              </Button>
            </>
          )}
        </div>
        <div className="flex-1 w-full space-y-1.5">
          <div className="space-y-1">
            <Label htmlFor="nome_completo" className="text-xs">Nome Completo *</Label>
            <Input
              id="nome_completo"
              value={user.nome_completo}
              onChange={(e) => onChange('nome_completo', e.target.value)}
              disabled={!isAdmin}
              placeholder="Nome completo do membro"
              className="h-7 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
            <div className="space-y-1">
              <Label htmlFor="numero_socio" className="text-xs">Nº Sócio</Label>
              <Input
                id="numero_socio"
                value={user.numero_socio}
                disabled
                className="bg-muted h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="data_nascimento" className="text-xs">Nasc. {userAge !== null && `(${userAge}a)`}</Label>
              <div className="flex gap-1">
                <Input
                  id="data_nascimento"
                  type="date"
                  value={user.data_nascimento || ''}
                  onChange={(e) => onChange('data_nascimento', e.target.value)}
                  disabled={!isAdmin}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  min="1900-01-01"
                  className="flex-1 h-7 text-xs"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      disabled={!isAdmin}
                      type="button"
                      className="h-7 w-7 text-xs hidden sm:flex"
                    >
                      📅
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={user.data_nascimento ? new Date(user.data_nascimento) : undefined}
                      onSelect={(date) => onChange('data_nascimento', date ? format(date, 'yyyy-MM-dd') : '')}
                      disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="nif" className="text-xs">NIF</Label>
              <Input
                id="nif"
                value={user.nif || ''}
                onChange={(e) => onChange('nif', e.target.value)}
                disabled={!isAdmin}
                placeholder="000000000"
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cc" className="text-xs">CC</Label>
              <Input
                id="cc"
                value={user.cc || ''}
                onChange={(e) => onChange('cc', e.target.value)}
                disabled={!isAdmin}
                placeholder="00000000"
                className="h-7 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
        <div className="sm:col-span-2 space-y-1">
          <Label htmlFor="morada" className="text-xs">Morada</Label>
          <Input
            id="morada"
            value={user.morada || ''}
            onChange={(e) => onChange('morada', e.target.value)}
            disabled={!isAdmin}
            placeholder="Rua, número, andar"
            className="h-7 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="codigo_postal" className="text-xs">Cód. Postal</Label>
          <Input
            id="codigo_postal"
            value={user.codigo_postal || ''}
            onChange={(e) => onChange('codigo_postal', e.target.value)}
            disabled={!isAdmin}
            placeholder="0000-000"
            className="h-7 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        <div className="space-y-1">
          <Label htmlFor="localidade" className="text-xs">Localidade</Label>
          <Input
            id="localidade"
            value={user.localidade || ''}
            onChange={(e) => onChange('localidade', e.target.value)}
            disabled={!isAdmin}
            placeholder="Cidade"
            className="h-7 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="nacionalidade" className="text-xs">Nacionalidade</Label>
          <Input
            id="nacionalidade"
            value={user.nacionalidade || ''}
            onChange={(e) => onChange('nacionalidade', e.target.value)}
            disabled={!isAdmin}
            placeholder="Portuguesa"
            className="h-7 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="estado_civil" className="text-xs">Est. Civil</Label>
          <Select
            value={user.estado_civil || undefined}
            onValueChange={(value) => onChange('estado_civil', value)}
            disabled={!isAdmin}
          >
            <SelectTrigger id="estado_civil" className="h-7 text-xs">
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
        <div className="space-y-1">
          <Label className="text-xs">Sexo</Label>
          <RadioGroup
            value={user.sexo}
            onValueChange={(value) => onChange('sexo', value)}
            disabled={!isAdmin}
            className="flex gap-3 pt-0.5"
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
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Estado *</Label>
        <RadioGroup
          value={user.estado}
          onValueChange={(value) => onChange('estado', value)}
          disabled={!isAdmin}
          className="flex flex-wrap gap-3 pt-0.5"
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
        <div className="space-y-1">
          <Label htmlFor="contacto_telefonico" className="text-xs">Telefone</Label>
          <Input
            id="contacto_telefonico"
            value={user.contacto_telefonico || ''}
            onChange={(e) => onChange('contacto_telefonico', e.target.value)}
            disabled={!isAdmin}
            placeholder="+351 900 000 000"
            className="h-7 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email_secundario" className="text-xs">Email Secundário</Label>
          <Input
            id="email_secundario"
            type="email"
            value={user.email_secundario || ''}
            onChange={(e) => onChange('email_secundario', e.target.value)}
            disabled={!isAdmin}
            placeholder="email@exemplo.com"
            className="h-7 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="numero_irmaos" className="text-xs">Nº Irmãos</Label>
          <Input
            id="numero_irmaos"
            type="number"
            value={user.numero_irmaos || ''}
            onChange={(e) => onChange('numero_irmaos', parseInt(e.target.value) || 0)}
            disabled={!isAdmin}
            min="0"
            className="h-7 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
        <div className="space-y-1">
          <Label htmlFor="ocupacao" className="text-xs">Ocupação</Label>
          <Input
            id="ocupacao"
            value={user.ocupacao || ''}
            onChange={(e) => onChange('ocupacao', e.target.value)}
            disabled={!isAdmin}
            placeholder="Profissão ou atividade"
            className="h-7 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="empresa" className="text-xs">Empresa</Label>
          <Input
            id="empresa"
            value={user.empresa || ''}
            onChange={(e) => onChange('empresa', e.target.value)}
            disabled={!isAdmin}
            placeholder="Local de trabalho"
            className="h-7 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="escola" className="text-xs">Escola</Label>
          <Input
            id="escola"
            value={user.escola || ''}
            onChange={(e) => onChange('escola', e.target.value)}
            disabled={!isAdmin}
            placeholder="Instituição de ensino"
            className="h-7 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="tipo_membro" className="text-xs">Tipo de Membro *</Label>
          <div className="space-y-0.5">
            {userTypes && userTypes.length > 0 ? (
              userTypes.map((tipo) => {
                const typeMapping: Record<string, string> = {
                  'Atleta': 'atleta',
                  'Encarregado de Educação': 'encarregado_educacao',
                  'Treinador': 'treinador',
                  'Dirigente': 'dirigente',
                  'Sócio': 'socio',
                  'Funcionário': 'funcionario',
                };
                const tipoValue = typeMapping[tipo.name] || tipo.name.toLowerCase().replace(/\s+/g, '_');
                
                return (
                  <div key={tipo.id} className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      id={`tipo_${tipo.id}`}
                      checked={user.tipo_membro.includes(tipoValue as any)}
                      onChange={(e) => {
                        const currentTypes = user.tipo_membro;
                        if (e.target.checked) {
                          onChange('tipo_membro', [...currentTypes, tipoValue]);
                        } else {
                          onChange('tipo_membro', currentTypes.filter(t => t !== tipoValue));
                        }
                      }}
                      disabled={!isAdmin}
                      className="h-3 w-3 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                    <Label htmlFor={`tipo_${tipo.id}`} className="font-normal cursor-pointer text-xs">
                      {tipo.name}
                    </Label>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground">Nenhum tipo de utilizador configurado. Configure os tipos em Configurações.</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between p-1.5 border rounded-lg">
            <div className="space-y-0">
              <Label htmlFor="menor" className="text-xs">Menor de Idade</Label>
              <p className="text-xs text-muted-foreground">
                Ativa campos de encarregado
              </p>
            </div>
            <Switch
              id="menor"
              checked={user.menor}
              onCheckedChange={(checked) => onChange('menor', checked)}
              disabled={!isAdmin}
              className="scale-75"
            />
          </div>
        </div>
      </div>

      {user.menor && (
        <div className="space-y-1 p-1.5 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <Label htmlFor="encarregado_educacao" className="text-xs">Encarregado de Educação</Label>
            {isAdmin && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 text-xs px-2"
                onClick={() => {
                  const currentGuardians = user.encarregado_educacao || [];
                  if (availableGuardians.length > 0) {
                    const firstAvailable = availableGuardians.find(
                      g => !currentGuardians.includes(g.id)
                    );
                    if (firstAvailable) {
                      onChange('encarregado_educacao', [...currentGuardians, firstAvailable.id]);
                      toast.success('Encarregado adicionado');
                    } else {
                      toast.error('Todos os encarregados disponíveis já foram adicionados');
                    }
                  } else {
                    toast.error('Não há encarregados disponíveis');
                  }
                }}
              >
                + Adicionar
              </Button>
            )}
          </div>
          
          {user.encarregado_educacao && user.encarregado_educacao.length > 0 ? (
            <div className="space-y-1">
              {user.encarregado_educacao.map((guardianId, index) => {
                const guardian = allUsers.find(u => u.id === guardianId);
                const filteredGuardians = availableGuardians.filter(
                  g => !user.encarregado_educacao?.includes(g.id) || g.id === guardianId
                );
                
                return (
                  <div key={guardianId} className="space-y-1">
                    {guardian && (
                      <div className="flex items-center justify-between p-2 border rounded-lg hover:bg-accent/50 transition-colors group">
                        <button
                          type="button"
                          className="flex items-center gap-2 flex-1 cursor-pointer text-left min-w-0 hover:opacity-80 transition-opacity"
                          onClick={() => {
                            console.log('🖱️ [PersonalTab] Clique no encarregado:', guardianId, guardian?.nome_completo);
                            console.log('🔍 [PersonalTab] onNavigateToUser está definido?', !!onNavigateToUser);
                            if (onNavigateToUser) {
                              console.log('✅ [PersonalTab] Chamando onNavigateToUser com ID:', guardianId);
                              onNavigateToUser(guardianId);
                            } else {
                              console.error('❌ [PersonalTab] onNavigateToUser não está definido!');
                            }
                          }}
                        >
                          <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                            <AvatarImage src={guardian.foto_perfil} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(guardian.nome_completo)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{guardian.nome_completo}</p>
                            <p className="text-xs text-muted-foreground">Nº {guardian.numero_socio}</p>
                          </div>
                        </button>
                        {isAdmin && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Select
                              value={guardianId}
                              onValueChange={(value) => {
                                const currentGuardians = [...(user.encarregado_educacao || [])];
                                currentGuardians[index] = value;
                                onChange('encarregado_educacao', currentGuardians);
                              }}
                            >
                              <SelectTrigger className="h-7 w-20 text-xs">
                                <SelectValue placeholder="Trocar" />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredGuardians.map(g => (
                                  <SelectItem key={g.id} value={g.id}>
                                    {g.nome_completo} (Nº {g.numero_socio})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                const currentGuardians = user.encarregado_educacao || [];
                                onChange('encarregado_educacao', currentGuardians.filter((_, i) => i !== index));
                                toast.success('Encarregado removido');
                              }}
                            >
                              ×
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Nenhum encarregado associado</p>
          )}
        </div>
      )}

      {isGuardian && (
        <div className="space-y-1 p-1.5 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Educandos</Label>
            {isAdmin && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 text-xs px-2"
                onClick={() => {
                  const currentEducandos = user.educandos || [];
                  if (availableAthletes.length > 0) {
                    const firstAvailable = availableAthletes.find(
                      a => !currentEducandos.includes(a.id)
                    );
                    if (firstAvailable) {
                      onChange('educandos', [...currentEducandos, firstAvailable.id]);
                      toast.success('Educando adicionado');
                    } else {
                      toast.error('Todos os educandos disponíveis já foram adicionados');
                    }
                  } else {
                    toast.error('Não há educandos disponíveis');
                  }
                }}
              >
                + Adicionar
              </Button>
            )}
          </div>
          
          {user.educandos && user.educandos.length > 0 ? (
            <div className="space-y-1">
              {user.educandos.map((educandoId, index) => {
                const educando = allUsers.find(u => u.id === educandoId);
                const filteredAthletes = availableAthletes.filter(
                  a => !user.educandos?.includes(a.id) || a.id === educandoId
                );
                
                return (
                  <div key={educandoId} className="space-y-1">
                    {educando && (
                      <div className="flex items-center justify-between p-2 border rounded-lg hover:bg-accent/50 transition-colors group">
                        <button
                          type="button"
                          className="flex items-center gap-2 flex-1 cursor-pointer text-left min-w-0 hover:opacity-80 transition-opacity"
                          onClick={() => {
                            console.log('🖱️ [PersonalTab] Clique no educando:', educandoId, educando?.nome_completo);
                            console.log('🔍 [PersonalTab] onNavigateToUser está definido?', !!onNavigateToUser);
                            if (onNavigateToUser) {
                              console.log('✅ [PersonalTab] Chamando onNavigateToUser com ID:', educandoId);
                              onNavigateToUser(educandoId);
                            } else {
                              console.error('❌ [PersonalTab] onNavigateToUser não está definido!');
                            }
                          }}
                        >
                          <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                            <AvatarImage src={educando.foto_perfil} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(educando.nome_completo)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{educando.nome_completo}</p>
                            <p className="text-xs text-muted-foreground">Nº {educando.numero_socio}</p>
                          </div>
                        </button>
                        {isAdmin && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Select
                              value={educandoId}
                              onValueChange={(value) => {
                                const currentEducandos = [...(user.educandos || [])];
                                currentEducandos[index] = value;
                                onChange('educandos', currentEducandos);
                              }}
                            >
                              <SelectTrigger className="h-7 w-20 text-xs">
                                <SelectValue placeholder="Trocar" />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredAthletes.map(a => (
                                  <SelectItem key={a.id} value={a.id}>
                                    {a.nome_completo} (Nº {a.numero_socio})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                const currentEducandos = user.educandos || [];
                                onChange('educandos', currentEducandos.filter((_, i) => i !== index));
                                toast.success('Educando removido');
                              }}
                            >
                              ×
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Nenhum educando associado</p>
          )}
        </div>
      )}
    </div>
  );
}
