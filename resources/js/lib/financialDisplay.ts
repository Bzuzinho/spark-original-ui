function parseAmount(value: string | number | null | undefined): number {
    if (value === null || value === undefined || value === '') {
        return 0;
    }

    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0;
    }

    const normalized = value
        .replace(/\s+/g, '')
        .replace(/€/g, '')
        .replace(/\./g, '')
        .replace(',', '.');

    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
}

type AmountMeaning = 'auto' | 'debt' | 'credit';
type AmountSurface = 'light' | 'dark';

function resolveSignedAmount(value: string | number | null | undefined, meaning: AmountMeaning): number {
    const parsed = parseAmount(value);

    if (meaning === 'debt') {
        return -Math.abs(parsed);
    }

    if (meaning === 'credit') {
        return Math.abs(parsed);
    }

    return parsed;
}

export function formatSignedCurrency(value: string | number | null | undefined, meaning: AmountMeaning = 'auto'): string {
    const signedAmount = resolveSignedAmount(value, meaning);
    const formatter = new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
    });

    if (signedAmount < 0) {
        return `-${formatter.format(Math.abs(signedAmount))}`;
    }

    if (signedAmount > 0) {
        return `+${formatter.format(signedAmount)}`;
    }

    return formatter.format(0);
}

export function amountToneClass(
    value: string | number | null | undefined,
    meaning: AmountMeaning = 'auto',
    surface: AmountSurface = 'light',
): string {
    const signedAmount = resolveSignedAmount(value, meaning);

    if (signedAmount < 0) {
        return surface === 'dark' ? 'text-rose-100' : 'text-rose-600';
    }

    if (signedAmount > 0) {
        return surface === 'dark' ? 'text-emerald-100' : 'text-emerald-600';
    }

    return surface === 'dark' ? 'text-white' : 'text-slate-900';
}