import type React from 'react';

const ExcelToPdfIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V9a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7h2a2 2 0 00-2-2H9a2 2 0 00-2 2h2" />
  </svg>
);
export default ExcelToPdfIcon;