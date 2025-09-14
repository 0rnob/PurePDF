import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import MergePdfPage from './pages/MergePdfPage';
import SplitPdfPage from './pages/SplitPdfPage';
import RotatePdfPage from './pages/RotatePdfPage';
import ImageToPdfPage from './pages/ImageToPdfPage';
import AddPageNumbersPage from './pages/AddPageNumbersPage';
import OrganizePdfPage from './pages/OrganizePdfPage';
import PdfToJpgPage from './pages/PdfToJpgPage';
import AddWatermarkPage from './pages/AddWatermarkPage';
import CropPdfPage from './pages/CropPdfPage';
import BlogPage from './pages/BlogPage';
import Header from './components/Header';
import Footer from './components/Footer';
import type { Tool } from './types';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'tool' | 'blog'>('home');

  const handleSelectTool = (tool: Tool) => {
    if (!tool.disabled) {
      setActiveTool(tool);
      setCurrentPage('tool');
    }
  };

  const handleGoHome = () => {
    setActiveTool(null);
    setCurrentPage('home');
  };

  const handleGoToBlog = () => {
    setActiveTool(null);
    setCurrentPage('blog');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'tool':
        if (!activeTool) return <HomePage onSelectTool={handleSelectTool} />;
        switch (activeTool.id) {
          case 'merge-pdf':
            return <MergePdfPage tool={activeTool} onGoBack={handleGoHome} />;
          case 'split-pdf':
            return <SplitPdfPage tool={activeTool} onGoBack={handleGoHome} />;
          case 'rotate-pdf':
            return <RotatePdfPage tool={activeTool} onGoBack={handleGoHome} />;
          case 'image-to-pdf':
            return <ImageToPdfPage tool={activeTool} onGoBack={handleGoHome} />;
          case 'add-page-numbers':
            return <AddPageNumbersPage tool={activeTool} onGoBack={handleGoHome} />;
          case 'organize-pdf':
            return <OrganizePdfPage tool={activeTool} onGoBack={handleGoHome} />;
          case 'pdf-to-jpg':
             return <PdfToJpgPage tool={activeTool} onGoBack={handleGoHome} />;
          case 'add-watermark':
            return <AddWatermarkPage tool={activeTool} onGoBack={handleGoHome} />;
          case 'crop-pdf':
            return <CropPdfPage tool={activeTool} onGoBack={handleGoHome} />;
          default:
            return <HomePage onSelectTool={handleSelectTool} />;
        }
      case 'blog':
        return <BlogPage onGoBack={handleGoHome} />;
      case 'home':
      default:
        return <HomePage onSelectTool={handleSelectTool} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-800">
      <Header onGoHome={handleGoHome} onGoToBlog={handleGoToBlog} />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

export default App;