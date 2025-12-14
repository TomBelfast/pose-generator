import React from 'react';
import type { GeneratedImage } from '../types';
import Spinner from './Spinner';
import { Download, ImageOff, DownloadCloud } from 'lucide-react';

interface ResultsPanelProps {
  generatedImages: GeneratedImage[];
  selectedImageIndex: number | null;
  onThumbnailClick: (index: number) => void;
  onDownloadAll: () => void;
  isGenerating: boolean;
  poseCount: number;
  generationProgress: { current: number; total: number };
}

const downloadImage = (src: string, prompt: string) => {
  const link = document.createElement('a');
  link.href = src;
  link.download = `${prompt.replace(/\s+/g, '_')}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  generatedImages,
  selectedImageIndex,
  onThumbnailClick,
  onDownloadAll,
  isGenerating,
  poseCount,
  generationProgress
}) => {
  const selectedImage = selectedImageIndex !== null ? generatedImages[selectedImageIndex] : null;

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* Preview area */}
      <div className="neu-pressed relative aspect-square w-full flex items-center justify-center rounded-[var(--radius-lg)]">
        {isGenerating ? (
          <div className="text-center p-4 sm:p-6">
            <Spinner className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-neu-success" />
            <p className="text-base sm:text-lg font-medium text-neu-text">
              Generowanie {generationProgress.current}/{generationProgress.total}...
            </p>
            <p className="text-sm text-neu-text-muted mt-2">
              AI tworzy Twoje pozy
            </p>
            {/* Progress bar */}
            <div className="mt-4 w-full max-w-xs mx-auto neu-progress h-2">
              <div
                className="neu-progress-bar h-2"
                style={{
                  width: `${(generationProgress.current / generationProgress.total) * 100}%`
                }}
              />
            </div>
          </div>
        ) : selectedImage && selectedImage.status === 'completed' && selectedImage.src ? (
          <>
            <img
              src={selectedImage.src}
              alt={selectedImage.prompt}
              className="object-contain w-full h-full rounded-[var(--radius-lg)] cursor-pointer"
              onClick={() => onThumbnailClick(selectedImageIndex!)}
            />
            {/* Download button overlay */}
            <button
              onClick={() => downloadImage(selectedImage.src!, selectedImage.prompt)}
              className="neu-icon-btn absolute top-3 right-3 p-2 sm:p-3 min-w-[44px] min-h-[44px] text-neu-text-muted hover:text-neu-accent"
              aria-label="Pobierz obraz"
              type="button"
            >
              <Download size={20} />
            </button>
            {/* Click hint */}
            <div className="absolute bottom-3 left-3 neu-raised-sm px-3 py-1.5 text-xs text-neu-text-muted">
              Kliknij, aby powiększyć
            </div>
          </>
        ) : selectedImage && selectedImage.status === 'loading' ? (
          <div className="text-center p-4 sm:p-6">
            <Spinner className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-neu-success" />
            <p className="text-base font-medium text-neu-text">Generowanie...</p>
            <p className="text-sm text-neu-text-muted mt-2">{selectedImage.prompt}</p>
          </div>
        ) : selectedImage && selectedImage.status === 'failed' ? (
          <div className="text-center p-4 sm:p-6">
            <div className="neu-pressed-sm inline-flex p-4 rounded-full mb-4">
              <ImageOff size={32} className="text-neu-danger" />
            </div>
            <p className="text-base font-medium text-neu-danger">Generowanie nie powiodło się</p>
            <p className="text-sm text-neu-text-muted mt-2">{selectedImage.prompt}</p>
          </div>
        ) : (
          <div className="text-center p-4 sm:p-6">
            <div className="neu-raised-sm inline-flex p-4 rounded-full mb-4">
              <ImageOff size={32} className="text-neu-text-light" />
            </div>
            <p className="text-sm text-neu-text-muted">Wybierz obraz do podglądu</p>
          </div>
        )}
      </div>

      {/* Thumbnails grid */}
      {generatedImages.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-neu-text">
              Wygenerowane obrazy
            </h3>
            {generatedImages.some(img => img.status === 'completed' && img.src) && (
              <button
                onClick={onDownloadAll}
                className="neu-btn neu-btn-primary flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white min-h-[36px]"
                aria-label="Pobierz wszystkie obrazy"
                type="button"
              >
                <DownloadCloud size={14} />
                <span className="hidden sm:inline">Pobierz wszystkie</span>
                <span className="sm:hidden">Pobierz</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
            {generatedImages.map((img, index) => (
              <button
                key={img.id}
                onClick={() => img.status === 'completed' && onThumbnailClick(index)}
                type="button"
                disabled={img.status !== 'completed'}
                className={`
                  relative group aspect-square
                  rounded-[var(--radius-sm)]
                  transition-all duration-150
                  overflow-hidden
                  ${selectedImageIndex === index
                    ? 'neu-selected ring-2 ring-neu-accent'
                    : img.status === 'completed'
                      ? 'neu-selectable'
                      : 'neu-pressed cursor-default'
                  }
                `}
                aria-label={`Miniatura: ${img.prompt}`}
                aria-pressed={selectedImageIndex === index}
              >
                {img.status === 'loading' && (
                  <div className="w-full h-full flex items-center justify-center animate-pulse">
                    <Spinner className="w-5 h-5 sm:w-6 sm:h-6 text-neu-success" />
                  </div>
                )}
                {img.status === 'failed' && (
                  <div className="w-full h-full flex items-center justify-center bg-red-100">
                    <ImageOff size={20} className="text-neu-danger" />
                  </div>
                )}
                {img.status === 'completed' && img.src && (
                  <>
                    <img
                      src={img.src}
                      alt={img.prompt}
                      className="object-cover w-full h-full"
                    />
                    {/* Hover overlay with download */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(img.src!, img.prompt);
                        }}
                        className="neu-icon-btn p-2 text-white hover:text-neu-accent min-w-[36px] min-h-[36px]"
                        type="button"
                        aria-label="Pobierz ten obraz"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ResultsPanel);
