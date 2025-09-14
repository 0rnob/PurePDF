
import type React from 'react';

const SplitIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.25 3.75l-5.5 5.5 5.5 5.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.75 3.75l5.5 5.5-5.5 5.5" />
  </svg>
);
export default SplitIcon;
