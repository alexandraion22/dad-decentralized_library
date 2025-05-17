use cosmwasm_std::Addr;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    AddBook {
        token_id: String,
        title: String,
        author: String,
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
    GetBorrower { token_id: String },
    GetBook { token_id: String },
    GetAllBooks {},
    GetBorrowedBooks {},
    GetMyBorrowedBooks { borrower: Addr },
    GetAvailableBooks {},
}