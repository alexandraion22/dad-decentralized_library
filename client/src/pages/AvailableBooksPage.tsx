import React, { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import { getAvailableBooks, BookWithId } from "../app/services/queries";
import Button from "../components/App/Button";
import { borrowBook } from "../app/services/contracts";

const AvailableBooksPage = () => {
  const [books, setBooks] = useState<BookWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [borrowingBook, setBorrowingBook] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const availableBooks = await getAvailableBooks();
        setBooks(availableBooks);
      } catch (error) {
        console.error("Error fetching available books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [successMessage]); // Refresh books when a successful borrow occurs

  const handleBorrowBook = async (bookId: string) => {
    try {
      setBorrowingBook(bookId);
      setError(null);
      setTxHash(null);
      
      const hash = await borrowBook(bookId);
      
      setSuccessMessage(`Book borrowed successfully!`);
      setTxHash(hash);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
        setTxHash(null);
      }, 5000);
    } catch (error) {
      console.error("Error borrowing book:", error);
      setError(`Failed to borrow book: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setBorrowingBook(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-green-200">Loading books...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Available Books</h1>
      
      {successMessage && (
        <div className="bg-green-900 border border-green-500 text-white p-4 rounded mb-6 mx-auto max-w-2xl">
          <p className="font-semibold mb-2">{successMessage}</p>
          {txHash && (
            <div className="mt-2">
              <p className="text-sm font-medium text-green-200">Transaction Hash:</p>
              <div className="bg-green-950 p-2 rounded mt-1 overflow-x-auto">
                <code className="text-xs text-green-300 break-all">{txHash}</code>
              </div>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="bg-red-900 border border-red-500 text-white p-4 rounded mb-6 mx-auto max-w-2xl">
          {error}
        </div>
      )}
      
      {books.length === 0 ? (
        <p className="text-center text-gray-400">No books currently available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((bookItem) => (
            <BookCard
              key={bookItem.id}
              title={bookItem.book.title}
              author={bookItem.book.author}
            >
              <div className="flex justify-center mt-2">
                <Button 
                  onClick={() => handleBorrowBook(bookItem.id)}
                  variant="nav"
                  disabled={borrowingBook === bookItem.id}
                >
                  {borrowingBook === bookItem.id ? "Borrowing..." : "Borrow Book"}
                </Button>
              </div>
            </BookCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableBooksPage; 
