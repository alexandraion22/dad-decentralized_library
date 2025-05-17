#!/bin/bash

# Wallet configuration
WALLET_ADDR="inj1vvtcndw7rgxkssxffws2zspdc4mgaevhrl6vs9"
FROM="wallet"

# Fee configuration
FEES="500000000000000inj"
STORE_FEES="273000000000000inj"

# Contract configuration
# Previous contract (no-admin, cannot be migrated)
OLD_CONTRACT_ADDR="inj1cde7ujdyvhj8cftdwaumvkzj4rqdv6hnjfvl8c"
OLD_CODE_ID="31981"

# Current contract (with admin, can be migrated)
CONTRACT_ADDR="inj1qq340xcmjszhe54ptq0s8jxx5mapdzepulkdjt"
CODE_ID="31987"

# Last deployment timestamp
LAST_DEPLOYMENT="$(date)"

# Usage:
# To source this file in other scripts, use:
# source "$(dirname "$0")/contract_config.sh" 