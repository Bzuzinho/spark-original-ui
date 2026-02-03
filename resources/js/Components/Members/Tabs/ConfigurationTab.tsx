import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Calendar } from '@/Components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Key } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { FileUpload } from '@/Components/FileUpload';

interface ConfigurationTabProps {
  user: any;
  onChange: (field: string, value: any) => void;
  isAdmin: boolean;
}

export function ConfigurationTab({ user, onChange, isAdmin }: ConfigurationTabProps) {
  const handlePasswordReset = () => {
    toast.success('Email de recuperação enviado com sucesso!', {
      description: `Email enviado para ${user.email_utilizador}`
    });
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1.5 p-1.5 border rounded-lg bg-card">
        <h3 className="text-xs font-semibold">Acesso à Plataforma</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          <div className="space-y-1">
            <Label htmlFor="email_utilizador" className="text-xs">Email de Autenticação</Label>
            <Input
              id="email_utilizador"
              type="email"
              value={user.email_utilizador}
              onChange={(e) => onChange('email_utilizador', e.target.value)}
              disabled={!isAdmin}
              placeholder="email@exemplo.com"
              className="h-7 text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Email usado para login na plataforma
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="perfil" className="text-xs">Perfil de Autorizações</Label>
            <Select
              value={user.perfil}
              onValueChange={(value) => onChange('perfil', value)}
              disabled={!isAdmin}
            >
              <SelectTrigger id="perfil" className="h-7 text-xs">
                <SelectValue placeholder="Selecionar perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="encarregado">Encarregado de Educação</SelectItem>
                <SelectItem value="atleta">Atleta</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Define as permissões de acesso do utilizador
            </p>
          </div>
        </div>

        {isAdmin && (
          <Button variant="outline" size="sm" onClick={handlePasswordReset} className="w-full h-7 text-xs">
            <Key className="mr-1" size={12} />
            Reenviar Recuperação de Password
          </Button>
        )}
      </div>

      <div className="border-t pt-2">
        <h3 className="text-xs font-semibold mb-1.5">RGPD e Consentimentos</h3>
        
        <div className="space-y-1.5">
          <div className="flex items-center justify-between p-1.5 border rounded-lg">
            <div className="space-y-0 flex-1">
              <Label htmlFor="rgpd" className="text-xs">RGPD</Label>
              <p className="text-xs text-muted-foreground">
                Consentimento para tratamento de dados pessoais
              </p>
            </div>
            <Switch
              id="rgpd"
              checked={user.rgpd}
              onCheckedChange={(checked) => onChange('rgpd', checked)}
              disabled={!isAdmin}
              className="scale-75"
            />
          </div>

          {user.rgpd && (
            <div className="space-y-1.5 pl-1.5 border-l-2 border-primary/20">
              <div className="space-y-1">
                <Label htmlFor="data_rgpd" className="text-xs">Data RGPD</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal h-7 text-xs"
                      disabled={!isAdmin}
                    >
                      {user.data_rgpd 
                        ? format(new Date(user.data_rgpd), 'PPP', { locale: pt })
                        : 'Selecionar data'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={user.data_rgpd ? new Date(user.data_rgpd) : undefined}
                      onSelect={(date) => onChange('data_rgpd', date ? format(date, 'yyyy-MM-dd') : '')}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1">
                <Label htmlFor="arquivo_rgpd" className="text-xs">Arquivo RGPD</Label>
                <FileUpload
                  value={user.arquivo_rgpd || ''}
                  onChange={(value) => onChange('arquivo_rgpd', value)}
                  disabled={!isAdmin}
                  accept=".pdf,.doc,.docx,image/*"
                  placeholder="Nenhum ficheiro carregado"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-1.5 border rounded-lg">
            <div className="space-y-0 flex-1">
              <Label htmlFor="consentimento" className="text-xs">Consentimento Imagens/Transporte</Label>
              <p className="text-xs text-muted-foreground">
                Autorização para uso de imagens e transporte
              </p>
            </div>
            <Switch
              id="consentimento"
              checked={user.consentimento}
              onCheckedChange={(checked) => onChange('consentimento', checked)}
              disabled={!isAdmin}
              className="scale-75"
            />
          </div>

          {user.consentimento && (
            <div className="space-y-1.5 pl-1.5 border-l-2 border-primary/20">
              <div className="space-y-1">
                <Label htmlFor="data_consentimento" className="text-xs">Data Consentimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal h-7 text-xs"
                      disabled={!isAdmin}
                    >
                      {user.data_consentimento 
                        ? format(new Date(user.data_consentimento), 'PPP', { locale: pt })
                        : 'Selecionar data'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={user.data_consentimento ? new Date(user.data_consentimento) : undefined}
                      onSelect={(date) => onChange('data_consentimento', date ? format(date, 'yyyy-MM-dd') : '')}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1">
                <Label htmlFor="arquivo_consentimento" className="text-xs">Arquivo Consentimento</Label>
                <FileUpload
                  value={user.arquivo_consentimento || ''}
                  onChange={(value) => onChange('arquivo_consentimento', value)}
                  disabled={!isAdmin}
                  accept=".pdf,.doc,.docx,image/*"
                  placeholder="Nenhum ficheiro carregado"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-1.5 border rounded-lg">
            <div className="space-y-0 flex-1">
              <Label htmlFor="afiliacao" className="text-xs">Afiliação</Label>
              <p className="text-xs text-muted-foreground">
                Documento de afiliação ao clube
              </p>
            </div>
            <Switch
              id="afiliacao"
              checked={user.afiliacao}
              onCheckedChange={(checked) => onChange('afiliacao', checked)}
              disabled={!isAdmin}
              className="scale-75"
            />
          </div>

          {user.afiliacao && (
            <div className="space-y-1.5 pl-1.5 border-l-2 border-primary/20">
              <div className="space-y-1">
                <Label htmlFor="data_afiliacao" className="text-xs">Data Afiliação</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal h-7 text-xs"
                      disabled={!isAdmin}
                    >
                      {user.data_afiliacao 
                        ? format(new Date(user.data_afiliacao), 'PPP', { locale: pt })
                        : 'Selecionar data'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={user.data_afiliacao ? new Date(user.data_afiliacao) : undefined}
                      onSelect={(date) => onChange('data_afiliacao', date ? format(date, 'yyyy-MM-dd') : '')}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1">
                <Label htmlFor="arquivo_afiliacao" className="text-xs">Arquivo Afiliação</Label>
                <FileUpload
                  value={user.arquivo_afiliacao || ''}
                  onChange={(value) => onChange('arquivo_afiliacao', value)}
                  disabled={!isAdmin}
                  accept=".pdf,.doc,.docx,image/*"
                  placeholder="Nenhum ficheiro carregado"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-1.5 border rounded-lg">
            <div className="space-y-0 flex-1">
              <Label htmlFor="declaracao_de_transporte" className="text-xs">Declaração de Transporte</Label>
              <p className="text-xs text-muted-foreground">
                Autorização para transporte em atividades do clube
              </p>
            </div>
            <Switch
              id="declaracao_de_transporte"
              checked={user.declaracao_de_transporte}
              onCheckedChange={(checked) => onChange('declaracao_de_transporte', checked)}
              disabled={!isAdmin}
              className="scale-75"
            />
          </div>

          {user.declaracao_de_transporte && (
            <div className="space-y-1 pl-1.5 border-l-2 border-primary/20">
              <Label htmlFor="declaracao_transporte" className="text-xs">Arquivo Declaração</Label>
              <FileUpload
                value={user.declaracao_transporte || ''}
                onChange={(value) => onChange('declaracao_transporte', value)}
                disabled={!isAdmin}
                accept=".pdf,.doc,.docx,image/*"
                placeholder="Nenhum ficheiro carregado"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
