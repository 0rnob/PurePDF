import React, { useState, useMemo } from 'react';
import type { Post } from '../types';
import { FacebookIcon, TwitterIcon, LinkedInIcon } from '../components/icons';

interface BlogPostPageProps {
  post: Post;
  allPosts: Post[];
  onGoBack: () => void;
  onSelectPost: (postId: string) => void;
}

const BlogPostPage: React.FC<BlogPostPageProps> = ({ post, allPosts, onGoBack, onSelectPost }) => {
  const [showShareOptions, setShowShareOptions] = useState(false);

  const relatedPosts = useMemo(() => {
    if (!post.tags || post.tags.length === 0) {
        return [];
    }
    return allPosts
        .filter(p => p.id !== post.id) 
        .map(p => {
            const commonTags = p.tags.filter(tag => post.tags.includes(tag));
            return { post: p, score: commonTags.length };
        })
        .filter(p => p.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3) 
        .map(p => p.post);
  }, [post, allPosts]);

  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: post.description.substring(0, 120) + '...',
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      setShowShareOptions(prev => !prev);
    }
  };

  const encodedUrl = encodeURIComponent(window.location.href);
  const encodedTitle = encodeURIComponent(post.title);
  const encodedSummary = encodeURIComponent(post.description.substring(0, 120) + '...');

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedSummary}`
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onGoBack} className="mb-8 flex items-center text-sm font-extrabold text-slate-600 hover:text-indigo-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Blog
      </button>

      <article className="bg-[#F8FAFC] p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="text-base text-slate-500">
              <span>By {post.author}</span> &middot; <span>{post.date}</span>
            </div>
            <div className="relative">
                <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share
                </button>
                {showShareOptions && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl z-10 p-2 border border-slate-200">
                        <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-100">
                          <FacebookIcon className="w-5 h-5 text-slate-500" />
                          <span>Share on Facebook</span>
                        </a>
                        <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-100">
                          <TwitterIcon className="w-5 h-5 text-slate-500" />
                          <span>Share on Twitter/X</span>
                        </a>
                        <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-100">
                          <LinkedInIcon className="w-5 h-5 text-slate-500" />
                          <span>Share on LinkedIn</span>
                        </a>
                    </div>
                )}
            </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="prose max-w-none text-slate-700 leading-relaxed">
              {post.description.split('\n\n').map((paragraph, index) => {
                const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                return (
                  <p key={index}>
                    {parts.map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i}>{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    })}
                  </p>
                );
              })}
            </div>
        </div>
      </article>

      {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6 text-center">You Might Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(relatedPost => (
                <div 
                  key={relatedPost.id} 
                  onClick={() => onSelectPost(relatedPost.id)} 
                  className="bg-[#F8FAFC] p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col"
                >
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-3 flex-grow">{relatedPost.title}</h3>
                  <div className="mt-4 pt-4 border-t border-slate-200 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                      Read More &rarr;
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      <style>{`
        .prose p { margin-bottom: 1em; }
        .prose strong { font-weight: 700; color: #1e293b; }
      `}</style>
    </div>
  );
};

export default BlogPostPage;