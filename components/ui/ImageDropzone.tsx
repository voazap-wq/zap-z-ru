import React, { useState, useCallback, useRef } from 'react';

interface ImageDropzoneProps {
  value: string;
  onChange: (base64: string) => void;
  label?: string;
  className?: string;
}

const MAX_FILE_SIZE_BYTES = 700 * 1024; // 700 KB

const ImageDropzone: React.FC<ImageDropzoneProps> = ({ value, onChange, label, className = '' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | undefined) => {
    setError(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        setError('Неверный тип файла. Выберите изображение.');
        return;
    }
    
    if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`Файл слишком большой. Макс. размер: ${Math.round(MAX_FILE_SIZE_BYTES / 1024)} КБ.`);
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);
  
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      handleFile(file);
      e.target.value = ''; // Allow re-uploading the same file
  };

  const onZoneClick = () => {
      fileInputRef.current?.click();
  };

  const baseClasses = "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors duration-200 flex items-center justify-center";
  const draggingClasses = "border-primary bg-primary/10";
  const idleClasses = "border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary-light";
  const errorClasses = "border-red-500 bg-red-50 dark:bg-red-900/20";


  return (
    <div>
      {label && <label className="block text-sm font-semibold mb-1 text-gray-500 dark:text-gray-400">{label}</label>}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
      />
      <div
        onClick={onZoneClick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`${baseClasses} ${error ? errorClasses : isDragging ? draggingClasses : idleClasses} ${className}`}
      >
        {value && !error ? (
          <img src={value} alt="Предпросмотр" className="max-h-40 max-w-full object-contain mx-auto rounded-md" />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 pointer-events-none">
             {error ? (
                <>
                    <span className="material-icons text-4xl mb-2 text-red-500">error_outline</span>
                    <p className="font-semibold text-red-500">{error}</p>
                    <p className="text-xs">Попробуйте другой файл.</p>
                </>
            ) : (
                <>
                    <span className="material-icons text-4xl mb-2">cloud_upload</span>
                    <p className="font-semibold">Перетащите изображение сюда</p>
                    <p className="text-xs">или нажмите для выбора файла</p>
                </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDropzone;