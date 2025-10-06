import React, { useState, useEffect } from 'react';
import ToolCard from '../components/ToolCard';
import { TOOLS } from '../constants';
import type { Tool, ToolCategory, Post } from '../types';
import { updateMetaTags } from '../utils/seo';

interface HomePageProps {
  onSelectTool: (tool: Tool) => void;
  onGoToBlog: () => void;
  onSelectPost: (postId: string) => void;
  posts: Post[];
}

const CATEGORIES: (ToolCategory | 'All')[] = ['All', 'Organize PDF', 'Optimize PDF', 'Convert PDF', 'Edit PDF'];

const HomePage: React.FC<HomePageProps> = ({ onSelectTool, onGoToBlog, onSelectPost, posts }) => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'All'>('All');
  
  const blogPosts = posts.slice(0, 3); // Get latest 3

  useEffect(() => {
    const BASE_URL = window.location.origin;
    updateMetaTags({
      title: 'PurePDF | Free Online PDF Tools',
      description: 'Merge, split, compress, convert, rotate, and organize your PDF files with our suite of free, easy-to-use online tools. No login required, lifetime free.',
      keywords: 'PDF tools, merge PDF, split PDF, compress PDF, convert PDF, rotate PDF, organize PDF, image to PDF, PDF to JPG, free PDF editor',
      canonicalUrl: BASE_URL,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "PurePDF",
        "url": BASE_URL,
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${BASE_URL}?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      }
    });
  }, []);


  const filteredTools = selectedCategory === 'All'
    ? TOOLS
    : TOOLS.filter(tool => tool.category === selectedCategory);

  return (
    <div>
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
      
      {blogPosts.length > 0 && (
          <div className="mt-20">
              <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">From Our Blog</h2>
                  <p className="mt-3 text-lg text-slate-600 max-w-xl mx-auto">
                      Discover tips, tutorials, and news about PDF management.
                  </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {blogPosts.map(post => (
                      <div key={post.id} onClick={() => onSelectPost(post.id)} className="bg-[#F8FAFC] p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col cursor-pointer">
                          <h3 className="text-xl font-bold text-slate-800">{post.title}</h3>
                          <p className="text-slate-500 mt-3 flex-grow line-clamp-3">{post.description}</p>
                          <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
                              <span>{post.date}</span>
                              <span className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                                Read More &rarr;
                              </span>
                          </div>
                      </div>
                  ))}
              </div>
               <div className="text-center mt-10">
                  <button onClick={onGoToBlog} className="px-8 py-3 bg-indigo-500 text-white text-base font-semibold rounded-lg shadow-md hover:bg-indigo-600 transition-colors">
                      View All Posts
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default HomePage;