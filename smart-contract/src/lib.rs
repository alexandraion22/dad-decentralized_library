pub mod error;
pub mod msg;
pub mod state;

use cosmwasm_std::{entry_point, DepsMut, Env, MessageInfo, Response, Addr, Binary, Deps, to_json_binary};
use crate::state::{BORROWERS, BOOKS, Book};
use crate::msg::{ExecuteMsg, QueryMsg, InstantiateMsg};
use crate::error::ContractError;

pub const CONTRACT_NAME: &str = "book-borrowing";
pub const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

/// Initializes the contract with metadata and sets up the state
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    _deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    _msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    Ok(Response::new()
        .add_attribute("action", "instantiate")
        .add_attribute("contract_name", CONTRACT_NAME)
        .add_attribute("contract_version", CONTRACT_VERSION))
}

/// Handles execution messages such as adding, borrowing, or returning books
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::AddBook { token_id, title, author, owner } => {
            execute_add_book(deps, info, token_id, title, author, owner)
        }
        ExecuteMsg::BorrowBook { token_id, borrower } => {
            execute_borrow_book(deps, info, token_id, borrower)
        }
        ExecuteMsg::ReturnBook { token_id } => execute_return_book(deps, info, token_id),
    }
}

/// Adds a new book to the library
fn execute_add_book(
    deps: DepsMut,
    _info: MessageInfo,
    token_id: String,
    title: String,
    author: String,
    owner: Addr,
) -> Result<Response, ContractError> {
    let book = Book {
        title,
        author,
        owner: owner.clone(),
    };

    BOOKS.save(deps.storage, &token_id, &book)?;

    Ok(Response::new()
        .add_attribute("action", "add_book")
        .add_attribute("token_id", token_id)
        .add_attribute("owner", owner.to_string()))
}

/// Allows a user to borrow a book if it is not already borrowed
fn execute_borrow_book(
    deps: DepsMut,
    _info: MessageInfo,
    token_id: String,
    borrower: Addr,
) -> Result<Response, ContractError> {
    if BORROWERS.may_load(deps.storage, &token_id)?.is_some() {
        return Err(ContractError::Unauthorized {});
    }

    BORROWERS.save(deps.storage, &token_id, &borrower)?;

    Ok(Response::new()
        .add_attribute("action", "borrow_book")
        .add_attribute("token_id", token_id)
        .add_attribute("borrower", borrower.to_string()))
}

/// Allows the borrower to return a book they have borrowed
fn execute_return_book(
    deps: DepsMut,
    info: MessageInfo,
    token_id: String,
) -> Result<Response, ContractError> {
    let borrower = BORROWERS.may_load(deps.storage, &token_id)?;
    if borrower.is_none() || borrower.unwrap() != info.sender {
        return Err(ContractError::Unauthorized {});
    }

    BORROWERS.remove(deps.storage, &token_id);

    Ok(Response::new()
        .add_attribute("action", "return_book")
        .add_attribute("token_id", token_id))
}

/// Handles query messages to retrieve information about books or borrowers
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> Result<Binary, ContractError> {
    match msg {
        QueryMsg::GetBorrower { token_id } => {
            let borrower = BORROWERS.may_load(deps.storage, &token_id)
                .map_err(|e| ContractError::Std(e.into()))?;
            Ok(to_json_binary(&borrower)?) // Serialize borrower to JSON
        }
        QueryMsg::GetBook { token_id } => query_book(deps, token_id),
        QueryMsg::GetAllBooks {} => query_all_books(deps),
    }
}

/// Retrieves details of a specific book by its token ID
fn query_book(deps: Deps, token_id: String) -> Result<Binary, ContractError> {
    let book = BOOKS.load(deps.storage, &token_id)
        .map_err(|e| ContractError::Std(e.into()))?;
    Ok(to_json_binary(&book)?)
}

/// Retrieves details of all books in the library.
fn query_all_books(deps: Deps) -> Result<Binary, ContractError> {
    let books: Vec<(String, Book)> = BOOKS
        .range(deps.storage, None, None, cosmwasm_std::Order::Ascending)
        .map(|item| {
            let (key, book) = item?;
            Ok((key, book))
        })
        .collect::<Result<Vec<_>, cosmwasm_std::StdError>>()?;

    Ok(to_json_binary(&books)?)
}