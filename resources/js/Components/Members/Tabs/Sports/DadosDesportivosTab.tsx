import { User } from '@/types';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Calendar } from '@/Components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { Button } from '@/Components/ui/button';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { FileUpload } from '@/Components/FileUpload';
import { useKV } from '@/hooks/useKV';
import { Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { useState } from 'react';

interface AgeGroup {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
}

interface DadosDesportivosTabProps {
  user: User;
  onChange: (field: keyof User, value: any) => void;
  isAdmin: boolean;
}

export function DadosDesportivosTab({ user, onChange, isAdmin }: DadosDesportivosTabProps) {
  const [ageGroups] = useKV<AgeGroup[]>('settings-age-groups', []);
  const [showCardPreview, setShowCardPreview] = useState(false);

  const handlePrintCard = () => {
    if (user.cartao_federacao) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Cartão de Federação - ${user.nome_completo}</title>
              <style>
                body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                img { max-width: 100%; height: auto; }
                @media print { body { padding: 0; } }
              </style>
            </head>
            <body>
              <img src="${user.cartao_federacao}" alt="Cartão de Federação" />
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 250);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="flex items-center justify-between p-2 border rounded-lg">
          <div className="space-y-0">
            <Label htmlFor="ativo_desportivo" className="text-xs">Ativo</Label>
            <p className="text-[10px] text-muted-foreground">Atleta ativo</p>
          </div>
          <Switch
            id="ativo_desportivo"
            checked={user.ativo_desportivo}
            onCheckedChange={(checked) => onChange('ativo_desportivo', checked)}
            disabled={!isAdmin}
            className="scale-75"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="num_federacao" className="text-xs">Nº de Federação</Label>
          <Input
            id="num_federacao"
            value={user.num_federacao || ''}
            onChange={(e) => onChange('num_federacao', e.target.value)}
            disabled={!isAdmin}
            placeholder="Número"
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="numero_pmb" className="text-xs">Número PMB</Label>
          <Input
            id="numero_pmb"
            value={user.numero_pmb || ''}
            onChange={(e) => onChange('numero_pmb', e.target.value)}
            disabled={!isAdmin}
            placeholder="Número"
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="escalao" className="text-xs">Escalão</Label>
          <Select
            value={user.escalao?.[0] || undefined}
            onValueChange={(value) => onChange('escalao', value ? [value] : [])}
            disabled={!isAdmin || (ageGroups || []).length === 0}
          >
            <SelectTrigger id="escalao" className="h-8 text-xs">
              <SelectValue placeholder="Selecionar" />
            </SelectTrigger>
            <SelectContent>
              {(ageGroups || []).length === 0 ? (
                <SelectItem value="placeholder" disabled>Nenhum escalão configurado</SelectItem>
              ) : (
                (ageGroups || []).map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name} ({group.minAge}-{group.maxAge}a)
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label htmlFor="cartao_federacao" className="text-xs">Cartão Federação</Label>
          {user.cartao_federacao && (
            <div 
              className="w-full h-16 border-2 border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors mb-1"
              onClick={() => setShowCardPreview(true)}
            >
              <img src={user.cartao_federacao} alt="Cartão" className="w-full h-full object-contain" />
            </div>
          )}
          <FileUpload
            value={user.cartao_federacao || ''}
            onChange={(value) => onChange('cartao_federacao', value)}
            disabled={!isAdmin}
            accept="image/*"
            placeholder="Carregar imagem"
            maxSizeMB={5}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="data_inscricao" className="text-xs">Data de Inscrição</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal h-8 text-xs" disabled={!isAdmin}>
                {user.data_inscricao ? format(new Date(user.data_inscricao), 'PPP', { locale: pt }) : 'Selecionar data'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={user.data_inscricao ? new Date(user.data_inscricao) : undefined}
                onSelect={(date) => onChange('data_inscricao', date ? format(date, 'yyyy-MM-dd') : '')}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1">
          <Label htmlFor="inscricao" className="text-xs">Inscrição</Label>
          <FileUpload
            value={user.inscricao || ''}
            onChange={(value) => onChange('inscricao', value)}
            disabled={!isAdmin}
            accept=".pdf,.doc,.docx,image/*"
            placeholder="Carregar ficheiro"
          />
        </div>
      </div>

      <div className="border-t pt-3">
        <h3 className="text-xs font-semibold mb-2">Atestado Médico</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label htmlFor="data_atestado_medico" className="text-xs">Data Atestado Médico</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal h-8 text-xs" disabled={!isAdmin}>
                  {user.data_atestado_medico ? format(new Date(user.data_atestado_medico), 'PPP', { locale: pt }) : 'Selecionar data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={user.data_atestado_medico ? new Date(user.data_atestado_medico) : undefined}
                  onSelect={(date) => onChange('data_atestado_medico', date ? format(date, 'yyyy-MM-dd') : '')}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1">
            <Label htmlFor="arquivo_atestado_medico" className="text-xs">Arquivo Atestado Médico</Label>
            <FileUpload
              value={user.arquivo_atestado_medico || []}
              onChange={(value) => onChange('arquivo_atestado_medico', value)}
              disabled={!isAdmin}
              accept=".pdf,.doc,.docx,image/*"
              multiple={true}
              placeholder="Carregar ficheiros"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="informacoes_medicas" className="text-xs">Informações Médicas</Label>
            <Textarea
              id="informacoes_medicas"
              value={user.informacoes_medicas || ''}
              onChange={(e) => onChange('informacoes_medicas', e.target.value)}
              disabled={!isAdmin}
              placeholder="Alergias, condições, medicação..."
              rows={2}
              className="text-xs"
            />
          </div>
        </div>
      </div>

      <Dialog open={showCardPreview} onOpenChange={setShowCardPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-sm">Cartão de Federação - {user.nome_completo}</DialogTitle>
            <DialogDescription>Visualização do cartão de federação</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {user.cartao_federacao && (
              <div className="flex justify-center">
                <img src={user.cartao_federacao} alt="Cartão" className="max-w-full h-auto rounded-lg" />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCardPreview(false)} className="h-7 text-xs">
                Fechar
              </Button>
              <Button size="sm" onClick={handlePrintCard} className="h-7 text-xs">
                <Printer className="mr-1" size={14} />
                Imprimir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
