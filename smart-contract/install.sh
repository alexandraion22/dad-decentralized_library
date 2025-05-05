
# 1. Update the package list and install basic tools
echo "Updating package list and installing basic tools..."
sudo apt update
sudo apt install -y build-essential git curl jq

# 2. Install Rust
echo "Installing Rust"
if ! command -v rustup &> /dev/null; then
  echo "Rustup not found. Installing Rustup..."
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  source $HOME/.cargo/env
else
  echo "Rustup is already installed."
fi

# Set Rust 1.81.0 as the default version
# Otherwise we face this problem https://github.com/CosmWasm/cosmwasm/issues/2292
echo "Setting Rust version 1.81.0 as default..."
rustup default 1.81.0

# 3. Add the WASM target for Rust
echo "Configuring Rust for WASM development..."
rustup target add wasm32-unknown-unknown
cargo install cargo-run-script

# 4. Install injectived
echo "Installing injectived..."
wget https://github.com/InjectiveLabs/injective-chain-releases/releases/download/v1.14.1-1740773301/linux-amd64.zip
unzip linux-amd64.zip
sudo mv injectived /usr/local/bin/
sudo mv libwasmvm.x86_64.so /usr/lib/

# 5. Configure injectived to use the Injective testnet
echo "Configuring injectived for the Injective testnet..."
injectived config set client chain-id injective-888
injectived config set client node https://k8s.testnet.tm.injective.network:443

# 6. Add a wallet (you will need to provide your mnemonic for recovery)
echo "Adding a wallet..."
injectived keys add wallet --recover
