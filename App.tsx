import React, { useState, useEffect } from 'react';
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
import UnlockPdfPage from './pages/UnlockPdfPage';
import CompressPdfPage from './pages/CompressPdfPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import Header from './components/Header';
import Footer from './components/Footer';
import type { Tool, Post } from './types';
import { getBlogPosts } from './services/contentfulService';


const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'tool' | 'blog' | 'blog-post'>('home');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const allPosts = await getBlogPosts();
        setPosts(allPosts);
      } catch (error) {
        console.error("Could not fetch blog posts:", error);
      } finally {
        setPostsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleSelectTool = (tool: Tool) => {
    if (!tool.disabled) {
      setActiveTool(tool);
      setCurrentPage('tool');
    }
  };

  const handleGoHome = () => {
    setActiveTool(null);
    setSelectedPostId(null);
    setCurrentPage('home');
  };

  const handleGoToBlog = () => {
    setActiveTool(null);
    setSelectedPostId(null);
    setCurrentPage('blog');
  };

  const handleSelectPost = (postId: string) => {
    setSelectedPostId(postId);
    setCurrentPage('blog-post');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'tool':
        if (!activeTool) return <HomePage posts={posts} onSelectTool={handleSelectTool} onGoToBlog={handleGoToBlog} onSelectPost={handleSelectPost} />;
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
          case 'unlock-pdf':
            return <UnlockPdfPage tool={activeTool} onGoBack={handleGoHome} />;
          case 'compress-pdf':
            return <CompressPdfPage tool={activeTool} onGoBack={handleGoHome} />;
          default:
            return <HomePage posts={posts} onSelectTool={handleSelectTool} onGoToBlog={handleGoToBlog} onSelectPost={handleSelectPost} />;
        }
      case 'blog':
        return <BlogPage onGoBack={handleGoHome} posts={posts} isLoading={postsLoading} onSelectPost={handleSelectPost} />;
      case 'blog-post':
        const selectedPost = posts.find(p => p.id === selectedPostId);
        if (!selectedPost) {
          // If post not found or loading, redirect to blog list
          return <BlogPage onGoBack={handleGoHome} posts={posts} isLoading={postsLoading} onSelectPost={handleSelectPost} />;
        }
        return <BlogPostPage post={selectedPost} onGoBack={handleGoToBlog} />;
      case 'home':
      default:
        return <HomePage posts={posts} onSelectTool={handleSelectTool} onGoToBlog={handleGoToBlog} onSelectPost={handleSelectPost} />;
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
