import type { LucideIcon } from 'lucide-react';

interface PortalBottomNavItem {
    key: string;
    label: string;
    icon: LucideIcon;
    href: string;
}

interface PortalBottomNavProps {
    items: PortalBottomNavItem[];
    onNavigate: (href: string) => void;
    activeKey?: string;
}

export default function PortalBottomNav({ items, onNavigate, activeKey }: PortalBottomNavProps) {
    const gridColumnsClass = items.length >= 5 ? 'grid-cols-5' : 'grid-cols-4';

    return (
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
            <div className={`mx-auto grid max-w-xl gap-2 ${gridColumnsClass}`}>
                {items.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        onClick={() => onNavigate(item.href)}
                        className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[10px] font-medium transition sm:px-2 sm:text-[11px] ${activeKey === item.key ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-blue-700'}`}
                    >
                        <item.icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                        <span className="truncate">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
}