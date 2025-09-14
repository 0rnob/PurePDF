import type React from 'react';

export type ToolCategory = 'Organize PDF' | 'Optimize PDF' | 'Convert PDF' | 'Edit PDF';

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  category: ToolCategory;
  disabled?: boolean;
}

export interface PdfFile {
  id: string;
  file: File;
}

export interface WatermarkOptions {
  text: string;
  fontSize: number;
  color: string;
  opacity: number;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}