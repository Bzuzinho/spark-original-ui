import { usePage } from '@inertiajs/react';
import type { ClubSettingsProps, PageProps } from '@/types';

const fallbackSettings: ClubSettingsProps = {
    nome_clube: 'Clube',
    sigla: 'CLUBE',
    morada: null,
    codigo_postal: null,
    localidade: null,
    telefone: null,
    email: null,
    website: null,
    nif: null,
    iban: null,
    logo_url: null,
    horario_funcionamento: [],
    redes_sociais: [],
    display_name: 'Clube',
    short_name: 'CLUBE',
    default_financial_entity_name: 'Clube',
    default_meeting_point: 'Sede do Clube',
};

export function useClubSettings() {
    const { clubSettings } = usePage<PageProps>().props;

    const clubName = clubSettings?.nome_clube?.trim() || 'Clube';
    const clubShortName = clubSettings?.short_name?.trim() || clubSettings?.sigla?.trim() || 'CLUBE';
    const clubLogoUrl = clubSettings?.logo_url || null;
    const clubDisplayName = clubSettings?.display_name?.trim() || clubName || clubShortName;
    const defaultFinancialEntityName = clubSettings?.default_financial_entity_name?.trim() || clubName;
    const defaultMeetingPoint = clubSettings?.default_meeting_point?.trim() || 'Sede do Clube';

    return {
        clubName,
        clubShortName,
        clubLogoUrl,
        clubDisplayName,
        defaultFinancialEntityName,
        defaultMeetingPoint,
        settings: {
            ...fallbackSettings,
            ...clubSettings,
            nome_clube: clubName,
            sigla: clubSettings?.sigla?.trim() || clubShortName,
            logo_url: clubLogoUrl,
            display_name: clubDisplayName,
            short_name: clubShortName,
            default_financial_entity_name: defaultFinancialEntityName,
            default_meeting_point: defaultMeetingPoint,
        },
    };
}