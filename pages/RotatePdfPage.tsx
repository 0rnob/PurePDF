import React, { useState, useRef } from 'react';
import { rotatePdf } from '../services/pdfService';
import { parsePageRanges } from '../utils/pageRangeParser';
import type { Tool } from '../types';

const RotatePdfPage: React.FC<{ tool: Tool; onGoBack: () => void; }> = ({ tool, onGoBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [pageRange, setPageRange] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (selectedFile: File | undefined) => {
    setError(null);
    setSuccessMessage(null);
    setFile(null);

    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setFile(selectedFile);
      } else {
        setError('Invalid file type. Please select a PDF file.');
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFile(event.target.files?.[0]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };
  
  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRotate = async () => {
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }
    
    setError(null);
    setSuccessMessage(null);
    setIsProcessing(true);

    try {
      // If pageRange is empty, it means all pages. pdfService handles undefined pageIndices as all pages.
      const pageIndices = pageRange ? parsePageRanges(pageRange) : undefined;
       if (pageRange && pageIndices?.length === 0) {
        throw new Error("Invalid page range format. Use numbers, commas, and hyphens (e.g., 1-3, 5, 8).");
      }

      const rotatedPdfBytes = await rotatePdf(file, rotation, pageIndices);
      const blob = new Blob([rotatedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const originalName = file.name.replace(/\.pdf$/i, '');
      triggerDownload(url, `${originalName}_rotated.pdf`);
      setSuccessMessage('Your PDF has been rotated and downloaded successfully!');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An error occurred while rotating the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onGoBack} className="mb-6 flex items-center text-sm font-extrabold text-slate-600 hover:text-indigo-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Tools
      </button>
      
      <div className="text-center">
        <div className="mx-auto p-4 inline-block rounded-lg bg-blue-100"><tool.icon className={`w-10 h-10 ${tool.color}`} /></div>
        <h1 className="text-3xl font-bold mt-4">{tool.title}</h1>
        <p className="text-slate-500 mt-2">{tool.description}</p>
      </div>

      <div className="mt-10 relative">
        {isProcessing && (
            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl">
                <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-lg font-semibold text-slate-700">Rotating your PDF...</p>
                <p className="mt-1 text-sm text-slate-500">This may take a few moments.</p>
            </div>
        )}
         <div
           onDragOver={handleDragOver}
           onDragLeave={handleDragLeave}
           onDrop={handleDrop}
           className={`border-2 border-dashed rounded-xl p-8 text-center bg-[#F8FAFC] transition-colors ${isDraggingOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300'}`}
         >
          {isDraggingOver ? (
            <div className="flex flex-col items-center justify-center pointer-events-none">
              <svg className="w-16 h-16 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="text-lg font-semibold text-indigo-600 mt-2">Drop file to upload</p>
            </div>
           ) : (
            <>
              <input type="file" accept=".pdf" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2 text-sm text-slate-500">Drag & drop PDF file here</p>
              <button onClick={() => fileInputRef.current?.click()} className="mt-4 px-8 py-3 bg-indigo-500 text-white text-base font-semibold rounded-lg shadow-md hover:bg-indigo-600 transition-colors">
                  Select PDF file
              </button>
              {file && <p className="mt-4 font-medium text-slate-700">Selected: {file.name}</p>}
            </>
           )}
        </div>

        {file && (
          <div className="mt-8 bg-[#F8FAFC] p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg">Rotation Options</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Angle</label>
                <div className="mt-2 flex rounded-md shadow-sm">
                  {[90, 180, 270].map(angle => (
                    <button key={angle} onClick={() => setRotation(angle as 90 | 180 | 270)} className={`flex-1 px-4 py-2 text-sm font-medium border -ml-px first:ml-0 first:rounded-l-md last:rounded-r-md transition-colors ${rotation === angle ? 'bg-indigo-500 text-white border-indigo-500 z-10' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>
                      {angle}°
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="page-range" className="block text-sm font-medium text-gray-700">Pages to rotate</label>
                <input
                    type="text"
                    id="page-range"
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                    placeholder="All pages"
                    className="mt-2 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-slate-500 mt-1">Leave blank to rotate all pages, or specify ranges (e.g., 1-3, 5).</p>
              </div>
            </div>
             <div className="mt-6 text-center">
              <button onClick={handleRotate} disabled={isProcessing} className="w-full sm:w-auto px-12 py-3 bg-blue-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-blue-600 transition-transform hover:scale-105 disabled:opacity-50">
                Rotate PDF
              </button>
            </div>
          </div>
        )}
        {error && <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">{error}</div>}
        {successMessage && <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">{successMessage}</div>}
      </div>
    </div>
  );
};

export default RotatePdfPage;