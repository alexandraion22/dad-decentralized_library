pub mod error;
pub mod msg;
pub mod state;

use cosmwasm_std::{
    entry_point, to_json_binary, Addr, Binary, Deps, DepsMut, Env, MessageInfo, Response,
    StdResult, Order, WasmMsg,
};
use cw_storage_plus::Bound;
use cw2::set_contract_version;
use cw721::{
    AllNftInfoResponse, Approval, ApprovalResponse, ApprovalsResponse, ContractInfoResponse, 
    Expiration, NftInfoResponse, NumTokensResponse, OperatorsResponse, OwnerOfResponse, TokensResponse,
};

use crate::error::ContractError;
use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg};
use crate::state::{
    Approval as StateApproval, CONTRACT_INFO, Metadata, NUM_TOKENS, OPERATORS, TokenInfo, TOKENS, BORROWERS, BOOKS, Book,
};

// Version information
const CONTRACT_NAME: &str = "crates.io:cw721-metadata-onchain";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

    // Initialize contract info
    let info = ContractInfoResponse {
        name: msg.name,
        symbol: msg.symbol,
    };
    CONTRACT_INFO.save(deps.storage, &info)?;

    // Initialize token count
    NUM_TOKENS.save(deps.storage, &0)?;

    // Set minter if provided
    let minter = deps.api.addr_validate(&msg.minter)?;

    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("contract_name", CONTRACT_NAME)
        .add_attribute("contract_version", CONTRACT_VERSION)
        .add_attribute("minter", minter))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        // CW721 standard messages
        ExecuteMsg::TransferNft {
            recipient,
            token_id,
        } => execute_transfer_nft(deps, env, info, recipient, token_id),
        ExecuteMsg::SendNft {
            contract,
            token_id,
            msg,
        } => execute_send_nft(deps, env, info, contract, token_id, msg),
        ExecuteMsg::Approve {
            spender,
            token_id,
            expires,
        } => execute_approve(deps, env, info, spender, token_id, expires),
        ExecuteMsg::Revoke { spender, token_id } => {
            execute_revoke(deps, env, info, spender, token_id)
        }
        ExecuteMsg::ApproveAll { operator, expires } => {
            execute_approve_all(deps, env, info, operator, expires)
        }
        ExecuteMsg::RevokeAll { operator } => execute_revoke_all(deps, env, info, operator),
        ExecuteMsg::Mint {
            token_id,
            owner,
            metadata,
        } => execute_mint(deps, env, info, token_id, owner, metadata),
        ExecuteMsg::Burn { token_id } => execute_burn(deps, env, info, token_id),

        // Legacy messages for backwards compatibility
        ExecuteMsg::AddBook {
            token_id,
            title,
            author,
            url,
            owner,
        } => {
            execute_add_book(deps, info, token_id, title, author, url, owner)
        }
        ExecuteMsg::BorrowBook { token_id, borrower } => {
            execute_borrow_book(deps, info, token_id, borrower)
        }
        ExecuteMsg::ReturnBook { token_id } => execute_return_book(deps, info, token_id),
    }
}

// CW721 Implementation functions

pub fn execute_transfer_nft(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    recipient: String,
    token_id: String,
) -> Result<Response, ContractError> {
    // Validate recipient address
    let recipient = deps.api.addr_validate(&recipient)?;

    // Ensure transferability of token by checking permissions
    _transfer_nft(deps, &env, &info, &recipient, &token_id)?;

    Ok(Response::new()
        .add_attribute("action", "transfer_nft")
        .add_attribute("sender", info.sender)
        .add_attribute("recipient", recipient)
        .add_attribute("token_id", token_id))
}

pub fn execute_send_nft(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    contract: String,
    token_id: String,
    msg: Binary,
) -> Result<Response, ContractError> {
    // Validate contract address
    let recipient = deps.api.addr_validate(&contract)?;

    // Transfer the token
    _transfer_nft(deps, &_env, &info, &recipient, &token_id)?;

    Ok(Response::new()
        .add_attribute("action", "send_nft")
        .add_attribute("sender", info.sender)
        .add_attribute("recipient", recipient.clone())
        .add_attribute("token_id", token_id)
        .add_message(WasmMsg::Execute {
            contract_addr: recipient.to_string(),
            msg,
            funds: vec![],
        }))
}

