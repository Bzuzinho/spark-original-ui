import type { StoreCategory } from '@/lib/storeApi';

interface CategoryScrollerProps {
    categories: StoreCategory[];
    activeCategoryId: string;
    onSelect: (categoryId: string) => void;
}

export default function CategoryScroller({ categories, activeCategoryId, onSelect }: CategoryScrollerProps) {
    return (
        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold text-slate-900">Categorias</h2>
                    <p className="text-sm text-slate-500">Filtra rapidamente a colecao oficial.</p>
                </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                    type="button"
                    onClick={() => onSelect('all')}
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${activeCategoryId === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                    Todas
                </button>
                {categories.map((category) => (
                    <button
                        key={category.id}
                        type="button"
                        onClick={() => onSelect(category.id)}
                        className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-semibold transition ${activeCategoryId === category.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        {category.nome}
                    </button>
                ))}
            </div>
        </section>
    );
}
