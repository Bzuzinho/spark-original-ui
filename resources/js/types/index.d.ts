export type User = Partial<import('@/lib/types').User> & {
    id: number | string;
    name?: string;
    email?: string;
    email_verified_at?: string;
    full_name?: string;
    member_number?: string;
    photo?: string;
};

export type Event = import('@/lib/types').Event;
export type ConvocatoriaAtleta = import('@/lib/types').ConvocatoriaAtleta;
export type ConvocatoriaGrupo = import('@/lib/types').ConvocatoriaGrupo;
export type ResultadoProva = import('@/lib/types').ResultadoProva;
export type EventoPresenca = import('@/lib/types').EventoPresenca;

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
