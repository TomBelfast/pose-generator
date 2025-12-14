import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';
import Spinner from './Spinner';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  uploadedImagePreview: string | null;
  onImageRemove: () => void;
  isUploading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  uploadedImagePreview,
  onImageRemove,
  isUploading
}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  }, [onImageUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onImageRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleContainerClick = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Base container classes with neumorphism
  const containerClasses = `
    relative group aspect-square w-full
    rounded-[var(--radius-lg)]
    transition-all duration-200
    flex items-center justify-center
    cursor-pointer
    ${isUploading
      ? 'neu-pressed cursor-not-allowed opacity-80'
      : isDraggingOver
        ? 'shadow-neu-hover border-2 border-neu-accent scale-[1.02]'
        : 'neu-pressed hover:shadow-neu-hover'
    }
  `;

  return (
    <div
      onClick={handleContainerClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={containerClasses}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleContainerClick();
        }
      }}
      aria-label="Upload image area"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        aria-label="Upload image"
      />

      {isUploading ? (
        <div className="text-center p-4 sm:p-6">
          <Spinner className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-neu-accent" />
          <p className="font-semibold text-neu-text">Przesyłanie obrazu...</p>
          <p className="text-sm text-neu-text-muted mt-1">Poczekaj na przetworzenie pliku</p>
        </div>
      ) : uploadedImagePreview ? (
        <>
          <img
            src={uploadedImagePreview}
            alt="Przesłany obraz"
            className="object-contain w-full h-full rounded-[var(--radius-lg)]"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-[var(--radius-lg)]">
            <button
              onClick={handleRemoveClick}
              className="neu-icon-btn p-3 sm:p-4 bg-neu-danger text-white hover:bg-red-600 min-w-[44px] min-h-[44px]"
              aria-label="Usuń obraz"
              type="button"
            >
              <X size={24} />
            </button>
          </div>
        </>
      ) : (
        <div className="text-center p-4 sm:p-6">
          <div className="neu-raised-sm inline-flex p-4 rounded-full mb-4">
            <UploadCloud size={32} className="text-neu-accent sm:w-12 sm:h-12" />
          </div>
          <p className="font-semibold text-neu-text">Przeciągnij i upuść obraz</p>
          <p className="text-sm text-neu-text-muted mt-1">lub kliknij, aby wybrać plik</p>
          <p className="text-xs text-neu-text-light mt-3">PNG, JPG, WEBP do 10MB</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
