import { WalletStrategy } from "@injectivelabs/wallet-strategy";
import { Web3Exception } from "@injectivelabs/exceptions";
import {
  CHAIN_ID,
  ETHEREUM_CHAIN_ID,
  alchemyRpcEndpoint,
} from "../utils/constants";

export const walletStrategy = new WalletStrategy({
  chainId: CHAIN_ID,
  ethereumOptions: {
    ethereumChainId: ETHEREUM_CHAIN_ID,
    rpcUrl: alchemyRpcEndpoint,
  },
  strategies: {}
});

export const getAddresses = async (): Promise<string[]> => {
  const addresses = await walletStrategy.getAddresses();

  if (addresses.length === 0) {
    throw new Web3Exception(
      new Error("There are no addresses linked in this wallet.")
    );
  }

  return addresses;
};
