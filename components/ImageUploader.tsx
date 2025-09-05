import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';
import Spinner from './Spinner';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  uploadedImagePreview: string | null;
  onImageRemove: () => void;
  isUploading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, uploadedImagePreview, onImageRemove, isUploading }) => {
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
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  }

  const handleContainerClick = () => {
    if (!isUploading && fileInputRef.current) {
        fileInputRef.current.click();
    }
  }

  return (
    <div
      onClick={handleContainerClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative group aspect-square w-full bg-base-200 border-2 border-dashed rounded-lg transition-all duration-300 flex items-center justify-center
        ${isUploading ? 'border-brand-primary bg-base-300 cursor-not-allowed' : 
          isDraggingOver ? 'border-brand-primary bg-base-300 scale-105 cursor-pointer' : 
          'border-base-300 cursor-pointer'}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      {isUploading ? (
        <div className="text-center text-gray-600 p-4">
          <Spinner className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
          <p className="font-semibold">Uploading image...</p>
          <p className="text-sm">Please wait while we process your file</p>
        </div>
      ) : uploadedImagePreview ? (
        <>
            <img src={uploadedImagePreview} alt="Uploaded character" className="object-contain w-full h-full rounded-lg" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <button 
                    onClick={handleRemoveClick}
                    className="relative p-2 bg-red-500/80 hover:bg-red-600 rounded-full text-white transition-transform transform hover:scale-110 group/btn"
                    aria-label="Remove image"
                    title="Remove uploaded image"
                >
                    <X size={24} />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                        Remove image
                    </div>
                </button>
            </div>
        </>
      ) : (
        <div className="text-center text-gray-400 p-4">
          <UploadCloud size={48} className="mx-auto mb-2" />
          <p className="font-semibold">Drag and drop an image</p>
          <p className="text-sm">or click to select a file</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;