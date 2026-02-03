// User helper functions

export function generateMemberNumber(existingUsers: any[]): string {
  const currentYear = new Date().getFullYear();
  const existingNumbers = existingUsers
    .map(u => u.member_number)
    .filter(n => n && n.startsWith(currentYear.toString()))
    .map(n => parseInt(n.split('-')[1] || '0'))
    .filter(n => !isNaN(n));
  
  const nextNumber = existingNumbers.length > 0 
    ? Math.max(...existingNumbers) + 1 
    : 1;
  
  return `${currentYear}-${nextNumber.toString().padStart(4, '0')}`;
}

export function getUserDisplayName(user: any): string {
  return user.full_name || 'Sem nome';
}

export function getUserAge(birthDate: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function isMinor(birthDate: string): boolean {
  const age = getUserAge(birthDate);
  return age !== null && age < 18;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'inactive':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'suspended':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Ativo';
    case 'inactive':
      return 'Inativo';
    case 'suspended':
      return 'Suspenso';
    default:
      return status;
  }
}

export function getMemberTypeLabel(type: string): string {
  const fallbackLabels: Record<string, string> = {
    atleta: 'Atleta',
    encarregado_educacao: 'Encarregado de Educação',
    treinador: 'Treinador',
    dirigente: 'Dirigente',
    funcionario: 'Funcionário',
    socio: 'Sócio',
  };
  return fallbackLabels[type] || type;
}

export function getEscalaoName(escalaoId: string, ageGroups: any[]): string {
  const escalao = ageGroups.find((e: any) => e.id === escalaoId);
  return escalao?.name || escalaoId;
}

export function getEscaloesNames(escalaoIds: string[] = [], ageGroups: any[]): string {
  return escalaoIds
    .map(id => getEscalaoName(id, ageGroups))
    .join(', ');
}

export function getInitials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
