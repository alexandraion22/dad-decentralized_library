import React from "react";
import { Link } from "react-router-dom";
import WalletConnect from "../App/WalletConnect";
import Button from "../App/Button";
import { useWalletStore } from "../../store/wallet";

type Props = {};

const Navbar = (props: Props) => {
  const { injectiveAddress } = useWalletStore();
  
  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-800 shadow-lg z-50">
      <div className="relative h-16 w-full">
        {/* Left side - navigation buttons (only shown when connected) */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          {injectiveAddress && (
            <div className="flex items-center gap-2">
              <Link to="/available-books">
                <Button variant="nav">Available Books</Button>
              </Link>
              <Link to="/borrowed-books">
                <Button variant="nav">Borrowed Books</Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Middle - title */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Link to="/">
            <h1 className="text-xl font-bold text-white whitespace-nowrap hover:text-green-200 transition-colors">Decentralized Library</h1>
          </Link>
        </div>
        
        {/* Right side - wallet connection */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 