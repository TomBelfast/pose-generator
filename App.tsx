import React, { useState, useMemo, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import PoseSelector from './components/PoseSelector';
import ResultsPanel from './components/ResultsPanel';
import ImageModal from './components/ImageModal';
import RatioSelector, { type ImageRatio } from './components/RatioSelector';
import AuthWrapper from './components/AuthWrapper';
import { generateImageFromPose } from './services/geminiService';
import type { GeneratedImage } from './types';
import { Github, Zap } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useUserLimit } from './hooks/useUserLimit';

const App: React.FC = () => {
  const { user } = useUser();
  const { refresh: refreshLimit } = useUserLimit();
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
  const [selectedRatio, setSelectedRatio] = useState<ImageRatio>('1:1');

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
      setError('Failed to upload image. Please try again.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };
  
  const handleImageRemove = () => {
      if(uploadedImagePreview) {
          URL.revokeObjectURL(uploadedImagePreview);
      }
      setUploadedImage(null);
      setUploadedImagePreview(null);
  }

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
    if(customPose.trim()) {
        poses.add(customPose.trim());
    }
    return Array.from(poses);
  }, [selectedPoses, customPose]);
  
  const poseCount = allPoses.length;
  const isGenerateDisabled = !uploadedImage || poseCount === 0;

  const handleGenerate = async () => {
    if (!uploadedImage || allPoses.length === 0) return;
    
    // Check user limit before generating
    if (user) {
      try {
        const response = await fetch(`http://localhost:3001/api/user-limit/${user.id}`);
        const data = await response.json();
        
        if (data.success && data.remaining < allPoses.length) {
          setError(`Daily limit exceeded! You have ${data.remaining} generations remaining. Limit resets tomorrow.`);
          return;
        }
      } catch (error) {
        console.error('Error checking user limit:', error);
        // If API is not available, allow generation (fallback mode)
        console.log('API not available, allowing generation in fallback mode');
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

    const generationPromises = allPoses.map((prompt, index) => 
      generateImageFromPose(uploadedImage.base64, uploadedImage.file.type, prompt, selectedRatio)
        .then(base64Data => {
            setGenerationProgress(prev => ({ ...prev, current: prev.current + 1 }));
            return {
                index,
                status: 'completed' as const,
                src: `data:image/png;base64,${base64Data}`
            };
        })
        .catch(err => {
            console.error(`Failed to generate image for prompt: "${prompt}"`, err);
            setGenerationProgress(prev => ({ ...prev, current: prev.current + 1 }));
            setError(`An error occurred while generating the image for pose: ${prompt}. Please try again.`);
            return {
                index,
                status: 'failed' as const,
                src: null
            }
        })
    );

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
        if(firstCompletedIndex !== -1) {
            setSelectedImageIndex(firstCompletedIndex);
        }
        
        return newImages;
    });

    // Update user's generation count
    if (user) {
      try {
        await fetch(`http://localhost:3001/api/increment-count/${user.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ count: allPoses.length })
        });
        // Refresh the limit display
        refreshLimit();
      } catch (error) {
        console.error('Error updating generation count:', error);
        // API not available, continue without updating count
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
      
      // Check user limit before regenerating
      if (user) {
        try {
          const response = await fetch(`http://localhost:3001/api/user-limit/${user.id}`);
          const data = await response.json();
          
          if (data.success && data.remaining < 1) {
            setError(`Daily limit exceeded! You have ${data.remaining} generations remaining. Limit resets tomorrow.`);
            return;
          }
        } catch (error) {
          console.error('Error checking user limit:', error);
          // If API is not available, allow regeneration (fallback mode)
          console.log('API not available, allowing regeneration in fallback mode');
        }
      }
      
      // Set current image to loading state
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
          selectedRatio
        );
        
        // Update with new image
        setGeneratedImages(prev => {
          const newImages = [...prev];
          newImages[selectedImageIndex] = {
            ...newImages[selectedImageIndex],
            status: 'completed',
            src: `data:image/png;base64,${base64Data}`
          };
          return newImages;
        });
        
        // Update user's generation count
        if (user) {
          try {
            await fetch(`http://localhost:3001/api/increment-count/${user.id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ count: 1 })
            });
            // Refresh the limit display
            refreshLimit();
          } catch (error) {
            console.error('Error updating generation count:', error);
            // API not available, continue without updating count
          }
        }
      } catch (error) {
        console.error('Failed to regenerate image:', error);
        setGeneratedImages(prev => {
          const newImages = [...prev];
          newImages[selectedImageIndex] = {
            ...newImages[selectedImageIndex],
            status: 'failed',
            src: null
          };
          return newImages;
        });
        setError(`Failed to regenerate image: ${currentImage.prompt}. Please try again.`);
      }
  }, [uploadedImage, selectedImageIndex, generatedImages]);

  const handleDownloadAll = useCallback(() => {
    const completedImages = generatedImages.filter(img => img.status === 'completed' && img.src);
    
    if (completedImages.length === 0) {
      setError('No completed images to download.');
      return;
    }

    // Download images one by one with a small delay
    completedImages.forEach((img, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = img.src!;
        link.download = `${img.prompt.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 500); // 500ms delay between downloads
    });
  }, [generatedImages]);


  return (
    <AuthWrapper refreshLimit={refreshLimit}>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
              <Zap className="text-brand-primary" />
              <span>Pose Generator</span>
            </h1>
            <p className="text-gray-400 mt-2">Upload a character image, select poses, and generate new variants using AI.</p>
          </header>

        {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md relative mb-6" role="alert">
                <strong className="font-bold">Error! </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="flex flex-col gap-6 p-6 bg-base-200 rounded-lg">
            <h2 className="text-xl font-semibold border-b border-base-300 pb-3">1. Input Panel</h2>
            <ImageUploader 
                onImageUpload={handleImageUpload} 
                uploadedImagePreview={uploadedImagePreview}
                onImageRemove={handleImageRemove}
                isUploading={isUploading}
            />
            <RatioSelector 
                selectedRatio={selectedRatio}
                onRatioChange={setSelectedRatio}
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

          {/* Right Column */}
          <div className="flex flex-col gap-6 p-6 bg-base-200 rounded-lg">
            <h2 className="text-xl font-semibold border-b border-base-300 pb-3">2. Generation Results</h2>
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
        <footer className="text-center mt-12 text-gray-500">
            <p>Created with React, Tailwind CSS, and the Gemini API.</p>
            <a href="https://github.com/google/genai-js" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-brand-primary transition-colors">
                <Github size={16} />
                View on GitHub
            </a>
          </footer>
        </div>
        
        {/* Image Modal */}
        <ImageModal
          images={generatedImages}
          currentIndex={selectedImageIndex || 0}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onNavigate={handleModalNavigate}
          onDownloadAll={handleDownloadAll}
          onRegenerate={handleRegenerate}
        />
      </div>
    </AuthWrapper>
  );
};

export default App;