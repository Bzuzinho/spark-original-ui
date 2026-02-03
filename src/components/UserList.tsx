import { useState, useMemo } from 'react';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MagnifyingGlass, Plus, UserCircle, FileArrowUp, Trash, SquaresFour, ListBullets } from '@phosphor-icons/react';
import { getStatusColor, getStatusLabel, getMemberTypeLabel, getUserDisplayName } from '@/lib/user-helpers';
import { generateMemberNumber } from '@/lib/user-helpers';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { useKV } from '@github/spark/hooks';
import { useIsMobile } from '@/hooks/use-mobile';

interface UserListProps {
  users: User[];
  onSelectUser: (userId: string) => void;
  onCreateUser: () => void;
  onDeleteUser: (userId: string) => void;
  isAdmin: boolean;
}

export function UserList({ users, onSelectUser, onCreateUser, onDeleteUser, isAdmin }: UserListProps) {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  
  const [dialogImportOpen, setDialogImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [usersState, setUsersState] = useKV<User[]>('club-users', []);
  const [showColumnMapping, setShowColumnMapping] = useState(false);
  const [userTypes] = useKV<Array<{ id: string; name: string; description: string }>>('settings-user-types', []);
  const [columnMapping, setColumnMapping] = useState<{
    nome_completo: string;
    data_nascimento: string;
    email_utilizador: string;
    contacto: string;
    nif: string;
    cc: string;
    morada: string;
    codigo_postal: string;
    localidade: string;
    sexo: string;
    nacionalidade: string;
    estado_civil: string;
    ocupacao: string;
    empresa: string;
    escola: string;
    senha: string;
    perfil: string;
    tipo_membro: string;
    tipo_mensalidade: string;
    centro_custo: string;
    num_federacao: string;
    numero_pmb: string;
    escalao: string;
    data_inscricao: string;
  }>({
    nome_completo: '__none__',
    data_nascimento: '__none__',
    email_utilizador: '__none__',
    contacto: '__none__',
    nif: '__none__',
    cc: '__none__',
    morada: '__none__',
    codigo_postal: '__none__',
    localidade: '__none__',
    sexo: '__none__',
    nacionalidade: '__none__',
    estado_civil: '__none__',
    ocupacao: '__none__',
    empresa: '__none__',
    escola: '__none__',
    senha: '__none__',
    perfil: '__none__',
    tipo_membro: '__none__',
    tipo_mensalidade: '__none__',
    centro_custo: '__none__',
    num_federacao: '__none__',
    numero_pmb: '__none__',
    escalao: '__none__',
    data_inscricao: '__none__',
  });

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.numero_socio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email_utilizador?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || user.estado === statusFilter;
      
      const matchesType = typeFilter === 'all' || user.tipo_membro.includes(typeFilter as any);
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [users, searchTerm, statusFilter, typeFilter]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.oasis.opendocument.spreadsheet',
      'text/csv'
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xls|xlsx|ods|csv)$/i)) {
      toast.error('Formato de ficheiro não suportado. Use XLS, XLSX, ODS ou CSV');
      return;
    }

    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        const preview = jsonData.slice(0, 6);
        setImportPreview(preview);

        if (jsonData.length > 0) {
          const headers = jsonData[0] as string[];
          setAvailableColumns(headers.filter(h => h && h.toString().trim()));
          
          const autoMapping: any = {
            nome_completo: '__none__',
            data_nascimento: '__none__',
            email_utilizador: '__none__',
            contacto: '__none__',
            nif: '__none__',
            cc: '__none__',
            morada: '__none__',
            codigo_postal: '__none__',
            localidade: '__none__',
            sexo: '__none__',
            nacionalidade: '__none__',
            estado_civil: '__none__',
            ocupacao: '__none__',
            empresa: '__none__',
            escola: '__none__',
            senha: '__none__',
            perfil: '__none__',
            tipo_membro: '__none__',
            tipo_mensalidade: '__none__',
            centro_custo: '__none__',
            num_federacao: '__none__',
            numero_pmb: '__none__',
            escalao: '__none__',
            data_inscricao: '__none__',
          };

          const defaultColumns: Record<string, string[]> = {
            nome_completo: ['Nome Completo', 'nome_completo', 'Nome', 'nome', 'NAME'],
            data_nascimento: ['Data de Nascimento', 'data_nascimento', 'Data Nascimento', 'Nascimento', 'DATE OF BIRTH'],
            email_utilizador: ['Email', 'email', 'EMAIL', 'E-mail', 'email_utilizador'],
            contacto: ['Contacto', 'contacto', 'Telefone', 'telefone', 'PHONE'],
            nif: ['NIF', 'nif', 'Número Fiscal'],
            cc: ['CC', 'cc', 'Cartão Cidadão', 'Bilhete de Identidade', 'BI'],
            morada: ['Morada', 'morada', 'Endereço', 'ADDRESS'],
            codigo_postal: ['Código Postal', 'codigo_postal', 'CP', 'Cód Postal'],
            localidade: ['Localidade', 'localidade', 'Cidade', 'cidade', 'CITY'],
            sexo: ['Sexo', 'sexo', 'Género', 'genero', 'GENDER'],
            nacionalidade: ['Nacionalidade', 'nacionalidade', 'País', 'NATIONALITY'],
            estado_civil: ['Estado Civil', 'estado_civil', 'Estado', 'MARITAL STATUS'],
            ocupacao: ['Ocupação', 'ocupacao', 'Profissão', 'profissao', 'OCCUPATION'],
            empresa: ['Empresa', 'empresa', 'COMPANY'],
            escola: ['Escola', 'escola', 'SCHOOL'],
            senha: ['Senha', 'senha', 'Password', 'PASSWORD'],
            perfil: ['Perfil', 'perfil', 'Tipo Utilizador', 'PROFILE'],
            tipo_membro: ['Tipo Membro', 'tipo_membro', 'Tipo', 'MEMBER TYPE'],
            tipo_mensalidade: ['Tipo Mensalidade', 'tipo_mensalidade', 'Mensalidade', 'MONTHLY FEE'],
            centro_custo: ['Centro Custo', 'centro_custo', 'Centro de Custo', 'COST CENTER'],
            num_federacao: ['Nº Federação', 'num_federacao', 'Número Federação', 'FEDERATION NUMBER'],
            numero_pmb: ['Nº PMB', 'numero_pmb', 'Número PMB', 'PMB NUMBER'],
            escalao: ['Escalão', 'escalao', 'LEVEL'],
            data_inscricao: ['Data Inscrição', 'data_inscricao', 'Data de Inscrição', 'REGISTRATION DATE'],
          };

          Object.keys(defaultColumns).forEach(field => {
            const possibleColumns = defaultColumns[field];
            for (const col of possibleColumns) {
              if (headers.includes(col)) {
                autoMapping[field] = col;
                break;
              }
            }
          });

          setColumnMapping(autoMapping);
          setShowColumnMapping(true);
        }
      } catch (error) {
        toast.error('Erro ao ler o ficheiro');
        console.error(error);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = () => {
    if (!importFile) {
      toast.error('Selecione um ficheiro para importar');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(firstSheet);

        if (jsonData.length === 0) {
          toast.error('O ficheiro está vazio');
          return;
        }

        const novosUtilizadores: User[] = [];
        const utilizadoresAtualizados: User[] = [];
        let importedCount = 0;
        let updatedCount = 0;
        let errorCount = 0;

        jsonData.forEach((row, index) => {
          try {
            const getColumnValue = (field: keyof typeof columnMapping) => {
              const mappedColumn = columnMapping?.[field];
              if (mappedColumn && mappedColumn !== '__auto__' && mappedColumn !== '' && mappedColumn !== '__none__' && row[mappedColumn]) {
                return row[mappedColumn];
              }
              
              const defaultColumns: Record<string, string[]> = {
                nome_completo: ['Nome Completo', 'nome_completo', 'Nome', 'nome', 'NAME'],
                data_nascimento: ['Data de Nascimento', 'data_nascimento', 'Data Nascimento', 'Nascimento', 'DATE OF BIRTH'],
                email_utilizador: ['Email', 'email', 'EMAIL', 'E-mail', 'email_utilizador'],
                contacto: ['Contacto', 'contacto', 'Telefone', 'telefone', 'PHONE'],
                nif: ['NIF', 'nif', 'Número Fiscal'],
                cc: ['CC', 'cc', 'Cartão Cidadão', 'Bilhete de Identidade', 'BI'],
                morada: ['Morada', 'morada', 'Endereço', 'ADDRESS'],
                codigo_postal: ['Código Postal', 'codigo_postal', 'CP', 'Cód Postal'],
                localidade: ['Localidade', 'localidade', 'Cidade', 'cidade', 'CITY'],
                sexo: ['Sexo', 'sexo', 'Género', 'genero', 'GENDER'],
                nacionalidade: ['Nacionalidade', 'nacionalidade', 'País', 'NATIONALITY'],
                estado_civil: ['Estado Civil', 'estado_civil', 'Estado', 'MARITAL STATUS'],
                ocupacao: ['Ocupação', 'ocupacao', 'Profissão', 'profissao', 'OCCUPATION'],
                empresa: ['Empresa', 'empresa', 'COMPANY'],
                escola: ['Escola', 'escola', 'SCHOOL'],
                senha: ['Senha', 'senha', 'Password', 'PASSWORD'],
                perfil: ['Perfil', 'perfil', 'Tipo Utilizador', 'PROFILE'],
                tipo_membro: ['Tipo Membro', 'tipo_membro', 'Tipo', 'MEMBER TYPE'],
                tipo_mensalidade: ['Tipo Mensalidade', 'tipo_mensalidade', 'Mensalidade', 'MONTHLY FEE'],
                centro_custo: ['Centro Custo', 'centro_custo', 'Centro de Custo', 'COST CENTER'],
                num_federacao: ['Nº Federação', 'num_federacao', 'Número Federação', 'FEDERATION NUMBER'],
                numero_pmb: ['Nº PMB', 'numero_pmb', 'Número PMB', 'PMB NUMBER'],
                escalao: ['Escalão', 'escalao', 'LEVEL'],
                data_inscricao: ['Data Inscrição', 'data_inscricao', 'Data de Inscrição', 'REGISTRATION DATE'],
              };
              
              const possibleColumns = defaultColumns[field] || [];
              for (const col of possibleColumns) {
                if (row[col] !== undefined) {
                  return row[col];
                }
              }
              return null;
            };

            const nome_completo = getColumnValue('nome_completo');
            if (!nome_completo) {
              errorCount++;
              return;
            }

            const data_nascimento = getColumnValue('data_nascimento');
            const email_utilizador = getColumnValue('email_utilizador');
            const contacto = getColumnValue('contacto');
            const nif = getColumnValue('nif');
            const cc = getColumnValue('cc');
            const morada = getColumnValue('morada');
            const codigo_postal = getColumnValue('codigo_postal');
            const localidade = getColumnValue('localidade');
            const sexo = getColumnValue('sexo');
            const nacionalidade = getColumnValue('nacionalidade');
            const estado_civil = getColumnValue('estado_civil');
            const ocupacao = getColumnValue('ocupacao');
            const empresa = getColumnValue('empresa');
            const escola = getColumnValue('escola');
            const senha = getColumnValue('senha');
            const perfil = getColumnValue('perfil');
            const tipo_membro = getColumnValue('tipo_membro');
            const tipo_mensalidade = getColumnValue('tipo_mensalidade');
            const centro_custo = getColumnValue('centro_custo');
            const num_federacao = getColumnValue('num_federacao');
            const numero_pmb = getColumnValue('numero_pmb');
            const escalao = getColumnValue('escalao');
            const data_inscricao = getColumnValue('data_inscricao');

            let parsedDataNascimento = '2000-01-01';
            if (data_nascimento) {
              try {
                if (typeof data_nascimento === 'number') {
                  const excelDate = new Date((data_nascimento - 25569) * 86400 * 1000);
                  parsedDataNascimento = format(excelDate, 'yyyy-MM-dd');
                } else {
                  const dateObj = new Date(data_nascimento);
                  if (!isNaN(dateObj.getTime())) {
                    parsedDataNascimento = format(dateObj, 'yyyy-MM-dd');
                  }
                }
              } catch (e) {
                console.error('Error parsing date:', e);
              }
            }

            let parsedDataInscricao: string | undefined = undefined;
            if (data_inscricao) {
              try {
                if (typeof data_inscricao === 'number') {
                  const excelDate = new Date((data_inscricao - 25569) * 86400 * 1000);
                  parsedDataInscricao = format(excelDate, 'yyyy-MM-dd');
                } else {
                  const dateObj = new Date(data_inscricao);
                  if (!isNaN(dateObj.getTime())) {
                    parsedDataInscricao = format(dateObj, 'yyyy-MM-dd');
                  }
                }
              } catch (e) {
                console.error('Error parsing inscription date:', e);
              }
            }

            const parsedSexo = sexo?.toString().toLowerCase().includes('f') ? 'feminino' : 'masculino';
            
            const parsedEstadoCivil = estado_civil ? 
              (['solteiro', 'casado', 'divorciado', 'viuvo'].find(ec => 
                estado_civil.toString().toLowerCase().includes(ec)
              ) as 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | undefined) : undefined;

            const parsedPerfil = perfil ? 
              (['admin', 'encarregado', 'atleta', 'staff'].find(p => 
                perfil.toString().toLowerCase().includes(p)
              ) || 'atleta') : 'atleta';

            const parsedTipoMembro = tipo_membro ? 
              tipo_membro.toString().split(',').map((t: string) => t.trim()).filter((t: string) => 
                ['atleta', 'encarregado_educacao', 'treinador', 'dirigente', 'socio', 'funcionario'].includes(t)
              ) : ['socio'];

            const parsedEscalao = escalao ? 
              escalao.toString().split(',').map((e: string) => e.trim()) : undefined;

            const parsedCentroCusto = centro_custo ? 
              centro_custo.toString().split(',').map((c: string) => c.trim()) : undefined;

            const birthDate = new Date(parsedDataNascimento);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const isMenor = age < 18;

            const currentUsers = usersState || [];
            
            const existingUser = currentUsers.find(u => 
              u.nome_completo.toLowerCase() === nome_completo.toString().toLowerCase() &&
              u.data_nascimento === parsedDataNascimento
            );

            if (existingUser) {
              const updatedUser: User = {
                ...existingUser,
                email_utilizador: existingUser.email_utilizador || (email_utilizador?.toString() || ''),
                senha: existingUser.senha || (senha?.toString() || undefined),
                contacto: existingUser.contacto || (contacto?.toString() || undefined),
                nif: existingUser.nif || (nif?.toString() || undefined),
                cc: existingUser.cc || (cc?.toString() || undefined),
                morada: existingUser.morada || (morada?.toString() || undefined),
                codigo_postal: existingUser.codigo_postal || (codigo_postal?.toString() || undefined),
                localidade: existingUser.localidade || (localidade?.toString() || undefined),
                nacionalidade: existingUser.nacionalidade || (nacionalidade?.toString() || undefined),
                estado_civil: existingUser.estado_civil || parsedEstadoCivil,
                ocupacao: existingUser.ocupacao || (ocupacao?.toString() || undefined),
                empresa: existingUser.empresa || (empresa?.toString() || undefined),
                escola: existingUser.escola || (escola?.toString() || undefined),
                tipo_mensalidade: existingUser.tipo_mensalidade || (tipo_mensalidade?.toString() || undefined),
                centro_custo: existingUser.centro_custo || parsedCentroCusto,
                num_federacao: existingUser.num_federacao || (num_federacao?.toString() || undefined),
                numero_pmb: existingUser.numero_pmb || (numero_pmb?.toString() || undefined),
                data_inscricao: existingUser.data_inscricao || parsedDataInscricao,
                escalao: existingUser.escalao || parsedEscalao,
              };
              
              utilizadoresAtualizados.push(updatedUser);
              updatedCount++;
            } else {
              const novoUtilizador: User = {
                id: crypto.randomUUID(),
                numero_socio: generateMemberNumber(currentUsers.concat(novosUtilizadores)),
                nome_completo: nome_completo.toString(),
                data_nascimento: parsedDataNascimento,
                email_utilizador: email_utilizador?.toString() || '',
                senha: senha?.toString() || undefined,
                perfil: parsedPerfil as 'admin' | 'encarregado' | 'atleta' | 'staff',
                contacto: contacto?.toString() || undefined,
                nif: nif?.toString() || undefined,
                cc: cc?.toString() || undefined,
                morada: morada?.toString() || undefined,
                codigo_postal: codigo_postal?.toString() || undefined,
                localidade: localidade?.toString() || undefined,
                nacionalidade: nacionalidade?.toString() || undefined,
                estado_civil: parsedEstadoCivil,
                ocupacao: ocupacao?.toString() || undefined,
                empresa: empresa?.toString() || undefined,
                escola: escola?.toString() || undefined,
                sexo: parsedSexo as 'masculino' | 'feminino',
                menor: isMenor,
                tipo_membro: parsedTipoMembro.length > 0 ? parsedTipoMembro : [],
                estado: 'ativo',
                tipo_mensalidade: tipo_mensalidade?.toString() || undefined,
                centro_custo: parsedCentroCusto,
                num_federacao: num_federacao?.toString() || undefined,
                numero_pmb: numero_pmb?.toString() || undefined,
                data_inscricao: parsedDataInscricao,
                escalao: parsedEscalao,
                rgpd: false,
                consentimento: false,
                afiliacao: false,
                declaracao_de_transporte: false,
                ativo_desportivo: false,
              };

              novosUtilizadores.push(novoUtilizador);
              importedCount++;
            }
          } catch (error) {
            console.error(`Error processing row ${index}:`, error);
            errorCount++;
          }
        });

        if (novosUtilizadores.length > 0 || utilizadoresAtualizados.length > 0) {
          setUsersState(currentUsers => {
            let updatedList = [...(currentUsers || [])];
            
            utilizadoresAtualizados.forEach(updatedUser => {
              const index = updatedList.findIndex(u => u.id === updatedUser.id);
              if (index !== -1) {
                updatedList[index] = updatedUser;
              }
            });
            
            return [...updatedList, ...novosUtilizadores];
          });
          
          const messages: string[] = [];
          if (importedCount > 0) messages.push(`${importedCount} novos`);
          if (updatedCount > 0) messages.push(`${updatedCount} atualizados`);
          if (errorCount > 0) messages.push(`${errorCount} erros`);
          
          toast.success(`Importação concluída: ${messages.join(', ')}`);
          setDialogImportOpen(false);
          resetImportData();
        } else {
          toast.error('Nenhum membro válido encontrado no ficheiro');
        }
      } catch (error) {
        toast.error('Erro ao processar o ficheiro');
        console.error(error);
      }
    };
    reader.readAsBinaryString(importFile);
  };

  const resetImportData = () => {
    setImportFile(null);
    setImportPreview([]);
    setAvailableColumns([]);
    setShowColumnMapping(false);
    setColumnMapping({
      nome_completo: '__none__',
      data_nascimento: '__none__',
      email_utilizador: '__none__',
      contacto: '__none__',
      nif: '__none__',
      cc: '__none__',
      morada: '__none__',
      codigo_postal: '__none__',
      localidade: '__none__',
      sexo: '__none__',
      nacionalidade: '__none__',
      estado_civil: '__none__',
      ocupacao: '__none__',
      empresa: '__none__',
      escola: '__none__',
      senha: '__none__',
      perfil: '__none__',
      tipo_membro: '__none__',
      tipo_mensalidade: '__none__',
      centro_custo: '__none__',
      num_federacao: '__none__',
      numero_pmb: '__none__',
      escalao: '__none__',
      data_inscricao: '__none__',
    });
  };

  const handleDeleteClick = (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete.id);
      toast.success(`Membro ${userToDelete.nome_completo} apagado com sucesso`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Gestão de Membros</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            {filteredUsers.length} de {users.length} membros
          </p>
        </div>
        <div className="flex gap-2">
          {!isMobile && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')}
              title={viewMode === 'card' ? 'Ver em modo compacto' : 'Ver em modo tabela'}
            >
              {viewMode === 'card' ? <SquaresFour size={14} /> : <ListBullets size={14} />}
            </Button>
          )}
          <Dialog open={dialogImportOpen} onOpenChange={setDialogImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={resetImportData} className="h-8 text-xs">
                <FileArrowUp size={14} className="sm:mr-1.5" />
                <span className="hidden sm:inline">Importar</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col w-[calc(100vw-2rem)] sm:w-full">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Importar Membros</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 flex-1 overflow-y-auto px-1">
                <div className="space-y-2">
                  <Label className="text-sm">Ficheiro de Membros (XLS, XLSX, CSV) *</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept=".xls,.xlsx,.ods,.csv"
                      onChange={handleFileSelect}
                      className="flex-1 text-sm"
                    />
                  </div>
                  {importFile && (
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      Ficheiro selecionado: {importFile.name}
                    </p>
                  )}
                </div>

                {importPreview.length > 0 && (
                  <div className="space-y-3">
                    <div>
                      <Label>Pré-visualização (primeiras 5 linhas)</Label>
                      <Card className="p-3 mt-2">
                        <ScrollArea className="h-[150px]">
                          <Table>
                            <TableBody>
                              {importPreview.map((row: any[], idx) => (
                                <TableRow key={idx}>
                                  {Array.isArray(row) && row.map((cell, cellIdx) => (
                                    <TableCell key={cellIdx} className="text-xs whitespace-nowrap">
                                      {cell?.toString() || '-'}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </Card>
                    </div>

                    {showColumnMapping && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold">Mapeamento de Colunas</Label>
                          <Badge variant="outline">Configure os campos</Badge>
                        </div>
                        
                        <Card className="p-4 bg-blue-50 border-blue-200">
                          <p className="text-sm text-blue-900">
                            <strong>Importante:</strong> Indique qual coluna do ficheiro Excel corresponde a cada campo do sistema. 
                            Campos não mapeados serão ignorados. Os campos estão organizados por categoria.
                          </p>
                        </Card>

                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-bold text-primary mb-3 pb-2 border-b">📋 Dados Pessoais</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-2">
                            <Label className="text-xs font-semibold">Nome Completo *</Label>
                            <Select 
                              value={columnMapping?.nome_completo || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, nome_completo: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Data de Nascimento</Label>
                            <Select 
                              value={columnMapping?.data_nascimento || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, data_nascimento: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Email</Label>
                            <Select 
                              value={columnMapping?.email_utilizador || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, email_utilizador: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Contacto / Telefone</Label>
                            <Select 
                              value={columnMapping?.contacto || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, contacto: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">NIF</Label>
                            <Select 
                              value={columnMapping?.nif || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, nif: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">CC / Cartão Cidadão</Label>
                            <Select 
                              value={columnMapping?.cc || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, cc: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Morada</Label>
                            <Select 
                              value={columnMapping?.morada || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, morada: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Código Postal</Label>
                            <Select 
                              value={columnMapping?.codigo_postal || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, codigo_postal: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Localidade</Label>
                            <Select 
                              value={columnMapping?.localidade || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, localidade: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Sexo / Género</Label>
                            <Select 
                              value={columnMapping?.sexo || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, sexo: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Nacionalidade</Label>
                            <Select 
                              value={columnMapping?.nacionalidade || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, nacionalidade: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Estado Civil</Label>
                            <Select 
                              value={columnMapping?.estado_civil || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, estado_civil: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Ocupação</Label>
                            <Select 
                              value={columnMapping?.ocupacao || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, ocupacao: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Empresa</Label>
                            <Select 
                              value={columnMapping?.empresa || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, empresa: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Escola</Label>
                            <Select 
                              value={columnMapping?.escola || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, escola: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-primary mb-3 pb-2 border-b">👤 Utilizador & Configuração</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Senha / Password</Label>
                            <Select 
                              value={columnMapping?.senha || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, senha: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Perfil de Utilizador</Label>
                            <Select 
                              value={columnMapping?.perfil || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, perfil: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Tipo de Membro</Label>
                            <Select 
                              value={columnMapping?.tipo_membro || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, tipo_membro: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-primary mb-3 pb-2 border-b">💰 Financeiro</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Tipo Mensalidade</Label>
                            <Select 
                              value={columnMapping?.tipo_mensalidade || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, tipo_mensalidade: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Centro de Custo</Label>
                            <Select 
                              value={columnMapping?.centro_custo || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, centro_custo: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-primary mb-3 pb-2 border-b">⚽ Desportivo</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Nº Federação</Label>
                            <Select 
                              value={columnMapping?.num_federacao || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, num_federacao: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Nº PMB</Label>
                            <Select 
                              value={columnMapping?.numero_pmb || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, numero_pmb: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Escalão</Label>
                            <Select 
                              value={columnMapping?.escalao || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, escalao: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Data de Inscrição</Label>
                            <Select 
                              value={columnMapping?.data_inscricao || '__none__'} 
                              onValueChange={(v) => setColumnMapping(current => ({ ...current, data_inscricao: v === '__none__' ? '' : v }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Não mapear</SelectItem>
                                {availableColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => {
                  setDialogImportOpen(false);
                  resetImportData();
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleImport} disabled={!importFile || !columnMapping?.nome_completo || columnMapping?.nome_completo === '__none__'}>
                  <FileArrowUp className="mr-2" />
                  Importar Membros
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={onCreateUser} size="sm" className="h-8 text-xs">
            <Plus size={14} className="sm:mr-1.5" />
            <span className="hidden sm:inline">Novo Membro</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      <Card className="p-2 sm:p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <MagnifyingGlass size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome, nº sócio ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px] h-8 text-xs">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Estados</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
              <SelectItem value="suspenso">Suspenso</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[160px] h-8 text-xs">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
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
                    <SelectItem key={tipo.id} value={tipoValue}>
                      {tipo.name}
                    </SelectItem>
                  );
                })
              ) : null}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {viewMode === 'card' && !isMobile ? (
        <Card className="overflow-hidden">
          <ScrollArea className="w-full">
            <div className="min-w-full inline-block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px] sticky left-0 bg-card z-10"></TableHead>
                    <TableHead className="min-w-[200px] sticky left-[60px] bg-card z-10">Nome</TableHead>
                    <TableHead className="min-w-[120px]">Nº Sócio</TableHead>
                    <TableHead className="min-w-[200px]">Email</TableHead>
                    <TableHead className="min-w-[100px]">Estado</TableHead>
                    <TableHead className="min-w-[150px]">Tipo de Membro</TableHead>
                    {isAdmin && <TableHead className="w-[60px]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow 
                      key={user.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onSelectUser(user.id)}
                    >
                      <TableCell className="sticky left-0 bg-card z-10">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.foto_perfil} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(getUserDisplayName(user))}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-semibold sticky left-[60px] bg-card z-10">{getUserDisplayName(user)}</TableCell>
                      <TableCell className="text-sm">{user.numero_socio}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.email_utilizador || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getStatusColor(user.estado)} text-xs`}>
                          {getStatusLabel(user.estado)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.tipo_membro.slice(0, 2).map(type => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {getMemberTypeLabel(type)}
                            </Badge>
                          ))}
                          {user.tipo_membro.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{user.tipo_membro.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => handleDeleteClick(user, e)}
                          >
                            <Trash size={16} />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </Card>
      ) : (
        <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map(user => (
            <Card
              key={user.id}
              className="p-2.5 sm:p-3 cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
              onClick={() => onSelectUser(user.id)}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                  <AvatarImage src={user.foto_perfil} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                    {getInitials(getUserDisplayName(user))}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{getUserDisplayName(user)}</h3>
                  <p className="text-xs text-muted-foreground">Nº {user.numero_socio}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <Badge variant="outline" className={`${getStatusColor(user.estado)} text-xs px-1.5 py-0`}>
                      {getStatusLabel(user.estado)}
                    </Badge>
                    {user.tipo_membro.slice(0, 2).map(type => (
                      <Badge key={type} variant="secondary" className="text-xs px-1.5 py-0">
                        {getMemberTypeLabel(type)}
                      </Badge>
                    ))}
                    {user.tipo_membro.length > 2 && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        +{user.tipo_membro.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => handleDeleteClick(user, e)}
                    >
                      <Trash size={16} />
                    </Button>
                  )}
                  <UserCircle className="text-muted-foreground hidden sm:block" size={18} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Confirmar eliminação</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Tem a certeza que deseja apagar o membro <strong>{userToDelete?.nome_completo}</strong>?
              Esta ação não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setUserToDelete(null)} className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto">
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {filteredUsers.length === 0 && (
        <Card className="p-8 sm:p-12">
          <div className="text-center">
            <UserCircle className="mx-auto text-muted-foreground mb-3" size={48} weight="thin" />
            <h3 className="text-base font-semibold mb-1.5">Nenhum membro encontrado</h3>
            <p className="text-muted-foreground mb-3 text-sm">
              Tente ajustar os filtros ou criar um novo membro.
            </p>
            <Button onClick={onCreateUser} size="sm" className="h-8 text-xs">
              <Plus size={14} className="mr-1.5" />
              Criar Primeiro Membro
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
