import React, { useState, useRef, useEffect } from 'react';
import { compressPdf } from '../services/pdfService';
import type { Tool } from '../types';
import { updateMetaTags } from '../utils/seo';

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

interface SuccessInfo {
    originalSize: number;
    newSize: number;
    url: string;
    filename: string;
}

const CompressPdfPage: React.FC<{ tool: Tool; onGoBack: () => void; }> = ({ tool, onGoBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const pageUrl = `${window.location.origin}/${tool.id}`;
    updateMetaTags({
        title: 'Compress PDF | Reduce PDF File Size Online - PurePDF',
        description: 'Reduce the file size of your PDF documents while maintaining the best possible quality. Free online PDF compressor for smaller, shareable files.',
        keywords: 'compress pdf, reduce pdf size, pdf compressor, optimize pdf',
        canonicalUrl: pageUrl,
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Compress a PDF",
            "description": "Reduce the file size of a PDF document for easier sharing and storage.",
            "step": [
                {
                    "@type": "HowToStep",
                    "name": "Select PDF",
                    "text": "Upload the PDF file you want to compress.",
                    "url": pageUrl,
                },
                {
                    "@type": "HowToStep",
                    "name": "Compress",
                    "text": "Click the 'Compress PDF' button to begin the file size reduction process.",
                    "url": pageUrl,
                },
                {
                    "@type": "HowToStep",
                    "name": "Download",
                    "text": "Your smaller, compressed PDF will be automatically downloaded.",
                    "url": pageUrl,
                }
            ]
        }
    });
  }, [tool.id]);

  useEffect(() => {
    return () => {
      if (successInfo?.url) {
        URL.revokeObjectURL(successInfo.url);
      }
    };
  }, [successInfo]);

  const processFile = (selectedFile: File | undefined) => {
    setError(null);
    setSuccessInfo(null);
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
  };

  const handleCompress = async () => {
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }
    
    setError(null);
    setSuccessInfo(null);
    setIsProcessing(true);

    try {
      const compressedPdfBytes = await compressPdf(file);
      const originalSize = file.size;
      const newSize = compressedPdfBytes.byteLength;
      
      const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const filename = `${file.name.replace(/\.pdf$/i, '')}_compressed.pdf`;
      triggerDownload(url, filename);
      setSuccessInfo({ originalSize, newSize, url, filename });
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An error occurred while compressing the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleStartOver = () => {
    setFile(null);
    setSuccessInfo(null);
    setError(null);
  };

  const renderSuccessMessage = () => {
    if (!successInfo) return null;
    const { originalSize, newSize, url, filename } = successInfo;
    const reduction = originalSize > 0 ? Math.round(((originalSize - newSize) / originalSize) * 100) : 0;
    
    return (
        <div className="text-center p-8 bg-green-50 border border-green-200 rounded-xl">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-800 mt-4">Compression Successful!</h2>
            <p className="mt-2 text-green-600">
                Original: {formatBytes(originalSize)} | New: {formatBytes(newSize)} | Saved: {formatBytes(originalSize - newSize)} ({reduction}% reduction)
            </p>
            <a
              href={url}
              download={filename}
              className="mt-6 inline-block px-8 py-3 bg-green-600 text-white font-bold text-base rounded-lg shadow-md hover:bg-green-700 transition-colors"
            >
              Download Again
            </a>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={handleStartOver} className="px-8 py-3 bg-green-500 text-white text-base font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors">
                    Compress Another PDF
                </button>
                <button onClick={onGoBack} className="px-8 py-3 bg-slate-200 text-slate-700 text-base font-semibold rounded-lg shadow-md hover:bg-slate-300 transition-colors">
                    Back to Home
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onGoBack} className="mb-6 flex items-center text-sm font-extrabold text-slate-600 hover:text-indigo-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Tools
      </button>
      
      <div className="text-center">
        <div className="mx-auto p-4 inline-block rounded-lg bg-green-100"><tool.icon className={`w-10 h-10 ${tool.color}`} /></div>
        <h1 className="text-3xl font-bold mt-4">{tool.title}</h1>
        <p className="text-slate-500 mt-2">{tool.description}</p>
      </div>

      <div className="mt-10 relative">
        {isProcessing && (
            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl">
                <svg className="animate-spin h-10 w-10 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-lg font-semibold text-slate-700">Compressing your PDF...</p>
                <p className="mt-1 text-sm text-slate-500">This may take a few moments.</p>
            </div>
        )}
        {!successInfo ? (
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
                    <button onClick={() => fileInputRef.current?.click()} className="mt-4 px-8 py-3 bg-indigo-500 text-white text-base font-semibold rounded-lg shadow-md hover:bg-indigo-600 transition-colors">
                        Select PDF file
                    </button>
                    {file && <p className="mt-4 font-medium text-slate-700">Selected: {file.name} ({formatBytes(file.size)})</p>}
                    </>
                )}
                </div>

                {file && (
                <div className="mt-8 text-center">
                    <button onClick={handleCompress} disabled={isProcessing} className="w-full sm:w-auto px-12 py-3 bg-green-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-green-600 transition-transform hover:scale-105 disabled:opacity-50">
                        Compress PDF
                    </button>
                </div>
                )}
                {error && <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">{error}</div>}
            </>
        ) : (
            renderSuccessMessage()
        )}
      </div>
    </div>
  );
};

export default CompressPdfPage;