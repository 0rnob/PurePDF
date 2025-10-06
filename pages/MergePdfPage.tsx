import React, { useState, useCallback, useRef, useEffect } from 'react';
import { mergePdfs } from '../services/pdfService';
import { suggestFilename } from '../services/geminiService';
import { MergeIcon } from '../components/icons';
import type { Tool, PdfFile } from '../types';
import { updateMetaTags } from '../utils/seo';

interface MergePdfPageProps {
  tool: Tool;
  onGoBack: () => void;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const MergePdfPage: React.FC<MergePdfPageProps> = ({ tool, onGoBack }) => {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [mergedFileUrl, setMergedFileUrl] = useState<string | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [isSuggestingName, setIsSuggestingName] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputFilename, setOutputFilename] = useState('merged.pdf');
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const pageUrl = `${window.location.origin}/${tool.id}`;
    updateMetaTags({
        title: 'Merge PDF | Combine PDF Files Online for Free - PurePDF',
        description: 'Easily merge multiple PDF files into one single document online. Free, fast, and secure PDF combiner tool from PurePDF.',
        keywords: 'merge pdf, combine pdf, join pdf, pdf merger, online pdf tool',
        canonicalUrl: pageUrl,
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Merge PDF Files",
            "description": "Combine two or more PDF files into a single document using the PurePDF online tool.",
            "step": [
                {
                    "@type": "HowToStep",
                    "name": "Select Files",
                    "text": "Click the 'Select PDF files' button or drag and drop your PDF files into the upload area.",
                    "url": pageUrl,
                },
                {
                    "@type": "HowToStep",
                    "name": "Order Files",
                    "text": "Drag and drop the file previews to arrange them in the desired order for the final document.",
                    "url": pageUrl,
                },
                 {
                    "@type": "HowToStep",
                    "name": "Merge",
                    "text": "Optionally, use the AI feature to suggest a filename. Then, click the 'Merge PDF' button to start the process.",
                    "url": pageUrl,
                },
                {
                    "@type": "HowToStep",
                    "name": "Download",
                    "text": "Your merged PDF will be created and automatically downloaded to your device.",
                    "url": pageUrl,
                }
            ]
        }
    });
}, [tool.id]);

  useEffect(() => {
    return () => {
      if (mergedFileUrl) {
        URL.revokeObjectURL(mergedFileUrl);
      }
    };
  }, [mergedFileUrl]);

  const processFiles = (incomingFiles: File[]) => {
    setError(null);
    setMergedFileUrl(null);

    const validFiles: File[] = [];
    const invalidFiles: File[] = [];

    for (const file of incomingFiles) {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    }

    if (invalidFiles.length > 0) {
      const filenames = invalidFiles.map(f => f.name).join(', ');
      setError(`Invalid file type. Only PDF files are allowed. The following files were rejected: ${filenames}`);
      return;
    }

    if (validFiles.length > 0) {
      const newFiles = validFiles.map(file => ({ id: `${file.name}-${Date.now()}`, file }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processFiles(Array.from(event.target.files));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
      processFiles(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };
  
  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please select at least two PDF files to merge.');
      return;
    }
    setError(null);
    setIsMerging(true);
    setMergedFileUrl(null);

    try {
      const fileObjects = files.map(f => f.file);
      const mergedPdfBytes = await mergePdfs(fileObjects);
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedFileUrl(url);
      triggerDownload(url, outputFilename);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An error occurred while merging the PDFs. Please try again.');
    } finally {
      setIsMerging(false);
    }
  };
  
  const handleSuggestFilename = async () => {
    if (files.length === 0) {
      setError("Please add some files first to suggest a name.");
      return;
    }
    setError(null);
    setIsSuggestingName(true);
    try {
      const filenames = files.map(f => f.file.name);
      const suggestedName = await suggestFilename(filenames);
      setOutputFilename(suggestedName);
    } catch (e) {
      console.error(e);
      setError("Could not suggest a filename. Please check your API key.");
    } finally {
      setIsSuggestingName(false);
    }
  };

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDropReorder = (e: React.DragEvent<HTMLDivElement>, dropId: string) => {
    e.preventDefault();
    if (!draggedItemId) return;

    const draggedIndex = files.findIndex(f => f.id === draggedItemId);
    const dropIndex = files.findIndex(f => f.id === dropId);
    
    if (draggedIndex === -1 || dropIndex === -1) return;

    const newFiles = [...files];
    const [draggedItem] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(dropIndex, 0, draggedItem);
    setFiles(newFiles);
    setDraggedItemId(null);
  };
  
  const onDragEnd = () => {
    setDraggedItemId(null);
  }
  
  const handleStartOver = () => {
    setFiles([]);
    setMergedFileUrl(null);
    setError(null);
    setOutputFilename('merged.pdf');
  };

  const FilePreview: React.FC<{ pdfFile: PdfFile }> = ({ pdfFile }) => (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, pdfFile.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDropReorder(e, pdfFile.id)}
      onDragEnd={onDragEnd}
      className={`relative p-3 bg-[#F8FAFC] rounded-lg shadow-sm border flex items-center justify-between transition-opacity ${draggedItemId === pdfFile.id ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="flex items-center space-x-3 overflow-hidden">
        <MergeIcon className="w-6 h-6 text-indigo-500 flex-shrink-0" />
        <span className="truncate text-sm font-medium">{pdfFile.file.name}</span>
        <span className="text-xs text-slate-500 flex-shrink-0">{formatBytes(pdfFile.file.size)}</span>
      </div>
      <button
        onClick={() => handleRemoveFile(pdfFile.id)}
        className="ml-2 p-1 rounded-full hover:bg-slate-200 transition-colors"
        aria-label="Remove file"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onGoBack} className="mb-6 flex items-center text-sm font-extrabold text-slate-600 hover:text-indigo-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Tools
      </button>
      
      <div className="text-center">
        <div className={`mx-auto p-4 inline-block rounded-lg bg-indigo-100`}>
          <tool.icon className={`w-10 h-10 ${tool.color}`} />
        </div>
        <h1 className="text-3xl font-bold mt-4">{tool.title}</h1>
        <p className="text-slate-500 mt-2">{tool.description}</p>
      </div>

      <div className="mt-10 relative">
        {isMerging && (
            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl">
                <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-lg font-semibold text-slate-700">Merging your PDFs...</p>
                <p className="mt-1 text-sm text-slate-500">This may take a few moments for large files.</p>
            </div>
        )}
        
        {!mergedFileUrl ? (
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
                  <p className="text-lg font-semibold text-indigo-600 mt-2">Drop files to upload</p>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-2 text-sm text-slate-500">Drag & drop PDF files here</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 px-8 py-3 bg-indigo-500 text-white text-base font-semibold rounded-lg shadow-md hover:bg-indigo-600 transition-colors"
                  >
                    Select PDF files
                  </button>
                </>
              )}
            </div>

            {files.length > 0 && (
              <div className="mt-8 space-y-2">
                <h3 className="font-semibold">Files to merge ({files.length}):</h3>
                 <p className="text-sm text-slate-500">Drag and drop files to change their order.</p>
                {files.map(pdfFile => <FilePreview key={pdfFile.id} pdfFile={pdfFile} />)}
              </div>
            )}

            {files.length > 1 && (
              <div className="mt-8 bg-[#F8FAFC] p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-grow">
                      <label htmlFor="filename" className="block text-sm font-medium text-slate-700">Output filename</label>
                      <input
                          type="text"
                          id="filename"
                          value={outputFilename}
                          onChange={(e) => setOutputFilename(e.target.value)}
                          className="mt-1 block w-full px-3 py-3 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                  </div>
                  <div className="flex-shrink-0 self-end">
                    <button
                      onClick={handleSuggestFilename}
                      disabled={isSuggestingName}
                      className="w-full sm:w-auto px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center justify-center text-base"
                      >
                      {isSuggestingName ? (
                         <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                      ) : '✨ Suggest Name (AI)'}
                     </button>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <button
                    onClick={handleMerge}
                    disabled={isMerging}
                    className="w-full sm:w-auto px-12 py-3 bg-indigo-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-indigo-600 transition-transform hover:scale-105 disabled:opacity-50"
                  >
                    Merge PDF
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-8 bg-green-50 border border-green-200 rounded-xl">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-800 mt-4">Merge Successful!</h2>
            <p className="mt-2 text-green-600">Your file has started downloading. You can download it again if needed.</p>
            <a
              href={mergedFileUrl}
              download={outputFilename}
              className="mt-6 inline-block px-8 py-3 bg-green-600 text-white font-bold text-base rounded-lg shadow-md hover:bg-green-700 transition-colors"
            >
              Download Again
            </a>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={handleStartOver} className="px-8 py-3 bg-indigo-500 text-white text-base font-semibold rounded-lg shadow-md hover:bg-indigo-600 transition-colors">
                    Merge More PDFs
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

export default MergePdfPage;