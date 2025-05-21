import React, { useState } from "react";
import { addBook } from "../app/services/contracts";
import Button from "../components/App/Button";
import { useNavigate } from "react-router-dom";

const AddBookPage: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const openModal = () => {
    setIsModalOpen(true);
    setTitle("");
    setAuthor("");
    setUrl("");
    setError(null);
    setSuccessMessage(null);
    setTxHash(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleAddBook = async () => {
    // Basic validation
    if (!title.trim()) {
      setError("Please enter a book title");
      return;
    }
    if (!author.trim()) {
      setError("Please enter the author's name");
      return;
    }
    if (!url.trim()) {
      setError("Please enter a URL to access the book");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const hash = await addBook(title, author, url);
      
      setSuccessMessage("Book added successfully!");
      setTxHash(hash);
      
      // Reset form after successful submission
      setTitle("");
      setAuthor("");
      setUrl("");
      
      // Automatically close modal and navigate to available books after 3 seconds
      setTimeout(() => {
        closeModal();
        navigate("/available-books");
      }, 3000);
    } catch (err) {
      setError(`Failed to add book: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Add a New Book</h1>
        
        <div className="text-center mb-8">
          <p className="mb-6">
            Share your favorite books with the community by adding them to our decentralized library.
          </p>
          <Button onClick={openModal}>Add a New Book</Button>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md mx-4">
              <h2 className="text-2xl font-bold mb-6 text-green-200">Add a New Book</h2>
              
              {error && (
                <div className="bg-red-900 border border-red-500 text-white p-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              {successMessage && (
                <div className="bg-green-900 border border-green-500 text-white p-4 rounded mb-4">
                  <p className="font-semibold mb-2">{successMessage}</p>
                  {txHash && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-green-200">Transaction Hash:</p>
                      <div className="bg-green-950 p-2 rounded mt-1 overflow-x-auto">
                        <code className="text-xs text-green-300 break-all">{txHash}</code>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-green-200 mt-3">Redirecting to Available Books in 3 seconds...</p>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-green-200 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  disabled={isLoading || successMessage !== null}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-green-200 mb-2">Author</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  disabled={isLoading || successMessage !== null}
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-green-200 mb-2">URL</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  disabled={isLoading || successMessage !== null}
                  placeholder="https://..."
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBook}
                  className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  disabled={isLoading || successMessage !== null}
                >
                  {isLoading ? "Adding..." : "Add Book"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-green-200">How to Add a Book</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-300">
            <li>Click on the "Add a New Book" button above</li>
            <li>Enter the book title, author, and a URL where the book can be accessed</li>
            <li>Click "Add Book" to submit your book to the blockchain</li>
            <li>Wait for the transaction to be confirmed</li>
            <li>Your book will appear in the "Available Books" section once confirmed</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AddBookPage; 