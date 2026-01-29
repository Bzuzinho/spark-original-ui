export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    nome_completo?: string;
    email_utilizador?: string;
    foto_perfil?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
