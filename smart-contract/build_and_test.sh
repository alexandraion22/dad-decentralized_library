#!/bin/bash

# Configure variables
CONTRACT_PATH="contracts/cw721-metadata-onchain"
WASM_TARGET="target/wasm32-unknown-unknown/release/cw721_metadata_onchain.wasm"
WALLET_ADDR="inj1d9d82j5xzlp50udmd7fnkdnruelxytaxhxd228"
FROM="wallet"
FEES="500000000000000inj"
STORE_FEES="273000000000000inj"

# 1. Build the contract
echo "Building contract..."
cd $CONTRACT_PATH
RUSTFLAGS='-C target-feature=-bulk-memory' cargo build --release --target wasm32-unknown-unknown
wasm-strip target/wasm32-unknown-unknown/release/cw721_metadata_onchain.wasm

# 2. Upload the contract
echo "Uploading contract..."
injectived tx wasm store $WASM_TARGET --from $WALLET_ADDR --fees $STORE_FEES --gas 1700000 -y

echo ""
read -p "Manually enter the code_id returned from the upload: " CODE_ID

# 3. Instantiate the contract
echo "Instantiating contract..."
injectived tx wasm instantiate $CODE_ID '{}' \
  --label "decentralized-library" \
  --from $FROM \
  --no-admin \
  --gas auto \
  --gas-adjustment 1.3 \
  --fees $FEES \
  --broadcast-mode sync \
  -y

echo ""
read -p "Manually enter the contract_address of the instance: " CONTRACT_ADDR

# 4. Add books
echo "Adding books..."
injectived tx wasm execute $CONTRACT_ADDR '{"add_book": {"token_id": "book1", "title": "The Lightning Thief", "author": "Rick Riordan", "owner": "'$WALLET_ADDR'"}}' \
  --from $FROM --gas auto --gas-adjustment 1.3 --fees $FEES --broadcast-mode sync -y

injectived tx wasm execute $CONTRACT_ADDR '{"add_book": {"token_id": "book2", "title": "The Sea of Monsters", "author": "Rick Riordan", "owner": "'$WALLET_ADDR'"}}' \
  --from $FROM --gas auto --gas-adjustment 1.3 --fees $FEES --broadcast-mode sync -y

# 5. Borrow a book
echo "Borrowing a book..."
injectived tx wasm execute $CONTRACT_ADDR '{"borrow_book": {"token_id": "book1", "borrower": "'$WALLET_ADDR'"}}' \
  --from $WALLET_ADDR --gas auto --gas-adjustment 1.3 --fees $FEES --broadcast-mode sync -y

# 6. Return a book
echo "Returning a book..."
injectived tx wasm execute $CONTRACT_ADDR '{"return_book": {"token_id": "book1"}}' \
  --from $WALLET_ADDR --gas auto --gas-adjustment 1.3 --fees $FEES --broadcast-mode sync -y

# 7. Query the contract
echo "Querying contract:"
injectived query wasm contract-state smart $CONTRACT_ADDR '{"get_book": {"token_id": "book1"}}'
injectived query wasm contract-state smart $CONTRACT_ADDR '{"get_borrower": {"token_id": "book1"}}'
injectived query wasm contract-state smart $CONTRACT_ADDR '{"get_all_books": {}}'