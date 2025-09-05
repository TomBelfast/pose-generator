
import type React from 'react';

export interface Pose {
  name: string;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export type GenerationStatus = 'loading' | 'completed' | 'failed';

export interface GeneratedImage {
  id: string;
  src: string | null;
  prompt: string;
  status: GenerationStatus;
}
