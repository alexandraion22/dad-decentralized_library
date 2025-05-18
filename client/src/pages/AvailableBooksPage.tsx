import React, { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import { getAvailableBooks, BookWithId } from "../app/services/queries";
import Button from "../components/App/Button";

const AvailableBooksPage = () => {
  const [books, setBooks] = useState<BookWithId[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const handleBorrowBook = (bookId: string) => {
    console.log(`Book ${bookId} clicked - would borrow this book`);
    // This will be implemented in future tasks
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
                >
                  Borrow Book
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
