require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require('@openzeppelin/hardhat-upgrades');
require('hardhat-contract-sizer');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

real_accounts = undefined;
if (process.env.PRIVATE_KEY) {
  real_accounts = [process.env.PRIVATE_KEY];
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      initialDate: "2021-04-04T00:00:00.000+00:00",
      saveDeployments: true,
      allowUnlimitedContractSize: true,
      tags: ["nft", "marketplace", "test"],
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_ID}`,
      tags: ["nft", "marketplace", "test"],
      chainId: 3,
      accounts: real_accounts,
      // gas: 2100000,
      // gasPrice: 8000000000
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_ID}`,
      tags: ["nft", "marketplace", "test"],
      chainId: 5,
      accounts: real_accounts,
      // gas: 2100000,
      // gasPrice: 8000000000
    },
    avalancheFuji: {
      url: `https://api.avax-test.network/ext/bc/C/rpc`,
      tags: ["nft", "marketplace", "test"],
      chainId: 43113,
      accounts: real_accounts,
      // gas: 'auto',
      // gasPrice: 25000000000,
      // blockGasLimit: 0x1fffffffffffff,
      // allowUnlimitedContractSize: true,
      // timeout: 1800000
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
