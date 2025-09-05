import React, { useEffect, useCallback } from 'react';
import type { GeneratedImage } from '../types';
import { X, ChevronLeft, ChevronRight, Download, DownloadCloud, RotateCcw } from 'lucide-react';
import Spinner from './Spinner';

interface ImageModalProps {
  images: GeneratedImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onDownloadAll: () => void;
  onRegenerate: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  onDownloadAll,
  onRegenerate
}) => {
  const currentImage = images[currentIndex];
  const completedImages = images.filter(img => img.status === 'completed' && img.src);
  const currentCompletedIndex = completedImages.findIndex(img => img.id === currentImage?.id);

  const downloadImage = (src: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `${prompt.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrevious = useCallback(() => {
    if (currentCompletedIndex > 0) {
      const prevImage = completedImages[currentCompletedIndex - 1];
      const prevIndex = images.findIndex(img => img.id === prevImage.id);
      onNavigate(prevIndex);
    }
  }, [currentCompletedIndex, completedImages, images, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentCompletedIndex < completedImages.length - 1) {
      const nextImage = completedImages[currentCompletedIndex + 1];
      const nextIndex = images.findIndex(img => img.id === nextImage.id);
      onNavigate(nextIndex);
    }
  }, [currentCompletedIndex, completedImages, images, onNavigate]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (event.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        handlePrevious();
        break;
      case 'ArrowRight':
        handleNext();
        break;
    }
  }, [isOpen, onClose, handlePrevious, handleNext]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    const startX = touch.clientX;
    
    const handleTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      const endX = touch.clientX;
      const diffX = startX - endX;
      
      if (Math.abs(diffX) > 50) { // Minimum swipe distance
        if (diffX > 0) {
          handleNext(); // Swipe left - go to next
        } else {
          handlePrevious(); // Swipe right - go to previous
        }
      }
      
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchend', handleTouchEnd);
  };

  if (!isOpen || !currentImage) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/75 rounded-full text-white transition-colors group/btn"
        aria-label="Close modal"
        title="Close fullscreen view"
      >
        <X size={24} />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
          Close
        </div>
      </button>

      {/* Download current image button */}
      {currentImage.status === 'completed' && currentImage.src && (
        <button
          onClick={() => downloadImage(currentImage.src!, currentImage.prompt)}
          className="absolute top-4 right-16 z-10 p-2 bg-black/50 hover:bg-black/75 rounded-full text-white transition-colors group/btn"
          aria-label="Download current image"
          title="Download current image"
        >
          <Download size={24} />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
            Download
          </div>
        </button>
      )}

      {/* Download all images button */}
      {completedImages.length > 0 && (
        <button
          onClick={onDownloadAll}
          className="absolute top-4 right-28 z-10 p-2 bg-black/50 hover:bg-black/75 rounded-full text-white transition-colors group/btn"
          aria-label="Download all images"
          title="Download all generated images"
        >
          <DownloadCloud size={24} />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
            Download All
          </div>
        </button>
      )}

      {/* Regenerate button */}
      {currentImage.status === 'completed' && (
        <button
          onClick={onRegenerate}
          className={`absolute top-4 right-40 z-10 p-2 rounded-full text-white transition-colors group/btn ${
            currentImage.status === 'loading' 
              ? 'bg-black/30 cursor-not-allowed' 
              : 'bg-black/50 hover:bg-black/75'
          }`}
          aria-label="Regenerate current image"
          title="Regenerate this image"
          disabled={currentImage.status === 'loading'}
        >
          <RotateCcw size={24} />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
            Regenerate
          </div>
        </button>
      )}

      {/* Previous button */}
      {currentCompletedIndex > 0 && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/75 rounded-full text-white transition-colors group/btn"
          aria-label="Previous image"
          title="Previous image"
        >
          <ChevronLeft size={28} />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
            Previous
          </div>
        </button>
      )}

      {/* Next button */}
      {currentCompletedIndex < completedImages.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/75 rounded-full text-white transition-colors group/btn"
          aria-label="Next image"
          title="Next image"
        >
          <ChevronRight size={28} />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
            Next
          </div>
        </button>
      )}

      {/* Image container */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-8"
        onTouchStart={handleTouchStart}
      >
        {currentImage.status === 'loading' ? (
          <div className="text-center text-white">
            <Spinner className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
            <p className="text-xl font-medium">Regenerating image...</p>
            <p className="text-sm mt-2 opacity-80">{currentImage.prompt}</p>
          </div>
        ) : currentImage.status === 'completed' && currentImage.src ? (
          <img
            src={currentImage.src}
            alt={currentImage.prompt}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        ) : currentImage.status === 'failed' ? (
          <div className="text-center text-red-400">
            <p className="text-xl font-medium">Generation Failed</p>
            <p className="text-sm mt-2">{currentImage.prompt}</p>
          </div>
        ) : null}
      </div>

      {/* Image counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full text-white text-sm">
        {currentCompletedIndex + 1} / {completedImages.length}
      </div>

      {/* Prompt text */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 max-w-2xl px-4 py-2 bg-black/50 rounded-lg text-white text-center text-sm">
        {currentImage.prompt}
      </div>
    </div>
  );
};

export default ImageModal;
