import React, { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import { getMyBorrowedBooks, BookWithId } from "../app/services/queries";
import Button from "../components/App/Button";
import { returnBook } from "../app/services/contracts";

const BorrowedBooksPage = () => {
  const [books, setBooks] = useState<BookWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [returningBook, setReturningBook] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const borrowedBooks = await getMyBorrowedBooks();
        setBooks(borrowedBooks);
      } catch (error) {
        console.error("Error fetching borrowed books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [successMessage]); // Refresh books when a successful return occurs

  const handleReturnBook = async (bookId: string) => {
    try {
      setReturningBook(bookId);
      setError(null);
      setTxHash(null);
      
      const hash = await returnBook(bookId);
      
      setSuccessMessage(`Book returned successfully!`);
      setTxHash(hash);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
        setTxHash(null);
      }, 5000);
    } catch (error) {
      console.error("Error returning book:", error);
      setError(`Failed to return book: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setReturningBook(null);
    }
  };

  const handleViewBook = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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
      <h1 className="text-2xl font-bold mb-6 text-center">Borrowed Books</h1>
      
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
        <p className="text-center text-gray-400">You haven't borrowed any books yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((bookItem) => (
            <BookCard
              key={bookItem.id}
              title={bookItem.book.title}
              author={bookItem.book.author}
            >
              <div className="flex justify-center gap-4 mt-2">
                {bookItem.book.url && (
                  <Button 
                    onClick={() => handleViewBook(bookItem.book.url || '')}
                    variant="nav"
                  >
                    View Book
                  </Button>
                )}
                <Button 
                  onClick={() => handleReturnBook(bookItem.id)}
                  variant="nav"
                  disabled={returningBook === bookItem.id}
                >
                  {returningBook === bookItem.id ? "Returning..." : "Return Book"}
                </Button>
              </div>
            </BookCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default BorrowedBooksPage;
