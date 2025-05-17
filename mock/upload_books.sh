#!/bin/bash

# Load common contract functions and configuration
source ../smart-contract/contract_config.sh

# Set the owner address (replace with your actual address)
OWNER_ADDRESS="$WALLET_ADDR"

# Check if owner address was provided as argument
if [ -n "$1" ]; then
    OWNER_ADDRESS="$1"
fi

echo "Using owner address: $OWNER_ADDRESS"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed. Please install jq to proceed."
    exit 1
fi

# Get passphrase securely only once
echo "Please enter your wallet passphrase:"
read -s PASSPHRASE
echo "Passphrase saved temporarily for this session."

# Read books from JSON file
BOOKS_JSON=$(cat books.json)
BOOK_COUNT=$(echo "$BOOKS_JSON" | jq length)

echo "Found $BOOK_COUNT books in books.json"

# Process each book
for (( i=0; i<$BOOK_COUNT; i++ )); do
    # Extract book data
    BOOK=$(echo "$BOOKS_JSON" | jq -r ".[$i]")
    ID=$(echo "$BOOK" | jq -r ".id")
    TITLE=$(echo "$BOOK" | jq -r ".title")
    AUTHOR=$(echo "$BOOK" | jq -r ".author")
    URL=$(echo "$BOOK" | jq -r ".url")
    
    echo "Processing book $ID: $TITLE by $AUTHOR"
    
    # Create JSON payload for the contract call
    ADD_BOOK_MSG=$(cat <<EOF
    {
        "add_book": {
            "token_id": "$ID",
            "title": "$TITLE",
            "author": "$AUTHOR",
            "url": "$URL",
            "owner": "$OWNER_ADDRESS"
        }
    }
EOF
    )
    
    # Execute contract call to add the book
    echo "Adding book to the smart contract..."
    TX_RESULT=$(echo "$PASSPHRASE" | injectived tx wasm execute $CONTRACT_ADDR "$ADD_BOOK_MSG" \
        --from $FROM \
        --gas auto \
        --gas-adjustment 1.3 \
        --fees $FEES \
        --broadcast-mode sync \
        -y)
    
    # Check if the transaction was successful
    if [ $? -eq 0 ]; then
        TX_HASH=$(echo "$TX_RESULT" | grep txhash | awk '{print $2}')
        echo "Book added successfully! Transaction hash: $TX_HASH"
    else
        echo "Failed to add book. Error: $TX_RESULT"
    fi
    
    # Short pause between transactions to prevent rate limiting
    sleep 5
done

# Clear passphrase from memory
PASSPHRASE=""

echo "All books have been processed!" 