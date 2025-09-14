import React, { useState, useRef } from 'react';
import { renderPdfToImages, createZipFromImages } from '../services/pdfService';
import type { Tool } from '../types';

const PdfToJpgPage: React.FC<{ tool: Tool; onGoBack: () => void; }> = ({ tool, onGoBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (selectedFile: File | undefined) => {
    setError(null);
    setFile(null);
    if (selectedFile?.type.endsWith('pdf')) {
      setFile(selectedFile);
    } else if (selectedFile) {
      setError('Invalid file type. Please select a PDF.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFile(e.target.files?.[0]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    processFile(e.dataTransfer.files?.[0]);
    e.dataTransfer.clearData();
  };
  
  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleProcess = async () => {
    if (!file) return setError('Please select a PDF file.');
    setError(null);
    setIsProcessing(true);

    try {
      const imagesDataUrls = await renderPdfToImages(file);
      const images = imagesDataUrls.map((data, i) => ({
        name: `page_${i + 1}.jpg`,
        data,
      }));
      const zipBlob = await createZipFromImages(images);
      const url = URL.createObjectURL(zipBlob);
      triggerDownload(url, `${file.name.replace(/\.pdf$/i, '')}_images.zip`);
    } catch (e: any) {
      setError(e.message || 'Failed to convert PDF to JPGs.');
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
        <div className={`mx-auto p-4 inline-block rounded-lg bg-fuchsia-100`}><tool.icon className={`w-10 h-10 ${tool.color}`} /></div>
        <h1 className="text-3xl font-bold mt-4">{tool.title}</h1>
        <p className="text-slate-500 mt-2">{tool.description}</p>
      </div>

       <div className="mt-10 relative">
        {isProcessing && (
            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl">
                <svg className="animate-spin h-10 w-10 text-fuchsia-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-lg font-semibold text-slate-700">Converting to JPG...</p>
                <p className="mt-1 text-sm text-slate-500">This may take a few moments for large files.</p>
            </div>
        )}
        <div onDragOver={e => {e.preventDefault(); setIsDraggingOver(true);}} onDragLeave={() => setIsDraggingOver(false)} onDrop={handleDrop} className={`border-2 border-dashed rounded-xl p-8 text-center bg-[#F8FAFC] transition-colors ${isDraggingOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300'}`}>
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
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              <p className="mt-2 text-sm text-slate-500">Drag & drop PDF file here</p>
              <button onClick={() => fileInputRef.current?.click()} className="mt-4 px-8 py-3 bg-indigo-500 text-white text-base font-semibold rounded-lg shadow-md hover:bg-indigo-600">Select PDF file</button>
              {file && <p className="mt-4 font-medium text-slate-700">Selected: {file.name}</p>}
            </>
          )}
        </div>
        
        {file && (
          <div className="mt-8 text-center">
            <button onClick={handleProcess} disabled={isProcessing} className="w-full sm:w-auto px-12 py-3 bg-fuchsia-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-fuchsia-600 transition-transform hover:scale-105 disabled:opacity-50">
              Convert to JPG
            </button>
          </div>
        )}
        {error && <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">{error}</div>}
      </div>
    </div>
  );
};

export default PdfToJpgPage;