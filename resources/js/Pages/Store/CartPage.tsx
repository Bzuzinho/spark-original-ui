import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import CartItemRow from '@/Components/Store/CartItemRow';
import EmptyCartState from '@/Components/Store/EmptyCartState';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import PortalLayout from '@/Layouts/PortalLayout';
import type { PageProps as SharedPageProps } from '@/types';
import { formatStoreCurrency, type StoreCart, type StoreCartItem, type StoreProfileOption, storeRequest } from '@/lib/storeApi';

interface CartPageProps {
    cart: StoreCart;
    profiles: StoreProfileOption[];
}

type PageProps = SharedPageProps<CartPageProps> & {
    accessControl?: {
        visibleMenuModules?: string[];
    };
};

export default function CartPage() {
    const { props } = usePage<PageProps>();
    const { auth, clubSettings, accessControl, cart, profiles } = props;
    const [localCart, setLocalCart] = useState<StoreCart>(cart);
    const [targetUserId, setTargetUserId] = useState<string>('self');
    const [observacoes, setObservacoes] = useState(localCart.observacoes || '');
    const [busyItemId, setBusyItemId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const isAlsoAdmin = Boolean(accessControl?.visibleMenuModules?.includes('loja'));

    const updateItem = async (item: StoreCartItem, quantity: number) => {
        try {
            setBusyItemId(item.id);
            const nextCart = await storeRequest<StoreCart>(`/api/loja/carrinho/itens/${item.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ quantidade: quantity, observacoes }),
            });
            setLocalCart(nextCart);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Nao foi possivel atualizar o item.');
        } finally {
            setBusyItemId(null);
        }
    };

    const removeItem = async (item: StoreCartItem) => {
        try {
            setBusyItemId(item.id);
            const nextCart = await storeRequest<StoreCart>(`/api/loja/carrinho/itens/${item.id}`, {
                method: 'DELETE',
                body: JSON.stringify({}),
            });
            setLocalCart(nextCart);
            toast.success('Artigo removido do carrinho.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Nao foi possivel remover o item.');
        } finally {
            setBusyItemId(null);
        }
    };

    const submitOrder = async () => {
        try {
            setSubmitting(true);
            const response = await storeRequest<{ encomenda_id: string; numero: string; message: string }>('/api/loja/carrinho/submeter', {
                method: 'POST',
                body: JSON.stringify({
                    target_user_id: targetUserId === 'self' ? null : targetUserId,
                    observacoes,
                }),
            });

            toast.success(response.message || 'Encomenda submetida com sucesso.');
            router.visit(`/loja/historico/${response.encomenda_id}`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Nao foi possivel submeter a encomenda.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Head title="Carrinho" />
            <PortalLayout user={auth.user} clubSettings={clubSettings} isAlsoAdmin={isAlsoAdmin} activeNav="shop" hasFamily={profiles.length > 1}>
                <section className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
                    <div className="space-y-4">
                        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h1 className="text-xl font-semibold text-slate-900">Carrinho</h1>
                                    <p className="text-sm text-slate-500">Valida quantidades, stock e observacoes antes de submeter.</p>
                                </div>
                                <Button type="button" variant="outline" className="rounded-2xl" onClick={() => router.visit('/loja')}>
                                    Continuar a comprar
                                </Button>
                            </div>
                        </section>

                        {localCart.items.length === 0 ? (
                            <EmptyCartState />
                        ) : (
                            <div className="space-y-3">
                                {localCart.items.map((item) => (
                                    <CartItemRow
                                        key={item.id}
                                        item={item}
                                        busy={busyItemId === item.id}
                                        onQuantityChange={updateItem}
                                        onRemove={removeItem}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <aside className="space-y-4">
                        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                            <h2 className="text-base font-semibold text-slate-900">Resumo do pedido</h2>

                            <div className="mt-4 space-y-3">
                                <div className="flex items-center justify-between text-sm text-slate-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-slate-900">{formatStoreCurrency(localCart.subtotal)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-slate-600">
                                    <span>Total</span>
                                    <span className="text-lg font-semibold text-blue-700">{formatStoreCurrency(localCart.total)}</span>
                                </div>
                            </div>

                            <div className="mt-5">
                                <label className="text-sm font-semibold text-slate-900">Comprar para</label>
                                <Select value={targetUserId} onValueChange={setTargetUserId}>
                                    <SelectTrigger className="mt-2 h-11 rounded-2xl">
                                        <SelectValue placeholder="Selecionar perfil" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="self">Eu proprio</SelectItem>
                                        {profiles.filter((profile) => !profile.is_self).map((profile) => (
                                            <SelectItem key={profile.id} value={profile.id}>{profile.nome_completo}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="mt-5">
                                <label className="text-sm font-semibold text-slate-900">Observacoes</label>
                                <Textarea
                                    value={observacoes}
                                    onChange={(event) => setObservacoes(event.target.value)}
                                    placeholder="Notas para a encomenda ou recolha"
                                    className="mt-2 min-h-[110px] rounded-2xl"
                                />
                            </div>

                            <div className="mt-5 grid gap-2">
                                <Button type="button" className="h-11 rounded-2xl bg-blue-600 hover:bg-blue-700" disabled={localCart.items.length === 0 || submitting} onClick={submitOrder}>
                                    {submitting ? 'A submeter...' : 'Submeter pedido'}
                                </Button>
                                <Button type="button" variant="outline" className="h-11 rounded-2xl" onClick={() => router.visit('/loja/historico')}>
                                    Ver historico
                                </Button>
                            </div>
                        </section>
                    </aside>
                </section>
            </PortalLayout>
        </>
    );
}
