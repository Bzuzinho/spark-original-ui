import { Eye, ShoppingBag } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import type { StoreProduct } from '@/lib/storeApi';
import { formatStoreCurrency } from '@/lib/storeApi';

interface ProductCardProps {
    product: StoreProduct;
    onView: (product: StoreProduct) => void;
    onAdd: (product: StoreProduct) => void;
}

function stockLabel(product: StoreProduct): { label: string; className: string } {
    if (!product.gere_stock) {
        return { label: 'Disponivel', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
    }

    if (product.stock_atual <= 0) {
        return { label: 'Sem stock', className: 'border-rose-200 bg-rose-50 text-rose-700' };
    }

    if (product.tem_stock_baixo) {
        return { label: 'Stock baixo', className: 'border-amber-200 bg-amber-50 text-amber-700' };
    }

    return { label: `${product.stock_atual} em stock`, className: 'border-sky-200 bg-sky-50 text-sky-700' };
}

export default function ProductCard({ product, onView, onAdd }: ProductCardProps) {
    const badge = stockLabel(product);

    return (
        <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <div className="aspect-[4/3] bg-slate-100">
                {product.imagem_principal_path ? (
                    <img src={product.imagem_principal_path} alt={product.nome} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">Sem imagem</div>
                )}
            </div>

            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-slate-900">{product.nome}</p>
                        <p className="mt-1 text-xs text-slate-500">{product.categoria?.nome || 'Colecao oficial'}</p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badge.className}`}>
                        {badge.label}
                    </span>
                </div>

                <p className="mt-3 text-lg font-semibold text-blue-700">{formatStoreCurrency(product.preco)}</p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">{product.descricao || 'Artigo oficial do clube com recolha e acompanhamento via portal.'}</p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" className="rounded-2xl" onClick={() => onView(product)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver artigo
                    </Button>
                    <Button
                        type="button"
                        className="rounded-2xl bg-blue-600 hover:bg-blue-700"
                        disabled={product.gere_stock && product.stock_atual <= 0}
                        onClick={() => onAdd(product)}
                    >
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Comprar
                    </Button>
                </div>
            </div>
        </article>
    );
}
