#!/bin/bash

# Source configuration
cd "$(dirname "$0")"  # Make sure we're in the smart-contract directory
source "./contract_config.sh"

# Helper for querying contract state
query_contract() {
    local query_msg="$1"
    
    echo "Querying contract with: $query_msg"
    injectived query wasm contract-state smart $CONTRACT_ADDR "$query_msg"
}

# Helper for executing contract state changes
execute_contract() {
    local execute_msg="$1"
    
    # Get passphrase securely
    echo "Please enter your wallet passphrase:"
    read -s PASSPHRASE
    echo "Executing: $execute_msg"
    
    echo "$PASSPHRASE" | injectived tx wasm execute $CONTRACT_ADDR "$execute_msg" \
        --from $FROM --gas auto --gas-adjustment 1.3 --fees $FEES --broadcast-mode sync -y
    
    # Clear passphrase
    PASSPHRASE=""
}

# Helper to display contract information
contract_info() {
    echo "Contract Information:"
    echo "Current Contract Address: $CONTRACT_ADDR"
    echo "Current Code ID: $CODE_ID"
    echo "Wallet Address: $WALLET_ADDR"
    echo "Last Deployment: $LAST_DEPLOYMENT"
    echo ""
    echo "Previous Contract Address: $OLD_CONTRACT_ADDR"
    echo "Previous Code ID: $OLD_CODE_ID"
    
    echo ""
    echo "Contract Admin:"
    injectived query wasm contract $CONTRACT_ADDR | grep -A 1 "admin"
}

# Helper for common queries
get_all_books() {
    query_contract '{"get_all_books": {}}'
}

get_book() {
    local token_id="$1"
    query_contract '{"get_book": {"token_id": "'$token_id'"}}'
}

get_borrower() {
    local token_id="$1"
    query_contract '{"get_borrower": {"token_id": "'$token_id'"}}'
}

get_borrowed_books() {
    query_contract '{"get_borrowed_books": {}}'
}

get_my_borrowed_books() {
    local address="$1"
    if [ -z "$address" ]; then
        address="$WALLET_ADDR"
    fi
    query_contract '{"get_my_borrowed_books": {"borrower": "'$address'"}}'
}

get_available_books() {
    query_contract '{"get_available_books": {}}'
}

# Helper for common executions
add_book() {
    local token_id="$1"
    local title="$2"
    local author="$3"
    local book_url="$4"
    local owner="${5:-$WALLET_ADDR}"
    
    execute_contract '{"add_book": {"token_id": "'$token_id'", "title": "'$title'", "author": "'$author'", "book_url": "'$book_url'", "owner": "'$owner'"}}'
}

borrow_book() {
    local token_id="$1"
    local borrower="${2:-$WALLET_ADDR}"
    
    execute_contract '{"borrow_book": {"token_id": "'$token_id'", "borrower": "'$borrower'"}}'
}

return_book() {
    local token_id="$1"
    
    execute_contract '{"return_book": {"token_id": "'$token_id'"}}'
}

# Show help if no arguments provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <command> [args...]"
    echo ""
    echo "Commands:"
    echo "  info                        - Show contract information"
    echo "  get_all_books               - Get all books"
    echo "  get_book <token_id>         - Get book by token ID"
    echo "  get_borrower <token_id>     - Get borrower of a book"
    echo "  get_borrowed_books          - Get all borrowed books"
    echo "  get_my_borrowed_books       - Get books borrowed by your wallet"
    echo "  get_available_books         - Get all books available for borrowing"
    echo "  add_book <id> <title> <author> <book_url> [owner] - Add a new book"
    echo "  borrow_book <token_id> [borrower]   - Borrow a book"
    echo "  return_book <token_id>      - Return a book"
    exit 1
fi

# Execute the command
cmd="$1"
shift

case "$cmd" in
    info)
        contract_info
        ;;
    get_all_books)
        get_all_books
        ;;
    get_book)
        get_book "$1"
        ;;
    get_borrower)
        get_borrower "$1"
        ;;
    get_borrowed_books)
        get_borrowed_books
        ;;
    get_my_borrowed_books)
        get_my_borrowed_books "$1"
        ;;
    get_available_books)
        get_available_books
        ;;
    add_book)
        add_book "$1" "$2" "$3" "$4" "$5"
        ;;
    borrow_book)
        borrow_book "$1" "$2"
        ;;
    return_book)
        return_book "$1"
        ;;
    *)
        echo "Unknown command: $cmd"
        exit 1
        ;;
esac 