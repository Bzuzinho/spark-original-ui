import { PackageSearch } from 'lucide-react';

export default function EmptyOrdersState() {
    return (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                <PackageSearch className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Sem encomendas registadas</h2>
            <p className="mt-2 text-sm text-slate-500">Quando submeteres o primeiro pedido, o historico da Loja fica disponivel aqui.</p>
        </div>
    );
}
