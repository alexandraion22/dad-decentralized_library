use cosmwasm_std::Addr;
use cw_storage_plus::Map;
use serde::{Deserialize, Serialize};

// Struct to store book metadata
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct Book {
    pub title: String,
    pub author: String,
    pub owner: Addr,
}

// Map to track the borrower of each book
pub const BORROWERS: Map<&str, Addr> = Map::new("borrowers");

// Map to store book metadata by token_id
pub const BOOKS: Map<&str, Book> = Map::new("books");