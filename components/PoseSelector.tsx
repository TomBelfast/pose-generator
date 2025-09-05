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
    <div className="flex flex-col gap-6">
      <div>
        <label htmlFor="custom-pose" className="block text-sm font-medium mb-2">Custom Pose (optional)</label>
        <input
          type="text"
          id="custom-pose"
          value={customPose}
          onChange={(e) => onCustomPoseChange(e.target.value)}
          placeholder="e.g. 'sitting on a chair'"
          className="w-full bg-base-200 border border-base-300 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition"
        />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Choose Predefined Poses</h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {PREDEFINED_POSES.map((pose: Pose) => {
            const isSelected = selectedPoses.has(pose.name);
            return (
              <button
                key={pose.name}
                onClick={() => onPoseSelect(pose.name)}
                className={`flex flex-col items-center justify-center p-2 gap-1 rounded-lg border-2 transition-all duration-200
                  ${isSelected ? 'bg-brand-light border-brand-primary text-brand-primary' : 'bg-base-200 border-base-300 hover:border-brand-secondary'}`}
              >
                <pose.icon className={`w-8 h-8 ${isSelected ? 'text-brand-primary' : 'text-gray-400'}`} />
                <span className="text-xs text-center">{pose.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <button
        onClick={onGenerate}
        disabled={isGenerateDisabled || isGenerating}
        className="relative w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:bg-base-300 disabled:cursor-not-allowed disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-brand-primary group/btn"
        title={isGenerateDisabled ? "Upload an image and select poses to generate" : `Generate ${poseCount} image${poseCount !== 1 ? 's' : ''}`}
      >
        {isGenerating ? (
            <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
            </>
        ) : (
            <>
                <Bot size={20} />
                <span>Generate Selected Poses ({poseCount})</span>
            </>
        )}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black/80 text-white text-sm rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
          {isGenerateDisabled ? "Upload an image and select poses to generate" : `Generate ${poseCount} image${poseCount !== 1 ? 's' : ''}`}
        </div>
      </button>
    </div>
  );
};

export default PoseSelector;