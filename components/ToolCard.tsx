import React from 'react';
import type { Tool } from '../types';

interface ToolCardProps {
  tool: Tool;
  onSelect: (tool: Tool) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  const { title, description, icon: Icon, color, disabled } = tool;

  const cardClasses = `
    relative group bg-[#F8FAFC] p-6 rounded-xl shadow-md
    hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  return (
    <div className={cardClasses} onClick={() => onSelect(tool)}>
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg bg-white`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
      </div>
      {disabled && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
          SOON
        </div>
      )}
    </div>
  );
};

export default ToolCard;