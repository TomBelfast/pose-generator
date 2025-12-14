import React, { useEffect, useCallback, useRef } from 'react';
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

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    // Ignore touch if it starts on a button
    const target = event.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }

    const touch = event.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }, []);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    // Allow default scroll behavior, but track movement
    event.stopPropagation();
  }, []);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = event.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const startX = touchStartRef.current.x;
    const startY = touchStartRef.current.y;
    const diffX = startX - endX;
    const diffY = startY - endY;
    const timeDiff = Date.now() - touchStartRef.current.time;

    // Only handle swipe if horizontal movement is greater than vertical (swipe, not scroll)
    // And minimum swipe distance
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50 && timeDiff < 500) {
      event.preventDefault();
      if (diffX > 0) {
        // Swipe left - next
        handleNext();
      } else {
        // Swipe right - previous
        handlePrevious();
      }
    }

    touchStartRef.current = null;
  }, [handleNext, handlePrevious]);

  if (!isOpen || !currentImage) {
    return null;
  }

  // Icon button style for modal
  const iconBtnClass = `
    neu-icon-btn p-2 sm:p-3
    min-w-[44px] min-h-[44px]
    text-neu-text
  `;

  return (
    <div
      className="fixed inset-0 z-50 bg-neu-base/95 backdrop-blur-sm flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Podgląd obrazu"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top toolbar */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 sm:gap-3 pointer-events-none">
        {/* Regenerate button */}
        {currentImage.status === 'completed' && (
          <button
            onClick={onRegenerate}
            className={`${iconBtnClass} pointer-events-auto`}
            aria-label="Regeneruj obraz"
            type="button"
            disabled={currentImage.status === 'loading'}
          >
            <RotateCcw size={20} />
          </button>
        )}

        {/* Download all */}
        {completedImages.length > 0 && (
          <button
            onClick={onDownloadAll}
            className={`${iconBtnClass} pointer-events-auto`}
            aria-label="Pobierz wszystkie obrazy"
            type="button"
          >
            <DownloadCloud size={20} />
          </button>
        )}

        {/* Download current */}
        {currentImage.status === 'completed' && currentImage.src && (
          <button
            onClick={() => downloadImage(currentImage.src!, currentImage.prompt)}
            className={`${iconBtnClass} pointer-events-auto`}
            aria-label="Pobierz aktualny obraz"
            type="button"
          >
            <Download size={20} />
          </button>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className={`${iconBtnClass} pointer-events-auto`}
          aria-label="Zamknij podgląd"
          type="button"
        >
          <X size={20} />
        </button>
      </div>

      {/* Previous button */}
      {currentCompletedIndex > 0 && (
        <button
          onClick={handlePrevious}
          className={`${iconBtnClass} absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-auto`}
          aria-label="Poprzedni obraz"
          type="button"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Next button */}
      {currentCompletedIndex < completedImages.length - 1 && (
        <button
          onClick={handleNext}
          className={`${iconBtnClass} absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 pointer-events-auto`}
          aria-label="Następny obraz"
          type="button"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Image container */}
      <div
        className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 pt-20 pb-24"
      >
        {currentImage.status === 'loading' ? (
          <div className="text-center">
            <Spinner className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-neu-accent" />
            <p className="text-lg sm:text-xl font-medium text-neu-text">
              Regenerowanie obrazu...
            </p>
            <p className="text-sm text-neu-text-muted mt-2">
              {currentImage.prompt}
            </p>
          </div>
        ) : currentImage.status === 'completed' && currentImage.src ? (
          <img
            src={currentImage.src}
            alt={currentImage.prompt}
            className="max-w-full max-h-full object-contain rounded-[var(--radius-lg)] shadow-neu-lg"
          />
        ) : currentImage.status === 'failed' ? (
          <div className="text-center">
            <p className="text-lg sm:text-xl font-medium text-neu-danger">
              Generowanie nie powiodło się
            </p>
            <p className="text-sm text-neu-text-muted mt-2">
              {currentImage.prompt}
            </p>
          </div>
        ) : null}
      </div>

      {/* Bottom info bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        {/* Counter */}
        <div className="neu-raised-sm px-4 py-2 text-sm text-neu-text font-medium">
          {currentCompletedIndex + 1} / {completedImages.length}
        </div>

        {/* Prompt text */}
        <div className="neu-raised-sm px-4 py-2 max-w-[90vw] sm:max-w-2xl text-center text-sm text-neu-text-muted truncate">
          {currentImage.prompt}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
