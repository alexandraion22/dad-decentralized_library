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
- **Page Structure**:
  - **Home**: Main landing page
  - **Available Books**: Shows all books available for borrowing
  - **Borrowed Books**: Shows books currently borrowed by the user

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
```

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
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
3. **Borrow Books**: Click on a book to borrow it (requires connected wallet).
4. **Return Books**: Visit "Borrowed Books" page to view and return your borrowed books.

## Smart Contract Integration

The application interacts with a CosmWasm smart contract deployed on the Injective blockchain. The main interactions are:

- Querying available books
- Querying books borrowed by the current user
- Borrowing books
- Returning books
- Adding books

## Troubleshooting

- **Wallet Connection Issues**: Ensure your Keplr wallet is configured for Injective network
- **Book Data Not Loading**: Check that the contract address is correct in your environment variables
- **Transaction Errors**: Make sure you have enough INJ tokens for gas fees
