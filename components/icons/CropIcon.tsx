import type React from 'react';

const CropIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 14.121L19 19M4.879 4.879L9.757 9.757" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M1 1h4v4M1 19h4v4M19 1h4v4M19 19h4v4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 14H1v-4M19 14h4v-4M14 5V1h-4M14 19v4h-4" />
  </svg>
);
export default CropIcon;