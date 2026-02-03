import { useRef } from 'react';
import { Button } from './ui/Button';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  label?: string;
  accept?: string;
  onChange?: (file: File | null) => void;
  value?: string;
  disabled?: boolean;
}

export function FileUpload({ label, accept, onChange, value, disabled }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange?.(file);
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={disabled}
        >
          <Upload className="mr-2 h-4 w-4" />
          Choose File
        </Button>
        {value && <span className="text-sm text-gray-600">{value}</span>}
      </div>
    </div>
  );
}
