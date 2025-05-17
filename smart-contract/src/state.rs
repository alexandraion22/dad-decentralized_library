use cosmwasm_std::Addr;
use cw_storage_plus::{Item, Map};
use cw721::{ContractInfoResponse, Expiration};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

// Struct to store book metadata
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct Book {
    pub title: String,
    pub author: String,
    pub url: String,
    pub owner: Addr,
}

// Define CW721 token extension
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Metadata {
    pub title: String,
    pub author: String,
    pub url: String,
}

// Contract state and configuration
pub const CONTRACT_INFO: Item<ContractInfoResponse> = Item::new("contract_info");

// Maps for token ownership and approvals
pub const TOKENS: Map<&str, TokenInfo> = Map::new("tokens");
pub const OPERATORS: Map<(&Addr, &Addr), Expiration> = Map::new("operators");
pub const NUM_TOKENS: Item<u64> = Item::new("num_tokens");

// CW721 Token information
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct TokenInfo {
    // Owner of the token
    pub owner: Addr,
    // List of approved addresses with expiration
    pub approvals: Vec<Approval>,
    // Book metadata
    pub metadata: Metadata,
}

// Approval structure with expiration
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct Approval {
    pub spender: Addr,
    pub expires: Expiration,
}

// Legacy maps - maintained for backward compatibility
pub const BORROWERS: Map<&str, Addr> = Map::new("borrowers");
pub const BOOKS: Map<&str, Book> = Map::new("books");