pub fn execute_approve(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    spender: String,
    token_id: String,
    expires: Option<Expiration>,
) -> Result<Response, ContractError> {
    // Validate spender address
    let spender_addr = deps.api.addr_validate(&spender)?;

    // Get token info and verify ownership
    let mut token = TOKENS.load(deps.storage, &token_id)?;
    
    // Only owner can approve
    if token.owner != info.sender {
        return Err(ContractError::Unauthorized {});
    }

    // Set the expiration (default: never)
    let expires = expires.unwrap_or_else(|| Expiration::Never {});
    
    // Check if the spender already has approval
    let existing_approval = token.approvals.iter_mut().find(|a| a.spender == spender_addr);
    
    match existing_approval {
        Some(approval) => {
            // Just update the expiration
            approval.expires = expires;
        }
        None => {
            // Add a new approval
            token.approvals.push(StateApproval {
                spender: spender_addr.clone(),
                expires,
            });
        }
    }

    // Save updated token info
    TOKENS.save(deps.storage, &token_id, &token)?;

    Ok(Response::new()
        .add_attribute("action", "approve")
        .add_attribute("sender", info.sender)
        .add_attribute("spender", spender)
        .add_attribute("token_id", token_id))
}

pub fn execute_revoke(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    spender: String,
    token_id: String,
) -> Result<Response, ContractError> {
    // Validate spender address
    let spender_addr = deps.api.addr_validate(&spender)?;

    // Get token info
    let mut token = TOKENS.load(deps.storage, &token_id)?;
    
    // Only owner can revoke
    if token.owner != info.sender {
        return Err(ContractError::Unauthorized {});
    }

    // Remove the approval
    token.approvals.retain(|a| a.spender != spender_addr);
    
    // Save updated token info
    TOKENS.save(deps.storage, &token_id, &token)?;

    Ok(Response::new()
        .add_attribute("action", "revoke")
        .add_attribute("sender", info.sender)
        .add_attribute("spender", spender)
        .add_attribute("token_id", token_id))
}

pub fn execute_approve_all(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    operator: String,
    expires: Option<Expiration>,
) -> Result<Response, ContractError> {
    // Validate operator address
    let operator_addr = deps.api.addr_validate(&operator)?;

    // Set the expiration (default: never)
    let expires = expires.unwrap_or_else(|| Expiration::Never {});
    
    // Save the operator approval
    OPERATORS.save(deps.storage, (&info.sender, &operator_addr), &expires)?;

    Ok(Response::new()
        .add_attribute("action", "approve_all")
        .add_attribute("sender", info.sender)
        .add_attribute("operator", operator))
}

pub fn execute_revoke_all(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    operator: String,
) -> Result<Response, ContractError> {
    // Validate operator address
    let operator_addr = deps.api.addr_validate(&operator)?;
    
    // Remove the operator approval
    OPERATORS.remove(deps.storage, (&info.sender, &operator_addr));

    Ok(Response::new()
        .add_attribute("action", "revoke_all")
        .add_attribute("sender", info.sender)
        .add_attribute("operator", operator))
}

pub fn execute_mint(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    token_id: String,
    owner: String,
    metadata: Metadata,
) -> Result<Response, ContractError> {
    // Validate owner address
    let owner_addr = deps.api.addr_validate(&owner)?;

    // Check if token ID already exists
    if TOKENS.may_load(deps.storage, &token_id)?.is_some() {
        return Err(ContractError::Claimed {});
    }

    // Create token info
    let token = TokenInfo {
        owner: owner_addr.clone(),
        approvals: vec![],
        metadata,
    };

    // Save token info
    TOKENS.save(deps.storage, &token_id, &token)?;

    // Increment token count
    let mut count = NUM_TOKENS.load(deps.storage)?;
    count += 1;
    NUM_TOKENS.save(deps.storage, &count)?;

    Ok(Response::new()
        .add_attribute("action", "mint")
        .add_attribute("minter", info.sender)
        .add_attribute("owner", owner)
        .add_attribute("token_id", token_id))
}

pub fn execute_burn(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    token_id: String,
) -> Result<Response, ContractError> {
    // Get token info
    let token = TOKENS.load(deps.storage, &token_id)?;
    
    // Check if sender is authorized (only owner can burn)
    if token.owner != info.sender {
        return Err(ContractError::Unauthorized {});
    }

    // Remove token
    TOKENS.remove(deps.storage, &token_id);
    
    // Decrement token count
    let mut count = NUM_TOKENS.load(deps.storage)?;
    count -= 1;
    NUM_TOKENS.save(deps.storage, &count)?;

    Ok(Response::new()
        .add_attribute("action", "burn")
        .add_attribute("sender", info.sender)
        .add_attribute("token_id", token_id))
}

