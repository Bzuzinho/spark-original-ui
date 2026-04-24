interface PortalUserContextOption {
    key: string;
    label: string;
    helper?: string | null;
}

interface PortalUserContextSwitcherProps {
    options: PortalUserContextOption[];
    activeKey: string;
    onChange: (key: string) => void;
}

export default function PortalUserContextSwitcher({
    options,
    activeKey,
    onChange,
}: PortalUserContextSwitcherProps) {
    return (
        <div className="rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {options.map((option) => {
                    const isActive = option.key === activeKey;

                    return (
                        <button
                            key={option.key}
                            type="button"
                            onClick={() => onChange(option.key)}
                            className={`rounded-2xl border px-3 py-3 text-left transition ${
                                isActive
                                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                            }`}
                        >
                            <p className="text-sm font-semibold">{option.label}</p>
                            {option.helper ? (
                                <p className="mt-1 text-xs text-slate-500">{option.helper}</p>
                            ) : null}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}