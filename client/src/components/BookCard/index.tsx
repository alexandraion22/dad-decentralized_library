import React, { ReactNode } from "react";

export type BookCardProps = {
  title: string;
  author: string;
  children?: ReactNode;
};

const BookCard = ({ title, author, children }: BookCardProps) => {
  return (
    <div 
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-green-200/20 
                 hover:translate-y-[-5px] transition-all duration-300
                 border border-gray-700 hover:border-green-200/50 h-full"
    >
      <div className="p-6 flex flex-col h-full">
        <div className="h-32 flex items-center justify-center mb-4 bg-gray-700 rounded">
          <span className="text-4xl text-green-200/40">📚</span>
        </div>
        
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-white mb-2 truncate">{title}</h3>
          <p className="text-gray-400 truncate">by {author}</p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BookCard; 
