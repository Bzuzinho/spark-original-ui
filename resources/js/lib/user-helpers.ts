export function getUserDisplayName(user: any): string {
    return user?.nome_completo || user?.name || 'No name';
}

export function getStatusColor(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status?.toLowerCase()) {
        case 'ativo':
        case 'active':
            return 'default';
        case 'inativo':
        case 'inactive':
            return 'secondary';
        case 'suspenso':
        case 'suspended':
            return 'destructive';
        default:
            return 'outline';
    }
}

export function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        'ativo': 'Active',
        'active': 'Active',
        'inativo': 'Inactive',
        'inactive': 'Inactive',
        'suspenso': 'Suspended',
        'suspended': 'Suspended',
    };
    return labels[status?.toLowerCase()] || status || 'Unknown';
}

export function getMemberTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        'atleta': 'Athlete',
        'athlete': 'Athlete',
        'encarregado_educacao': 'Guardian',
        'guardian': 'Guardian',
        'socio': 'Member',
        'member': 'Member',
        'staff': 'Staff',
        'treinador': 'Coach',
        'coach': 'Coach',
        'dirigente': 'Director',
        'director': 'Director',
    };
    return labels[type?.toLowerCase()] || type || 'Other';
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string | null | undefined): number | null {
    if (!birthDate) return null;
    
    try {
        const today = new Date();
        const birth = new Date(birthDate);
        
        if (isNaN(birth.getTime())) return null;
        
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age >= 0 ? age : null;
    } catch (error) {
        return null;
    }
}

/**
 * Format phone number (Portuguese format)
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
    if (!phone) return '';
    
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Portuguese mobile: +351 9XX XXX XXX
    if (cleaned.length === 9 && cleaned.startsWith('9')) {
        return `+351 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    
    // Portuguese landline: +351 2XX XXX XXX
    if (cleaned.length === 9 && cleaned.startsWith('2')) {
        return `+351 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    
    // International format (already has country code)
    if (cleaned.length > 9) {
        return `+${cleaned}`;
    }
    
    // Return original if format unknown
    return phone;
}

/**
 * Format date to locale string
 */
export function formatDate(date: string | null | undefined, locale: string = 'pt-PT'): string {
    if (!date) return '';
    
    try {
        return new Date(date).toLocaleDateString(locale);
    } catch (error) {
        return date;
    }
}

/**
 * Format date and time to locale string
 */
export function formatDateTime(date: string | null | undefined, locale: string = 'pt-PT'): string {
    if (!date) return '';
    
    try {
        return new Date(date).toLocaleString(locale);
    } catch (error) {
        return date;
    }
}

/**
 * Check if user is minor (under 18)
 */
export function isMinor(birthDate: string | null | undefined): boolean {
    const age = calculateAge(birthDate);
    return age !== null && age < 18;
}

/**
 * Get initials from name
 */
export function getInitials(name: string | null | undefined): string {
    if (!name) return '??';
    
    return name
        .split(' ')
        .map(n => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

/**
 * Format currency (EUR)
 */
export function formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return '€0.00';
    
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string | null | undefined, maxLength: number = 50): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}
