use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Unauthorized")]
    Unauthorized {},
    
    #[error("Token already claimed")]
    Claimed {},
    
    #[error("Token not found")]
    TokenNotFound {},
    
    #[error("Cannot set approval that is already expired")]
    Expired {},
    
    #[error("Approval not found")]
    ApprovalNotFound {},
    
    #[error("Operator not found")]
    OperatorNotFound {},
}
