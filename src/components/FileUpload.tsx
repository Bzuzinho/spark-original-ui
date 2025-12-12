import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface FileUploadProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  placeholder?: string;
}

export function FileUpload({ 
  value, 
  onChange, 
  disabled = false, 
  accept = '*/*',
  multiple = false,
  maxSizeMB = 10,
  placeholder = 'Nenhum ficheiro carregado'
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const maxSize = maxSizeMB * 1024 * 1024;

    for (const file of fileArray) {
      if (file.size > maxSize) {
        toast.error(`O ficheiro ${file.name} excede o tamanho máximo de ${maxSizeMB}MB`);
        return;
      }
    }

    const readerPromises = fileArray.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          resolve(result);
        };
        reader.onerror = () => reject(new Error(`Erro ao ler ${file.name}`));
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readerPromises)
      .then(results => {
        if (multiple) {
          const currentFiles = Array.isArray(value) ? value : (value ? [value] : []);
          onChange([...currentFiles, ...results]);
        } else {
          onChange(results[0]);
        }
        toast.success(fileArray.length === 1 ? 'Ficheiro carregado!' : `${fileArray.length} ficheiros carregados!`);
      })
      .catch(error => {
        toast.error(error.message || 'Erro ao carregar ficheiro(s)');
      });

    if (event.target) {
      event.target.value = '';
    }
  };

  const handleRemove = (index?: number) => {
    if (multiple && Array.isArray(value) && index !== undefined) {
      const newFiles = value.filter((_, i) => i !== index);
      onChange(newFiles);
      toast.success('Ficheiro removido');
    } else {
      onChange(multiple ? [] : '');
      toast.success('Ficheiro removido');
    }
  };

  const displayValue = () => {
    if (multiple && Array.isArray(value)) {
      return value.length > 0 ? `${value.length} ficheiro(s) carregado(s)` : placeholder;
    }
    return value ? 'Ficheiro carregado' : placeholder;
  };

  const hasFiles = multiple ? (Array.isArray(value) && value.length > 0) : !!value;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={displayValue()}
          disabled
          placeholder={placeholder}
          className="flex-1"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
        {!disabled && (
          <Button type="button" variant="outline" onClick={handleUploadClick}>
            <Upload className="mr-2" />
            Upload
          </Button>
        )}
        {!disabled && hasFiles && (
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            onClick={() => handleRemove()}
          >
            <X />
          </Button>
        )}
      </div>
      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="space-y-1">
          {value.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
              <span className="truncate flex-1">Ficheiro {index + 1}</span>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(index)}
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
