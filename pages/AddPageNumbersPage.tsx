import React, { useState, useRef, useEffect } from 'react';
import { addPageNumbers } from '../services/pdfService';
import { parsePageRanges } from '../utils/pageRangeParser';
import type { PageNumberOptions } from '../services/pdfService';
import type { Tool } from '../types';
import { updateMetaTags } from '../utils/seo';

const AddPageNumbersPage: React.FC<{ tool: Tool; onGoBack: () => void; }> = ({ tool, onGoBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<Omit<PageNumberOptions, 'pageIndices'>>({
    position: 'bottom-center',
    start: 1,
    size: 12,
  });
  const [pageRange, setPageRange] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedFileUrl, setProcessedFileUrl] = useState<string | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const pageUrl = `${window.location.origin}/${tool.id}`;
    updateMetaTags({
        title: 'Add Page Numbers to PDF | Free Online Tool - PurePDF',
        description: 'Easily insert page numbers into your PDF documents. Choose position, format, and range for your page numbers.',
        keywords: 'add page numbers to pdf, pdf page numbering, insert page numbers',
        canonicalUrl: pageUrl,
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Add Page Numbers to a PDF",
            "description": "Insert sequential page numbers into a PDF document with custom position and styling.",
            "step": [
                {
                    "@type": "HowToStep",
                    "name": "Select PDF",
                    "text": "Upload the PDF file to which you want to add page numbers.",
                    "url": pageUrl,
                },
                {
                    "@type": "HowToStep",
                    "name": "Configure Options",
                    "text": "Choose the position for the numbers (e.g., bottom-center), the starting number, and the range of pages to apply them to.",
                    "url": pageUrl,
                },
                {
                    "@type": "HowToStep",
                    "name": "Process and Download",
                    "text": "Click 'Add Page Numbers' to generate and download your numbered PDF file.",
                    "url": pageUrl,
                }
            ]
        }
    });
  }, [tool.id]);

  useEffect(() => {
    return () => {
      if (processedFileUrl) {
        URL.revokeObjectURL(processedFileUrl);
      }
    };
  }, [processedFileUrl]);
  
  const processFile = (selectedFile: File | undefined) => {
    setError(null);
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
    const a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleProcess = async () => {
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }
    setError(null);
    setIsProcessing(true);

    try {
      const pageIndices = pageRange ? parsePageRanges(pageRange) : undefined;
       if (pageRange && pageIndices?.length === 0) {
        throw new Error("Invalid page range format.");
      }
      
      const numberedPdfBytes = await addPageNumbers(file, { ...options, pageIndices });
      const blob = new Blob([numberedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const filename = `${file.name.replace(/\.pdf$/i, '')}_numbered.pdf`;
      setProcessedFileUrl(url);
      setOutputFilename(filename);
      triggerDownload(url, filename);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An error occurred while adding page numbers.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleStartOver = () => {
    setFile(null);
    setOptions({ position: 'bottom-center', start: 1, size: 12 });
    setPageRange('');
    setError(null);
    setProcessedFileUrl(null);
    setOutputFilename('');
  };

  return (
     <div className="max-w-4xl mx-auto">
      <button onClick={onGoBack} className="mb-6 flex items-center text-sm font-extrabold text-slate-600 hover:text-indigo-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Tools
      </button>
      
      <div className="text-center">
        <div className="mx-auto p-4 inline-block rounded-lg bg-rose-100"><tool.icon className={`w-10 h-10 ${tool.color}`} /></div>
        <h1 className="text-3xl font-bold mt-4">{tool.title}</h1>
        <p className="text-slate-500 mt-2">{tool.description}</p>
      </div>

       <div className="mt-10 relative">
        {isProcessing && (
            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl">
                <svg className="animate-spin h-10 w-10 text-rose-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-lg font-semibold text-slate-700">Adding page numbers...</p>
                <p className="mt-1 text-sm text-slate-500">This may take a few moments.</p>
            </div>
        )}
        {!processedFileUrl ? (
          <>
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
                  <button onClick={() => fileInputRef.current?.click()} className="mt-4 px-8 py-3 bg-indigo-500 text-white text-base font-semibold rounded-lg shadow-md hover:bg-indigo-600 transition-colors">Select PDF file</button>
                  {file && <p className="mt-4 font-medium text-slate-700">Selected: {file.name}</p>}
                </>
              )}
            </div>
            
            {file && (
              <div className="mt-8 bg-[#F8FAFC] p-6 rounded-lg shadow-md">
                <h3 className="font-semibold text-lg">Numbering Options</h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="position" className="block text-sm font-medium text-slate-700">Position</label>
                        <select id="position" value={options.position} onChange={e => setOptions(o => ({...o, position: e.target.value as any}))} className="mt-1 block w-full pl-3 pr-10 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="bottom-center">Bottom Center</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="bottom-right">Bottom Right</option>
                            <option value="top-center">Top Center</option>
                            <option value="top-left">Top Left</option>
                            <option value="top-right">Top Right</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="start" className="block text-sm font-medium text-slate-700">Start from page</label>
                        <input type="number" id="start" min="1" value={options.start} onChange={e => setOptions(o => ({...o, start: parseInt(e.target.value, 10) || 1}))} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="range" className="block text-sm font-medium text-slate-700">Apply to pages</label>
                        <input type="text" id="range" value={pageRange} onChange={e => setPageRange(e.target.value)} placeholder="All pages" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                </div>
                <div className="mt-6 text-center">
                  <button onClick={handleProcess} disabled={isProcessing} className="w-full sm:w-auto px-12 py-3 bg-rose-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-rose-600 transition-transform hover:scale-105 disabled:opacity-50">
                    Add Page Numbers
                  </button>
                </div>
              </div>
            )}
            {error && <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">{error}</div>}
          </>
        ) : (
          <div className="text-center p-8 bg-green-50 border border-green-200 rounded-xl">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-800 mt-4">Task Successful!</h2>
              <p className="mt-2 text-green-600">Page numbers have been added and your file has started downloading.</p>
              <a
                href={processedFileUrl}
                download={outputFilename}
                className="mt-6 inline-block px-8 py-3 bg-green-600 text-white font-bold text-base rounded-lg shadow-md hover:bg-green-700 transition-colors"
              >
                Download Again
              </a>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                  <button onClick={handleStartOver} className="px-8 py-3 bg-rose-500 text-white text-base font-semibold rounded-lg shadow-md hover:bg-rose-600 transition-colors">
                      Process Another PDF
                  </button>
                  <button onClick={onGoBack} className="px-8 py-3 bg-slate-200 text-slate-700 text-base font-semibold rounded-lg shadow-md hover:bg-slate-300 transition-colors">
                      Back to Home
                  </button>
              </div>
          </div>
        )}
       </div>
    </div>
  );
};
export default AddPageNumbersPage;