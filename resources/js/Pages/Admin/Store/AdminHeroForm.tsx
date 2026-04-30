import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { SectionTitle } from '@/components/sports/shared';
import type { PageProps as SharedPageProps } from '@/types';
import { storeRequest } from '@/lib/storeApi';
import { StoreAdminShell } from './StoreAdminShell';

interface AdminHeroTargetProduct {
    id: string;
    nome: string;
    slug: string;
}

interface AdminHeroTargetCategory {
    id: string;
    nome: string;
}

interface AdminHeroItem {
    id: string;
    titulo_curto?: string | null;
    titulo_principal: string;
    descricao?: string | null;
    texto_botao?: string | null;
    tipo_destino?: 'produto' | 'categoria' | 'url' | 'nenhum' | null;
    produto_id?: string | null;
    categoria_id?: string | null;
    url_destino?: string | null;
    imagem_desktop_path?: string | null;
    imagem_tablet_path?: string | null;
    imagem_mobile_path?: string | null;
    cor_fundo?: string | null;
    ativo: boolean;
    ordem?: number | null;
    data_inicio?: string | null;
    data_fim?: string | null;
}

interface AdminHeroFormProps {
    item: AdminHeroItem | null;
    products: AdminHeroTargetProduct[];
    categories: AdminHeroTargetCategory[];
}

type PageProps = SharedPageProps<AdminHeroFormProps>;

