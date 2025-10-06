import React, { useEffect } from 'react';
import type { Post } from '../types';

interface BlogPageProps {
  onGoBack: () => void;
  posts: Post[];
  isLoading: boolean;
  onSelectPost: (postId: string) => void;
}

const BlogPage: React.FC<BlogPageProps> = ({ onGoBack, posts, isLoading, onSelectPost }) => {
  useEffect(() => {
    document.title = 'PurePDF Blog | Tips & Tricks for PDF Management';

    const setMetaTag = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('description', 'Explore the PurePDF blog for tips, tricks, and updates on how to manage your PDF files effectively. Learn about merging, splitting, converting, and more.');
    setMetaTag('keywords', 'PDF tips, PDF tricks, document management, PDF productivity, PDF help, PurePDF blog');
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
      <div className="space-y-8">
        {posts.map((post) => (
          <div key={post.id} onClick={() => onSelectPost(post.id)} className="bg-[#F8FAFC] p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer">
            <h2 className="text-2xl font-bold text-slate-800">{post.title}</h2>
            <p className="text-slate-500 mt-2 line-clamp-3">{post.description}</p>
            <div className="mt-4 text-sm text-slate-400">
              <span>By {post.author}</span> &middot; <span>{post.date}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onGoBack} className="mb-8 flex items-center text-sm font-extrabold text-slate-600 hover:text-indigo-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Tools
      </button>

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">
          Our Blog
        </h1>
        <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
          Tips, tricks, and updates from the PurePDF team.
        </p>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default BlogPage;
