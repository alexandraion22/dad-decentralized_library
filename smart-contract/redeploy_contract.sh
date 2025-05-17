#!/bin/bash

# Deploys contracts and assigns them new address.
set -e  # Exit on error

# Source configuration
cd "$(dirname "$0")"  # Make sure we're in the smart-contract directory
source "./contract_config.sh"

# Get passphrase securely
echo "Please enter your wallet passphrase:"
read -s PASSPHRASE
echo "Passphrase saved temporarily for this session."

# 1. Build the contract
echo "Building contract..."
RUSTFLAGS='-C target-feature=-bulk-memory' cargo build --release --target wasm32-unknown-unknown
wasm-strip target/wasm32-unknown-unknown/release/*.wasm 2>/dev/null || echo "No wasm-strip needed"

# Find the generated WASM file
WASM_FILE=$(find target/wasm32-unknown-unknown/release -name "*.wasm" | head -1)
if [ -z "$WASM_FILE" ]; then
    echo "Error: No WASM file found in target/wasm32-unknown-unknown/release/"
    exit 1
fi
echo "Using WASM file: $WASM_FILE"

# 2. Upload the new contract code
echo "Uploading new contract code..."
# Store the command output in a variable while still displaying it to the user
UPLOAD_OUTPUT=$(echo "$PASSPHRASE" | injectived tx wasm store "$WASM_FILE" --from $WALLET_ADDR --fees $STORE_FEES --gas 3000000 -y 2>&1 | tee /dev/tty)
echo "Waiting for transaction to be processed..."

# Extract transaction hash
TX_HASH=$(echo "$UPLOAD_OUTPUT" | grep -oP 'txhash: \K[A-Z0-9]+')
if [ -z "$TX_HASH" ]; then
    echo "Error: Could not extract transaction hash from upload output"
    echo "Full output: $UPLOAD_OUTPUT"
    exit 1
fi
echo "Transaction hash: $TX_HASH"

# Wait for transaction to be processed
sleep 15

# Query the transaction to get code_id
TX_QUERY_OUTPUT=$(injectived query tx "$TX_HASH" 2>&1)

# Try different patterns to extract the code_id
NEW_CODE_ID=$(echo "$TX_QUERY_OUTPUT" | grep -A 5 "code_id" | grep -oP '[0-9]+' | head -1)
if [ -z "$NEW_CODE_ID" ]; then
    # Try alternative pattern
    NEW_CODE_ID=$(echo "$TX_QUERY_OUTPUT" | grep -oP 'code_id: "\K[0-9]+')
fi

if [ -z "$NEW_CODE_ID" ]; then
    echo "Error: Could not extract code_id from transaction output"
    echo "Full transaction query output: $TX_QUERY_OUTPUT"
    exit 1
fi

echo "New contract code uploaded with code_id: $NEW_CODE_ID"

# 3. Instantiate the new contract
echo "Instantiating contract..."
# Using an admin this time for future migrations
INST_OUTPUT=$(echo "$PASSPHRASE" | injectived tx wasm instantiate "$NEW_CODE_ID" '{"name":"Decentralized Library", "symbol":"LIB", "minter":"'$WALLET_ADDR'"}' \
  --label "decentralized-library" \
  --from $FROM \
  --admin="$WALLET_ADDR" \
  --gas auto \
  --gas-adjustment 1.3 \
  --fees $FEES \
  --broadcast-mode sync \
  -y 2>&1)

# Extract transaction hash for instantiation
INST_TX_HASH=$(echo "$INST_OUTPUT" | grep -oP 'txhash: \K[A-Z0-9]+')
if [ -z "$INST_TX_HASH" ]; then
    echo "Error: Could not extract transaction hash from instantiate output"
    echo "Full output: $INST_OUTPUT"
    exit 1
fi
echo "Instantiate transaction hash: $INST_TX_HASH"

echo "Waiting for transaction to be processed..."
sleep 15

# Query the instantiate transaction to get contract address
INST_TX_QUERY_OUTPUT=$(injectived query tx "$INST_TX_HASH" 2>&1)

# Try different patterns to extract the contract address
NEW_CONTRACT_ADDR=$(echo "$INST_TX_QUERY_OUTPUT" | grep -A 5 "_contract_address" | grep -oP 'inj[a-zA-Z0-9]+' | head -1)
if [ -z "$NEW_CONTRACT_ADDR" ]; then
    # Try alternative pattern
    NEW_CONTRACT_ADDR=$(echo "$INST_TX_QUERY_OUTPUT" | grep -oP 'contract_address: "\K[^"]+')
fi

if [ -z "$NEW_CONTRACT_ADDR" ]; then
    # Another approach - manually look through the output
    NEW_CONTRACT_ADDR=$(echo "$INST_TX_QUERY_OUTPUT" | grep -oP 'inj[a-zA-Z0-9]+')
fi

if [ -z "$NEW_CONTRACT_ADDR" ]; then
    echo "Error: Could not extract contract address from instantiate transaction output"
    echo "Full transaction query output: $INST_TX_QUERY_OUTPUT"
    exit 1
fi

echo "Contract instantiated with address: $NEW_CONTRACT_ADDR"
echo "IMPORTANT: Save this contract address for future use."

# 4. Add some initial books
echo "Adding initial books..."
BOOK1_OUTPUT=$(echo "$PASSPHRASE" | injectived tx wasm execute "$NEW_CONTRACT_ADDR" '{"add_book": {"token_id": "book1", "title": "The Lightning Thief", "author": "Rick Riordan", "url": "https://example.com/books/lightning_thief.pdf", "owner": "'$WALLET_ADDR'"}}' \
  --from $FROM --gas auto --gas-adjustment 1.3 --fees $FEES --broadcast-mode sync -y 2>&1)
echo "Book1 add output: $BOOK1_OUTPUT"

echo "Waiting for transaction to be processed..."
sleep 10

BOOK2_OUTPUT=$(echo "$PASSPHRASE" | injectived tx wasm execute "$NEW_CONTRACT_ADDR" '{"add_book": {"token_id": "book2", "title": "The Sea of Monsters", "author": "Rick Riordan", "url": "https://example.com/books/sea_of_monsters.pdf", "owner": "'$WALLET_ADDR'"}}' \
  --from $FROM --gas auto --gas-adjustment 1.3 --fees $FEES --broadcast-mode sync -y 2>&1)
echo "Book2 add output: $BOOK2_OUTPUT"

echo "Waiting for transaction to be processed..."
sleep 10

# 5. Verify the contract works
echo "Querying contract:"
if [ -n "$NEW_CONTRACT_ADDR" ]; then
    QUERY_OUTPUT=$(injectived query wasm contract-state smart "$NEW_CONTRACT_ADDR" '{"get_all_books": {}}' 2>&1)
    echo "Query output: $QUERY_OUTPUT" 
else
    echo "Error: Cannot query contract - contract address is empty"
fi

# Update config file with new contract information only if we have valid values
if [ -n "$NEW_CONTRACT_ADDR" ] && [ -n "$NEW_CODE_ID" ]; then
    # Store the old contract information
    sed -i "s/OLD_CONTRACT_ADDR=\".*\"/OLD_CONTRACT_ADDR=\"$CONTRACT_ADDR\"/" ./contract_config.sh
    sed -i "s/OLD_CODE_ID=\".*\"/OLD_CODE_ID=\"$CODE_ID\"/" ./contract_config.sh

    # Update with new contract information
    sed -i "s/CONTRACT_ADDR=\".*\"/CONTRACT_ADDR=\"$NEW_CONTRACT_ADDR\"/" ./contract_config.sh
    sed -i "s/CODE_ID=\".*\"/CODE_ID=\"$NEW_CODE_ID\"/" ./contract_config.sh
    sed -i "s/LAST_DEPLOYMENT=\".*\"/LAST_DEPLOYMENT=\"$(date)\"/" ./contract_config.sh

    echo "Configuration file updated with new contract information."
else
    echo "Error: Not updating config file due to missing contract address or code_id"
fi

# Clear passphrase from memory
PASSPHRASE=""

echo "Contract redeployment complete."
echo "New contract address: $NEW_CONTRACT_ADDR" 