export default function AdminHeroForm() {
    const { props } = usePage<PageProps>();
    const { item, products, categories } = props;
    const editing = Boolean(item);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        titulo_curto: item?.titulo_curto || '',
        titulo_principal: item?.titulo_principal || '',
        descricao: item?.descricao || '',
        texto_botao: item?.texto_botao || '',
        tipo_destino: item?.tipo_destino || 'nenhum',
        produto_id: item?.produto_id || '',
        categoria_id: item?.categoria_id || '',
        url_destino: item?.url_destino || '',
        imagem_desktop_path: item?.imagem_desktop_path || '',
        imagem_tablet_path: item?.imagem_tablet_path || '',
        imagem_mobile_path: item?.imagem_mobile_path || '',
        cor_fundo: item?.cor_fundo || '#1d4ed8',
        ativo: item?.ativo ?? true,
        ordem: item?.ordem != null ? String(item.ordem) : '0',
        data_inicio: item?.data_inicio ? item.data_inicio.slice(0, 16) : '',
        data_fim: item?.data_fim ? item.data_fim.slice(0, 16) : '',
    });

    const submit = async () => {
        try {
            setSubmitting(true);
            await storeRequest(editing ? `/api/admin/loja/hero/${item?.id}` : '/api/admin/loja/hero', {
                method: editing ? 'PATCH' : 'POST',
                body: JSON.stringify({
                    titulo_curto: form.titulo_curto || null,
                    titulo_principal: form.titulo_principal,
                    descricao: form.descricao || null,
                    texto_botao: form.texto_botao || null,
                    tipo_destino: form.tipo_destino || 'nenhum',
                    produto_id: form.tipo_destino === 'produto' ? form.produto_id || null : null,
                    categoria_id: form.tipo_destino === 'categoria' ? form.categoria_id || null : null,
                    url_destino: form.tipo_destino === 'url' ? form.url_destino || null : null,
                    imagem_desktop_path: form.imagem_desktop_path || null,
                    imagem_tablet_path: form.imagem_tablet_path || null,
                    imagem_mobile_path: form.imagem_mobile_path || null,
                    cor_fundo: form.cor_fundo || null,
                    ativo: form.ativo,
                    ordem: Number(form.ordem || 0),
                    data_inicio: form.data_inicio || null,
                    data_fim: form.data_fim || null,
                }),
            });
            toast.success(editing ? 'Hero atualizado com sucesso.' : 'Hero criado com sucesso.');
            router.visit('/admin/loja/hero');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Não foi possível guardar o hero.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <StoreAdminShell
            title={editing ? 'Editar hero da Loja' : 'Novo hero da Loja'}
            description="Texto, CTA, destino e imagens responsivas para o topo da loja."
            activeTab="hero"
            actions={
                <Button type="button" variant="outline" size="sm" onClick={() => router.visit('/admin/loja/hero')}>
                    Voltar ao hero
                </Button>
            }
        >
            <Head title={editing ? 'Editar hero da Loja' : 'Novo hero da Loja'} />

            <div className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_360px]">
                <Card>
                    <CardHeader className="pb-2">
                        <SectionTitle title="Configuração do hero" subtitle="Mensagem, destino, período e imagens por breakpoint." />
                    </CardHeader>
                    <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Título curto</label>
                            <Input value={form.titulo_curto} onChange={(event) => setForm((current) => ({ ...current, titulo_curto: event.target.value }))} className="mt-2" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Texto do botão</label>
                            <Input value={form.texto_botao} onChange={(event) => setForm((current) => ({ ...current, texto_botao: event.target.value }))} className="mt-2" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Título principal</label>
                            <Input value={form.titulo_principal} onChange={(event) => setForm((current) => ({ ...current, titulo_principal: event.target.value }))} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Descrição</label>
                        <textarea value={form.descricao} onChange={(event) => setForm((current) => ({ ...current, descricao: event.target.value }))} className="mt-2 min-h-[130px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none" />
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Tipo de destino</label>
                            <select value={form.tipo_destino} onChange={(event) => setForm((current) => ({ ...current, tipo_destino: event.target.value as 'produto' | 'categoria' | 'url' | 'nenhum' }))} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none">
                                <option value="nenhum">Nenhum</option>
                                <option value="produto">Produto</option>
                                <option value="categoria">Categoria</option>
                                <option value="url">URL</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Cor de fundo</label>
                            <Input value={form.cor_fundo} onChange={(event) => setForm((current) => ({ ...current, cor_fundo: event.target.value }))} className="mt-2" />
                        </div>
                        {form.tipo_destino === 'produto' ? (
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Produto destino</label>
                                <select value={form.produto_id} onChange={(event) => setForm((current) => ({ ...current, produto_id: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none">
                                    <option value="">Selecionar produto</option>
                                    {products.map((product) => <option key={product.id} value={product.id}>{product.nome}</option>)}
                                </select>
                            </div>
                        ) : null}
                        {form.tipo_destino === 'categoria' ? (
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Categoria destino</label>
                                <select value={form.categoria_id} onChange={(event) => setForm((current) => ({ ...current, categoria_id: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none">
                                    <option value="">Selecionar categoria</option>
                                    {categories.map((category) => <option key={category.id} value={category.id}>{category.nome}</option>)}
                                </select>
                            </div>
                        ) : null}
                        {form.tipo_destino === 'url' ? (
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">URL destino</label>
                                <Input value={form.url_destino} onChange={(event) => setForm((current) => ({ ...current, url_destino: event.target.value }))} className="mt-2" />
                            </div>
                        ) : null}
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Imagem desktop</label>
                            <Input value={form.imagem_desktop_path} onChange={(event) => setForm((current) => ({ ...current, imagem_desktop_path: event.target.value }))} className="mt-2" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Imagem tablet</label>
                            <Input value={form.imagem_tablet_path} onChange={(event) => setForm((current) => ({ ...current, imagem_tablet_path: event.target.value }))} className="mt-2" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Imagem mobile</label>
                            <Input value={form.imagem_mobile_path} onChange={(event) => setForm((current) => ({ ...current, imagem_mobile_path: event.target.value }))} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Ordem</label>
                            <Input type="number" value={form.ordem} onChange={(event) => setForm((current) => ({ ...current, ordem: event.target.value }))} className="mt-2" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Data início</label>
                            <Input type="datetime-local" value={form.data_inicio} onChange={(event) => setForm((current) => ({ ...current, data_inicio: event.target.value }))} className="mt-2" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Data fim</label>
                            <Input type="datetime-local" value={form.data_fim} onChange={(event) => setForm((current) => ({ ...current, data_fim: event.target.value }))} className="mt-2" />
                        </div>
                    </div>

                    <label className="mt-4 flex items-center gap-3 rounded-md border border-border px-3 py-2.5 text-sm font-medium text-slate-700">
                        <input type="checkbox" checked={form.ativo} onChange={(event) => setForm((current) => ({ ...current, ativo: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                        Hero ativo
                    </label>
                    </CardContent>
                </Card>

                <div className="space-y-3">
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <SectionTitle title="Pré-visualização" subtitle="Aproximação do destaque visível no topo da loja." />
                        </CardHeader>
                        <CardContent>
                        <div className="min-h-[320px] p-6 text-white" style={{ background: form.cor_fundo || 'linear-gradient(135deg, #1d4ed8 0%, #0f766e 100%)' }}>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/75">{form.titulo_curto || 'Pré-visualização'}</p>
                            <h2 className="mt-3 text-3xl font-semibold leading-tight">{form.titulo_principal || 'Título principal do hero'}</h2>
                            <p className="mt-3 text-sm leading-6 text-white/85">{form.descricao || 'Descrição do destaque da Loja, adaptada ao portal e aos cards brancos do ClubOS.'}</p>
                            {form.texto_botao ? <span className="mt-5 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white">{form.texto_botao}</span> : null}
                        </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" onClick={() => router.visit('/admin/loja/hero')}>Cancelar</Button>
                        <Button type="button" disabled={submitting} onClick={submit}>
                            {submitting ? 'A guardar...' : editing ? 'Guardar hero' : 'Criar hero'}
                        </Button>
                    </div>
                </div>
            </div>
        </StoreAdminShell>
    );
}