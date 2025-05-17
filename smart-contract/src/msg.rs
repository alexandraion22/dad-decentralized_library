use cosmwasm_std::{Addr, Binary};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use cw721::{Expiration};

use crate::state::Metadata;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub name: String,
    pub symbol: String,
    pub minter: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    // CW721 standard messages
    /// Transfer is a base message to move a token to another account without triggering actions
    TransferNft { recipient: String, token_id: String },
    /// Send is a base message to transfer a token to a contract and trigger an action
    /// on the receiving contract.
    SendNft {
        contract: String,
        token_id: String,
        msg: Binary,
    },
    /// Allows operator to transfer / send the token from the owner's account.
    /// If expiration is set, then this allowance has a time/height limit
    Approve {
        spender: String,
        token_id: String,
        expires: Option<Expiration>,
    },
    /// Remove previously granted Approval
    Revoke { spender: String, token_id: String },
    /// Allows operator to transfer / send any token from the owner's account.
    /// If expiration is set, then this allowance has a time/height limit
    ApproveAll {
        operator: String,
        expires: Option<Expiration>,
    },
    /// Remove previously granted ApproveAll permission
    RevokeAll { operator: String },
    /// Mint a new NFT, can only be called by the contract minter
    Mint {
        token_id: String,
        owner: String,
        metadata: Metadata,
    },
    /// Burn an NFT the sender has access to
    Burn { token_id: String },

    // Original library-specific messages
    AddBook {
        token_id: String,
        title: String,
        author: String,
        url: String,
        owner: Addr,
    },
    BorrowBook {
        token_id: String,
        borrower: Addr,
    },
    ReturnBook {
        token_id: String,
    },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    // CW721 standard queries
    /// Return the owner of the given token, error if token does not exist
    OwnerOf {
        token_id: String,
        /// unset or false will filter out expired approvals, you must set to true to see them
        include_expired: Option<bool>,
    },
    /// Return operator that can access all of the owner's tokens
    Approval {
        token_id: String,
        spender: String,
        include_expired: Option<bool>,
    },
    /// Return approvals that a token has
    Approvals {
        token_id: String,
        include_expired: Option<bool>,
    },
    /// List all operators that can access all of the owner's tokens
    AllOperators {
        owner: String,
        /// unset or false will filter out expired items, you must set to true to see them
        include_expired: Option<bool>,
        start_after: Option<String>,
        limit: Option<u32>,
    },
    /// Total number of tokens issued
    NumTokens {},
    /// With MetaData Extension
    /// Returns metadata about one particular token
    NftInfo {
        token_id: String,
    },
    /// With MetaData Extension
    /// Returns the result of both `NftInfo` and `OwnerOf` as one query as an optimization
    AllNftInfo {
        token_id: String,
        /// unset or false will filter out expired approvals, you must set to true to see them
        include_expired: Option<bool>,
    },
    /// With Enumerable extension
    /// Returns all tokens owned by the given address, [] if unset
    Tokens {
        owner: String,
        start_after: Option<String>,
        limit: Option<u32>,
    },
    /// With Enumerable extension
    /// Requires pagination. Lists all token_ids controlled by the contract.
    AllTokens {
        start_after: Option<String>,
        limit: Option<u32>,
    },
    /// Return the contract's configuration
    ContractInfo {},

    // Original library-specific queries
    GetBorrower { token_id: String },
    GetBook { token_id: String },
    GetAllBooks {},
    GetBorrowedBooks {},
    GetMyBorrowedBooks { borrower: Addr },
    GetAvailableBooks {},
}

/// Message type for `nft_info` response
#[derive(Serialize, Deserialize, Clone, JsonSchema)]
pub struct BookInfoResponse {
    /// Standard CW721 NftInfoResponse fields
    pub name: String,
    pub description: String,
    /// Book-specific metadata fields
    pub title: String,
    pub author: String,
    pub url: String,
}

// Type for Minter info
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct MinterResponse {
    pub minter: String,
}