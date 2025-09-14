import React, { useState, useEffect } from 'react';
import ToolCard from '../components/ToolCard';
import { TOOLS } from '../constants';
import type { Tool, ToolCategory } from '../types';

interface HomePageProps {
  onSelectTool: (tool: Tool) => void;
}

const CATEGORIES: (ToolCategory | 'All')[] = ['All', 'Organize PDF', 'Optimize PDF', 'Convert PDF', 'Edit PDF'];

const HomePage: React.FC<HomePageProps> = ({ onSelectTool }) => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'All'>('All');

  useEffect(() => {
    document.title = 'PurePDF | Free Online PDF Tools';

    const setMetaTag = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('description', 'Merge, split, compress, convert, rotate, and organize your PDF files with our suite of free, easy-to-use online tools. No login required, lifetime free.');
    setMetaTag('keywords', 'PDF tools, merge PDF, split PDF, compress PDF, convert PDF, rotate PDF, organize PDF, image to PDF, PDF to JPG, free PDF editor');
  }, []);


  const filteredTools = selectedCategory === 'All'
    ? TOOLS
    : TOOLS.filter(tool => tool.category === selectedCategory);

  return (
    <div className="text-center">
      <div className="flex items-center justify-center flex-wrap gap-3 mb-4">
        <span className="inline-flex items-center gap-x-2 bg-indigo-100 text-indigo-800 text-sm font-semibold px-4 py-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944A12.02 12.02 0 0012 22a12.02 12.02 0 009-1.056c.343-.332.65-.685.933-1.056a11.955 11.955 0 01-8.317-15.908z" />
            </svg>
            No login required
        </span>
        <span className="inline-flex items-center gap-x-2 bg-indigo-100 text-indigo-800 text-sm font-semibold px-4 py-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            Lifetime free access.
        </span>
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">
        Every tool you need to work with PDFs
      </h1>
      <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
        Merge, split, compress, convert, rotate, and more. Get more done with our powerful and easy-to-use PDF tools, all in one place.
      </p>

      <div className="my-8 flex justify-center flex-wrap gap-2 md:gap-3">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 ${
              selectedCategory === category
                ? 'bg-slate-800 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
            aria-pressed={selectedCategory === category}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        {filteredTools.length > 0 ? (
          filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
          ))
        ) : (
          <div className="col-span-full text-center py-16 px-6 text-slate-500 bg-white rounded-xl shadow-md">
            <p className="text-xl font-semibold text-slate-700">Coming Soon!</p>
            <p className="mt-2 max-w-md mx-auto">There are no tools in the '{selectedCategory}' category yet, but we're working on adding more powerful features. Stay tuned!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;