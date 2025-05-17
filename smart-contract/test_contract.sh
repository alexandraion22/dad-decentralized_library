#!/bin/bash

# Configure variables
CONTRACT_ADDR="inj1cde7ujdyvhj8cftdwaumvkzj4rqdv6hnjfvl8c"
WALLET_ADDR="inj1vvtcndw7rgxkssxffws2zspdc4mgaevhrl6vs9"
FROM="wallet"
FEES="500000000000000inj"

# Array to store test results
declare -a TEST_RESULTS

# Function to check if a command was successful
check_status() {
    if [ $? -eq 0 ]; then
        echo "✅ $1 successful"
        TEST_RESULTS+=("✅ $1")
        return 0
    else
        echo "❌ $1 failed"
        TEST_RESULTS+=("❌ $1")
        return 1
    fi
}

# Function to wait for transaction to be processed
wait_for_tx() {
    echo "Waiting for transaction to be processed..."
    sleep 5
}

# Function to print separator
print_separator() {
    echo ""
    echo "=========================================="
    echo "          $1"
    echo "=========================================="
    echo ""
}

# Function to print test summary
print_summary() {
    print_separator "TEST SUMMARY"
    echo "Test Results:"
    for result in "${TEST_RESULTS[@]}"; do
        echo "$result"
    done
    echo ""
}

# Get passphrase securely
echo "Please enter your wallet passphrase:"
read -s PASSPHRASE
echo "Passphrase saved temporarily for this session."

# Check if contract address is provided
if [ -z "$CONTRACT_ADDR" ]; then
    read -p "Enter the contract address to test: " CONTRACT_ADDR
fi

echo "Starting contract tests..."
echo "Contract address: $CONTRACT_ADDR"
echo "Wallet address: $WALLET_ADDR"
print_separator "TEST SESSION STARTED"

# Test 1: Add a new book
print_separator "TEST 1: ADDING A NEW BOOK"
echo "Test 1: Adding a new book..."
echo "$PASSPHRASE" | injectived tx wasm execute $CONTRACT_ADDR '{"add_book": {"token_id": "test_book1", "title": "Test Book 1", "author": "Test Author", "owner": "'$WALLET_ADDR'"}}' \
    --from $FROM --gas auto --gas-adjustment 1.3 --fees $FEES --broadcast-mode sync -y
check_status "Add book"
wait_for_tx

# Test 2: Query the added book
print_separator "TEST 2: QUERYING THE ADDED BOOK"
echo "Test 2: Querying the added book..."
injectived query wasm contract-state smart $CONTRACT_ADDR '{"get_book": {"token_id": "test_book1"}}'
check_status "Query book"

# Test 3: Borrow the book
print_separator "TEST 3: BORROWING THE BOOK"
echo "Test 3: Borrowing the book..."
echo "Current wallet address: $WALLET_ADDR"
echo "Using FROM account: $FROM"

echo "Checking book state before borrowing..."
injectived query wasm contract-state smart $CONTRACT_ADDR '{"get_book": {"token_id": "test_book1"}}'

echo "Attempting to borrow book..."
echo "$PASSPHRASE" | injectived tx wasm execute $CONTRACT_ADDR '{"borrow_book": {"token_id": "test_book1", "borrower": "'$WALLET_ADDR'"}}' \
    --from $FROM --gas auto --gas-adjustment 1.3 --fees $FEES --broadcast-mode sync -y
check_status "Borrow book"
wait_for_tx

echo "Checking book state after borrowing..."
injectived query wasm contract-state smart $CONTRACT_ADDR '{"get_book": {"token_id": "test_book1"}}'

# Test 4: Query borrower
print_separator "TEST 4: QUERYING BORROWER"
echo "Test 4: Querying borrower..."
injectived query wasm contract-state smart $CONTRACT_ADDR '{"get_borrower": {"token_id": "test_book1"}}'
check_status "Query borrower"

# Test 5: Return the book
print_separator "TEST 5: RETURNING THE BOOK"
echo "Test 5: Returning the book..."
echo "$PASSPHRASE" | injectived tx wasm execute $CONTRACT_ADDR '{"return_book": {"token_id": "test_book1"}}' \
    --from $WALLET_ADDR --gas auto --gas-adjustment 1.3 --fees $FEES --broadcast-mode sync -y
check_status "Return book"
wait_for_tx

# Test 6: Query all books
print_separator "TEST 6: QUERYING ALL BOOKS"
echo "Test 6: Querying all books..."
injectived query wasm contract-state smart $CONTRACT_ADDR '{"get_all_books": {}}'
check_status "Query all books"

# Test 7: Try to borrow a non-existent book (should fail)
print_separator "TEST 7: ATTEMPTING TO BORROW NON-EXISTENT BOOK"
echo "Test 7: Attempting to borrow non-existent book..."
RESPONSE=$(echo "$PASSPHRASE" | injectived tx wasm execute $CONTRACT_ADDR '{"borrow_book": {"token_id": "non_existent_book", "borrower": "'$WALLET_ADDR'"}}' \
    --from $WALLET_ADDR --gas auto --gas-adjustment 1.3 --fees $FEES --broadcast-mode sync -y)

# Check if the response contains an error message or empty result
if echo "$RESPONSE" | grep -q "Error\|error\|failed\|code: [1-9]" || [ -z "$(echo "$RESPONSE" | grep -v '^$')" ]; then
    echo "✅ Expected failure for non-existent book"
    TEST_RESULTS+=("✅ Borrow non-existent book (expected failure)")
else
    echo "❌ Unexpected success for non-existent book"
    echo "Response: $RESPONSE"
    TEST_RESULTS+=("❌ Borrow non-existent book (unexpected success)")
fi

# Clear passphrase from memory
PASSPHRASE=""

# Print test summary
print_summary

print_separator "TEST SESSION COMPLETED"
echo "All tests completed!" 