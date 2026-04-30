import { ArrowRight, ExternalLink } from 'lucide-react';
import type { StoreHeroItem } from '@/lib/storeApi';

interface StoreHeroCarouselProps {
    items: StoreHeroItem[];
    onNavigate: (item: StoreHeroItem) => void;
}

function heroImage(item: StoreHeroItem): string | null {
    return item.imagem_desktop_path || item.imagem_tablet_path || item.imagem_mobile_path || null;
}

export default function StoreHeroCarousel({ items, onNavigate }: StoreHeroCarouselProps) {
    if (items.length === 0) {
        return (
            <section className="overflow-hidden rounded-[24px] border border-blue-900/10 bg-[linear-gradient(180deg,#0f57b3_0%,#114c98_100%)] p-5 text-white shadow-[0_14px_28px_rgba(15,76,152,0.18)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-100">Loja oficial</p>
                <h2 className="mt-2 text-2xl font-semibold">Veste as nossas cores</h2>
                <p className="mt-2 max-w-2xl text-sm text-blue-50">
                    Explora a colecao oficial do clube, organiza o teu carrinho e acompanha as encomendas sem sair do portal.
                </p>
            </section>
        );
    }

    return (
        <section className="flex snap-x gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {items.map((item) => {
                const image = heroImage(item);
                const hasAction = item.tipo_destino && item.tipo_destino !== 'nenhum';

                return (
                    <article
                        key={item.id}
                        className="relative min-w-full snap-start overflow-hidden rounded-[24px] border border-blue-900/10 bg-[linear-gradient(180deg,#0f57b3_0%,#114c98_100%)] p-5 text-white shadow-[0_14px_28px_rgba(15,76,152,0.18)]"
                        style={{ backgroundColor: item.cor_fundo || undefined }}
                    >
                        <div className="grid gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(220px,0.8fr)] md:items-center">
                            <div>
                                {item.titulo_curto ? (
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-100">{item.titulo_curto}</p>
                                ) : null}
                                <h2 className="mt-2 text-2xl font-semibold leading-tight md:text-3xl">{item.titulo_principal}</h2>
                                {item.descricao ? <p className="mt-3 max-w-2xl text-sm text-blue-50">{item.descricao}</p> : null}

                                {hasAction ? (
                                    <button
                                        type="button"
                                        onClick={() => onNavigate(item)}
                                        className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                                    >
                                        {item.texto_botao || 'Ver destaque'}
                                        {item.tipo_destino === 'url' ? <ExternalLink className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                                    </button>
                                ) : null}
                            </div>

                            <div className="relative flex items-center justify-center overflow-hidden rounded-[20px] border border-white/10 bg-white/10 p-4">
                                {image ? (
                                    <img src={image} alt={item.titulo_principal} className="h-52 w-full rounded-2xl object-cover md:h-60" />
                                ) : (
                                    <div className="flex h-52 w-full items-center justify-center rounded-2xl border border-dashed border-white/20 text-sm text-blue-100 md:h-60">
                                        Hero da colecao
                                    </div>
                                )}
                            </div>
                        </div>
                    </article>
                );
            })}
        </section>
    );
}
