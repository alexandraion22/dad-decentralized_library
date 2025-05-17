import React from "react";
import Button from "./Button";
import { useWalletStore } from "../../store/wallet";

type Props = {};

const WalletConnect = (props: Props) => {
  const { injectiveAddress, connectWallet } = useWalletStore();

  function handleConnectWallet() {
    connectWallet().catch((error) => {
      console.error("Wallet connection error:", error);
      alert(`Error connecting wallet: ${error.message || "Unknown error"}`);
    });
  }

  // Use a style object for the button to make it wider
  const buttonStyle = {
    minWidth: '240px',
    display: 'inline-block',
    textAlign: 'center' as const, // TypeScript needs this type assertion
    whiteSpace: 'nowrap' as const
  };

  return (
    <Button variant="default" onClick={handleConnectWallet} style={buttonStyle}>
      {injectiveAddress ? injectiveAddress : "Connect Wallet"}
    </Button>
  );
};

export default WalletConnect;
