#!/bin/bash

# Updates existing contracts.

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

# 3. Migrate to the new contract code
echo "Migrating contract..."

# Check if the contract has an admin
ADMIN_INFO=$(injectived query wasm contract $CONTRACT_ADDR | grep -A 1 "admin")
if echo "$ADMIN_INFO" | grep -q "admin: \"\""; then
    echo "Contract has no admin. Cannot migrate. Need to redeploy from scratch."
    echo "Run redeploy_contract.sh to deploy a new instance of the contract."
else
    echo "Contract has an admin. Migrating..."
    echo "$PASSPHRASE" | injectived tx wasm migrate $CONTRACT_ADDR $NEW_CODE_ID '{}' \
        --from $FROM --gas auto --gas-adjustment 1.3 --fees $FEES -y
    
    echo "Waiting for migration to complete..."
    sleep 5
    
    echo "Migration complete. Contract updated."
    
    # Update the configuration file with new code_id
    sed -i "s/CODE_ID=\"[0-9]*\"/CODE_ID=\"$NEW_CODE_ID\"/" ./contract_config.sh
    sed -i "s/LAST_DEPLOYMENT=\".*\"/LAST_DEPLOYMENT=\"$(date)\"/" ./contract_config.sh
    
    echo "Configuration file updated with new code_id: $NEW_CODE_ID"
fi

# Clear passphrase from memory
PASSPHRASE=""

echo "Update process completed." 