# Decentralized Library on Injective Testnet

This project uses blockchain technology to create a decentralized book borrowing system. It runs on the Injective Testnet blockchain and has two main parts: a frontend and a backend.

The frontend is built with React and TypeScript, allowing users to connect their wallets and manage book transactions. The backend is a smart contract written in Rust, deployed on the Injective Testnet to handle the library's core logic.

## Project Structure

The project is divided into two main components:

* **Frontend (Client Folder)**: A web interface where users can connect their wallets, add books, borrow, read, and return them. The frontend is developed using React, TypeScript, and the Injective SDK.

* **Smart Contract (Smart-Contract Folder)**: A Rust-based smart contract deployed on the Injective Testnet. This contract handles the core logic of the decentralized library, including book addition, borrowing, and returning operations.

## Features

The decentralized library currently supports the following operations:

1. **Adding a Book**: Users can add new books to the library by providing relevant details.
2. **Borrowing and Reading a Book**: Users can borrow books and access their content.
3. **Returning a Book**: Once finished, users can return the borrowed books, making them available for others.

Additional features can be implemented as needed.

## Prerequisites

* Node.js
* npm or yarn
* Rust and Cargo
* Keplr wallet browser extension
* Wallet compatible with Injective Testnet

## Contributors

* Mihnea Blotiu
* Alexandra Ion
* Vitalii Toderian
