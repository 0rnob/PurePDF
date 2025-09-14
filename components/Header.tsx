import React from 'react';

interface HeaderProps {
  onGoHome: () => void;
  onGoToBlog: () => void;
}

const Header: React.FC<HeaderProps> = ({ onGoHome, onGoToBlog }) => {
  return (
    <header className="bg-[#F8FAFC]/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <button onClick={onGoHome} className="flex items-center space-x-3 cursor-pointer">
            <svg className="h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-5.494-5.494H17.494" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
            </svg>
            <span className="text-2xl font-bold text-slate-800">PurePDF</span>
          </button>
          <nav>
            <button
              onClick={onGoToBlog}
              className="px-4 py-2 text-lg font-bold text-slate-600 rounded-lg hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
            >
              Blog
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;