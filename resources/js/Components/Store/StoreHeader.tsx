import { Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

interface StoreHeaderProps {
    search: string;
    onSearchChange: (value: string) => void;
    onSubmitSearch: () => void;
    cartCount: number;
    onOpenCart: () => void;
}

export default function StoreHeader({
    search,
    onSearchChange,
    onSubmitSearch,
    cartCount,
    onOpenCart,
}: StoreHeaderProps) {
    return (
        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-600">Loja do Clube</p>
                    <h1 className="mt-1 text-xl font-semibold text-slate-900">Colecao oficial BSCN</h1>
                </div>

                <Button type="button" variant="outline" className="relative h-10 rounded-2xl px-3" onClick={onOpenCart}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Carrinho
                    {cartCount > 0 ? (
                        <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                            {cartCount}
                        </span>
                    ) : null}
                </Button>
            </div>

            <div className="mt-4 flex gap-2">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                onSubmitSearch();
                            }
                        }}
                        placeholder="Pesquisar produtos, codigos ou descricoes"
                        className="h-11 rounded-2xl border-slate-200 pl-9"
                    />
                </div>
                <Button type="button" className="h-11 rounded-2xl bg-blue-600 px-4 hover:bg-blue-700" onClick={onSubmitSearch}>
                    Pesquisar
                </Button>
            </div>
        </section>
    );
}
