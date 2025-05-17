#!/bin/bash

# Wallet configuration
WALLET_ADDR="inj1vvtcndw7rgxkssxffws2zspdc4mgaevhrl6vs9"
FROM="wallet"

# Fee configuration
FEES="500000000000000inj"
STORE_FEES="273000000000000inj"

# Contract configuration
# Previous contract (no-admin, cannot be migrated)
OLD_CONTRACT_ADDR="inj1gsp0n2l7sx4ahr03s5e3ch72f6jepkgchvqpwq"
OLD_CODE_ID="31991"

# Current contract (with admin, can be migrated)
CONTRACT_ADDR="inj1gsp0n2l7sx4ahr03s5e3ch72f6jepkgchvqpwq"
CODE_ID="31991"

# Last deployment timestamp
LAST_DEPLOYMENT="Sat May 17 10:36:45 PM EEST 2025"

# Usage:
# To source this file in other scripts, use:
# source "$(dirname "$0")/contract_config.sh" 