import React from 'react';
import { Square } from 'lucide-react';

export type ImageRatio = '9:16' | '1:1' | '16:9';

interface RatioSelectorProps {
  selectedRatio: ImageRatio;
  onRatioChange: (ratio: ImageRatio) => void;
}

const ratioOptions = [
  { value: '9:16' as ImageRatio, label: '9:16' },
  { value: '1:1' as ImageRatio, label: '1:1' },
  { value: '16:9' as ImageRatio, label: '16:9' }
];

const RatioSelector: React.FC<RatioSelectorProps> = ({ selectedRatio, onRatioChange }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-300">Image Ratio</h3>
      <div className="grid grid-cols-3 gap-2">
        {ratioOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onRatioChange(option.value)}
            className={`relative p-2 rounded-lg border-2 transition-all duration-200 text-center ${
              selectedRatio === option.value
                ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                : 'border-base-300 bg-base-200 hover:border-base-400 text-gray-300 hover:text-white'
            }`}
          >
            {/* Visual ratio indicator */}
            <div className="flex justify-center mb-1">
              <div 
                className={`bg-current opacity-60 ${
                  option.value === '9:16' ? 'w-2 h-4' :
                  option.value === '1:1' ? 'w-3 h-3' :
                  'w-4 h-2'
                }`}
              />
            </div>
            <div className="text-xs font-medium">{option.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RatioSelector;
