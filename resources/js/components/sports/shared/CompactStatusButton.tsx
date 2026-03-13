import { Button } from '@/Components/ui/button';

interface CompactStatusButtonProps {
  label: string;
  title: string;
  isActive: boolean;
  activeClassName: string;
  sizeClassName: string;
  disabled?: boolean;
  onClick: () => void;
}

export function CompactStatusButton({
  label,
  title,
  isActive,
  activeClassName,
  sizeClassName,
  disabled = false,
  onClick,
}: CompactStatusButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      className={`${sizeClassName} px-0 ${isActive ? activeClassName : ''}`}
      onClick={onClick}
      title={title}
    >
      {label}
    </Button>
  );
}
