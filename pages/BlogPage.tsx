import React, { useEffect } from 'react';
import type { Post } from '../types';
import { updateMetaTags } from '../utils/seo';

interface BlogPageProps {
  onGoBack: () => void;
  posts: Post[];
  isLoading: boolean;
  onSelectPost: (postId: string) => void;
}

const BlogPage: React.FC<BlogPageProps> = ({ onGoBack, posts, isLoading, onSelectPost }) => {
  useEffect(() => {
    const pageUrl = `${window.location.origin}/blog`;
    updateMetaTags({
        title: 'PurePDF Blog | Tips & Tricks for PDF Management',
        description: 'Explore the PurePDF blog for tips, tricks, and updates on how to manage your PDF files effectively. Learn about merging, splitting, converting, and more.',
        keywords: 'PDF tips, PDF tricks, document management, PDF productivity, PDF help, PurePDF blog',
        canonicalUrl: pageUrl,
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "PurePDF Blog",
            "url": pageUrl,
            "description": "Tips, tricks, and updates from the PurePDF team on how to manage your PDF files effectively.",
        }
    });
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-16 text-slate-500">
          <p className="text-lg">Loading posts...</p>
        </div>
      );
    }
    
    if (posts.length === 0) {
      return (
        <div className="text-center py-16 text-slate-500">
          <p className="text-lg">No blog posts found.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <div key={post.id} onClick={() => onSelectPost(post.id)} className="bg-[#F8FAFC] p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col cursor-pointer">
            <h3 className="text-xl font-bold text-slate-800 line-clamp-3 flex-grow">{post.title}</h3>
            <p className="text-slate-500 mt-3 flex-grow line-clamp-4">{post.description}</p>
            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
              <span>{post.date}</span>
              <span className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                Read More &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <button onClick={onGoBack} className="mb-6 flex items-center text-sm font-extrabold text-slate-600 hover:text-indigo-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Home
      </button>

      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">
          Our Blog
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Tips, tricks, and updates from the PurePDF team on how to manage your PDF files effectively.
        </p>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default BlogPage;
