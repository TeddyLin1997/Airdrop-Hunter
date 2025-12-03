import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "dotenv/config";

const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  console.warn("PRIVATE_KEY environment variable not set. Using a default for local development.");
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {},
};

const supportedChains = [
  "mainnet",
  "sepolia",
  "polygon",
  "polygonMumbai",
  "arbitrum",
  "arbitrumSepolia",
  "optimism",
  "optimismSepolia",
  "base",
  "baseSepolia",
  "zora",
  "zoraSepolia",
];

for (const chainName of supportedChains) {
  const rpcUrl = process.env[`${chainName.toUpperCase()}_RPC_URL`];
  if (rpcUrl && privateKey) {
    if (config.networks) { // Type guard
      config.networks[chainName] = {
        url: rpcUrl,
        accounts: [privateKey],
      };
    }
  }
}

// Add localhost separately
if (config.networks) {
  config.networks.localhost = {
    url: "http://127.0.0.1:8545",
  };
}


export default config;
