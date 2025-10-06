import React, { useState, useRef, useEffect } from 'react';
import { addWatermark } from '../services/pdfService';
import type { WatermarkOptions } from '../types';
import type { Tool } from '../types';
import { updateMetaTags } from '../utils/seo';

const AddWatermarkPage: React.FC<{ tool: Tool; onGoBack: () => void; }> = ({ tool, onGoBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<WatermarkOptions>({
    text: 'CONFIDENTIAL',
    fontSize: 50,
    color: '#ff0000',
    opacity: 0.5,
    position: 'center',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedFileUrl, setProcessedFileUrl] = useState<string | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const pageUrl = `${window.location.origin}/${tool.id}`;
    updateMetaTags({
        title: 'Add Watermark to PDF | Free Online Watermarking Tool - PurePDF',
        description: 'Stamp a text or image watermark over your PDF documents in seconds. Protect your files with a custom watermark.',
        keywords: 'add watermark to pdf, watermark pdf, pdf watermarking tool, text watermark',
        canonicalUrl: pageUrl,
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Add a Watermark to a PDF",
            "description": "Apply a custom text watermark to every page of your PDF document.",
            "step": [
                {
                    "@type": "HowToStep",
                    "name": "Select PDF",
                    "text": "Upload the PDF file you want to watermark.",
                    "url": pageUrl,
                },
                {
                    "@type": "HowToStep",
                    "name": "Customize Watermark",
                    "text": "Enter your watermark text and customize its position, font size, color, and opacity.",
                    "url": pageUrl,
                },
                {
                    "@type": "HowToStep",
                    "name": "Apply and Download",
                    "text": "Click 'Add Watermark' to process the file and download your watermarked PDF.",
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
  };

  const handleProcess = async () => {
    if (!file) return setError('Please select a PDF file.');
    if (!options.text) return setError('Watermark text cannot be empty.');
    setError(null);
    setIsProcessing(true);
    try {
      const watermarkedBytes = await addWatermark(file, options);
      const blob = new Blob([watermarkedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const filename = `${file.name.replace(/\.pdf$/i, '')}_watermarked.pdf`;
      setProcessedFileUrl(url);
      setOutputFilename(filename);
      triggerDownload(url, filename);
    } catch (e: any) {
      setError(e.message || 'Failed to add watermark.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleStartOver = () => {
    setFile(null);
    setError(null);
    setProcessedFileUrl(null);
    setOutputFilename('');
    setOptions({
      text: 'CONFIDENTIAL',
      fontSize: 50,
      color: '#ff0000',
      opacity: 0.5,
      position: 'center',
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onGoBack} className="mb-6 flex items-center text-sm font-extrabold text-slate-600 hover:text-indigo-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Tools
      </button>
      
      <div className="text-center">
        <div className={`mx-auto p-4 inline-block rounded-lg bg-lime-100`}><tool.icon className={`w-10 h-10 ${tool.color}`} /></div>
        <h1 className="text-3xl font-bold mt-4">{tool.title}</h1>
        <p className="text-slate-500 mt-2">{tool.description}</p>
      </div>

      <div className="mt-10 relative">
        {isProcessing && (
            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl">
                <svg className="animate-spin h-10 w-10 text-lime-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-lg font-semibold text-slate-700">Adding watermark...</p>
                <p className="mt-1 text-sm text-slate-500">This may take a few moments.</p>
            </div>
        )}
        {!processedFileUrl ? (
          <>
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
              <div className="mt-8 bg-[#F8FAFC] p-6 rounded-lg shadow-md">
                <h3 className="font-semibold text-lg">Watermark Options</h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="watermark-text" className="block text-sm font-medium text-slate-700">Text</label>
                    <input type="text" id="watermark-text" value={options.text} onChange={e => setOptions({...options, text: e.target.value})} className="mt-1 block w-full input" />
                  </div>
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-slate-700">Position</label>
                    <select id="position" value={options.position} onChange={e => setOptions({...options, position: e.target.value as any})} className="mt-1 block w-full input">
                      <option value="center">Center (Diagonal)</option>
                      <option value="top-left">Top Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="font-size" className="block text-sm font-medium text-slate-700">Font Size</label>
                    <input type="number" id="font-size" value={options.fontSize} onChange={e => setOptions({...options, fontSize: Number(e.target.value)})} className="mt-1 block w-full input" />
                  </div>
                  <div>
                    <label htmlFor="color" className="block text-sm font-medium text-slate-700">Color</label>
                    <input type="color" id="color" value={options.color} onChange={e => setOptions({...options, color: e.target.value})} className="mt-1 block w-full h-10 p-1" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="opacity" className="block text-sm font-medium text-slate-700">Opacity ({Math.round(options.opacity * 100)}%)</label>
                    <input type="range" id="opacity" min="0" max="1" step="0.1" value={options.opacity} onChange={e => setOptions({...options, opacity: Number(e.target.value)})} className="mt-1 block w-full" />
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <button onClick={handleProcess} disabled={isProcessing} className="w-full sm:w-auto px-12 py-3 bg-lime-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-lime-600 transition-transform hover:scale-105 disabled:opacity-50">
                    Add Watermark
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
              <p className="mt-2 text-green-600">Your PDF has been watermarked and started downloading.</p>
              <a
                href={processedFileUrl}
                download={outputFilename}
                className="mt-6 inline-block px-8 py-3 bg-green-600 text-white font-bold text-base rounded-lg shadow-md hover:bg-green-700 transition-colors"
              >
                Download Again
              </a>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                  <button onClick={handleStartOver} className="px-8 py-3 bg-lime-500 text-white text-base font-semibold rounded-lg shadow-md hover:bg-lime-600 transition-colors">
                      Watermark Another PDF
                  </button>
                  <button onClick={onGoBack} className="px-8 py-3 bg-slate-200 text-slate-700 text-base font-semibold rounded-lg shadow-md hover:bg-slate-300 transition-colors">
                      Back to Home
                  </button>
              </div>
          </div>
        )}
      </div>
      <style>{`.input { all: unset; box-sizing: border-box; display: block; width: 100%; margin-top: 0.25rem; padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #cbd5e1; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); } .input:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-color: #6366f1; border-color: #6366f1; }`}</style>
    </div>
  );
};
export default AddWatermarkPage;