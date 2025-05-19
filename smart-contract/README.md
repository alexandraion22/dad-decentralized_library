# Decentralized Library Smart Contract

A blockchain-based library management system built on the Injective Protocol, allowing users to add, borrow, and return books in a decentralized manner.

## Overview

This project implements a decentralized library system using CosmWasm smart contracts, based on the [CW721 NFT standard](https://github.com/public-awesome/cw-nfts/tree/main/contracts/cw721-metadata-onchain).

## Project Structure

```
smart-contract/
├── src/                 # Smart contract source code
│   ├── state.rs        # Contract state definitions
│   └── ...
├── contract_config.sh  # Shared configuration variables
├── contract_utils.sh   # Utility functions for interacting with the contract
├── build_and_deploy.sh # Initial deployment script
├── redeploy_contract.sh # Deploy a new instance of the contract
├── update_contract.sh  # Update an existing contract (migration)
├── test_contract.sh    # Run tests against the deployed contract
└── install.sh          # Environment setup
```

## Features

### Smart Contract Functions

#### Execute Messages
- `add_book`: Create a new book entry and assign it to an owner
- `borrow_book`: Borrow an available book (only if not currently borrowed)
- `return_book`: Return a previously borrowed book

#### Query Messages
- `get_book`: Retrieve details for a specific book
- `get_all_books`: List all books in the library
- `get_borrower`: Get the current borrower of a specific book
- `get_borrowed_books`: List all currently borrowed books
- `get_my_borrowed_books`: List books borrowed by a specific address
- `get_available_books`: List all books that are available for borrowing

### Book Data Structure
```rust
pub struct Book {
    pub title: String,
    pub author: String,
    pub owner: Addr,
    pub book_url: String,  // URL to access the book content
}
```

## Development Setup

### Prerequisites
- [Keplr wallet](https://www.keplr.app/) with Injective testnet setup

### Installation
Run the setup script `install.sh` to install dependencies.

This will install:
- Rust v1.81.0 (required for CosmWasm compatibility)
- WASM target
- Injective CLI (`injectived`)

## Scripts

### Configuration
- `contract_config.sh`: Contains shared configuration variables including contract addresses, wallet information, and fee settings.

### Utility
- `contract_utils.sh`: Provides utility functions for common contract operations without having to manually construct transaction commands.

### Deployment and Management
- `build_and_deploy.sh`: Initial deployment script for first-time setup.
- `redeploy_contract.sh`: Deploy a new instance of the contract with admin capabilities to allow for future migrations.
- `update_contract.sh`: Update an existing contract by uploading new code and migrating the contract state (requires admin privileges).

### Testing
- `test_contract.sh`: Run a comprehensive test suite against the deployed contract to verify all functionality works as expected.

## Testing Environment

The contract is deployed on the Injective Testnet. You can view all transactions related to the test deployment at:

- [Testnet Explorer - First contract attempt + Some client transactions](https://testnet.explorer.injective.network/account/inj1d9d82j5xzlp50udmd7fnkdnruelxytaxhxd228/transactions/)

- [Testnet Explorer - Second contract attempt + Some client transactions](https://testnet.explorer.injective.network/account/inj1vvtcndw7rgxkssxffws2zspdc4mgaevhrl6vs9/transactions/)
