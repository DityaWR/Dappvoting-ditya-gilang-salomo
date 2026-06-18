require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // ── Solidity Compiler ──────────────────────────────────────────────────────
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,          // Balance between deploy cost and call cost
      },
      evmVersion: "cancun", // Latest stable EVM version
    },
  },

  // ── Network Configuration ──────────────────────────────────────────────────
  networks: {
    // Default in-process network used by `npx hardhat test`
    hardhat: {
      chainId: 31337,
      mining: {
        auto: true,         // Mine a block for every transaction
        interval: 0,
      },
    },

    // Local node started via `npx hardhat node`
    // Used for: npx hardhat run scripts/deploy.js --network localhost
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },

  // ── Paths ──────────────────────────────────────────────────────────────────
  paths: {
    sources:   "./contracts",
    tests:     "./test",
    cache:     "./cache",
    artifacts: "./artifacts",
  },

  // ── Gas Reporter (optional — install: npm i hardhat-gas-reporter) ──────────
  // gasReporter: {
  //   enabled: process.env.REPORT_GAS !== undefined,
  //   currency: "USD",
  // },
};
