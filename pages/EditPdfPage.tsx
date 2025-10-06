import React, { useState, useRef, useEffect, useCallback } from 'react';
import { renderPdfToImages, applyEditsToPdf } from '../services/pdfService';
import type { Tool, EditObject, TextObject, ImageObject, ShapeObject } from '../types';
import { updateMetaTags } from '../utils/seo';

interface Page {
  originalIndex: number;
  id: string;
  imageUrl: string;
  rotation: number;
  edits: EditObject[];
}

type EditorTool = 'select' | 'text' | 'image' | 'shape';

const EditPdfPage: React.FC<{ tool: Tool; onGoBack: () => void; }> = ({ tool, onGoBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedFileUrl, setProcessedFileUrl] = useState<string | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const pageUrl = `${window.location.origin}/${tool.id}`;
    updateMetaTags({
        title: 'Edit PDF | Free Online PDF Editor - PurePDF',
        description: 'Edit your PDF files online for free. Add text, images, and shapes, and organize pages in your PDF document.',
        keywords: 'edit pdf, pdf editor, annotate pdf, modify pdf, online pdf editor',
        canonicalUrl: pageUrl,
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Edit a PDF",
            "description": "Add text, images, and shapes to a PDF, and reorganize its pages.",
            "step": [
                {
                    "@type": "HowToStep",
                    "name": "Upload PDF",
                    "text": "Select the PDF file you want to edit. Page previews will be generated.",
                    "url": pageUrl,
                },
                {
                    "@type": "HowToStep",
                    "name": "Use Editing Tools",
                    "text": "Select tools to add text, images, or shapes to the active page. Click on an object to select it and edit its properties.",
                    "url": pageUrl,
                },
                 {
                    "@type": "HowToStep",
                    "name": "Organize Pages",
                    "text": "Use the page sidebar to reorder, rotate, or delete pages as needed.",
                    "url": pageUrl,
                },
                {
                    "@type": "HowToStep",
                    "name": "Save and Download",
                    "text": "Click 'Save & Download' to apply all your edits and download the new PDF file.",
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

  const processFile = useCallback(async (selectedFile: File | undefined) => {
    if (!selectedFile || !selectedFile.type.endsWith('pdf')) {
      if (selectedFile) setError('Invalid file type. Please select a PDF.');
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
        edits: [],
      })));
      setActivePageIndex(0);
    } catch (e: any) {
      setError(e.message || 'Failed to render PDF previews.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
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

  const updatePageEdits = (pageIndex: number, newEdits: EditObject[]) => {
    setPages(pages.map((p, i) => i === pageIndex ? { ...p, edits: newEdits } : p));
  };
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'select') {
      setSelectedObjectId(null);
      return;
    }

    const rect = canvasContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let newObject: EditObject | null = null;
    if (activeTool === 'text') {
      const textObject: TextObject = {
        id: Date.now().toString(),
        type: 'text',
        x,
        y,
        text: 'Type here...',
        fontSize: 16,
        color: '#000000',
        width: 100,
      };
      newObject = textObject;
    } else if (activeTool === 'shape') {
      const shapeObject: ShapeObject = {
        id: Date.now().toString(),
        type: 'shape',
        shape: 'rectangle',
        x,
        y,
        width: 100,
        height: 50,
        color: '#000000',
        fill: '#ffffff',
        strokeWidth: 2,
      };
      newObject = shapeObject;
    }

    if (newObject) {
      const currentPage = pages[activePageIndex];
      updatePageEdits(activePageIndex, [...currentPage.edits, newObject]);
      setActiveTool('select');
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgFile = e.target.files?.[0];
    if (!imgFile || !['image/jpeg', 'image/png'].includes(imgFile.type)) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const bytes = new Uint8Array(event.target?.result as ArrayBuffer);
      const newImage: ImageObject = {
        id: Date.now().toString(),
        type: 'image',
        x: 50, y: 50, width: 200, height: 150,
        bytes,
        mimeType: imgFile.type as 'image/jpeg' | 'image/png',
      };
      const currentPage = pages[activePageIndex];
      updatePageEdits(activePageIndex, [...currentPage.edits, newImage]);
    };
    reader.readAsArrayBuffer(imgFile);
    if(imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
        const newOrder = pages.map(p => p.originalIndex);
        const rotations = new Map(pages.map(p => [p.originalIndex, p.rotation]));
        const edits = new Map(pages.map(p => [p.originalIndex, p.edits]));
        
        const editedBytes = await applyEditsToPdf(file, newOrder, rotations, edits);
        
        const blob = new Blob([editedBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const filename = `${file.name.replace(/\.pdf$/i, '')}_edited.pdf`;

        setProcessedFileUrl(url);
        setOutputFilename(filename);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (e: any) {
      setError(e.message || 'Failed to save PDF.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleStartOver = () => {
    setFile(null);
    setPages([]);
    setActivePageIndex(0);
    setActiveTool('select');
    setError(null);
    setSelectedObjectId(null);
    setProcessedFileUrl(null);
    setOutputFilename('');
  };

  const updateObject = (updatedObject: EditObject) => {
    const newEdits = pages[activePageIndex].edits.map(obj => 
      obj.id === updatedObject.id ? updatedObject : obj
    );
    updatePageEdits(activePageIndex, newEdits);
  };
  
  const renderObject = (obj: EditObject) => {
    const isSelected = selectedObjectId === obj.id;
    const style: React.CSSProperties = {
      position: 'absolute',
      left: obj.x,
      top: obj.y,
      border: isSelected ? '2px dashed #6366f1' : 'none',
      cursor: 'pointer',
    };
    
    const onObjectClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveTool('select');
      setSelectedObjectId(obj.id);
    };

    switch(obj.type) {
      case 'text':
        return <div onClick={onObjectClick} style={{...style, color: obj.color, fontSize: obj.fontSize, width: obj.width, whiteSpace: 'pre-wrap' }}>{obj.text}</div>;
      case 'image':
        const imageUrl = URL.createObjectURL(new Blob([obj.bytes], { type: obj.mimeType }));
        return <img src={imageUrl} onClick={onObjectClick} style={{...style, width: obj.width, height: obj.height}} alt="user upload" />;
      case 'shape':
        return <div onClick={onObjectClick} style={{...style, width: obj.width, height: obj.height, backgroundColor: obj.fill, border: `${obj.strokeWidth}px solid ${obj.color}`}} />;
      default: return null;
    }
  }
  
  const renderContextualEditor = () => {
    if (!selectedObjectId) return null;
    const obj = pages[activePageIndex].edits.find(o => o.id === selectedObjectId);
    if (!obj) return null;

    return (
      <div className="bg-slate-100 p-3 rounded-lg shadow-md">
        <h4 className="font-bold text-sm mb-2 capitalize">{obj.type} Properties</h4>
        {obj.type === 'text' && (
          <div className="space-y-2">
            <textarea value={obj.text} onChange={e => updateObject({ ...obj, text: e.target.value })} className="w-full p-2 border rounded-md text-sm bg-white text-slate-800 border-slate-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" rows={3}></textarea>
            <div className="flex items-center gap-2">
              <label className="text-xs">Size:</label>
              <input type="number" value={obj.fontSize} onChange={e => updateObject({ ...obj, fontSize: parseInt(e.target.value, 10) })} className="w-16 p-1 border rounded text-sm" />
              <input type="color" value={obj.color} onChange={e => updateObject({ ...obj, color: e.target.value })} className="w-8 h-8 p-0 border-none rounded" />
            </div>
          </div>
        )}
        {(obj.type === 'image' || obj.type === 'shape') && (
           <div className="grid grid-cols-2 gap-2">
             <div>
                <label className="text-xs">Width:</label>
                <input type="number" value={obj.width} onChange={e => updateObject({ ...obj, width: parseInt(e.target.value, 10) })} className="w-full p-1 border rounded text-sm" />
             </div>
             <div>
                <label className="text-xs">Height:</label>
                <input type="number" value={obj.height} onChange={e => updateObject({ ...obj, height: parseInt(e.target.value, 10) })} className="w-full p-1 border rounded text-sm" />
             </div>
           </div>
        )}
      </div>
    );
  }

  const handleDeletePage = (index: number) => {
    if (pages.length <= 1) return setError("Cannot delete the last page.");
    const newPages = pages.filter((_, i) => i !== index);
    if (activePageIndex >= newPages.length) {
      setActivePageIndex(newPages.length - 1);
    }
    setPages(newPages);
  };

  const handleRotatePage = (index: number) => {
    setPages(pages.map((p, i) => i === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
  };
  
  const onPageDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => setDraggedPageId(id);
  const onPageDropReorder = (e: React.DragEvent<HTMLDivElement>, dropId: string) => {
    e.preventDefault();
    if (!draggedPageId || draggedPageId === dropId) return;
    const dragIndex = pages.findIndex(p => p.id === draggedPageId);
    const dropIndex = pages.findIndex(p => p.id === dropId);
    const newPages = [...pages];
    const [draggedItem] = newPages.splice(dragIndex, 1);
    newPages.splice(dropIndex, 0, draggedItem);
    setPages(newPages);
    setActivePageIndex(newPages.findIndex(p => p.id === draggedItem.id));
  };

  return (
    <div className="max-w-full mx-auto">
      <button onClick={onGoBack} className="mb-6 flex items-center text-sm font-extrabold text-slate-600 hover:text-indigo-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Tools
      </button>
      <div className="text-center mb-8">
        <div className={`mx-auto p-4 inline-block rounded-lg bg-teal-100`}><tool.icon className={`w-10 h-10 ${tool.color}`} /></div>
        <h1 className="text-3xl font-bold mt-4">{tool.title}</h1>
        <p className="text-slate-500 mt-2">{tool.description}</p>
      </div>

      {!file && !processedFileUrl && (
        <div onDragOver={e => {e.preventDefault(); setIsDraggingOver(true);}} onDragLeave={() => setIsDraggingOver(false)} onDrop={handleDrop} className={`border-2 border-dashed rounded-xl p-12 text-center bg-[#F8FAFC] transition-colors max-w-4xl mx-auto ${isDraggingOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300'}`}>
            <input type="file" accept=".pdf" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            <p className="mt-2 text-sm text-slate-500">Drag & drop PDF file here</p>
            <button onClick={() => fileInputRef.current?.click()} className="mt-4 px-8 py-3 bg-indigo-500 text-white text-base font-semibold rounded-lg shadow-md hover:bg-indigo-600">Select PDF file</button>
        </div>
      )}
      {isLoading && <p className="text-center text-lg font-semibold">Loading PDF previews...</p>}
      
      {file && pages.length > 0 && !processedFileUrl && (
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-60 bg-slate-100 p-3 rounded-lg flex-shrink-0">
            <h3 className="font-bold text-lg mb-2">Pages</h3>
            <div className="space-y-2 max-h-96 lg:max-h-[calc(100vh-20rem)] overflow-y-auto">
              {pages.map((p, i) => (
                <div key={p.id} draggable onDragStart={e => onPageDragStart(e, p.id)} onDragOver={e => e.preventDefault()} onDrop={e => onPageDropReorder(e, p.id)} onClick={() => setActivePageIndex(i)} className={`relative group p-1 border-2 rounded-lg cursor-pointer transition-all ${activePageIndex === i ? 'border-indigo-500 bg-indigo-100' : 'border-transparent hover:bg-white'} ${draggedPageId === p.id ? 'opacity-50' : ''}`}>
                  <img src={p.imageUrl} alt={`Page ${p.originalIndex + 1}`} className="w-full rounded-md shadow-sm" />
                  <span className="absolute top-2 left-2 font-bold bg-slate-800 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{i + 1}</span>
                  <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); handleRotatePage(i); }} className="w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-sm hover:bg-blue-500">🔄</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeletePage(i); }} className="w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-500">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </aside>
          
          <main className="flex-grow flex flex-col gap-4">
            <div className="bg-slate-100 p-3 rounded-lg shadow-md flex flex-wrap items-center justify-center gap-4">
              <button onClick={() => setActiveTool('text')} className={`px-4 py-2 flex items-center gap-2 rounded-lg font-semibold text-sm ${activeTool === 'text' ? 'bg-indigo-500 text-white' : 'bg-white hover:bg-slate-200'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5L6 19M18 5l-5 14" /></svg>
                Add Text
              </button>
              <button onClick={() => imageInputRef.current?.click()} className={`px-4 py-2 flex items-center gap-2 rounded-lg font-semibold text-sm bg-white hover:bg-slate-200`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Add Image
              </button>
              <input type="file" accept="image/jpeg, image/png" onChange={handleImageUpload} ref={imageInputRef} className="hidden" />
              <button onClick={() => setActiveTool('shape')} className={`px-4 py-2 flex items-center gap-2 rounded-lg font-semibold text-sm ${activeTool === 'shape' ? 'bg-indigo-500 text-white' : 'bg-white hover:bg-slate-200'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7L9 18l-5-5" /></svg>
                Add Shape
              </button>
              <div className="border-l border-slate-300 h-8 mx-2"></div>
              <button onClick={handleSave} disabled={isProcessing} className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg shadow hover:bg-green-600 transition-colors">
                {isProcessing ? 'Saving...' : 'Save & Download'}
              </button>
            </div>
            <div className="bg-white p-2 rounded-lg shadow-inner overflow-auto flex-grow flex items-center justify-center">
              <div ref={canvasContainerRef} onClick={handleCanvasClick} className="relative shadow-lg" style={{ cursor: activeTool !== 'select' ? 'crosshair' : 'default' }}>
                <img src={pages[activePageIndex].imageUrl} alt="PDF Page" style={{ transform: `rotate(${pages[activePageIndex].rotation}deg)` }} className="max-w-full max-h-[70vh]"/>
                <div className="absolute inset-0">
                  {pages[activePageIndex].edits.map(obj => <div key={obj.id}>{renderObject(obj)}</div>)}
                </div>
              </div>
            </div>
          </main>

          <aside className="w-full lg:w-64 bg-slate-100 p-3 rounded-lg flex-shrink-0">
            <h3 className="font-bold text-lg mb-2">Properties</h3>
            {renderContextualEditor() || <p className="text-sm text-slate-500">Select an object on the page to edit its properties.</p>}
          </aside>
        </div>
      )}
      
      {processedFileUrl && (
          <div className="text-center p-8 bg-green-50 border border-green-200 rounded-xl max-w-2xl mx-auto">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-800 mt-4">Save Successful!</h2>
              <p className="mt-2 text-green-600">Your edited PDF has been saved and started downloading.</p>
              <a
                href={processedFileUrl}
                download={outputFilename}
                className="mt-6 inline-block px-8 py-3 bg-green-600 text-white font-bold text-base rounded-lg shadow-md hover:bg-green-700 transition-colors"
              >
                Download Again
              </a>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                  <button onClick={handleStartOver} className="px-8 py-3 bg-teal-500 text-white text-base font-semibold rounded-lg shadow-md hover:bg-teal-600 transition-colors">
                      Edit Another PDF
                  </button>
                  <button onClick={onGoBack} className="px-8 py-3 bg-slate-200 text-slate-700 text-base font-semibold rounded-lg shadow-md hover:bg-slate-300 transition-colors">
                      Back to Home
                  </button>
              </div>
          </div>
      )}

       {error && <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md max-w-4xl mx-auto">{error}</div>}
    </div>
  );
};

export default EditPdfPage;