#!/bin/bash

# Wallet configuration
WALLET_ADDR="inj16fphk6w6qdlv062r8cxuk5awgvpm3ylew9rj75"
FROM="wallet"

# Fee configuration
FEES="500000000000000inj"
STORE_FEES="483000000000000inj"

# Contract configuration
# Previous contract (no-admin, cannot be migrated)
OLD_CONTRACT_ADDR="inj1dp57ek20evwz885ux4v5jrssqa7kwg2glclwcl"
OLD_CODE_ID="32001"

# Current contract (with admin, can be migrated)
CONTRACT_ADDR="inj1dp57ek20evwz885ux4v5jrssqa7kwg2glclwcl" # REPLACE WITH YOUR ACTUAL CONTRACT ADDRESS
CODE_ID="32001"

# Last deployment timestamp
LAST_DEPLOYMENT="Sun May 18 13:06:50 EEST 2025"

# Usage:
# To source this file in other scripts, use:
# source "$(dirname "$0")/contract_config.sh" 