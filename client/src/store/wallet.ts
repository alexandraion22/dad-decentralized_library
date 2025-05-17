import { create } from "zustand";
import { getAddresses } from "../app/services/wallet";
import { getInjectiveAddress } from "@injectivelabs/sdk-ts";

type WalletState = {
  injectiveAddress: string;
  ethereumAddress: string;
  connectWallet: () => Promise<void>;
};

export const useWalletStore = create<WalletState>()((set, get) => ({
  injectiveAddress: "",
  ethereumAddress: "",
  connectWallet: async () => {
    if (get().injectiveAddress) {
      set({ ethereumAddress: "", injectiveAddress: "" });
      return;
    }

    const [address] = await getAddresses();

    let injectiveAddress;
    if (address.startsWith("inj")) {
      injectiveAddress = address;
    } else {
      injectiveAddress = getInjectiveAddress(address);
    }

    set({
      ethereumAddress: address,
      injectiveAddress: injectiveAddress,
    });
  },
}));
