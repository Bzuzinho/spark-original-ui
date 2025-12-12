import type { User } from './types';

export async function authenticateUser(
  email: string, 
  password: string, 
  users: User[]
): Promise<User | null> {
  const user = users.find(u => u.email_utilizador === email);
  
  if (!user) {
    return null;
  }
  
  if (user.senha === password) {
    return user;
  }
  
  return null;
}

export async function initializeAdminUser(
  users: User[],
  setUsers: (updater: (current: User[]) => User[]) => void
): Promise<void> {
  const currentUsers = users || [];
  const adminExists = currentUsers.some(u => u.email_utilizador === 'admin@bscn.pt');
  
  if (!adminExists) {
    const adminUser: User = {
      id: crypto.randomUUID(),
      numero_socio: '2025-0001',
      nome_completo: 'Administrador',
      email_utilizador: 'admin@bscn.pt',
      senha: 'password123',
      perfil: 'admin',
      tipo_membro: [],
      estado: 'ativo',
      data_nascimento: '1990-01-01',
      menor: false,
      sexo: 'masculino',
      rgpd: true,
      consentimento: true,
      afiliacao: true,
      declaracao_de_transporte: true,
      ativo_desportivo: false,
    };
    
    setUsers(current => [...(current || []), adminUser]);
  }
}

