import React from "react";
import BookCard from "../components/BookCard";

// Mock data - will be replaced with actual API calls later
const mockBorrowedBooks = [
  { id: 4, title: "Token Economy", author: "Shermin Voshmgir" },
  { id: 5, title: "The Infinite Machine", author: "Camila Russo" },
];

const BorrowedBooksPage = () => {
  // Placeholder for future API call to fetch borrowed books
  // const fetchBorrowedBooks = async () => { ... }

  const handleBookClick = (bookId: number) => {
    console.log(`Book ${bookId} clicked`);
    // This will be implemented in future tasks
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Borrowed Books</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockBorrowedBooks.map((book) => (
          <BookCard
            key={book.id}
            title={book.title}
            author={book.author}
            onClick={() => handleBookClick(book.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default BorrowedBooksPage; 