import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import type { StoreCartItem } from '@/lib/storeApi';
import { formatStoreCurrency } from '@/lib/storeApi';

interface CartItemRowProps {
    item: StoreCartItem;
    onQuantityChange: (item: StoreCartItem, quantity: number) => void;
    onRemove: (item: StoreCartItem) => void;
    busy?: boolean;
}

export default function CartItemRow({ item, onQuantityChange, onRemove, busy = false }: CartItemRowProps) {
    return (
        <article className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
            <div className="flex gap-3">
                <div className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-100">
                    {item.produto?.imagem_principal_path ? (
                        <img src={item.produto.imagem_principal_path} alt={item.produto.nome} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full items-center justify-center text-xs text-slate-400">Sem imagem</div>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">{item.produto?.nome || 'Produto removido'}</p>
                            {item.variante?.etiqueta ? <p className="mt-1 text-xs text-slate-500">{item.variante.etiqueta}</p> : null}
                            <p className="mt-2 text-sm font-semibold text-blue-700">{formatStoreCurrency(item.total_linha)}</p>
                        </div>

                        <Button type="button" variant="ghost" size="icon" disabled={busy} onClick={() => onRemove(item)}>
                            <Trash2 className="h-4 w-4 text-rose-600" />
                        </Button>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                        <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-xl" disabled={busy || item.quantidade <= 1} onClick={() => onQuantityChange(item, item.quantidade - 1)}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <div className="flex h-9 min-w-12 items-center justify-center rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-900">
                            {item.quantidade}
                        </div>
                        <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-xl" disabled={busy} onClick={() => onQuantityChange(item, item.quantidade + 1)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                        <span className="ml-auto text-xs text-slate-500">{formatStoreCurrency(item.preco_unitario)} / un.</span>
                    </div>
                </div>
            </div>
        </article>
    );
}
