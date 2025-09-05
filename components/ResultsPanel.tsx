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
}

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
    <div className="flex flex-col gap-4">
      {/* Preview area - shows selected image, loading state, or placeholder */}
      <div className="relative aspect-square w-full bg-base-200 border-2 border-base-300 rounded-lg flex items-center justify-center">
        {isGenerating ? (
          <div className="text-center text-gray-600">
            <Spinner className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
            <p className="text-lg font-medium">
              Generating {generationProgress.current}/{generationProgress.total} images...
            </p>
            <p className="text-sm mt-2">Please wait while AI creates your poses</p>
            <div className="mt-4 w-full bg-base-300 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(generationProgress.current / generationProgress.total) * 100}%` }}
              />
            </div>
          </div>
        ) : selectedImage && selectedImage.status === 'completed' && selectedImage.src ? (
          <>
            <img 
              src={selectedImage.src} 
              alt={selectedImage.prompt} 
              className="object-contain w-full h-full rounded-lg cursor-pointer" 
              onClick={() => onThumbnailClick(selectedImageIndex!)}
            />
            <div className="absolute top-2 right-2 flex gap-2">
                <button
                    onClick={() => downloadImage(selectedImage.src!, selectedImage.prompt)}
                    className="relative p-2 bg-black/50 hover:bg-black/75 rounded-full text-white transition group/btn"
                    aria-label="Download image"
                    title="Download current image"
                >
                    <Download size={20} />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                        Download image
                    </div>
                </button>
            </div>
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-white text-xs">
              Click to view fullscreen
            </div>
          </>
        ) : selectedImage && selectedImage.status === 'loading' ? (
          <div className="text-center text-gray-600">
            <Spinner className="w-12 h-12 mx-auto mb-4" />
            <p className="text-lg font-medium">Generating...</p>
            <p className="text-sm mt-2">{selectedImage.prompt}</p>
          </div>
        ) : selectedImage && selectedImage.status === 'failed' ? (
          <div className="text-center text-red-500">
            <ImageOff size={48} className="mx-auto mb-4" />
            <p className="text-lg font-medium">Generation Failed</p>
            <p className="text-sm mt-2">{selectedImage.prompt}</p>
          </div>
        ) : (
          <div className="text-gray-500 text-center">
            <ImageOff size={48} />
            <p className="mt-2 text-sm">Select an image to preview</p>
          </div>
        )}
      </div>

      {generatedImages.length > 0 && (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Generated Images</h3>
                {generatedImages.some(img => img.status === 'completed' && img.src) && (
                    <button
                        onClick={onDownloadAll}
                        className="relative flex items-center gap-1 px-3 py-1.5 bg-brand-primary hover:bg-brand-primary/90 text-white text-xs rounded-md transition-colors group/btn"
                        aria-label="Download all images"
                        title="Download all generated images"
                    >
                        <DownloadCloud size={14} />
                        Download All
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                            Download all images
                        </div>
                    </button>
                )}
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {generatedImages.map((img, index) => (
                <div
                key={img.id}
                onClick={() => img.status === 'completed' && onThumbnailClick(index)}
                className={`relative group aspect-square rounded-md border-2 transition-all duration-200
                    ${selectedImageIndex === index ? 'border-brand-primary' : 'border-transparent'}
                    ${img.status === 'completed' ? 'cursor-pointer' : 'cursor-default'}`}
                >
                {img.status === 'loading' && (
                    <div className="w-full h-full bg-base-300 flex items-center justify-center rounded-md animate-pulse">
                        <Spinner className="w-6 h-6 text-gray-400" />
                    </div>
                )}
                {img.status === 'failed' && (
                    <div className="w-full h-full bg-red-900/50 flex items-center justify-center rounded-md">
                        <ImageOff size={24} className="text-red-400" />
                    </div>
                )}
                {img.status === 'completed' && img.src && (
                    <>
                    <img src={img.src} alt={img.prompt} className="object-cover w-full h-full rounded-md" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                        <button 
                            onClick={(e) => { e.stopPropagation(); downloadImage(img.src!, img.prompt); }}
                            className="relative p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white group/btn"
                            title="Download this image"
                        >
                            <Download size={16} />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                                Download
                            </div>
                        </button>
                    </div>
                    </>
                )}
                </div>
            ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;