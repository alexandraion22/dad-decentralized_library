#!/bin/bash

# Wallet configuration
WALLET_ADDR="inj1vvtcndw7rgxkssxffws2zspdc4mgaevhrl6vs9"
FROM="wallet"

# Fee configuration
FEES="500000000000000inj"
STORE_FEES="483000000000000inj"

# Contract configuration
# Previous contract (no-admin, cannot be migrated)
OLD_CONTRACT_ADDR="inj1gsp0n2l7sx4ahr03s5e3ch72f6jepkgchvqpwq"
OLD_CODE_ID="31991"

# Current contract (with admin, can be migrated)
CONTRACT_ADDR="inj1p63p0uwczqd00m9cjxahc78z6ejjq2zgwjm5j2" # REPLACE WITH YOUR ACTUAL CONTRACT ADDRESS
CODE_ID="31994"

# Last deployment timestamp
LAST_DEPLOYMENT="Sat May 17 11:28:18 PM EEST 2025"

# Usage:
# To source this file in other scripts, use:
# source "$(dirname "$0")/contract_config.sh" 