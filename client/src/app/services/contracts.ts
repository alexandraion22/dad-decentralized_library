import { createTxRawFromSigResponse, BaseAccount, ChainRestAuthApi, ChainRestTendermintApi, createTransaction, MsgExecuteContractCompat } from "@injectivelabs/sdk-ts";
import { CHAIN_ID, CONTRACT_ADDRESS, ENDPOINTS } from "../utils/constants";
import { useWalletStore } from "../../store/wallet";
import { walletStrategy } from "./wallet";
import { Wallet } from "@injectivelabs/wallet-base";
import { BigNumberInBase } from "@injectivelabs/utils";
import { getStdFee, DEFAULT_BLOCK_TIMEOUT_HEIGHT } from "@injectivelabs/utils";


const chainRestAuthApi = new ChainRestAuthApi(ENDPOINTS.rest);
const chainRestTendermintApi = new ChainRestTendermintApi(ENDPOINTS.rest);

/**
 * Execute a contract transaction with provided message
 */
const executeContractTx = async (contractMsg: any): Promise<string> => {
  const { injectiveAddress } = useWalletStore.getState();
  
  if (!injectiveAddress) {
    throw new Error("Wallet not connected");
  }
  
  try {
    walletStrategy.setWallet(Wallet.Keplr);

    const accountDetailsResponse = await chainRestAuthApi.fetchAccount(injectiveAddress)
    const baseAccount = BaseAccount.fromRestApi(accountDetailsResponse)

    const latestBlock = await chainRestTendermintApi.fetchLatestBlock();
    const latestHeight = latestBlock.header.height;
    const timeoutHeight = new BigNumberInBase(latestHeight).plus(DEFAULT_BLOCK_TIMEOUT_HEIGHT);
    
    const msg = MsgExecuteContractCompat.fromJSON({
        sender: injectiveAddress,
        contractAddress: CONTRACT_ADDRESS,
        msg: contractMsg
    })

    const pubKey = await walletStrategy.getPubKey();

    const { txRaw } = createTransaction({
        pubKey,
        chainId: CHAIN_ID,
        fee: getStdFee({}),
        message: msg,
        sequence: baseAccount.sequence,
        timeoutHeight: timeoutHeight.toNumber(),
        accountNumber: baseAccount.accountNumber,
    });

    const signResponse = await walletStrategy.signCosmosTransaction({
        txRaw,
        accountNumber: baseAccount.accountNumber,
        chainId: CHAIN_ID,
        address: injectiveAddress
    })

    const signedTx = createTxRawFromSigResponse(signResponse);

    const sendResponse = await walletStrategy.sendTransaction(
        signedTx,
        {
            address: injectiveAddress,
            chainId: CHAIN_ID,
            endpoints: ENDPOINTS
        }
    )

    return sendResponse.txHash;
  } catch (error) {
    console.error("Error executing contract transaction:", error);
    throw error;
  }
};

/**
 * Add a new book to the decentralized library
 * @param title - The title of the book
 * @param author - The author of the book
 * @param url - The URL where the book can be accessed
 * @returns A promise that resolves when the transaction is complete
 */
export const addBook = async (
  title: string,
  author: string,
  url: string
): Promise<string> => {
  const { injectiveAddress } = useWalletStore.getState();
  const token_id = `book_${Date.now()}`;
  
  const contractMsg = {
    add_book: {
      token_id,
      title,
      author,
      url: url,
      owner: injectiveAddress
    }
  };
  
  return executeContractTx(contractMsg);
};

/**
 * Borrow a book from the decentralized library
 * @param tokenId - The ID of the book to borrow
 * @returns A promise that resolves when the transaction is complete
 */
export const borrowBook = async (tokenId: string): Promise<string> => {
  const { injectiveAddress } = useWalletStore.getState();
  
  const contractMsg = {
    borrow_book: {
      token_id: tokenId,
      borrower: injectiveAddress
    }
  };
  
  return executeContractTx(contractMsg);
};

/**
 * Return a borrowed book to the decentralized library
 * @param tokenId - The ID of the book to return
 * @returns A promise that resolves when the transaction is complete
 */
export const returnBook = async (tokenId: string): Promise<string> => {
  const contractMsg = {
    return_book: {
      token_id: tokenId
    }
  };
  
  return executeContractTx(contractMsg);
}; 
