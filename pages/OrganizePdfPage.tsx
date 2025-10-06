import React, { useState, useRef, useEffect, useCallback } from 'react';
import { renderPdfToImages, organizePdf } from '../services/pdfService';
import type { Tool } from '../types';
import { updateMetaTags } from '../utils/seo';

interface Page {
  originalIndex: number;
  id: string;
  imageUrl: string;
  rotation: number;
}

const OrganizePdfPage: React.FC<{ tool: Tool; onGoBack: () => void; }> = ({ tool, onGoBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedFileUrl, setProcessedFileUrl] = useState<string | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const pageUrl = `${window.location.origin}/${tool.id}`;
    updateMetaTags({
        title: 'Organize PDF | Reorder, Rotate, and Delete PDF Pages - PurePDF',
        description: 'Visually reorder, rotate, and delete pages from your PDF file. A simple way to organize your PDF documents online for free.',
        keywords: 'organize pdf, reorder pdf pages, delete pdf pages, sort pdf',
        canonicalUrl: pageUrl,
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Organize a PDF",
            "description": "Visually re-arrange, rotate, and delete pages in a PDF document.",
            "step": [
                {
                    "@type": "HowToStep",
                    "name": "Upload PDF",
                    "text": "Select the PDF file you wish to organize. The tool will generate a preview of all pages.",
                    "url": pageUrl,
                },
                {
                    "@type": "HowToStep",
                    "name": "Reorder, Rotate, Delete",
                    "text": "Drag and drop page thumbnails to change their order. Use the buttons on each page to rotate or delete it.",
                    "url": pageUrl,
                },
                {
                    "@type": "HowToStep",
                    "name": "Save and Download",
                    "text": "Click 'Save Organized PDF' to apply your changes and download the new file.",
                    "url": pageUrl,
                }
            ]
        }
    });
  }, [tool.id]);

  const processFile = useCallback(async (selectedFile: File | undefined) => {
    if (!selectedFile || !selectedFile.type.endsWith('pdf')) {
      if(selectedFile) setError('Invalid file type. Please select a PDF.');
      return;
    }
    setError(null);
    setFile(selectedFile);
    setIsLoading(true);
    setPages([]);

    try {
      const images = await renderPdfToImages(selectedFile);
      setPages(images.map((url, i) => ({
        originalIndex: i,
        id: `page-${i}`,
        imageUrl: url,
        rotation: 0,
      })));
    } catch (e: any) {
      setError(e.message || 'Failed to render PDF previews.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => { 
      pages.forEach(p => URL.revokeObjectURL(p.imageUrl));
      if (processedFileUrl) {
        URL.revokeObjectURL(processedFileUrl);
      }
    };
  }, [pages, processedFileUrl]);

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

  const handleRotate = (id: string) => {
    setPages(pages.map(p => p.id === id ? {...p, rotation: (p.rotation + 90) % 360 } : p));
  };
  
  const handleDelete = (id: string) => {
    setPages(pages.filter(p => p.id !== id));
  };

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => setDraggedItemId(id);
  const onDropReorder = (e: React.DragEvent<HTMLDivElement>, dropId: string) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === dropId) return;
    const dragIndex = pages.findIndex(p => p.id === draggedItemId);
    const dropIndex = pages.findIndex(p => p.id === dropId);
    const newPages = [...pages];
    const [draggedItem] = newPages.splice(dragIndex, 1);
    newPages.splice(dropIndex, 0, draggedItem);
    setPages(newPages);
  };
  
  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleOrganize = async () => {
    if (!file || pages.length === 0) return setError('No pages to organize.');
    setIsProcessing(true);
    setError(null);
    try {
      const newOrder = pages.map(p => p.originalIndex);
      const rotations = new Map<number, number>(pages.filter(p => p.rotation !== 0).map(p => [p.originalIndex, p.rotation]));
      const organizedBytes = await organizePdf(file, newOrder, rotations);
      const blob = new Blob([organizedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const filename = `${file.name.replace(/\.pdf$/i, '')}_organized.pdf`;
      setProcessedFileUrl(url);
      setOutputFilename(filename);
      triggerDownload(url, filename);
    } catch (e: any) {
      setError(e.message || 'Failed to organize PDF.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleStartOver = () => {
    setFile(null);
    setPages([]);
    setProcessedFileUrl(null);
    setOutputFilename('');
    setError(null);
  };

  const showOverlay = isLoading || isProcessing;
  let overlayMessage = 'Loading previews...';
  if (isProcessing) {
    overlayMessage = 'Saving your organized PDF...';
  }

  return (
    <div className="max-w-6xl mx-auto">
      <button onClick={onGoBack} className="mb-6 flex items-center text-sm font-extrabold text-slate-600 hover:text-indigo-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Tools
      </button>
      <div className="text-center">
        <div className={`mx-auto p-4 inline-block rounded-lg bg-cyan-100`}><tool.icon className={`w-10 h-10 ${tool.color}`} /></div>
        <h1 className="text-3xl font-bold mt-4">{tool.title}</h1>
        <p className="text-slate-500 mt-2">{tool.description}</p>
      </div>

      <div className="mt-10 relative">
        {showOverlay && !processedFileUrl && (
          <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl min-h-[200px]">
            <svg className="animate-spin h-10 w-10 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg font-semibold text-slate-700">{overlayMessage}</p>
            <p className="mt-1 text-sm text-slate-500">This may take a few moments for large files.</p>
          </div>
        )}

        {!file && !processedFileUrl && (
          <div onDragOver={e => {e.preventDefault(); setIsDraggingOver(true);}} onDragLeave={() => setIsDraggingOver(false)} onDrop={handleDrop} >
            <div className={`border-2 border-dashed rounded-xl p-8 text-center bg-[#F8FAFC] transition-colors ${isDraggingOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300'}`}>
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
                </>
              )}
            </div>
          </div>
        )}
        
        {pages.length > 0 && !processedFileUrl && (
          <>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {pages.map((p, index) => (
              <div key={p.id} draggable onDragStart={e => onDragStart(e, p.id)} onDragOver={e => e.preventDefault()} onDrop={e => onDropReorder(e, p.id)} className={`relative group border-2 rounded-lg shadow-sm cursor-move ${draggedItemId === p.id ? 'border-indigo-500' : 'border-transparent'}`}>
                <img src={p.imageUrl} alt={`Page ${p.originalIndex + 1}`} className="w-full h-auto rounded-md transition-transform" style={{ transform: `rotate(${p.rotation}deg)` }} />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity" />
                <span className="absolute top-1 left-2 font-bold text-white text-shadow">{index + 1}</span>
                <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleRotate(p.id)} className="w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-blue-500">🔄</button>
                  <button onClick={() => handleDelete(p.id)} className="w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-500">🗑️</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
              <button onClick={handleOrganize} disabled={isProcessing} className="px-12 py-3 bg-cyan-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-cyan-600 transition-transform hover:scale-105 disabled:opacity-50">
                Save Organized PDF
              </button>
          </div>
          </>
        )}
        
        {processedFileUrl && (
            <div className="text-center p-8 bg-green-50 border border-green-200 rounded-xl">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-800 mt-4">Organize Successful!</h2>
              <p className="mt-2 text-green-600">Your PDF has been reorganized and started downloading.</p>
              <a
                href={processedFileUrl}
                download={outputFilename}
                className="mt-6 inline-block px-8 py-3 bg-green-600 text-white font-bold text-base rounded-lg shadow-md hover:bg-green-700 transition-colors"
              >
                Download Again
              </a>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                  <button onClick={handleStartOver} className="px-8 py-3 bg-cyan-500 text-white text-base font-semibold rounded-lg shadow-md hover:bg-cyan-600 transition-colors">
                      Organize Another PDF
                  </button>
                  <button onClick={onGoBack} className="px-8 py-3 bg-slate-200 text-slate-700 text-base font-semibold rounded-lg shadow-md hover:bg-slate-300 transition-colors">
                      Back to Home
                  </button>
              </div>
          </div>
        )}
      </div>

      {error && <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">{error}</div>}
      <style>{`.text-shadow { text-shadow: 1px 1px 2px rgba(0,0,0,0.7); }`}</style>
    </div>
  );
};
export default OrganizePdfPage;