#!/bin/bash

# Deploys contracts and assigns them new address.

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
TX_HASH=$(echo "$PASSPHRASE" | injectived tx wasm store "$WASM_FILE" --from $WALLET_ADDR --fees $STORE_FEES --gas 1700000 -y | grep txhash | awk '{print $2}')

echo "Waiting for transaction to be processed..."
sleep 5

# Get the code_id from the transaction
NEW_CODE_ID=$(injectived query tx $TX_HASH | grep -A 1 "key: code_id" | grep "value:" | head -n 1 | awk '{print $2}' | tr -d '"')

echo "New contract code uploaded with code_id: $NEW_CODE_ID"

# 3. Instantiate the new contract
echo "Instantiating contract..."
# Using an admin this time for future migrations
INST_TX_HASH=$(echo "$PASSPHRASE" | injectived tx wasm instantiate $NEW_CODE_ID '{}' \
  --label "decentralized-library" \
  --from $FROM \
  --admin=$WALLET_ADDR \
  --gas auto \
  --gas-adjustment 1.3 \
  --fees $FEES \
  --broadcast-mode sync \
  -y | grep txhash | awk '{print $2}')

echo "Waiting for transaction to be processed..."
sleep 5

# Get the contract_address from the transaction
NEW_CONTRACT_ADDR=$(injectived query tx $INST_TX_HASH | grep -A 1 "key: _contract_address" | grep "value:" | head -n 1 | awk '{print $2}' | tr -d '"')

echo "Contract instantiated with address: $NEW_CONTRACT_ADDR"
echo "IMPORTANT: Save this contract address for future use."

# 4. Add some initial books
echo "Adding initial books..."
echo "$PASSPHRASE" | injectived tx wasm execute $NEW_CONTRACT_ADDR '{"add_book": {"token_id": "book1", "title": "The Lightning Thief", "author": "Rick Riordan", "url": "https://example.com/books/lightning_thief.pdf", "owner": "'$WALLET_ADDR'"}}' \
  --from $FROM --gas auto --gas-adjustment 1.3 --fees $FEES --broadcast-mode sync -y

echo "Waiting for transaction to be processed..."
sleep 5

echo "$PASSPHRASE" | injectived tx wasm execute $NEW_CONTRACT_ADDR '{"add_book": {"token_id": "book2", "title": "The Sea of Monsters", "author": "Rick Riordan", "url": "https://example.com/books/sea_of_monsters.pdf", "owner": "'$WALLET_ADDR'"}}' \
  --from $FROM --gas auto --gas-adjustment 1.3 --fees $FEES --broadcast-mode sync -y

echo "Waiting for transaction to be processed..."
sleep 5

# 5. Verify the contract works
echo "Querying contract:"
injectived query wasm contract-state smart $NEW_CONTRACT_ADDR '{"get_all_books": {}}'

# Update config file with new contract information
# Store the old contract information
sed -i "s/OLD_CONTRACT_ADDR=\".*\"/OLD_CONTRACT_ADDR=\"$CONTRACT_ADDR\"/" ./contract_config.sh
sed -i "s/OLD_CODE_ID=\".*\"/OLD_CODE_ID=\"$CODE_ID\"/" ./contract_config.sh

# Update with new contract information
sed -i "s/CONTRACT_ADDR=\".*\"/CONTRACT_ADDR=\"$NEW_CONTRACT_ADDR\"/" ./contract_config.sh
sed -i "s/CODE_ID=\".*\"/CODE_ID=\"$NEW_CODE_ID\"/" ./contract_config.sh
sed -i "s/LAST_DEPLOYMENT=\".*\"/LAST_DEPLOYMENT=\"$(date)\"/" ./contract_config.sh

echo "Configuration file updated with new contract information."

# Clear passphrase from memory
PASSPHRASE=""

echo "Contract redeployment complete."
echo "New contract address: $NEW_CONTRACT_ADDR" 