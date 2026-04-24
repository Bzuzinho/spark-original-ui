import type { LucideIcon } from 'lucide-react';

interface PortalKpiCardProps {
    label: string;
    value: string;
    helper: string;
    icon: LucideIcon;
}

export default function PortalKpiCard({ label, value, helper, icon: Icon }: PortalKpiCardProps) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-medium text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-slate-400">{helper}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50 text-blue-600">
                    <Icon className="h-4 w-4" />
                </div>
            </div>
        </div>
    );
}