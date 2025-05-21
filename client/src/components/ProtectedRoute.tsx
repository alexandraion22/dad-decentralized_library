import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useWalletStore } from "../store/wallet";

const ProtectedRoute = () => {
  const { injectiveAddress } = useWalletStore();
  
  // If not connected, redirect to the home page
  if (!injectiveAddress) {
    return <Navigate to="/" replace />;
  }
  
  // Otherwise, render the protected route
  return <Outlet />;
};

export default ProtectedRoute; 