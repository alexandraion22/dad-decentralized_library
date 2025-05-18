import React from "react";

const HomePage = () => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Logo/Header section */}
          <div className="text-center mb-16">
            <div className="mb-6">
              <div className="inline-block p-2 border-4 border-green-200 rounded-lg">
                <h1 className="text-6xl font-bold tracking-tight mb-2">
                  <span className="text-white">D</span>
                  <span className="text-green-200">Library</span>
                </h1>
                <p className="text-xl text-gray-400 italic">Knowledge on the blockchain</p>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-green-200">What is Decentralized Library?</h2>
              <p className="text-gray-300 mb-4">
                The Decentralized Library is a revolutionary platform powered by Injective Protocol, 
                allowing users to borrow and share books in a fully decentralized manner.
              </p>
              <p className="text-gray-300">
                With no central authority, your reading history remains private, and the wisdom of books 
                becomes accessible to everyone.
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-green-200">How to Use</h2>
              <ol className="list-decimal list-inside text-gray-300 space-y-2">
                <li>Connect your Injective wallet</li>
                <li>Browse our collection of available books</li>
                <li>Borrow books with a simple transaction</li>
                <li>Return books when finished to make them available for others</li>
                <li>Enjoy reading without intermediaries!</li>
              </ol>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 mb-8">
            <p>Open-source decentralized application built on Injective Protocol</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 