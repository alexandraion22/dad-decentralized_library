import { useWalletStore } from "../../store/wallet";
import { CONTRACT_ADDRESS } from "../utils/constants";
import { ChainGrpcWasmApi, fromBase64, toBase64 } from "@injectivelabs/sdk-ts";
import { ENDPOINTS } from "../utils/constants";

// Define types for the responses
export interface Book {
  title: string;
  author: string;
  url: string;
  owner: string;
}

export interface BookWithId {
  id: string;
  book: Book;
}

// Initialize the Wasm API client 
const wasmClient = new ChainGrpcWasmApi(ENDPOINTS.grpc);

const decodeResponseData = (data: Uint8Array): any => {
  const textDecoder = new TextDecoder('utf-8');
  const jsonStr = textDecoder.decode(data);
  
  return JSON.parse(jsonStr);
};

/**
 * Get a specific book by token ID
 */
export const getBook = async (tokenId: string): Promise<Book | null> => {
  try {
    const queryMsg = { get_book: { token_id: tokenId } };
    const base64queryMsg = toBase64(queryMsg);
    
    const response = await wasmClient.fetchSmartContractState(CONTRACT_ADDRESS, base64queryMsg);
    
    return decodeResponseData(response.data) as Book;
  } catch (error) {
    console.error("Error fetching book:", error);
    return null;
  }
};

/**
 * Get all books borrowed by the current user
 * This function requires the user to be connected with their wallet
 */
export const getMyBorrowedBooks = async (): Promise<BookWithId[]> => {
  const { injectiveAddress } = useWalletStore.getState();
  
  if (!injectiveAddress) {
    return [];
  }
  
  try {
    const queryMsg = { get_my_borrowed_books: { borrower: injectiveAddress } };
    const base64queryMsg = toBase64(queryMsg);
    
    const response = await wasmClient.fetchSmartContractState(CONTRACT_ADDRESS, base64queryMsg);
    
    return (decodeResponseData(response.data) as [string, Book][]).map(([id, book]) => ({
      id,
      book
    }));
  } catch (error) {
    console.error("Error fetching borrowed books:", error);
    return [];
  }
};

/**
 * Get all books that are available for borrowing
 */
export const getAvailableBooks = async (): Promise<BookWithId[]> => {
  try {
    const queryMsg = { get_available_books: {} };
    const base64queryMsg = toBase64(queryMsg);
    
    const response = await wasmClient.fetchSmartContractState(CONTRACT_ADDRESS, base64queryMsg);
    
    return (decodeResponseData(response.data) as [string, Book][]).map(([id, book]) => ({
      id,
      book
    }));
  } catch (error) {
    console.error("Error fetching available books:", error);
    return [];
  }
}; 
