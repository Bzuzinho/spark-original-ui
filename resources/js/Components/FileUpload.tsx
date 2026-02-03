import { useRef, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { X, Upload, File } from 'lucide-react';

interface FileUploadProps {
    value: string | string[];
    onChange: (value: string | string[]) => void;
    accept?: string;
    multiple?: boolean;
    maxSizeMB?: number;
    disabled?: boolean;
    placeholder?: string;
}

export function FileUpload({
    value,
    onChange,
    accept = '*/*',
    multiple = false,
    maxSizeMB = 5,
    disabled = false,
    placeholder = 'Carregar ficheiro'
}: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleClick = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    const processFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const maxSize = maxSizeMB * 1024 * 1024;
        const validFiles: string[] = [];

        Array.from(files).forEach(file => {
            if (file.size > maxSize) {
                alert(`Ficheiro ${file.name} excede o tamanho máximo de ${maxSizeMB}MB`);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                validFiles.push(result);

                if (validFiles.length === files.length) {
                    if (multiple) {
                        onChange([...(Array.isArray(value) ? value : []), ...validFiles]);
                    } else {
                        onChange(validFiles[0]);
                    }
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(event.target.files);
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (!disabled && e.dataTransfer.files) {
            processFiles(e.dataTransfer.files);
        }
    };

    const handleRemove = (index: number) => {
        if (Array.isArray(value)) {
            const newValue = value.filter((_, i) => i !== index);
            onChange(newValue);
        } else {
            onChange('');
        }
    };

    const getFileName = (path: string): string => {
        if (path.startsWith('data:')) {
            return 'Ficheiro carregado';
        }
        return path.split('/').pop() || path;
    };

    const files = Array.isArray(value) ? value : value ? [value] : [];

    return (
        <div className="space-y-2">
            <div
                className={`
                    border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
                    transition-colors duration-200
                    ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}
                `}
                onClick={handleClick}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                    {placeholder}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    Arraste ficheiros ou clique para selecionar
                </p>
                {maxSizeMB && (
                    <p className="text-xs text-gray-400 mt-1">
                        Tamanho máximo: {maxSizeMB}MB
                    </p>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
            />

            {files.length > 0 && (
                <div className="space-y-1">
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50"
                        >
                            <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="text-sm flex-1 truncate">
                                {getFileName(file)}
                            </span>
                            {!disabled && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(index);
                                    }}
                                    className="h-6 w-6 p-0"
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
