import React from 'react';
import type { Pose } from './types';

// Custom SVG Icons as React Components
const RunningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6.5" cy="4.5" r="2.5"></circle>
    <path d="M14 11l-2.5 2.5-4-4-2.5 2.5"></path>
    <path d="M10 20l-1.5-4-4-1"></path>
    <path d="M19 14l-4 4-3-2"></path>
  </svg>
);

const DancingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="5" r="3"></circle>
    <path d="M12 12l-2 8-4-4"></path>
    <path d="M14 12l4 8 4-4"></path>
    <path d="M4 12h16"></path>
  </svg>
);

const HeroPoseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3"></circle>
    <path d="M12 8v8"></path>
    <path d="M9 21h6"></path>
    <path d="M6 14l-3 3h4"></path>
    <path d="M18 14l3 3h-4"></path>
  </svg>
);

const ThinkingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="6" r="3"></circle>
    <path d="M12 9v4l-2 2"></path>
    <path d="M12 21V19"></path>
    <path d="M9 21H15"></path>
    <path d="M8 15h.01"></path>
    <path d="M16 15h.01"></path>
    <path d="M10 12H7c-1.7 0-3 1.3-3 3v0c0 1.7 1.3 3 3 3h1"></path>
  </svg>
);

const FightingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="4" r="2"></circle>
    <path d="M15 8l-2 1-2-1"></path>
    <path d="M12 10v4"></path>
    <path d="M9 20l2-4h2l2 4"></path>
    <path d="M8 12h-2l-2 2h4"></path>
    <path d="M16 12h2l2 2h-4"></path>
  </svg>
);

const SwimmingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="6" r="2"></circle>
    <path d="M10 10l-4 4 4 4"></path>
    <path d="M14 10l4 4-4 4"></path>
    <path d="M12 10v10"></path>
  </svg>
);

const JumpingJackIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3"></circle>
    <path d="M12 8v7"></path>
    <path d="M9 21l3-7 3 7"></path>
    <path d="M4 12l8-2 8 2"></path>
  </svg>
);

const YogaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="4" r="2"></circle>
    <path d="M12 6v10"></path>
    <path d="M12 22v-2"></path>
    <path d="M9 12h6"></path>
    <path d="M12 16l-3 3h6l-3-3"></path>
  </svg>
);

const StretchingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3"></circle>
    <path d="M8 9l4 4h6"></path>
    <path d="M6 9v12"></path>
    <path d="M3 21h6"></path>
  </svg>
);

const SquattingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3"></circle>
    <path d="M12 8v5"></path>
    <path d="M9 18l3-5 3 5"></path>
    <path d="M9 21h6"></path>
  </svg>
);


export const PREDEFINED_POSES: Pose[] = [
  { name: 'a character in a dynamic running pose', label: 'Running', icon: RunningIcon },
  { name: 'a character in a joyful dancing pose', label: 'Dancing', icon: DancingIcon },
  { name: 'a character in a proud, heroic pose, standing tall', label: 'Hero Pose', icon: HeroPoseIcon },
  { name: 'a character in a pensive, thinking pose', label: 'Thinking', icon: ThinkingIcon },
  { name: 'a character in a dynamic fighting stance, ready for action', label: 'Fighting', icon: FightingIcon },
  { name: 'a character swimming through water', label: 'Swimming', icon: SwimmingIcon },
  { name: 'a character doing a jumping jack', label: 'Jumping Jack', icon: JumpingJackIcon },
  { name: 'a character in a calm yoga pose (e.g., tree pose)', label: 'Yoga', icon: YogaIcon },
  { name: 'a character stretching their arms and legs', label: 'Stretching', icon: StretchingIcon },
  { name: 'a character in a deep squatting position', label: 'Squatting', icon: SquattingIcon },
];
