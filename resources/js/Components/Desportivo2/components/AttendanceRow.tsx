interface StatusButton {
  label: string;
  status: string;
  activeClassName: string;
  inactiveClassName: string;
}

interface Props {
  name: string;
  currentStatus: string;
  actions: StatusButton[];
  disabled?: boolean;
  onMark: (status: string) => void;
}

export function AttendanceRow({ name, currentStatus, actions, disabled = false, onMark }: Props) {
  return (
    <div className="flex items-center justify-between gap-2 rounded border px-2 py-1">
      <span className="text-xs font-medium truncate flex-1">{name}</span>
      <div className="flex gap-1 shrink-0">
        {actions.map((action) => (
          <button
            key={action.status}
            type="button"
            onClick={() => onMark(action.status)}
            disabled={disabled}
            className={`w-7 h-7 rounded text-[11px] font-bold transition-all disabled:opacity-40 ${
              currentStatus === action.status ? action.activeClassName : action.inactiveClassName
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
