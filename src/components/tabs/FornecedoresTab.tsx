import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import type { Fornecedor } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Users, Pencil, Trash } from '@phosphor-icons/react';
import { toast } from 'sonner';

export function FornecedoresTab() {
  const [fornecedores, setFornecedores] = useKV<Fornecedor[]>('loja-fornecedores', []);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);
  
  const [formData, setFormData] = useState<{
    nome: string;
    nif: string;
    morada: string;
    codigo_postal: string;
    localidade: string;
    contacto_telefone: string;
    contacto_email: string;
    contacto_nome: string;
    iban: string;
    observacoes: string;
    ativo: boolean;
  }>({
    nome: '',
    nif: '',
    morada: '',
    codigo_postal: '',
    localidade: '',
    contacto_telefone: '',
    contacto_email: '',
    contacto_nome: '',
    iban: '',
    observacoes: '',
    ativo: true,
  });

  const handleCreate = () => {
    if (!formData.nome.trim()) {
      toast.error('O nome do fornecedor é obrigatório');
      return;
    }

    if (editingFornecedor) {
      setFornecedores(current =>
        (current || []).map(fornecedor =>
          fornecedor.id === editingFornecedor.id
            ? { ...fornecedor, ...formData }
            : fornecedor
        )
      );
      toast.success('Fornecedor atualizado!');
    } else {
      const novoFornecedor: Fornecedor = {
        id: crypto.randomUUID(),
        ...formData,
        nif: formData.nif || undefined,
        morada: formData.morada || undefined,
        codigo_postal: formData.codigo_postal || undefined,
        localidade: formData.localidade || undefined,
        contacto_telefone: formData.contacto_telefone || undefined,
        contacto_email: formData.contacto_email || undefined,
        contacto_nome: formData.contacto_nome || undefined,
        iban: formData.iban || undefined,
        observacoes: formData.observacoes || undefined,
        created_at: new Date().toISOString(),
      };

      setFornecedores(current => [...(current || []), novoFornecedor]);
      toast.success('Fornecedor adicionado!');
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja eliminar este fornecedor?')) {
      setFornecedores(current => (current || []).filter(f => f.id !== id));
      toast.success('Fornecedor eliminado!');
    }
  };

  const handleEdit = (fornecedor: Fornecedor) => {
    setEditingFornecedor(fornecedor);
    setFormData({
      nome: fornecedor.nome,
      nif: fornecedor.nif || '',
      morada: fornecedor.morada || '',
      codigo_postal: fornecedor.codigo_postal || '',
      localidade: fornecedor.localidade || '',
      contacto_telefone: fornecedor.contacto_telefone || '',
      contacto_email: fornecedor.contacto_email || '',
      contacto_nome: fornecedor.contacto_nome || '',
      iban: fornecedor.iban || '',
      observacoes: fornecedor.observacoes || '',
      ativo: fornecedor.ativo,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      nif: '',
      morada: '',
      codigo_postal: '',
      localidade: '',
      contacto_telefone: '',
      contacto_email: '',
      contacto_nome: '',
      iban: '',
      observacoes: '',
      ativo: true,
    });
    setEditingFornecedor(null);
  };

  const totalFornecedores = (fornecedores || []).length;
  const fornecedoresAtivos = (fornecedores || []).filter(f => f.ativo).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Fornecedores</h2>
          <p className="text-xs text-muted-foreground">{totalFornecedores} fornecedores registados</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="h-8 text-xs">
              <Plus className="mr-1.5" size={16} />
              Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Fornecedor *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Fornecedor XYZ, Lda"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nif">NIF</Label>
                  <Input
                    id="nif"
                    value={formData.nif}
                    onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                    placeholder="123456789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="morada">Morada</Label>
                <Input
                  id="morada"
                  value={formData.morada}
                  onChange={(e) => setFormData({ ...formData, morada: e.target.value })}
                  placeholder="Rua, nº"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo_postal">Código Postal</Label>
                  <Input
                    id="codigo_postal"
                    value={formData.codigo_postal}
                    onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
                    placeholder="1234-567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="localidade">Localidade</Label>
                  <Input
                    id="localidade"
                    value={formData.localidade}
                    onChange={(e) => setFormData({ ...formData, localidade: e.target.value })}
                    placeholder="Cidade"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contacto_nome">Nome do Contacto</Label>
                  <Input
                    id="contacto_nome"
                    value={formData.contacto_nome}
                    onChange={(e) => setFormData({ ...formData, contacto_nome: e.target.value })}
                    placeholder="Nome da pessoa de contacto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contacto_telefone">Telefone</Label>
                  <Input
                    id="contacto_telefone"
                    value={formData.contacto_telefone}
                    onChange={(e) => setFormData({ ...formData, contacto_telefone: e.target.value })}
                    placeholder="+351 912 345 678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contacto_email">Email</Label>
                  <Input
                    id="contacto_email"
                    type="email"
                    value={formData.contacto_email}
                    onChange={(e) => setFormData({ ...formData, contacto_email: e.target.value })}
                    placeholder="email@fornecedor.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    value={formData.iban}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    placeholder="PT50 0000 0000 0000 0000 0000 0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Notas adicionais sobre o fornecedor"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate}>
                  {editingFornecedor ? 'Atualizar' : 'Adicionar'} Fornecedor
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-2 grid-cols-2">
        <Card className="p-2 sm:p-3">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-medium">Total Fornecedores</p>
              <p className="text-lg sm:text-xl font-bold mt-0.5">{totalFornecedores}</p>
            </div>
            <div className="p-1.5 rounded-lg bg-blue-50 flex-shrink-0">
              <Users className="text-blue-600" size={16} weight="bold" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-medium">Ativos</p>
              <p className="text-lg sm:text-xl font-bold text-green-600 mt-0.5">{fornecedoresAtivos}</p>
            </div>
            <div className="p-1.5 rounded-lg bg-green-50 flex-shrink-0">
              <Users className="text-green-600" size={16} weight="bold" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Nome</TableHead>
                <TableHead className="text-xs">NIF</TableHead>
                <TableHead className="text-xs">Contacto</TableHead>
                <TableHead className="text-xs">Email</TableHead>
                <TableHead className="text-xs">Localidade</TableHead>
                <TableHead className="text-xs">Estado</TableHead>
                <TableHead className="text-xs">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(fornecedores || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                    Nenhum fornecedor registado
                  </TableCell>
                </TableRow>
              ) : (
                (fornecedores || []).map(fornecedor => (
                  <TableRow key={fornecedor.id}>
                    <TableCell className="text-xs font-medium">{fornecedor.nome}</TableCell>
                    <TableCell className="text-xs">{fornecedor.nif || 'N/A'}</TableCell>
                    <TableCell className="text-xs">{fornecedor.contacto_telefone || 'N/A'}</TableCell>
                    <TableCell className="text-xs">{fornecedor.contacto_email || 'N/A'}</TableCell>
                    <TableCell className="text-xs">{fornecedor.localidade || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={fornecedor.ativo ? 'default' : 'secondary'} className="text-xs">
                        {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(fornecedor)}
                          className="h-7 w-7 p-0"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(fornecedor.id)}
                          className="h-7 w-7 p-0"
                        >
                          <Trash size={14} className="text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
