import React, { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import { getMyBorrowedBooks, BookWithId } from "../app/services/queries";

const BorrowedBooksPage = () => {
  const [books, setBooks] = useState<BookWithId[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const handleBookClick = (bookId: string) => {
    console.log(`Book ${bookId} clicked`);
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
      <h1 className="text-2xl font-bold mb-6 text-center">Borrowed Books</h1>
      
      {books.length === 0 ? (
        <p className="text-center text-gray-400">You haven't borrowed any books yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((bookItem) => (
            <BookCard
              key={bookItem.id}
              title={bookItem.book.title}
              author={bookItem.book.author}
              url={bookItem.book.url}
              onClick={() => handleBookClick(bookItem.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BorrowedBooksPage;
