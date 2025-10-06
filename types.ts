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

export interface Post {
  id: string;
  title: string;
  description: string;
  author: string;
  date: string;
  tags: string[];
}

// Types for Edit PDF feature
export interface TextObject {
  id: string;
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  width: number; // For wrapping, etc.
}

export interface ImageObject {
  id: string;
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  bytes: Uint8Array;
  mimeType: 'image/jpeg' | 'image/png';
}

export interface ShapeObject {
  id: string;
  type: 'shape';
  shape: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  fill: string;
  strokeWidth: number;
}

export type EditObject = TextObject | ImageObject | ShapeObject;
