import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import AvailableBooksPage from "./pages/AvailableBooksPage";
import BorrowedBooksPage from "./pages/BorrowedBooksPage";
import AddBookPage from "./pages/AddBookPage";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <BrowserRouter>
      <div className="bg-gray-900 text-white min-h-screen">
        <Navbar />
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/available-books" element={<AvailableBooksPage />} />
              <Route path="/borrowed-books" element={<BorrowedBooksPage />} />
              <Route path="/add-book" element={<AddBookPage />} />
            </Route>
            
            {/* Catch-all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
