import React, { useState, useCallback, useRef } from 'react';

interface ImageDropzoneProps {
  value: string;
  onChange: (base64: string) => void;
  label?: string;
}

const ImageDropzone: React.FC<ImageDropzoneProps> = ({ value, onChange, label }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | undefined) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
  };

  const onZoneClick = () => {
      fileInputRef.current?.click();
  };

  const baseClasses = "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors duration-200 flex items-center justify-center min-h-[10rem]";
  const draggingClasses = "border-primary bg-primary/10";
  const idleClasses = "border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary-light";

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
        className={`${baseClasses} ${isDragging ? draggingClasses : idleClasses}`}
      >
        {value ? (
          <img src={value} alt="Предпросмотр" className="max-h-40 max-w-full object-contain mx-auto rounded-md" />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 pointer-events-none">
            <span className="material-icons text-4xl mb-2">cloud_upload</span>
            <p className="font-semibold">Перетащите изображение сюда</p>
            <p className="text-xs">или нажмите для выбора файла</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDropzone;