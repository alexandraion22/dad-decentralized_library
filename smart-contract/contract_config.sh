#!/bin/bash

# Wallet configuration
WALLET_ADDR="inj1vvtcndw7rgxkssxffws2zspdc4mgaevhrl6vs9"
FROM="wallet"

# Fee configuration
FEES="500000000000000inj"
STORE_FEES="273000000000000inj"

# Contract configuration
# Previous contract (no-admin, cannot be migrated)
OLD_CONTRACT_ADDR="inj12pzg8dpxn8fp2f56gs684a9r7wuf50s0q48r09"
OLD_CODE_ID="31988"

# Current contract (with admin, can be migrated)
CONTRACT_ADDR="inj12pzg8dpxn8fp2f56gs684a9r7wuf50s0q48r09"
CODE_ID="31988"

# Last deployment timestamp
LAST_DEPLOYMENT="Sat May 17 09:40:32 PM EEST 2025"

# Usage:
# To source this file in other scripts, use:
# source "$(dirname "$0")/contract_config.sh" 