import React from "react";
import BookCard from "../components/BookCard";

// Mock data - will be replaced with actual API calls later
const mockAvailableBooks = [
  { id: 1, title: "The Blockchain Revolution", author: "Don Tapscott" },
  { id: 2, title: "Decentralized Applications", author: "Siraj Raval" },
  { id: 3, title: "Mastering Ethereum", author: "Andreas M. Antonopoulos" },
];

const AvailableBooksPage = () => {
  // Placeholder for future API call to fetch available books
  // const fetchAvailableBooks = async () => { ... }

  const handleBookClick = (bookId: number) => {
    console.log(`Book ${bookId} clicked`);
    // This will be implemented in future tasks
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Available Books</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAvailableBooks.map((book) => (
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

export default AvailableBooksPage; 