// Helper function to transfer NFT ownership
fn _transfer_nft(
    deps: DepsMut,
    env: &Env,
    info: &MessageInfo,
    recipient: &Addr,
    token_id: &str,
) -> Result<(), ContractError> {
    // Load token info
    let mut token = TOKENS.load(deps.storage, token_id)?;

    // Check if sender is authorized to transfer
    if token.owner != info.sender {
        let mut found = false;
        
        // Check token-specific approvals
        for approval in &token.approvals {
            if approval.spender == info.sender && !approval.expires.is_expired(&env.block) {
                found = true;
                break;
            }
        }
        
        // Check operator approvals
        if !found {
            let op = OPERATORS.may_load(deps.storage, (&token.owner, &info.sender))?;
            if let Some(expiration) = op {
                if !expiration.is_expired(&env.block) {
                    found = true;
                }
            }
        }
        
        if !found {
            return Err(ContractError::Unauthorized {});
        }
    }

    // Update ownership
    token.owner = recipient.clone();
    
    // Remove all existing approvals
    token.approvals = vec![];
    
    // Save updated token info
    TOKENS.save(deps.storage, token_id, &token)?;

    Ok(())
}

/// Adds a new book to the library - legacy support
fn execute_add_book(
    deps: DepsMut,
    _info: MessageInfo,
    token_id: String,
    title: String,
    author: String,
    url: String,
    owner: Addr,
) -> Result<Response, ContractError> {
    // Store in legacy BOOKS map for backwards compatibility
    let book = Book {
        title: title.clone(),
        author: author.clone(),
        url: url.clone(),
        owner: owner.clone(),
    };
    BOOKS.save(deps.storage, &token_id, &book)?;
    
    // Also store as CW721 token
    let metadata = Metadata {
        title,
        author,
        url,
    };
    
    let token = TokenInfo {
        owner,
        approvals: vec![],
        metadata,
    };
    
    TOKENS.save(deps.storage, &token_id, &token)?;
    
    // Increment token count
    let mut count = NUM_TOKENS.may_load(deps.storage)?.unwrap_or(0);
    count += 1;
    NUM_TOKENS.save(deps.storage, &count)?;

    Ok(Response::new()
        .add_attribute("action", "add_book")
        .add_attribute("token_id", token_id))
}

/// Allows a user to borrow a book if it is not already borrowed - legacy support
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
        .add_attribute("token_id", token_id))
}

/// Allows the borrower to return a book they have borrowed - legacy support
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

// QUERY HANDLERS

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        // CW721 standard queries
        QueryMsg::OwnerOf {
            token_id,
            include_expired,
        } => to_json_binary(&query_owner_of(deps, env, token_id, include_expired)?),
        QueryMsg::Approval {
            token_id,
            spender,
            include_expired,
        } => to_json_binary(&query_approval(deps, env, token_id, spender, include_expired)?),
        QueryMsg::Approvals {
            token_id,
            include_expired,
        } => to_json_binary(&query_approvals(deps, env, token_id, include_expired)?),
        QueryMsg::AllOperators {
            owner,
            include_expired,
            start_after,
            limit,
        } => to_json_binary(&query_all_operators(
            deps,
            env,
            owner,
            include_expired,
            start_after,
            limit,
        )?),
        QueryMsg::NumTokens {} => to_json_binary(&query_num_tokens(deps)?),
        QueryMsg::NftInfo { token_id } => to_json_binary(&query_nft_info(deps, token_id)?),
        QueryMsg::AllNftInfo {
            token_id,
            include_expired,
        } => to_json_binary(&query_all_nft_info(deps, env, token_id, include_expired)?),
        QueryMsg::Tokens {
            owner,
            start_after,
            limit,
        } => to_json_binary(&query_tokens(deps, owner, start_after, limit)?),
        QueryMsg::AllTokens { start_after, limit } => {
            to_json_binary(&query_all_tokens(deps, start_after, limit)?)
        }
        QueryMsg::ContractInfo {} => to_json_binary(&query_contract_info(deps)?),
        
        // Legacy queries for backward compatibility
        QueryMsg::GetBorrower { token_id } => {
            let borrower = BORROWERS.may_load(deps.storage, &token_id)?;
            to_json_binary(&borrower)
        }
        QueryMsg::GetBook { token_id } => query_book(deps, token_id),
        QueryMsg::GetAllBooks {} => query_all_books(deps),
        QueryMsg::GetBorrowedBooks {} => query_borrowed_books(deps),
        QueryMsg::GetMyBorrowedBooks { borrower } => query_my_borrowed_books(deps, borrower),
        QueryMsg::GetAvailableBooks {} => query_available_books(deps),
    }
}

