import React from 'react';
import type { Pose } from '../types';
import { PREDEFINED_POSES } from '../constants';
import { Bot } from 'lucide-react';

interface PoseSelectorProps {
  selectedPoses: Set<string>;
  onPoseSelect: (poseName: string) => void;
  customPose: string;
  onCustomPoseChange: (value: string) => void;
  onGenerate: () => void;
  isGenerateDisabled: boolean;
  isGenerating: boolean;
  poseCount: number;
}

const PoseSelector: React.FC<PoseSelectorProps> = ({
  selectedPoses,
  onPoseSelect,
  customPose,
  onCustomPoseChange,
  onGenerate,
  isGenerateDisabled,
  isGenerating,
  poseCount
}) => {
  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Custom pose input */}
      <div>
        <label
          htmlFor="custom-pose"
          className="block text-sm font-medium text-neu-text mb-2"
        >
          Własna poza (opcjonalnie)
        </label>
        <input
          type="text"
          id="custom-pose"
          value={customPose}
          onChange={(e) => onCustomPoseChange(e.target.value)}
          placeholder="np. 'siedząca na krześle'"
          className="neu-input"
        />
      </div>

      {/* Predefined poses */}
      <div>
        <h3 className="text-sm font-medium text-neu-text mb-3">
          Wybierz predefiniowane pozy
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          {PREDEFINED_POSES.map((pose: Pose) => {
            const isSelected = selectedPoses.has(pose.name);
            return (
              <button
                key={pose.name}
                onClick={() => onPoseSelect(pose.name)}
                type="button"
                className={`
                  flex flex-col items-center justify-center
                  p-2 sm:p-3 gap-1
                  min-h-[72px] sm:min-h-[80px]
                  rounded-[var(--radius-sm)]
                  transition-all duration-150
                  ${isSelected
                    ? 'neu-selected'
                    : 'neu-selectable'
                  }
                `}
                aria-pressed={isSelected}
                aria-label={`Wybierz pozę: ${pose.label}`}
              >
                <pose.icon
                  className={`w-6 h-6 sm:w-8 sm:h-8 ${
                    isSelected ? 'text-neu-accent' : 'text-neu-text-muted'
                  }`}
                />
                <span className={`text-xs text-center leading-tight ${
                  isSelected ? 'text-neu-accent font-medium' : 'text-neu-text-muted'
                }`}>
                  {pose.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={onGenerate}
        disabled={isGenerateDisabled || isGenerating}
        type="button"
        className={`
          relative w-full
          flex items-center justify-center gap-2
          py-3 sm:py-4 px-4
          rounded-[var(--radius-sm)]
          font-semibold text-base
          min-h-[48px] sm:min-h-[52px]
          transition-all duration-150
          ${isGenerateDisabled || isGenerating
            ? 'neu-btn opacity-50 cursor-not-allowed text-neu-text-light'
            : 'neu-btn neu-btn-primary'
          }
        `}
        aria-busy={isGenerating}
        aria-disabled={isGenerateDisabled}
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Generowanie...</span>
          </>
        ) : (
          <>
            <Bot size={20} />
            <span>Generuj wybrane pozy ({poseCount})</span>
          </>
        )}
      </button>

      {/* Helper text */}
      {isGenerateDisabled && !isGenerating && (
        <p className="text-xs text-neu-text-light text-center -mt-2">
          Prześlij obraz i wybierz co najmniej jedną pozę, aby rozpocząć generowanie
        </p>
      )}
    </div>
  );
};

export default PoseSelector;
