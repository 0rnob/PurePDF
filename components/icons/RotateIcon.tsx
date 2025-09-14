
import type React from 'react';

const RotateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l16 16" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 4h5v5" />
  </svg>
);
export default RotateIcon;
