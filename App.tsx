import React, { useState, useMemo, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import PoseSelector from './components/PoseSelector';
import ResultsPanel from './components/ResultsPanel';
import AuthWrapper from './components/AuthWrapper';
import { generateImageFromPose, getApiStatus } from './services/geminiService';
import type { GeneratedImage, ApiStatus } from './types';

const ImageModal = React.lazy(() => import('./components/ImageModal'));
import { Github, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useUserLimit } from './hooks/useUserLimit';
import { API_BASE_URL } from './constants';
import { logger } from './utils/logger';

const App: React.FC = () => {
  const { user } = useUser();
  const limitData = useUserLimit();
  const { refresh: refreshLimit } = limitData;

  const [uploadedImage, setUploadedImage] = useState<{ file: File; base64: string; } | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [selectedPoses, setSelectedPoses] = useState<Set<string>>(new Set());
  const [customPose, setCustomPose] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);

  const handleImageUpload = (file: File) => {
    setIsUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setUploadedImage({ file, base64: base64String });
      setUploadedImagePreview(URL.createObjectURL(file));
      setGeneratedImages([]);
      setSelectedImageIndex(null);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setError('Nie udało się przesłać obrazu. Spróbuj ponownie.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    if (uploadedImagePreview) {
      URL.revokeObjectURL(uploadedImagePreview);
    }
    setUploadedImage(null);
    setUploadedImagePreview(null);
  };

  const handlePoseSelect = (poseName: string) => {
    setSelectedPoses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(poseName)) {
        newSet.delete(poseName);
      } else {
        newSet.add(poseName);
      }
      return newSet;
    });
  };

  const allPoses = useMemo(() => {
    const poses = new Set(selectedPoses);
    if (customPose.trim()) {
      poses.add(customPose.trim());
    }
    return Array.from(poses);
  }, [selectedPoses, customPose]);

  const poseCount = allPoses.length;
  const isGenerateDisabled = !uploadedImage || poseCount === 0;

  const handleGenerate = async () => {
    if (!uploadedImage || allPoses.length === 0) return;

    setApiStatus(getApiStatus());

    if (user) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user-limit/${user.id}`);
        const data = await response.json();

        if (data.success && data.remaining < allPoses.length) {
          setError(`Dzienny limit przekroczony! Pozostało ${data.remaining} generacji. Limit resetuje się jutro.`);
          return;
        }
      } catch (error) {
        logger.error('Error checking user limit:', error);
      }
    }

    setIsGenerating(true);
    setGenerationProgress({ current: 0, total: allPoses.length });
    setError(null);
    setGeneratedImages([]);
    setSelectedImageIndex(null);

    const initialImages: GeneratedImage[] = allPoses.map(prompt => ({
      id: crypto.randomUUID(),
      prompt,
      src: null,
      status: 'loading'
    }));
    setGeneratedImages(initialImages);

    const generationPromises = allPoses.map((prompt, index) => {
      return generateImageFromPose(uploadedImage.base64, uploadedImage.file.type, prompt, '1:1')
        .then(base64Data => {
          setGenerationProgress(prev => ({ ...prev, current: prev.current + 1 }));
          return {
            index,
            status: 'completed' as const,
            src: `data:image/png;base64,${base64Data}`
          };
        })
        .catch(err => {
          setGenerationProgress(prev => ({ ...prev, current: prev.current + 1 }));
          setError(`Błąd podczas generowania pozy: ${prompt}. Spróbuj ponownie.`);
          return {
            index,
            status: 'failed' as const,
            src: null
          };
        });
    });

    const results = await Promise.all(generationPromises);

    setGeneratedImages(currentImages => {
      const newImages = [...currentImages];
      results.forEach(result => {
        newImages[result.index] = {
          ...newImages[result.index],
          status: result.status,
          src: result.src
        };
      });

      const firstCompletedIndex = newImages.findIndex(img => img.status === 'completed');
      if (firstCompletedIndex !== -1) {
        setSelectedImageIndex(firstCompletedIndex);
      }

      return newImages;
    });

    if (user) {
      try {
        await fetch(`${API_BASE_URL}/api/increment-count/${user.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ count: allPoses.length })
        });
        refreshLimit();
      } catch (error) {
        logger.error('Error updating generation count:', error);
      }
    }

    setIsGenerating(false);
  };

  const handleThumbnailClick = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleModalNavigate = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  const handleRegenerate = useCallback(async () => {
    if (!uploadedImage || selectedImageIndex === null) return;

    const currentImage = generatedImages[selectedImageIndex];
    if (!currentImage || currentImage.status !== 'completed') return;

    if (user) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user-limit/${user.id}`);
        const data = await response.json();

        if (data.success && data.remaining < 1) {
          setError(`Dzienny limit przekroczony! Pozostało ${data.remaining} generacji. Limit resetuje się jutro.`);
          return;
        }
      } catch (error) {
        logger.error('Error checking user limit:', error);
      }
    }

    setGeneratedImages(prev => {
      const newImages = [...prev];
      newImages[selectedImageIndex] = {
        ...newImages[selectedImageIndex],
        status: 'loading',
        src: null
      };
      return newImages;
    });

    try {
      const base64Data = await generateImageFromPose(
        uploadedImage.base64,
        uploadedImage.file.type,
        currentImage.prompt,
        '1:1'
      );

      setGeneratedImages(prev => {
        const newImages = [...prev];
        newImages[selectedImageIndex] = {
          ...newImages[selectedImageIndex],
          status: 'completed',
          src: `data:image/png;base64,${base64Data}`
        };
        return newImages;
      });

      if (user) {
        try {
          await fetch(`${API_BASE_URL}/api/increment-count/${user.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ count: 1 })
          });
          refreshLimit();
        } catch (error) {
          logger.error('Error updating generation count:', error);
        }
      }
    } catch (error) {
      logger.error('Failed to regenerate image:', error);
      setGeneratedImages(prev => {
        const newImages = [...prev];
        newImages[selectedImageIndex] = {
          ...newImages[selectedImageIndex],
          status: 'failed',
          src: null
        };
        return newImages;
      });
      setError(`Nie udało się regenerować obrazu: ${currentImage.prompt}. Spróbuj ponownie.`);
    }
  }, [uploadedImage, selectedImageIndex, generatedImages, user, refreshLimit]);

  const handleDownloadAll = useCallback(() => {
    const completedImages = generatedImages.filter(img => img.status === 'completed' && img.src);

    if (completedImages.length === 0) {
      setError('Brak ukończonych obrazów do pobrania.');
      return;
    }

    completedImages.forEach((img, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = img.src!;
        link.download = `${img.prompt.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 500);
    });
  }, [generatedImages]);

  return (
    <AuthWrapper refreshLimit={refreshLimit} limitData={limitData}>
      <div className="p-3 sm:p-6 lg:p-8 pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Error alert */}
          {error && (
            <div className="neu-raised mb-4 sm:mb-6 p-3 sm:p-4 flex items-start gap-3 border-l-4 border-neu-danger">
              <AlertCircle className="w-5 h-5 text-neu-danger flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-neu-text">Błąd</p>
                <p className="text-sm text-neu-text-muted mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-neu-text-light hover:text-neu-text"
                aria-label="Zamknij"
                type="button"
              >
                <XCircle size={20} />
              </button>
            </div>
          )}

          {/* API Status */}
          {apiStatus && (
            <div className="neu-raised mb-4 sm:mb-6 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${apiStatus.isRateLimited ? 'bg-neu-danger' : 'bg-neu-success'}`} />
                <span className="font-medium text-neu-text text-sm">Status API</span>
              </div>
              <div className="text-xs sm:text-sm text-neu-text-muted">
                {apiStatus.requestsInLastMinute}/{apiStatus.rateLimitRemaining + apiStatus.requestsInLastMinute} req/min
                {apiStatus.isRateLimited && (
                  <span className="text-neu-danger ml-2">(Rate Limited)</span>
                )}
              </div>
              <div className="text-xs text-neu-text-light">
                Sukces: {apiStatus.successfulRequests} | Błędy: {apiStatus.failedRequests}
              </div>
            </div>
          )}

          {/* Main content grid */}
          <main className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Left Column - Input Panel */}
            <div className="neu-card flex flex-col gap-4 sm:gap-6">
              <div className="flex items-center gap-3 pb-3 border-b border-white/30">
                <div className="neu-raised-sm w-8 h-8 flex items-center justify-center rounded-full text-neu-accent font-bold text-sm">
                  1
                </div>
                <h2 className="text-lg font-semibold text-neu-text">
                  Panel wejściowy
                </h2>
              </div>
              <ImageUploader
                onImageUpload={handleImageUpload}
                uploadedImagePreview={uploadedImagePreview}
                onImageRemove={handleImageRemove}
                isUploading={isUploading}
              />
              <PoseSelector
                selectedPoses={selectedPoses}
                onPoseSelect={handlePoseSelect}
                customPose={customPose}
                onCustomPoseChange={setCustomPose}
                onGenerate={handleGenerate}
                isGenerateDisabled={isGenerateDisabled}
                isGenerating={isGenerating}
                poseCount={poseCount}
              />
            </div>

            {/* Right Column - Results Panel */}
            <div className="neu-card flex flex-col gap-4 sm:gap-6">
              <div className="flex items-center gap-3 pb-3 border-b border-white/30">
                <div className="neu-raised-sm w-8 h-8 flex items-center justify-center rounded-full text-neu-accent font-bold text-sm">
                  2
                </div>
                <h2 className="text-lg font-semibold text-neu-text">
                  Wyniki generowania
                </h2>
              </div>
              <ResultsPanel
                generatedImages={generatedImages}
                selectedImageIndex={selectedImageIndex}
                onThumbnailClick={handleThumbnailClick}
                onDownloadAll={handleDownloadAll}
                isGenerating={isGenerating}
                poseCount={poseCount}
                generationProgress={generationProgress}
              />
            </div>
          </main>

          {/* Footer */}
          <footer className="text-center mt-8 sm:mt-12">
            <p className="text-neu-text-light text-sm">
              Stworzone z React, Tailwind CSS i Gemini API
            </p>
            <a
              href="https://github.com/google/genai-js"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 text-neu-text-muted hover:text-neu-accent transition-colors text-sm"
            >
              <Github size={16} />
              Zobacz na GitHub
            </a>
          </footer>
        </div>

        {/* Image Modal */}
        <React.Suspense fallback={null}>
          <ImageModal
            images={generatedImages}
            currentIndex={selectedImageIndex || 0}
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onNavigate={handleModalNavigate}
            onDownloadAll={handleDownloadAll}
            onRegenerate={handleRegenerate}
          />
        </React.Suspense>
      </div>
    </AuthWrapper>
  );
};

export default App;
