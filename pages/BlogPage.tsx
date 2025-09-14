import React, { useState, useEffect } from 'react';
import { contentfulClient } from '../services/contentfulService';

// Define the Post type for type safety
interface Post {
  title: string;
  description: string;
  author: string;
  date: string;
}

interface BlogPageProps {
  onGoBack: () => void;
}

const BlogPage: React.FC<BlogPageProps> = ({ onGoBack }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await contentfulClient.getEntries({
          content_type: 'blogPost',
          order: ['-fields.date'],
        });

        const fetchedPosts = response.items.map((item: any) => ({
          title: item.fields.title,
          description: item.fields.description,
          author: item.fields.author,
          date: new Date(item.fields.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        }));

        setPosts(fetchedPosts as Post[]);
      } catch (err: any) {
        if (err.message && (err.message.includes('accessToken') || err.message.includes('space'))) {
            setError('Could not connect to Contentful. Please ensure your Space ID and Access Token are correctly configured as environment variables.');
        } else {
            setError(err.message || 'An unexpected error occurred while fetching posts.');
        }
        console.error("Error fetching blog posts from Contentful:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-16 text-slate-500">
          <p className="text-lg">Loading posts...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="mt-6 p-6 bg-red-100 border border-red-400 text-red-700 rounded-md text-left">
          <p className="font-bold text-lg">Could not load blog posts</p>
          <p className="mt-2">{error}</p>
        </div>
      );
    }
    
    if (posts.length === 0) {
      return (
        <div className="text-center py-16 text-slate-500">
          <p className="text-lg">No blog posts found.</p>
           <p className="text-sm">Make sure you have published posts in Contentful under the 'blogPost' content type.</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {posts.map((post, index) => (
          <div key={index} className="bg-[#F8FAFC] p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-slate-800">{post.title}</h2>
            <p className="text-slate-500 mt-2">{post.description}</p>
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
