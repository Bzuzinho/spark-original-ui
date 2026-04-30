import { ShoppingCart } from 'lucide-react';

export default function EmptyCartState() {
    return (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">O carrinho esta vazio</h2>
            <p className="mt-2 text-sm text-slate-500">Adiciona artigos da colecao oficial para preparar uma nova encomenda.</p>
        </div>
    );
}
