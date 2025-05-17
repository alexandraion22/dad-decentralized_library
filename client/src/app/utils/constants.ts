import { Network, getNetworkEndpoints } from "@injectivelabs/networks";
import { ChainId, EthereumChainId } from "@injectivelabs/ts-types";

export const IS_PRODUCTION: boolean = import.meta.env.PROD;
export const IS_DEVELOPMENT = !IS_PRODUCTION;

const env = {
  VITE_ALCHEMY_SEPOLIA_KEY: import.meta.env.VITE_ALCHEMY_SEPOLIA_KEY as string,
  VITE_NETWORK: import.meta.env.VITE_NETWORK as string,
  VITE_ETHEREUM_CHAIN_ID: import.meta.env.VITE_ETHEREUM_CHAIN_ID as string,
  VITE_CHAIN_ID: import.meta.env.VITE_CHAIN_ID as string,
};

export const ALCHEMY_SEPOLIA_KEY = env.VITE_ALCHEMY_SEPOLIA_KEY;

export const alchemyRpcEndpoint = `https://eth-sepolia.alchemyapi.io/v2/${ALCHEMY_SEPOLIA_KEY}`;
export const alchemyWsRpcEndpoint = `wss://eth-sepolia.ws.alchemyapi.io/v2/${ALCHEMY_SEPOLIA_KEY}`;

export const ETHEREUM_CHAIN_ID = (env.VITE_ETHEREUM_CHAIN_ID ||
  EthereumChainId.Sepolia) as EthereumChainId;
export const CHAIN_ID = (env.VITE_CHAIN_ID || ChainId.Testnet) as ChainId;

export const NETWORK: Network =
  (env.VITE_NETWORK as Network) || Network.Testnet;
export const ENDPOINTS = getNetworkEndpoints(NETWORK)

export const IS_TESTNET: boolean = [
  Network.Testnet,
  Network.TestnetK8s,
].includes(NETWORK);
