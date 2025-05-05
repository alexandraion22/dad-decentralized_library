# Decentralized Library Smart Contract

A blockchain-based library management system built on the Injective Protocol, allowing users to add, borrow, and return books in a decentralized manner.

## Overview

This project implements a decentralized library system using CosmWasm smart contracts, based on the [CW721 NFT standard](https://github.com/public-awesome/cw-nfts/tree/main/contracts/cw721-metadata-onchain).

## Project Structure

```
smart-contract/
├── src/               # Smart contract source code
│   ├── state.rs      # Contract state definitions
│   └── ...
├── build_and_test.sh # Deployment and testing script
└── install.sh        # Environment setup
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

### Book Data Structure
```rust
pub struct Book {
    pub title: String,
    pub author: String,
    pub owner: Addr,
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

### Deployment and Testing

1. Build and deploy the contract using `build_and_test.sh`.

## Testing Environment

The contract is deployed on the Injective Testnet. You can view all transactions related to the test deployment at:
[Testnet Explorer](https://testnet.explorer.injective.network/account/inj1d9d82j5xzlp50udmd7fnkdnruelxytaxhxd228/transactions/)