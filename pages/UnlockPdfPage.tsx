import React, { useState, useRef, useEffect } from 'react';
import { unlockPdf } from '../services/pdfService';
import type { Tool } from '../types';
import { updateMetaTags } from '../utils/seo';

const UnlockPdfPage: React.FC<{ tool: Tool; onGoBack: () => void; }> = ({ tool, onGoBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedFileUrl, setProcessedFileUrl] = useState<string | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const pageUrl = `${window.location.origin}/${tool.id}`;
    updateMetaTags({
        title: 'Unlock PDF | Remove PDF Password & Restrictions - PurePDF',
        description: 'Remove password security from your PDF files if you have the password. Unlock protected PDFs for editing and printing.',
        keywords: 'unlock pdf, remove pdf password, pdf password remover, decrypt pdf',
        canonicalUrl: pageUrl,
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Unlock a PDF",
            "description": "Remove password protection from a PDF file to allow editing and printing.",
            "step": [
                {
                    "@type": "HowToStep",
                    "name": "Select PDF",
                    "text": "Upload the password-protected PDF file you want to unlock.",
                    "url": pageUrl,
                },
                {
                    "@type": "HowToStep",
                    "name": "Enter Password",
                    "text": "Provide the current password for the PDF file to authorize its removal.",
                    "url": pageUrl,
                },
                {
                    "@type": "HowToStep",
                    "name": "Unlock and Download",
                    "text": "Click 'Unlock PDF'. Your new, unrestricted PDF will be downloaded.",
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

  const handleUnlock = async () => {
    if (!file) return setError('Please select a PDF file.');
    if (!password) return setError('Please enter the password for the PDF.');
    setError(null);
    setIsProcessing(true);
    try {
      const unlockedBytes = await unlockPdf(file, password);
      const blob = new Blob([unlockedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const filename = `${file.name.replace(/\.pdf$/i, '')}_unlocked.pdf`;
      setProcessedFileUrl(url);
      setOutputFilename(filename);
      triggerDownload(url, filename);
    } catch (e: any) {
      console.error(e);
      setError('Failed to unlock PDF. Please double-check your password.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleStartOver = () => {
    setFile(null);
    setError(null);
    setProcessedFileUrl(null);
    setOutputFilename('');
    setPassword('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onGoBack} className="mb-6 flex items-center text-sm font-extrabold text-slate-600 hover:text-indigo-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Tools
      </button>
      
      <div className="text-center">
        <div className={`mx-auto p-4 inline-block rounded-lg bg-red-100`}><tool.icon className={`w-10 h-10 ${tool.color}`} /></div>
        <h1 className="text-3xl font-bold mt-4">{tool.title}</h1>
        <p className="text-slate-500 mt-2">{tool.description}</p>
      </div>

      <div className="mt-10 relative">
        {isProcessing && (
            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl">
                <svg className="animate-spin h-10 w-10 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-lg font-semibold text-slate-700">Unlocking your PDF...</p>
                <p className="mt-1 text-sm text-slate-500">This may take a moment.</p>
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
                <div className="max-w-sm mx-auto">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">PDF Password</label>
                  <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Enter password to unlock" />
                </div>
                <div className="mt-6 text-center">
                  <button onClick={handleUnlock} disabled={isProcessing} className="w-full sm:w-auto px-12 py-3 bg-red-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-red-600 transition-transform hover:scale-105 disabled:opacity-50">
                    Unlock PDF
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
              <h2 className="text-2xl font-bold text-green-800 mt-4">Unlock Successful!</h2>
              <p className="mt-2 text-green-600">Your PDF has been unlocked and started downloading.</p>
              <a
                href={processedFileUrl}
                download={outputFilename}
                className="mt-6 inline-block px-8 py-3 bg-green-600 text-white font-bold text-base rounded-lg shadow-md hover:bg-green-700 transition-colors"
              >
                Download Again
              </a>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                  <button onClick={handleStartOver} className="px-8 py-3 bg-red-500 text-white text-base font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors">
                      Unlock Another PDF
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
export default UnlockPdfPage;