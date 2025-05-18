# Decentralized Library - Client Application

This is the frontend application for the Decentralized Library project built on Injective Protocol. This client provides a user interface for interacting with the Decentralized Library smart contract.

## Project Structure

The application follows a modular structure:

```
client/
├── public/              # Static assets
├── src/
│   ├── app/             # Application core functionality
│   │   ├── services/    # Services for API interaction
│   │   └── utils/       # Utility functions and constants
│   │   
│   ├── components/      # Reusable UI components
│   │   ├── App/         # Core application components
│   │   ├── BookCard/    # Book display components
│   │   └── Navbar/      # Navigation components
│   ├── pages/           # Page components
│   ├── store/           # State management (Zustand)
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
└── package.json         # Dependencies and scripts
```

### Key Components

- **Navigation**: Top bar with "Decentralized Library" title and navigation links
- **Wallet Connection**: Integration with Injective wallets (e.g., Keplr)
- **BookCard**: Reusable component for displaying book information with action buttons
- **Transaction Feedback**: Clear success/error messages with transaction hash display
- **Page Structure**:
  - **Home**: Main landing page
  - **Available Books**: Shows all books available for borrowing with "Borrow Book" buttons
  - **Borrowed Books**: Shows books currently borrowed by the user with "View Book" and "Return Book" buttons
  - **Add Book**: Form to add new books to the library with automatic redirection after success

## Smart Contract Integration

The application interacts with a CosmWasm smart contract deployed on the Injective blockchain. The main interactions are:

- **Queries**:
  - Getting available books
  - Getting books borrowed by the current user
  
- **Transactions**:
  - Borrowing books with real-time status updates
  - Returning books with transaction confirmation
  - Adding new books to the library

Each transaction displays a success message with the transaction hash and updates the UI accordingly.

## Technologies Used

- **React**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: State management
- **Injective SDK**: For blockchain interaction
- **Vite**: Build tool and development server

## Environment Setup

The application requires certain environment variables to run properly. Create a `.env` file in the client directory with the following variables:

```
VITE_CONTRACT_ADDRESS=inj1...  # Your deployed contract address
CHAIN_ID=injective-1           # Use injective-1 for mainnet or injective-888 for testnet
```

## Getting Started

### Prerequisites

- Node.js (v16 or later) (for development v24.0.2 was used)
- npm or yarn (for development npm - v11.3.0 and yarn - v1.22.22 were used)
- Keplr wallet browser extension

### Installation

1. Clone the repository
2. Navigate to the client directory
3. Install dependencies:

```bash
yarn install
```

### Running the Development Server

```bash
yarn dev:poll
```

This will start the development server at `http://localhost:5173`

### Building for Production

```bash
yarn build
```

The built files will be in the `dist` directory.

## Usage

1. **Connect Wallet**: Use the "Connect Wallet" button in the navbar to connect your Injective wallet.
2. **Browse Books**: View available books on the "Available Books" page.
3. **Borrow Books**: Click the "Borrow Book" button on a book card to initiate the borrowing process.
4. **Return Books**: Visit "Borrowed Books" page to view your borrowed books, then click "Return Book" to return them.
5. **View Books**: If a borrowed book has a URL, you can click "View Book" to open it in a new tab.
6. **Add Books**: Use the "Add Book" button in the navigation to add a new book to the library.

## Features

- **Real-time Transaction Feedback**: Clear success and error messages with transaction hashes
- **Automatic Redirection**: After adding a book, you're automatically redirected to the Available Books page
- **Responsive Design**: Works well on both desktop and mobile devices
- **Protected Routes**: Certain pages are only accessible when a wallet is connected

## Troubleshooting

- **Wallet Connection Issues**: Ensure your Keplr wallet is configured for Injective network
- **Book Data Not Loading**: Check that the contract address is correct in your environment variables
- **Transaction Errors**: Make sure you have enough INJ tokens for gas fees
- **Empty Address Errors**: If you see errors about empty addresses, make sure your wallet is properly connected
