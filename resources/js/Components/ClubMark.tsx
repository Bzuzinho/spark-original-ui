import { cn } from '@/lib/utils';

interface ClubMarkProps {
    logoUrl?: string | null;
    clubName: string;
    clubShortName: string;
    alt?: string;
    className?: string;
    imageClassName?: string;
    fallbackClassName?: string;
}

function resolveInitials(clubShortName: string, clubName: string): string {
    const source = (clubShortName || clubName).trim();

    if (source === '') {
        return 'CL';
    }

    const sanitized = source.replace(/[^A-Za-z0-9]/g, '');

    if (sanitized.length >= 2) {
        return sanitized.slice(0, 3).toUpperCase();
    }

    return source
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase() || 'CL';
}

export function ClubMark({
    logoUrl = null,
    clubName,
    clubShortName,
    alt,
    className,
    imageClassName,
    fallbackClassName,
}: ClubMarkProps) {
    if (logoUrl) {
        return <img src={logoUrl} alt={alt || `Logo ${clubName}`} className={cn(className, imageClassName)} />;
    }

    return (
        <div className={cn('flex items-center justify-center rounded-full bg-slate-200 text-slate-900', className, fallbackClassName)}>
            <span className="font-semibold uppercase leading-none">{resolveInitials(clubShortName, clubName)}</span>
        </div>
    );
}