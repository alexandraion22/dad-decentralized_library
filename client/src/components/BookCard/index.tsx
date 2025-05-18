import React from "react";

export type BookCardProps = {
  title: string;
  author: string;
  url?: string;
  onClick?: () => void;
};

const BookCard = ({ title, author, url, onClick }: BookCardProps) => {
  return (
    <div 
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-green-200/20 
                 hover:translate-y-[-5px] transition-all duration-300 cursor-pointer
                 border border-gray-700 hover:border-green-200/50 h-full"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="h-32 flex items-center justify-center mb-4 bg-gray-700 rounded">
          <span className="text-4xl text-green-200/40">📚</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2 truncate">{title}</h3>
        <p className="text-gray-400 truncate">by {author}</p>
        
        {url && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-200 hover:text-green-100 text-sm underline"
              onClick={(e) => e.stopPropagation()}
            >
              View Book
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCard; 