fn query_owner_of(
    deps: Deps,
    env: Env,
    token_id: String,
    include_expired: Option<bool>,
) -> StdResult<OwnerOfResponse> {
    let token = TOKENS.load(deps.storage, &token_id)?;
    
    let include_expired = include_expired.unwrap_or(false);
    
    // Filter out expired approvals
    let approvals: Vec<_> = token
        .approvals
        .iter()
        .filter(|a| include_expired || !a.expires.is_expired(&env.block))
        .map(|a| Approval {
            spender: a.spender.to_string(),
            expires: a.expires,
        })
        .collect();

    Ok(OwnerOfResponse {
        owner: token.owner.to_string(),
        approvals,
    })
}

fn query_approval(
    deps: Deps,
    env: Env,
    token_id: String,
    spender: String,
    include_expired: Option<bool>,
) -> StdResult<ApprovalResponse> {
    let token = TOKENS.load(deps.storage, &token_id)?;
    let include_expired = include_expired.unwrap_or(false);
    
    // Find the approval for this spender
    let approval = token
        .approvals
        .iter()
        .find(|a| a.spender == deps.api.addr_validate(&spender).unwrap())
        .filter(|a| include_expired || !a.expires.is_expired(&env.block))
        .map(|a| Approval {
            spender: a.spender.to_string(),
            expires: a.expires,
        });

    match approval {
        Some(approval) => Ok(ApprovalResponse { approval }),
        None => Err(cosmwasm_std::StdError::not_found("Approval not found")),
    }
}

fn query_approvals(
    deps: Deps,
    env: Env,
    token_id: String,
    include_expired: Option<bool>,
) -> StdResult<ApprovalsResponse> {
    let token = TOKENS.load(deps.storage, &token_id)?;
    let include_expired = include_expired.unwrap_or(false);
    
    // Filter expired approvals if requested
    let approvals: Vec<_> = token
        .approvals
        .iter()
        .filter(|a| include_expired || !a.expires.is_expired(&env.block))
        .map(|a| Approval {
            spender: a.spender.to_string(),
            expires: a.expires,
        })
        .collect();

    Ok(ApprovalsResponse { approvals })
}

fn query_all_operators(
    deps: Deps,
    env: Env,
    owner: String,
    include_expired: Option<bool>,
    start_after: Option<String>,
    limit: Option<u32>,
) -> StdResult<OperatorsResponse> {
    let owner_addr = deps.api.addr_validate(&owner)?;
    let include_expired = include_expired.unwrap_or(false);
    
    let start_addr = if let Some(start) = start_after {
        Some(deps.api.addr_validate(&start)?)
    } else {
        None
    };

    // Default and max limits for query pagination
    let limit = limit.unwrap_or(10).min(30) as usize;
    
    let operators = OPERATORS
        .prefix(&owner_addr)
        .range(
            deps.storage,
            start_addr.as_ref().map(|x| Bound::exclusive(x)),
            None,
            Order::Ascending,
        )
        .filter(|item| {
            let (_, expires) = item.as_ref().unwrap();
            include_expired || !expires.is_expired(&env.block)
        })
        .take(limit)
        .map(|item| {
            let (addr, expires) = item?;
            Ok(Approval {
                spender: addr.to_string(),
                expires,
            })
        })
        .collect::<StdResult<Vec<_>>>()?;

    Ok(OperatorsResponse { operators })
}

fn query_num_tokens(deps: Deps) -> StdResult<NumTokensResponse> {
    let count = NUM_TOKENS.load(deps.storage)?;
    Ok(NumTokensResponse { count })
}

fn query_nft_info(deps: Deps, token_id: String) -> StdResult<NftInfoResponse<Metadata>> {
    let token = TOKENS.load(deps.storage, &token_id)?;
    Ok(NftInfoResponse {
        token_uri: None, // We store metadata on-chain instead of URI
        extension: token.metadata,
    })
}

fn query_all_nft_info(
    deps: Deps,
    env: Env,
    token_id: String,
    include_expired: Option<bool>,
) -> StdResult<AllNftInfoResponse<Metadata>> {
    let owner = query_owner_of(deps, env.clone(), token_id.clone(), include_expired)?;
    let info = query_nft_info(deps, token_id)?;
    Ok(AllNftInfoResponse { access: owner, info })
}

