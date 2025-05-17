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

    set({
      ethereumAddress: address,
      injectiveAddress: getInjectiveAddress(address),
    });
  },
}));
