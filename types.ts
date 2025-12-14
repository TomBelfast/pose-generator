
import type React from 'react';

export interface Pose {
  name: string;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export type GenerationStatus = 'loading' | 'completed' | 'failed';

export interface ApiStatus {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  requestsInLastMinute: number;
  rateLimitRemaining: number;
  isRateLimited: boolean;
  lastRequestTime: number | null;
}

export interface GeneratedImage {
  id: string;
  src: string | null;
  prompt: string;
  status: GenerationStatus;
}
