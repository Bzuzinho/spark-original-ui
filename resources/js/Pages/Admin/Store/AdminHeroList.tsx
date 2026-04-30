import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { SectionTitle } from '@/components/sports/shared';
import type { PageProps as SharedPageProps } from '@/types';
import { formatStoreDate, storeRequest } from '@/lib/storeApi';
import { StoreAdminShell } from './StoreAdminShell';

interface AdminHeroItem {
    id: string;
    titulo_curto?: string | null;
    titulo_principal: string;
    descricao?: string | null;
    texto_botao?: string | null;
    tipo_destino?: string | null;
    produto?: { id: string; nome: string } | null;
    categoria?: { id: string; nome: string } | null;
    url_destino?: string | null;
    imagem_mobile_path?: string | null;
    cor_fundo?: string | null;
    ativo: boolean;
    ordem?: number | null;
    data_inicio?: string | null;
    data_fim?: string | null;
}

interface AdminHeroListProps {
    items: AdminHeroItem[];
}

type PageProps = SharedPageProps<AdminHeroListProps>;

export default function AdminHeroList() {
    const { props } = usePage<PageProps>();
    const { items } = props;
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const toggleItem = async (itemId: string) => {
        try {
            setLoadingId(itemId);
            await storeRequest(`/api/admin/loja/hero/${itemId}/toggle`, {
                method: 'PATCH',
                body: JSON.stringify({}),
            });
            toast.success('Estado do hero atualizado.');
            router.reload({ only: ['items'] });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Não foi possível atualizar o hero.');
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <StoreAdminShell
            title="Hero da Loja"
            description="Slides configuráveis para o topo da loja do utilizador."
            activeTab="hero"
            actions={
                <Button type="button" size="sm" onClick={() => router.visit('/admin/loja/hero/criar')}>
                    Novo item hero
                </Button>
            }
        >
            <Head title="Hero da Loja" />

            <div className="space-y-3">
                <Card>
                    <CardHeader className="pb-2">
                        <SectionTitle title="Itens do hero" subtitle="Ordenação, ativação e pré-visualização rápida dos destaques do topo da loja." />
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 lg:grid-cols-2">
                    {items.length > 0 ? items.map((item) => (
                        <article key={item.id} className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
                            <div className="grid min-h-[220px] gap-0 md:grid-cols-[1.1fr_0.9fr]">
                                <div className="p-5 text-white" style={{ background: item.cor_fundo || 'linear-gradient(135deg, #1d4ed8 0%, #0f766e 100%)' }}>
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">{item.titulo_curto || 'Hero Loja'}</p>
                                    <h2 className="mt-3 text-2xl font-semibold">{item.titulo_principal}</h2>
                                    {item.descricao ? <p className="mt-3 max-w-md text-sm leading-6 text-white/85">{item.descricao}</p> : null}
                                    {item.texto_botao ? <span className="mt-5 inline-flex rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">{item.texto_botao}</span> : null}
                                </div>
                                <div className="flex items-center justify-center bg-slate-100 p-4">
                                    {item.imagem_mobile_path ? <img src={item.imagem_mobile_path} alt={item.titulo_principal} className="h-full max-h-[220px] w-full rounded-md object-cover" /> : <div className="text-sm text-slate-400">Sem imagem</div>}
                                </div>
                            </div>

                            <div className="border-t border-slate-200 p-5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline" className={item.ativo ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-700'}>
                                        {item.ativo ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                    <Badge variant="outline">Ordem {item.ordem ?? 0}</Badge>
                                    {item.tipo_destino ? <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">Destino {item.tipo_destino}</Badge> : null}
                                </div>

                                <div className="mt-3 text-sm text-slate-500">
                                    {item.produto ? <p>Produto: {item.produto.nome}</p> : null}
                                    {item.categoria ? <p>Categoria: {item.categoria.nome}</p> : null}
                                    {item.url_destino ? <p>URL: {item.url_destino}</p> : null}
                                    <p>Período: {formatStoreDate(item.data_inicio)} até {formatStoreDate(item.data_fim)}</p>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => router.visit(`/admin/loja/hero/${item.id}/editar`)}>Editar</Button>
                                    <Button type="button" variant="outline" size="sm" disabled={loadingId === item.id} onClick={() => toggleItem(item.id)}>
                                        {loadingId === item.id ? 'A atualizar...' : item.ativo ? 'Desativar' : 'Ativar'}
                                    </Button>
                                </div>
                            </div>
                        </article>
                    )) : (
                        <article className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-sm text-slate-500 lg:col-span-2">
                            Ainda não existem slides configurados para o hero da Loja.
                        </article>
                    )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StoreAdminShell>
    );
}