fn query_tokens(
    deps: Deps,
    owner: String,
    start_after: Option<String>,
    limit: Option<u32>,
) -> StdResult<TokensResponse> {
    let owner_addr = deps.api.addr_validate(&owner)?;
    
    // Default and max limits for query pagination
    let limit = limit.unwrap_or(10).min(30) as usize;
    
    // Different approach to avoid Bound issues
    let tokens = if let Some(start) = start_after {
        TOKENS
            .range(deps.storage, None, None, Order::Ascending)
            .filter(|item| {
                let (id, token) = item.as_ref().unwrap();
                &start < id && token.owner == owner_addr
            })
            .take(limit)
            .map(|item| {
                let (token_id, _) = item?;
                Ok(token_id)
            })
            .collect::<StdResult<Vec<String>>>()?
    } else {
        TOKENS
            .range(deps.storage, None, None, Order::Ascending)
            .filter(|item| {
                let (_, token) = item.as_ref().unwrap();
                token.owner == owner_addr
            })
            .take(limit)
            .map(|item| {
                let (token_id, _) = item?;
                Ok(token_id)
            })
            .collect::<StdResult<Vec<String>>>()?
    };

    Ok(TokensResponse { tokens })
}

fn query_all_tokens(
    deps: Deps,
    start_after: Option<String>,
    limit: Option<u32>,
) -> StdResult<TokensResponse> {
    // Default and max limits for query pagination
    let limit = limit.unwrap_or(10).min(30) as usize;
    
    // Different approach to avoid Bound issues
    let tokens = if let Some(start) = start_after {
        TOKENS
            .range(deps.storage, None, None, Order::Ascending)
            .filter(|item| {
                let (id, _) = item.as_ref().unwrap();
                &start < id
            })
            .take(limit)
            .map(|item| {
                let (token_id, _) = item?;
                Ok(token_id)
            })
            .collect::<StdResult<Vec<String>>>()?
    } else {
        TOKENS
            .range(deps.storage, None, None, Order::Ascending)
            .take(limit)
            .map(|item| {
                let (token_id, _) = item?;
                Ok(token_id)
            })
            .collect::<StdResult<Vec<String>>>()?
    };

    Ok(TokensResponse { tokens })
}

fn query_contract_info(deps: Deps) -> StdResult<ContractInfoResponse> {
    CONTRACT_INFO.load(deps.storage)
}

// Legacy query implementations

/// Retrieves details of a specific book by its token ID
fn query_book(deps: Deps, token_id: String) -> StdResult<Binary> {
    let book = BOOKS.load(deps.storage, &token_id)?;
    to_json_binary(&book)
}

/// Retrieves details of all books in the library.
fn query_all_books(deps: Deps) -> StdResult<Binary> {
    // Use a more gas-efficient approach by limiting the number of books returned
    const MAX_BOOKS: usize = 100;
    let mut books = Vec::with_capacity(MAX_BOOKS);
    
    for item in BOOKS.range(deps.storage, None, None, Order::Ascending).take(MAX_BOOKS) {
        let (key, book) = item?;
        books.push((key, book));
    }

    to_json_binary(&books)
}

/// Retrieves details of all borrowed books in the library
fn query_borrowed_books(deps: Deps) -> StdResult<Binary> {
    const MAX_BOOKS: usize = 100;
    let mut borrowed_books = Vec::with_capacity(MAX_BOOKS);
    
    for item in BORROWERS.range(deps.storage, None, None, Order::Ascending).take(MAX_BOOKS) {
        let (token_id, borrower) = item?;
        if let Ok(book) = BOOKS.load(deps.storage, &token_id) {
            borrowed_books.push((token_id, book, borrower));
        }
    }

    to_json_binary(&borrowed_books)
}

/// Retrieves details of all books borrowed by a specific address
fn query_my_borrowed_books(deps: Deps, borrower: Addr) -> StdResult<Binary> {
    const MAX_BOOKS: usize = 100;
    let mut my_borrowed_books = Vec::with_capacity(MAX_BOOKS);
    
    for item in BORROWERS.range(deps.storage, None, None, Order::Ascending).take(MAX_BOOKS) {
        let (token_id, current_borrower) = item?;
        if current_borrower == borrower {
            if let Ok(book) = BOOKS.load(deps.storage, &token_id) {
                my_borrowed_books.push((token_id, book));
            }
        }
    }

    to_json_binary(&my_borrowed_books)
}

/// Retrieves details of all books that are available for borrowing (not currently borrowed)
fn query_available_books(deps: Deps) -> StdResult<Binary> {
    const MAX_BOOKS: usize = 100;
    let mut available_books = Vec::with_capacity(MAX_BOOKS);
    
    // Get all books
    for item in BOOKS.range(deps.storage, None, None, Order::Ascending).take(MAX_BOOKS) {
        let (token_id, book) = item?;
        
        // Check if the book is currently borrowed
        let is_borrowed = BORROWERS.may_load(deps.storage, &token_id)?.is_some();
        
        // If not borrowed, add to available books
        if !is_borrowed {
            available_books.push((token_id, book));
        }
    }

    to_json_binary(&available_books)
}