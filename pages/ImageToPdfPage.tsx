import React, { useState, useRef, useEffect } from 'react';
import { imagesToPdf } from '../services/pdfService';
import type { Tool } from '../types';

interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const ImageToPdfPage: React.FC<{ tool: Tool; onGoBack: () => void; }> = ({ tool, onGoBack }) => {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputFilename, setOutputFilename] = useState('converted.pdf');
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const processFiles = (incomingFiles: File[]) => {
    setError(null);
    const acceptedFiles = incomingFiles.filter(file => ['image/jpeg', 'image/png'].includes(file.type));
    if (acceptedFiles.length !== incomingFiles.length) {
        setError('Some files were not valid image types (only JPG and PNG are supported) and were ignored.');
    }
    if (acceptedFiles.length > 0) {
        const newFiles = acceptedFiles.map(file => ({ 
            id: `${file.name}-${Date.now()}`, 
            file,
            previewUrl: URL.createObjectURL(file) 
        }));
        setFiles(prev => [...prev, ...newFiles]);
    }
  };

  // Clean up object URLs when the component unmounts
  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.previewUrl));
    };
  }, [files]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processFiles(Array.from(event.target.files));
    }
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
      processFiles(Array.from(e.dataTransfer.files));
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

  const handleConvert = async () => {
    if (files.length === 0) {
      setError('Please select at least one image file.');
      return;
    }
    setError(null);
    setIsProcessing(true);

    try {
      const fileObjects = files.map(f => f.file);
      const pdfBytes = await imagesToPdf(fileObjects);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, outputFilename);
    } catch (e) {
      console.error(e);
      setError('An error occurred while converting the images. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Drag and Drop reordering logic
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => setDraggedItemId(id);
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
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
  const onDragEnd = () => setDraggedItemId(null);
  const handleRemoveFile = (id: string) => {
    const fileToRemove = files.find(f => f.id === id);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    setFiles(files.filter(f => f.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onGoBack} className="mb-6 flex items-center text-sm font-extrabold text-slate-600 hover:text-indigo-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Tools
      </button>
      
      <div className="text-center">
        <div className="mx-auto p-4 inline-block rounded-lg bg-purple-100"><tool.icon className={`w-10 h-10 ${tool.color}`} /></div>
        <h1 className="text-3xl font-bold mt-4">{tool.title}</h1>
        <p className="text-slate-500 mt-2">{tool.description}</p>
      </div>

      <div className="mt-10 relative">
         {isProcessing && (
            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl">
                <svg className="animate-spin h-10 w-10 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-lg font-semibold text-slate-700">Converting images to PDF...</p>
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
              <p className="text-lg font-semibold text-indigo-600 mt-2">Drop files to upload</p>
            </div>
           ) : (
            <>
              <input type="file" multiple accept="image/jpeg, image/png" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2 text-sm text-slate-500">Drag & drop image files here</p>
              <button onClick={() => fileInputRef.current?.click()} className="mt-4 px-8 py-3 bg-indigo-500 text-white text-base font-semibold rounded-lg shadow-md hover:bg-indigo-600 transition-colors">
                  Select Images
              </button>
            </>
           )}
        </div>
        
        {files.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold">Files to convert ({files.length}):</h3>
            <p className="text-sm text-slate-500 mb-4">Drag and drop files to change their order in the PDF.</p>
            <div className="flex flex-wrap gap-4">
              {files.map(imgFile => (
                <div 
                  key={imgFile.id} 
                  draggable 
                  onDragStart={(e) => onDragStart(e, imgFile.id)} 
                  onDragOver={onDragOver} 
                  onDrop={(e) => onDropReorder(e, imgFile.id)} 
                  onDragEnd={onDragEnd} 
                  className={`relative group w-36 bg-slate-100 rounded-lg shadow-sm overflow-hidden cursor-move transition-all ${draggedItemId === imgFile.id ? 'opacity-50 scale-95' : 'opacity-100'}`}
                >
                  <img src={imgFile.previewUrl} alt={imgFile.file.name} className="w-full h-36 object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-1 bg-black bg-opacity-60 text-white text-xs">
                    <p className="truncate">{imgFile.file.name}</p>
                    <p>{formatBytes(imgFile.file.size)}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(imgFile.id)}
                    className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-black bg-opacity-60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    aria-label="Remove file"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length > 0 && (
           <div className="mt-8 bg-[#F8FAFC] p-6 rounded-lg shadow-md">
            <div>
              <label htmlFor="filename" className="block text-sm font-medium text-slate-700">Output filename</label>
              <input type="text" id="filename" value={outputFilename} onChange={(e) => setOutputFilename(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="mt-6 text-center">
              <button onClick={handleConvert} disabled={isProcessing} className="w-full sm:w-auto px-12 py-3 bg-purple-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-purple-600 transition-transform hover:scale-105 disabled:opacity-50">
                Convert to PDF
              </button>
            </div>
           </div>
        )}
        {error && <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">{error}</div>}
      </div>
    </div>
  );
};
export default ImageToPdfPage;